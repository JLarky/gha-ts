/**
 * Production-ready helpers for authoring GitHub Actions expressions.
 *
 * This module exposes a tagged template (`expr`), a rich context tree (`ctx`),
 * core helpers (`fn`, `raw`, `token`), and legacy helpers mirroring the
 * original simple API (`github`, `env`, etc).
 */

const RAW_TOKEN_PREFIXES = [
  "github",
  "env",
  "matrix",
  "needs",
  "steps",
  "secrets",
  "vars",
  "runner",
  "job",
  "strategy",
  "inputs",
] as const;

const RAW_TOKEN_PREFIX_SET = new Set(RAW_TOKEN_PREFIXES);

export type RawTokenPrefix = (typeof RAW_TOKEN_PREFIXES)[number];
export type RawToken = `${RawTokenPrefix}.${string}`;
type TokenPath = RawToken | RawTokenPrefix;

export type WorkflowExpr = `${"${{"} ${string} }}`;

export interface Fragment {
  readonly inner: string;
  wrap(): WorkflowExpr;
  toString(): string;
}

class FragmentImpl implements Fragment {
  readonly inner: string;

  constructor(inner: string) {
    this.inner = inner;
  }

  wrap(): WorkflowExpr {
    return wrap(this.inner);
  }

  toString(): string {
    return this.inner;
  }

  [Symbol.toPrimitive](): string {
    return this.inner;
  }
}

function fragment(inner: string): Fragment {
  return new FragmentImpl(inner);
}

function assertToken(path: string): asserts path is RawToken {
  const [prefix, rest] = path.split(".", 2);
  if (!RAW_TOKEN_PREFIX_SET.has(prefix as RawTokenPrefix) || !rest) {
    throw new Error(
      `Invalid raw token "${path}". Expected prefix (${[...RAW_TOKEN_PREFIX_SET]
        .map((p) => `"${p}".`)
        .join(
          ", ",
        )}) followed by at least one segment (e.g. "github.ref").`,
    );
  }
}

export function token(path: RawToken): Fragment {
  assertToken(path);
  return fragment(path);
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "\\'");
}

export function raw(value: string): Fragment {
  return fragment(`'${escapeSingleQuotes(value)}'`);
}

