/**
 * GitHub Actions expression builders and context helpers.
 *
 * Provides a type-safe DSL for building GitHub Actions expressions using
 * tagged templates and context namespaces.
 *
 * @example
 * ```ts
 * import { expr, ctx, fn } from '@jlarky/gha-ts';
 *
 * const workflow = {
 *   'run-name': expr`${ctx.github.workflow} - ${ctx.github.ref}`,
 *   jobs: {
 *     test: {
 *       if: expr`${fn.endsWith(ctx.github.head_ref, '-run-tests')}`,
 *       steps: [...]
 *     }
 *   }
 * };
 * ```
 */

// Prefixes that form valid GitHub Actions context tokens
export type RawTokenPrefix =
  | "github"
  | "env"
  | "matrix"
  | "needs"
  | "steps"
  | "secrets"
  | "vars"
  | "runner";
export type RawToken = `${RawTokenPrefix}.${string}`;
export type WorkflowExpr = `${"${{"} ${string} }}`; // no brand

/**
 * Fragment abstraction (unwrapped piece of expression).
 * Represents a part of an expression that hasn't been wrapped in ${{ }} yet.
 */
export interface Fragment {
  /** The inner content of the fragment (without ${{ }} wrapper) */
  readonly inner: string;
  /** Returns the inner content as a string */
  toString(): string;
  /** Wraps the fragment in ${{ }} to produce a WorkflowExpr */
  wrap(): WorkflowExpr;
}

class FragmentImpl implements Fragment {
  readonly inner: string;
  constructor(inner: string) {
    this.inner = inner;
  }
  toString() {
    return this.inner;
  }
  wrap(): WorkflowExpr {
    return wrap(this.inner);
  }
}

/**
 * Creates a fragment from inner content.
 * @internal
 */
function fragment(inner: string): Fragment {
  return new FragmentImpl(inner);
}

/**
 * Creates a token fragment for a GitHub Actions context path.
 *
 * @example
 * ```ts
 * token('github.ref') // creates a fragment for github.ref
 * ```
 */
export function token(path: RawToken): Fragment {
  return fragment(path);
}

/**
 * Escapes single quotes in a string for use in GitHub Actions expressions.
 * @internal
 */