export function wrap(inner: string): WorkflowExpr {
  if (/\$\{\{/.test(inner)) {
    const cleaned = inner.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
    throw new Error(
      `Expression already wrapped. Use unwrap() before composing nested expressions. Inner: ${cleaned.trim()}`,
    );
  }
  return `${"${{"} ${inner.trim()} }}` as WorkflowExpr;
}

export function unwrap(expr: WorkflowExpr): string {
  if (!expr.startsWith("${{ ") || !expr.endsWith(" }}")) {
    throw new Error(
      'Cannot unwrap expression. Expected it to start with "${{ " and end with " }}".',
    );
  }
  return expr.slice(4, -3);
}

function unwrapMaybe(value: string): string {
  if (value.startsWith("${{")) {
    return value.replace(/^\$\{\{\s*/, "").replace(/\s*\}\}$/, "").trim();
  }
  return value;
}

function isFragment(value: unknown): value is Fragment {
  return (
    typeof value === "object" &&
    value !== null &&
    "inner" in value &&
    typeof (value as Fragment).wrap === "function"
  );
}

function isRawTokenString(value: string): boolean {
  const [prefix] = value.split(".", 1);
  return value.includes(".") && RAW_TOKEN_PREFIX_SET.has(prefix as RawTokenPrefix);
}

function looksLikeExpression(value: string): boolean {
  return /[()|&<>!=]/.test(value) || value.includes(" ");
}

type Primitive = string | number | boolean | bigint | null;
type ExprValue = Fragment | WorkflowExpr | Primitive;

function renderPrimitive(value: Primitive): string {
  if (value === null) {
    return "null";
  }
  switch (typeof value) {
    case "number":
    case "bigint":
      return String(value);
    case "boolean":
      return value ? "true" : "false";
    case "string":
      return `'${escapeSingleQuotes(value)}'`;
    default:
      return String(value);
  }
}

function autoQuoteIfNeeded(value: ExprValue): string {
  if (isFragment(value)) {
    return value.inner;
  }
  if (typeof value === "string") {
    if (value.startsWith("${{")) {
      return unwrapMaybe(value);
    }
    if (isRawTokenString(value) || looksLikeExpression(value)) {
      return value;
    }
    return `'${escapeSingleQuotes(value)}'`;
  }
  return renderPrimitive(value);
}

export type ExprInterpolationValue =
  | Fragment
  | WorkflowExpr
  | Primitive
  | undefined;

function toInner(value: ExprInterpolationValue): string {
  if (value === undefined) {
    throw new Error("Expression interpolation received undefined value.");
  }
  if (isFragment(value)) {
    return value.inner;
  }
  if (typeof value === "string") {
    if (value.startsWith("${{")) {
      return unwrapMaybe(value);
    }
    if (isRawTokenString(value) || looksLikeExpression(value)) {
      return value;
    }
    return `'${escapeSingleQuotes(value)}'`;
  }
  return renderPrimitive(value);
}

export function expr(
  parts: TemplateStringsArray,
  ...values: ExprInterpolationValue[]
): WorkflowExpr {
  let inner = "";
  for (let i = 0; i < parts.length; i++) {
    inner += parts[i] ?? "";
    if (i < values.length) {
      inner += toInner(values[i]);
    }
  }
  return wrap(inner);
}

type ExprInput = Fragment | WorkflowExpr | Primitive | string;

export const fn = {
  always: (): string => "always()",
  success: (): string => "success()",
  failure: (): string => "failure()",
  cancelled: (): string => "cancelled()",
  contains: (subject: ExprInput, search: ExprInput): string =>
    `contains(${autoQuoteIfNeeded(subject)}, ${autoQuoteIfNeeded(search)})`,
  startsWith: (value: ExprInput, prefix: string): string =>
    `startsWith(${autoQuoteIfNeeded(value)}, '${escapeSingleQuotes(prefix)}')`,
  endsWith: (value: ExprInput, suffix: string): string =>
    `endsWith(${autoQuoteIfNeeded(value)}, '${escapeSingleQuotes(suffix)}')`,
  format: (template: string, ...values: ExprInput[]): string => {
    if (!/\{\d+}/.test(template)) {
      throw new Error(
        "format() template must contain placeholders such as {0}",
      );
    }
    return `format('${escapeSingleQuotes(template)}', ${values
      .map(autoQuoteIfNeeded)
      .join(", ")})`;
  },
  join: (values: ExprInput, separator = ","): string =>
    `join(${autoQuoteIfNeeded(values)}, '${escapeSingleQuotes(separator)}')`,
  hashFiles: (...paths: ExprInput[]): string => {
    if (paths.length === 0) {
      throw new Error("hashFiles() requires at least one path.");
    }
    return `hashFiles(${paths.map(autoQuoteIfNeeded).join(", ")})`;
  },
  toJSON: (value: ExprInput): string => `toJSON(${autoQuoteIfNeeded(value)})`,
  fromJSON: (value: ExprInput): string =>
    `fromJSON(${autoQuoteIfNeeded(value)})`,
  coalesce: (...values: ExprInput[]): string => {
    if (values.length < 2) {
      throw new Error("coalesce() requires at least two arguments.");
    }
    return `coalesce(${values.map(autoQuoteIfNeeded).join(", ")})`;
  },
  eq: (left: ExprInput, right: ExprInput): string =>
    `${autoQuoteIfNeeded(left)} == ${autoQuoteIfNeeded(right)}`,
  ne: (left: ExprInput, right: ExprInput): string =>
    `${autoQuoteIfNeeded(left)} != ${autoQuoteIfNeeded(right)}`,
  and: (...values: ExprInput[]): string => {
    if (values.length < 2) {
      throw new Error("and() requires at least two arguments.");
    }
    return values.map(autoQuoteIfNeeded).join(" && ");
  },
  or: (...values: ExprInput[]): string => {
    if (values.length < 2) {
      throw new Error("or() requires at least two arguments.");
    }
    return values.map(autoQuoteIfNeeded).join(" || ");
  },
} as const;

export interface TokenNamespace extends Fragment {
  at(segment: string): TokenNamespace;
  select(segment: string): TokenNamespace;
  path(...segments: string[]): TokenNamespace;
  readonly [key: string]: TokenNamespace;
}

type HelperFactory = (
  fragment: Fragment,
  segments: readonly string[],
) => Record<string | symbol, unknown>;

function createTokenNamespace(
  base: TokenPath,
  helpers?: HelperFactory,
): TokenNamespace {
  const baseSegments = base.split(".");
  const prefix = baseSegments[0] as RawTokenPrefix;
  const staticSegments = baseSegments.slice(1);

  const buildFragment = (segments: string[]): Fragment => {
    const pathSegments = [prefix, ...staticSegments, ...segments];
    return fragment(pathSegments.filter(Boolean).join("."));
  };

  const proxify = (segments: string[]): TokenNamespace => {
    const current = buildFragment(segments);

    const helperEntries = helpers?.(current, segments) ?? {};

    const target: Record<string | symbol, unknown> = {
      get inner(): string {
        return current.inner;
      },
      wrap: (): WorkflowExpr => current.wrap(),
      toString: (): string => current.toString(),
      at: (segment: string): TokenNamespace => proxify([...segments, segment]),
      select: (segment: string): TokenNamespace =>
        proxify([...segments, segment]),
      path: (...rest: string[]): TokenNamespace =>
        proxify([...segments, ...rest]),
      [Symbol.toPrimitive]: (): string => current.inner,
      ...helperEntries,
    };

    return new Proxy(target, {
      get(t, prop, receiver) {
        if (prop === "inner" || prop === "wrap" || prop === "toString") {
          return Reflect.get(t, prop, receiver);
        }
        if (prop === Symbol.toPrimitive) {
          return () => current.inner;
        }
        if (typeof prop === "string") {
          if (prop in t) {
            return Reflect.get(t, prop, receiver);
          }
          return proxify([...segments, prop]);
        }
        return Reflect.get(t, prop, receiver);
      },
    }) as TokenNamespace;
  };

  return proxify([]);
}

const ctxGithub = createTokenNamespace("github");
const ctxEnv = createTokenNamespace("env", (_, segments) =>
  segments.length === 0
    ? {
        var: (name: string): Fragment => token(`env.${name}` as RawToken),
      }
    : {},
);
const ctxSecrets = createTokenNamespace("secrets", (_, segments) =>
  segments.length === 0
    ? {
        secret: (name: string): Fragment =>
          token(`secrets.${name}` as RawToken),
      }
    : {},
);
const ctxMatrix = createTokenNamespace("matrix", (_, segments) =>
  segments.length === 0
    ? {
        value: (name: string): Fragment =>
          token(`matrix.${name}` as RawToken),
      }
    : {},
);
const ctxVars = createTokenNamespace("vars", (_, segments) =>
  segments.length === 0
    ? {
        var: (name: string): Fragment => token(`vars.${name}` as RawToken),
      }
    : {},
);
const ctxRunner = createTokenNamespace("runner");
const ctxJob = createTokenNamespace("job");
const ctxStrategy = createTokenNamespace("strategy");
const ctxInputs = createTokenNamespace("inputs", (_, segments) =>
  segments.length === 0
    ? {
        input: (name: string): Fragment =>
          token(`inputs.${name}` as RawToken),
      }
    : {},
);

const ctxSteps = createTokenNamespace("steps", (_, segments) =>
  segments.length === 0
    ? {
        output: (stepId: string, outputName: string): Fragment =>
          token(`steps.${stepId}.outputs.${outputName}` as RawToken),
        conclusion: (stepId: string): Fragment =>
          token(`steps.${stepId}.conclusion` as RawToken),
        outcome: (stepId: string): Fragment =>
          token(`steps.${stepId}.outcome` as RawToken),
      }
    : {},
);

const ctxNeeds = createTokenNamespace("needs", (_, segments) =>
  segments.length === 0
    ? {
        output: (jobId: string, outputName: string): Fragment =>
          token(`needs.${jobId}.outputs.${outputName}` as RawToken),
        result: (jobId: string): Fragment =>
          token(`needs.${jobId}.result` as RawToken),
      }
    : {},
);

export interface ContextHelpers {
  github: TokenNamespace;
  env: TokenNamespace & { var(name: string): Fragment };
  secrets: TokenNamespace & { secret(name: string): Fragment };
  matrix: TokenNamespace & { value(name: string): Fragment };
  steps: TokenNamespace & {
    output(stepId: string, outputName: string): Fragment;
    conclusion(stepId: string): Fragment;
    outcome(stepId: string): Fragment;
  };
  needs: TokenNamespace & {
    output(jobId: string, outputName: string): Fragment;
    result(jobId: string): Fragment;
  };
  vars: TokenNamespace & { var(name: string): Fragment };
  runner: TokenNamespace;
  job: TokenNamespace;
  strategy: TokenNamespace;
  inputs: TokenNamespace & { input(name: string): Fragment };
  token(path: RawToken): Fragment;
  raw(value: string): Fragment;
  fn: typeof fn;
  unwrap(expr: WorkflowExpr): string;
}

export const ctx: ContextHelpers = {
  github: ctxGithub,
  env: ctxEnv as ContextHelpers["env"],
  secrets: ctxSecrets as ContextHelpers["secrets"],
  matrix: ctxMatrix as ContextHelpers["matrix"],
  steps: ctxSteps as ContextHelpers["steps"],
  needs: ctxNeeds as ContextHelpers["needs"],
  vars: ctxVars as ContextHelpers["vars"],
  runner: ctxRunner,
  job: ctxJob,
  strategy: ctxStrategy,
  inputs: ctxInputs as ContextHelpers["inputs"],
  token,
  raw,
  fn,
  unwrap,
};

export function fragmentFrom(path: string): Fragment {
  return fragment(path);
}

function wrapPath(path: string): WorkflowExpr {
  return wrap(path);
}

export function github(name: string): WorkflowExpr {
  return wrapPath(`github.${name}`);
}

export function env(name: string): WorkflowExpr {
  return wrapPath(`env.${name}`);
}

export function job(name: string): WorkflowExpr {
  return wrapPath(`job.${name}`);
}

export function jobs(path: string): WorkflowExpr {
  return wrapPath(`jobs.${path}`);
}

export function steps(id: string, field: string): WorkflowExpr {
  return wrapPath(`steps.${id}.${field}`);
}

export function runner(name: string): WorkflowExpr {
  return wrapPath(`runner.${name}`);
}

export function secrets(name: string): WorkflowExpr {
  return wrapPath(`secrets.${name}`);
}

export function strategy(name: string): WorkflowExpr {
  return wrapPath(`strategy.${name}`);
}

export function matrix(name: string): WorkflowExpr {
  return wrapPath(`matrix.${name}`);
}

export function needs(jobId: string, output?: string): WorkflowExpr {
  return output
    ? wrapPath(`needs.${jobId}.outputs.${output}`)
    : wrapPath(`needs.${jobId}`);
}

export function inputs(name: string): WorkflowExpr {
  return wrapPath(`inputs.${name}`);
}

export const githubRef = (): WorkflowExpr => github("ref");
export const githubSha = (): WorkflowExpr => github("sha");
export const githubRepository = (): WorkflowExpr => github("repository");
export const githubActor = (): WorkflowExpr => github("actor");
export const githubEventName = (): WorkflowExpr => github("event_name");
export const githubWorkflow = (): WorkflowExpr => github("workflow");
export const githubEvent = (path: string): WorkflowExpr =>
  wrapPath(`github.event.${path}`);