function escapeSingle(str: string): string {
  return str.replace(/'/g, "\\'");
}

/**
 * Produces a quoted literal fragment (for edge cases where auto-quoting isn't sufficient).
 *
 * @example
 * ```ts
 * raw("some'value") // produces 'some\'value'
 * ```
 */
export function raw(value: string): Fragment {
  return fragment(`'${escapeSingle(value)}'`);
}

/**
 * Wraps inner content in ${{ }} to create a WorkflowExpr.
 * Ensures exactly one wrapper with explicit validation to prevent double-wrapping.
 *
 * @throws {Error} If the inner content already contains ${{ }}
 */
export function wrap(inner: string): WorkflowExpr {
  // Explicit validation: fail fast on double-wrapping
  if (inner.includes("${{")) {
    const cleaned = inner.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
    throw new Error(
      `Expression already wrapped! Did you mean to use: ${cleaned.trim()}. Use unwrap() helper for intentional unwrapping.`,
    );
  }
  const trimmed = inner.trim();
  return `${"${{"} ${trimmed} }}` as WorkflowExpr;
}

/**
 * Unwraps an expression (extracts inner content from ${{ }} wrapper).
 * Only removes the outer ${{ }} wrapper, leaving any nested expressions intact.
 *
 * @throws {Error} If the expression doesn't have the expected format
 *
 * @example
 * ```ts
 * const expr1 = expr`${ctx.github.ref}`;
 * const expr2 = expr`${unwrap(expr1)}`; // intentional unwrap
 * ```
 */
export function unwrap(expr: WorkflowExpr): string {
  if (!expr.startsWith("${{ ") || !expr.endsWith(" }}")) {
    throw new Error(
      'Cannot unwrap: expression must start with "${{ " and end with " }}"',
    );
  }

  // Remove the outer "${{ " (4 chars) and " }}" (3 chars) wrapper
  // No need to trim() since wrap() already trims the inner content
  return expr.slice(4, -3);
}

/**
 * Unwraps an expression if it's wrapped, otherwise returns as-is.
 * @internal
 */
function unwrapMaybe(value: string): string {
  if (value.startsWith("${{")) {
    return value
      .replace(/^\$\{\{\s*/, "")
      .replace(/\s*\}\}$/, "")
      .trim();
  }
  return value;
}

/**
 * Type for values that can be interpolated into expressions.
 */
type ExprValue = Fragment | RawToken | WorkflowExpr | string;

/**
 * Auto-quotes plain strings (not Fragments, not WorkflowExpr, not RawToken).
 * @internal
 */
function autoQuoteIfNeeded(
  value: string | Fragment | RawToken | WorkflowExpr,
): string {
  // If it's already a Fragment, extract inner
  if (typeof value === "object" && value !== null && "inner" in value) {
    return (value as Fragment).inner;
  }
  // If it's a WorkflowExpr string (unwrap it)
  if (typeof value === "string" && value.startsWith("${{")) {
    return unwrapMaybe(value);
  }
  // If it's a RawToken (starts with known prefix), use as-is
  if (typeof value === "string") {
    const prefixes: RawTokenPrefix[] = [
      "github",
      "env",
      "matrix",
      "needs",
      "steps",
      "secrets",
      "vars",
      "runner",
    ];
    if (prefixes.some((prefix) => value.startsWith(`${prefix}.`))) {
      return value;
    }
    // Plain string - auto-quote it
    return `'${escapeSingle(value)}'`;
  }
  return String(value);
}

/**
 * Function helpers for GitHub Actions expressions.
 * These return inner expression bodies (not wrapped in ${{ }}).
 */
export const fn = {
  /** Returns 'always()' */
  always: () => "always()",
  /** Returns 'success()' */
  success: () => "success()",
  /** Returns 'failure()' */
  failure: () => "failure()",
  /** Returns 'cancelled()' */
  cancelled: () => "cancelled()",
  /**
   * Checks if a value contains another value.
   * @example `contains(github.ref, 'develop')`
   */
  contains: (a: ExprValue, b: ExprValue) =>
    `contains(${autoQuoteIfNeeded(a)}, ${autoQuoteIfNeeded(b)})`,
  /**
   * Checks if a value starts with a prefix.
   * @example `startsWith(github.ref, 'refs/heads/')`
   */
  startsWith: (v: ExprValue, prefix: string) =>
    `startsWith(${autoQuoteIfNeeded(v)}, '${escapeSingle(prefix)}')`,
  /**
   * Checks if a value ends with a suffix.
   * @example `endsWith(github.head_ref, '-run-tests')`
   */
  endsWith: (v: ExprValue, suffix: string) =>
    `endsWith(${autoQuoteIfNeeded(v)}, '${escapeSingle(suffix)}')`,
  /**
   * Formats a template string with values.
   * @example `format('PR {0} #{1}', github.event.pull_request.title, github.event.pull_request.number)`
   * @throws {Error} If template doesn't contain placeholders like {0}
   */
  format: (template: string, ...values: ExprValue[]) => {
    if (!/\{\d+}/.test(template))
      throw new Error("format template must contain placeholders like {0}");
    return `format('${escapeSingle(template)}', ${values
      .map(autoQuoteIfNeeded)
      .join(", ")})`;
  },
  /**
   * Joins an array with a separator.
   * @example `join(matrix.os, ',')`
   */
  join: (arr: ExprValue, sep = ",") =>
    `join(${autoQuoteIfNeeded(arr)}, '${escapeSingle(sep)}')`,
  /**
   * Computes hash of files.
   * @example `hashFiles('package.json', 'tsconfig.json')`
   */
  hashFiles: (...paths: ExprValue[]) =>
    `hashFiles(${paths.map(autoQuoteIfNeeded).join(", ")})`,
  /**
   * Converts a value to JSON.
   * @example `toJSON(github.event)`
   */
  toJSON: (v: ExprValue) => `toJSON(${autoQuoteIfNeeded(v)})`,
  /**
   * Parses JSON into a value.
   * @example `fromJSON(github.event.pull_request.body)`
   */
  fromJSON: (v: ExprValue) => `fromJSON(${autoQuoteIfNeeded(v)})`,
};

/**
 * Converts a value to its inner expression representation.
 * @internal
 */
function toInner(v: Fragment | RawToken | WorkflowExpr | string): string {
  if (typeof v === "string") {
    // Check if it's a WorkflowExpr (unwrap it)
    if (v.startsWith("${{")) {
      return unwrapMaybe(v);
    }
    // Check if it's a RawToken (starts with known prefix)
    const prefixes: RawTokenPrefix[] = [
      "github",
      "env",
      "matrix",
      "needs",
      "steps",
      "secrets",
      "vars",
      "runner",
    ];
    if (prefixes.some((prefix) => v.startsWith(`${prefix}.`))) {
      return v;
    }
    // Check if it looks like an expression fragment (contains function calls, operators, etc.)
    // Expression fragments typically contain: parentheses, operators, or are multi-part
    if (
      /[()]/.test(v) ||
      /[|&<>!=]/.test(v) ||
      v.includes(" ") ||
      v.includes(",")
    ) {
      // Likely an expression fragment from fn.* helpers - return as-is
      return v;
    }
    // Plain string literal - auto-quote it
    return `'${escapeSingle(v)}'`;
  }
  if (typeof v === "object" && v !== null && "inner" in v) {
    return (v as Fragment).inner;
  }
  return unwrapMaybe(String(v));
}

/**
 * Type for values that can be interpolated into expr template literals.
 */
type ExprInterpolationValue = Fragment | RawToken | WorkflowExpr | string;

/**
 * Tagged template function for building GitHub Actions expressions.
 *
 * Automatically handles:
 * - Wrapping in ${{ }}
 * - Auto-quoting plain strings
 * - Unwrapping nested expressions
 * - Converting fragments and tokens
 *
 * @example
 * ```ts
 * expr`${ctx.github.workflow} - ${ctx.github.ref}`
 * // => "${{ github.workflow - github.ref }}"
 *
 * expr`${fn.endsWith(ctx.github.head_ref, '-run-tests')}`
 * // => "${{ endsWith(github.head_ref, '-run-tests') }}"
 * ```
 *
 * @remarks
 * **JavaScript vs Expression-level operators:**
 * - JavaScript operators (like `||`) in interpolations are evaluated in JavaScript first.
 *   Example: `expr`${ctx.github.head_ref || ctx.github.ref}`` will use `head_ref` (truthy Fragment).
 * - For expression-level operators, put them in the template string:
 *   Example: `expr`${ctx.github.head_ref} || ${ctx.github.ref}`` produces `${{ github.head_ref || github.ref }}`.
 */
export function expr(
  parts: TemplateStringsArray,
  ...vals: ExprInterpolationValue[]
): WorkflowExpr {
  let inner = "";
  for (let i = 0; i < parts.length; i++) {
    inner += parts[i];
    if (i < vals.length) {
      const val = vals[i];
      if (val !== undefined) {
        inner += toInner(val);
      }
    }
  }
  return wrap(inner);
}

/**
 * GitHub context namespace.
 * Provides typed access to github.* context properties.
 */
class GitHubCtx {
  workflow = token("github.workflow");
  ref = token("github.ref");
  sha = token("github.sha");
  event_name = token("github.event_name");
  head_ref = token("github.head_ref");
  base_ref = token("github.base_ref");
  actor = token("github.actor");
  repository = token("github.repository");
  run_id = token("github.run_id");
  run_number = token("github.run_number");
  run_attempt = token("github.run_attempt");
  event = {
    pull_request: {
      title: token("github.event.pull_request.title"),
      number: token("github.event.pull_request.number"),
      head: {
        ref: token("github.event.pull_request.head.ref"),
        sha: token("github.event.pull_request.head.sha"),
      },
      base: {
        ref: token("github.event.pull_request.base.ref"),
        sha: token("github.event.pull_request.base.sha"),
      },
    },
    merge_group: {
      head_ref: token("github.event.merge_group.head_ref"),
      base_ref: token("github.event.merge_group.base_ref"),
      head_sha: token("github.event.merge_group.head_sha"),
      base_sha: token("github.event.merge_group.base_sha"),
    },
  } as const;
}

/**
 * Environment context namespace.
 * Provides access to env.* context properties.
 */
class EnvCtx {
  /**
   * Gets an environment variable.
   * @example `ctx.env.var('NODE_VERSION')`
   */
  var(name: string) {
    return token(`env.${name}` as RawToken);
  }
}

/**
 * Secrets context namespace.
 * Provides access to secrets.* context properties.
 */
class SecretsCtx {
  /**
   * Gets a secret.
   * @example `ctx.secrets.secret('API_KEY')`
   */
  secret(name: string) {
    return token(`secrets.${name}` as RawToken);
  }
}

/**
 * Matrix context namespace.
 * Provides access to matrix.* context properties.
 */
class MatrixCtx {
  /**
   * Gets a matrix value.
   * @example `ctx.matrix.value('os')`
   */
  value(name: string) {
    return token(`matrix.${name}` as RawToken);
  }
}

/**
 * Steps context namespace.
 * Provides access to steps.* context properties.
 */
class StepsCtx {
  /**
   * Gets a step output.
   * @example `ctx.steps.output('build', 'artifact-path')`
   */
  output(step: string, out: string) {
    return token(`steps.${step}.outputs.${out}` as RawToken);
  }
}

/**
 * Needs context namespace.
 * Provides access to needs.* context properties.
 */
class NeedsCtx {
  /**
   * Gets a job output.
   * @example `ctx.needs.output('build', 'artifact-path')`
   */
  output(job: string, out: string) {
    return token(`needs.${job}.outputs.${out}` as RawToken);
  }
}

/**
 * Vars context namespace.
 * Provides access to vars.* context properties (workflow variables).
 */
class VarsCtx {
  /**
   * Gets a workflow variable.
   * @example `ctx.vars.var('DEPLOY_ENV')`
   */
  var(name: string) {
    return token(`vars.${name}` as RawToken);
  }
}

/**
 * Main context namespace providing access to all GitHub Actions contexts.
 *
 * @example
 * ```ts
 * ctx.github.ref
 * ctx.env.var('NODE_VERSION')
 * ctx.secrets.secret('API_KEY')
 * ctx.matrix.value('os')
 * ctx.steps.output('build', 'artifact-path')
 * ctx.needs.output('build', 'artifact-path')
 * ```
 */
class Ctx {
  github = new GitHubCtx();
  env = new EnvCtx();
  secrets = new SecretsCtx();
  matrix = new MatrixCtx();
  steps = new StepsCtx();
  needs = new NeedsCtx();
  vars = new VarsCtx();
  fn = fn; // expose function helpers
  raw = raw; // expose raw literal helper for edge cases
  /**
   * Creates a token for a raw context path.
   * @example `ctx.token('github.repository')`
   */
  token(path: RawToken) {
    return token(path);
  }
}

/**
 * Main context object providing typed access to all GitHub Actions contexts.
 *
 * @example
 * ```ts
 * import { ctx } from '@jlarky/gha-ts';
 *
 * expr`${ctx.github.ref}`
 * expr`${ctx.env.var('NODE_VERSION')}`
 * expr`${ctx.secrets.secret('API_KEY')}`
 * ```
 */
export const ctx = new Ctx();
