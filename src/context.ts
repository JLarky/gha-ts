/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Production-ready helpers for authoring GitHub Actions expressions.
 *
 * This module mirrors the ergonomics of Context.pkl while embracing TypeScript
 * ergonomics. It provides:
 *   - `expr`` tagged template for building `${{ }}` expressions with auto-quoting
 *   - `Fragment` instances that represent unwrapped expression pieces
 *   - `fn` helpers for GitHub expression built-ins (`contains`, `format`, etc.)
 *   - `ctx` namespace for strongly-typed context tokens (`github`, `env`, …)
 *
 * The helpers prefer safe defaults:
 *   - Plain strings are automatically quoted when interpolated into `expr`
 *   - Double wrapping is prevented—`wrap()` throws if input already contains `${{`
 *   - Composition utilities (`and`, `or`, `nullishCoalesce`, …) preserve precedence
 */

export const RAW_TOKEN_PREFIXES = [
  "github",
  "env",
  "job",
  "jobs",
  "steps",
  "runner",
  "secrets",
  "strategy",
  "matrix",
  "needs",
  "inputs",
  "vars",
] as const;

export type RawTokenPrefix = (typeof RAW_TOKEN_PREFIXES)[number];
export type RawToken = `${RawTokenPrefix}.${string}`;
export type WorkflowExpression = `${"${{"} ${string} }}`;

const RAW_TOKEN_PREFIX_SET = new Set<string>(RAW_TOKEN_PREFIXES);
const FRAGMENT_BRAND = Symbol.for("gha-ts.fragment");

export interface Fragment {
  readonly inner: string;
  readonly [FRAGMENT_BRAND]: true;
  wrap(): WorkflowExpression;
  toString(): string;
  and(value: ExprValue): Fragment;
  or(value: ExprValue): Fragment;
  nullishCoalesce(value: ExprValue): Fragment;
  equals(value: ExprValue): Fragment;
  notEquals(value: ExprValue): Fragment;
  not(): Fragment;
  group(): Fragment;
}

const BINARY_GROUP_OPEN = "(";
const BINARY_GROUP_CLOSE = ")";

class FragmentImpl implements Fragment {
  readonly inner: string;
  readonly [FRAGMENT_BRAND] = true;

  constructor(inner: string) {
    this.inner = inner.trim();
  }

  wrap(): WorkflowExpression {
    return wrap(this.inner);
  }

  toString(): string {
    return this.inner;
  }

  and(value: ExprValue): Fragment {
    return this.binary("&&", value);
  }

  or(value: ExprValue): Fragment {
    return this.binary("||", value);
  }

  nullishCoalesce(value: ExprValue): Fragment {
    return this.binary("??", value);
  }

  equals(value: ExprValue): Fragment {
    return this.binary("==", value);
  }

  notEquals(value: ExprValue): Fragment {
    return this.binary("!=", value);
  }

  not(): Fragment {
    return fragment(`!${this.groupedInner()}`);
  }

  group(): Fragment {
    if (this.inner.startsWith(BINARY_GROUP_OPEN) && this.inner.endsWith(BINARY_GROUP_CLOSE)) {
      return this;
    }
    return fragment(`${BINARY_GROUP_OPEN}${this.inner}${BINARY_GROUP_CLOSE}`);
  }

  private binary(operator: string, value: ExprValue): Fragment {
    return fragment(
      `${this.groupedInner()} ${operator} ${groupForBinary(toInner(value))}`,
    );
  }

  private groupedInner(): string {
    return groupForBinary(this.inner);
  }
}

export function fragment(inner: string): Fragment {
  return new FragmentImpl(inner);
}

export function isFragment(value: unknown): value is Fragment {
  return typeof value === "object" && value !== null && (value as Fragment)[FRAGMENT_BRAND] === true;
}

function ensureTokenPrefix(path: string): void {
  const prefix = path.split(".")[0];
  if (!RAW_TOKEN_PREFIX_SET.has(prefix)) {
    throw new Error(
      `Invalid context token "${path}". Expected prefix to be one of: ${Array.from(RAW_TOKEN_PREFIX_SET)
        .sort()
        .join(", ")}`,
    );
  }
}

export function token(path: RawToken): Fragment {
  ensureTokenPrefix(path);
  return fragment(path);
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/'/g, "\\'");
}

export function raw(value: string): Fragment {
  return fragment(`'${escapeSingleQuotes(value)}'`);
}

export function wrap(inner: string): WorkflowExpression {
  if (inner.includes("${{")) {
    const cleaned = inner.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
    throw new Error(
      `Expression already wrapped. Did you mean to interpolate "${cleaned.trim()}" directly or call unwrap() first?`,
    );
  }
  const trimmed = inner.trim();
  return `${"${{"} ${trimmed} }}` as WorkflowExpression;
}

export function isWorkflowExpression(value: unknown): value is WorkflowExpression {
  return typeof value === "string" && value.startsWith("${{") && value.endsWith(" }}");
}

export function unwrap(expression: WorkflowExpression): string {
  if (!expression.startsWith("${{ ") || !expression.endsWith(" }}")) {
    throw new Error('Cannot unwrap: expression must start with "${{ " and end with " }}"');
  }
  return expression.slice(4, -3);
}

function unwrapIfNeeded(value: string): string {
  if (isWorkflowExpression(value)) {
    return unwrap(value);
  }
  return value;
}

function looksLikeExpression(value: string): boolean {
  if (value === "") return false;
  if (value.startsWith("!")) return true;
  if (value.startsWith("(") || value.endsWith(")")) return true;
  if (value.includes("||") || value.includes("&&") || value.includes("??")) return true;
  if (value.includes(" ? ") && value.includes(" : ")) return true;
  if (/[=!<>]/.test(value)) return true;
  if (value.includes("[") || value.includes("]")) return true;
  if (/^[a-zA-Z_][\w]*\s*\(/.test(value)) return true;
  return false;
}

function isRawToken(value: string): value is RawToken {
  const [prefix] = value.split(".");
  return RAW_TOKEN_PREFIX_SET.has(prefix ?? "");
}

type PrimitiveExpr = string | number | boolean | null | bigint;

export type ExprValue =
  | Fragment
  | WorkflowExpression
  | RawToken
  | PrimitiveExpr;

export type ExprInterpolationValue = ExprValue;

function toInner(value: ExprValue): string {
  if (isFragment(value)) {
    return value.inner;
  }
  if (typeof value === "string") {
    const unwrapped = unwrapIfNeeded(value);
    if (isRawToken(unwrapped)) {
      return unwrapped;
    }
    if (looksLikeExpression(unwrapped)) {
      return unwrapped;
    }
    return `'${escapeSingleQuotes(unwrapped)}'`;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null) {
    return "null";
  }
  // Should be unreachable because ExprValue covers cases above.
  return `'${escapeSingleQuotes(String(value))}'`;
}

function groupForBinary(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return trimmed;
  if (trimmed.startsWith(BINARY_GROUP_OPEN) && trimmed.endsWith(BINARY_GROUP_CLOSE)) {
    return trimmed;
  }
  if (!/[&|?!<>=]/.test(trimmed)) {
    return trimmed;
  }
  return `${BINARY_GROUP_OPEN}${trimmed}${BINARY_GROUP_CLOSE}`;
}

export function expr(
  parts: TemplateStringsArray,
  ...values: ExprInterpolationValue[]
): WorkflowExpression {
  let inner = "";
  for (let i = 0; i < parts.length; i++) {
    inner += parts[i] ?? "";
    if (i < values.length) {
      const value = values[i];
      inner += toInner(value);
    }
  }
  return wrap(inner);
}

function callFunction(name: string, ...values: ExprValue[]): Fragment {
  const args = values.map((value) => toInner(value)).join(", ");
  return fragment(`${name}(${args})`);
}

function ensurePlaceholder(template: string): void {
  if (!/\{\d+}/.test(template)) {
    throw new Error("format template must contain placeholders like {0}");
  }
}

export const fn = Object.freeze({
  always: (): Fragment => fragment("always()"),
  success: (): Fragment => fragment("success()"),
  failure: (): Fragment => fragment("failure()"),
  cancelled: (): Fragment => fragment("cancelled()"),
  contains: (a: ExprValue, b: ExprValue): Fragment =>
    callFunction("contains", a, b),
  startsWith: (value: ExprValue, prefix: ExprValue): Fragment =>
    callFunction("startsWith", value, prefix),
  endsWith: (value: ExprValue, suffix: ExprValue): Fragment =>
    callFunction("endsWith", value, suffix),
  format: (template: string, ...values: ExprValue[]): Fragment => {
    ensurePlaceholder(template);
    return callFunction("format", fragment(`'${escapeSingleQuotes(template)}'`), ...values);
  },
  join: (array: ExprValue, separator: ExprValue = raw(",")): Fragment =>
    callFunction("join", array, separator),
  hashFiles: (...paths: ExprValue[]): Fragment => {
    if (paths.length === 0) throw new Error("hashFiles requires at least one path argument");
    return callFunction("hashFiles", ...paths);
  },
  toJSON: (value: ExprValue): Fragment => callFunction("toJSON", value),
  fromJSON: (value: ExprValue): Fragment => callFunction("fromJSON", value),
} as const);

type TokenFactory = (name: string) => Fragment;

function createDynamicTokenFactory(prefix: RawTokenPrefix): TokenFactory {
  return (name: string) => token(`${prefix}.${name}` as RawToken);
}

class GitHubPullRequestBranchCtx {
  constructor(private readonly basePath: string) {}

  readonly ref = token(`${this.basePath}.ref` as RawToken);
  readonly sha = token(`${this.basePath}.sha` as RawToken);
  readonly label = token(`${this.basePath}.label` as RawToken);
}

class GitHubPullRequestCtx {
  readonly title = token("github.event.pull_request.title");
  readonly number = token("github.event.pull_request.number");
  readonly body = token("github.event.pull_request.body");
  readonly draft = token("github.event.pull_request.draft");
  readonly head = new GitHubPullRequestBranchCtx("github.event.pull_request.head");
  readonly base = new GitHubPullRequestBranchCtx("github.event.pull_request.base");
}

class GitHubMergeGroupCtx {
  readonly head_ref = token("github.event.merge_group.head_ref");
  readonly base_ref = token("github.event.merge_group.base_ref");
  readonly head_sha = token("github.event.merge_group.head_sha");
  readonly base_sha = token("github.event.merge_group.base_sha");
}

class GitHubWorkflowRunCtx {
  readonly id = token("github.event.workflow_run.id");
  readonly head_branch = token("github.event.workflow_run.head_branch");
  readonly head_sha = token("github.event.workflow_run.head_sha");
  readonly status = token("github.event.workflow_run.status");
  readonly conclusion = token("github.event.workflow_run.conclusion");
  readonly event = token("github.event.workflow_run.event");
}

class GitHubEventCtx {
  readonly pull_request = new GitHubPullRequestCtx();
  readonly merge_group = new GitHubMergeGroupCtx();
  readonly workflow_run = new GitHubWorkflowRunCtx();

  field(path: string): Fragment {
    return token(`github.event.${path}` as RawToken);
  }
}

class GitHubCtx {
  readonly action = token("github.action");
  readonly action_path = token("github.action_path");
  readonly action_ref = token("github.action_ref");
  readonly action_repository = token("github.action_repository");
  readonly action_status = token("github.action_status");
  readonly actor = token("github.actor");
  readonly actor_id = token("github.actor_id");
  readonly api_url = token("github.api_url");
  readonly base_ref = token("github.base_ref");
  readonly env = token("github.env");
  readonly event_name = token("github.event_name");
  readonly event_path = token("github.event_path");
  readonly graphql_url = token("github.graphql_url");
  readonly head_ref = token("github.head_ref");
  readonly job = token("github.job");
  readonly path = token("github.path");
  readonly ref = token("github.ref");
  readonly ref_name = token("github.ref_name");
  readonly ref_protected = token("github.ref_protected");
  readonly ref_type = token("github.ref_type");
  readonly repository = token("github.repository");
  readonly repository_id = token("github.repository_id");
  readonly repository_owner = token("github.repository_owner");
  readonly repository_owner_id = token("github.repository_owner_id");
  readonly repository_url = token("github.repository_url");
  readonly retention_days = token("github.retention_days");
  readonly run_id = token("github.run_id");
  readonly run_number = token("github.run_number");
  readonly run_attempt = token("github.run_attempt");
  readonly server_url = token("github.server_url");
  readonly sha = token("github.sha");
  readonly token = token("github.token");
  readonly triggering_actor = token("github.triggering_actor");
  readonly workflow = token("github.workflow");
  readonly workflow_ref = token("github.workflow_ref");
  readonly workflow_sha = token("github.workflow_sha");
  readonly workspace = token("github.workspace");
  readonly ref_name_default = token("github.ref_name");
  readonly event = new GitHubEventCtx();

  field(name: string): Fragment {
    return token(`github.${name}` as RawToken);
  }
}

class EnvCtx {
  readonly var = createDynamicTokenFactory("env");

  scope<const Names extends readonly string[]>(
    ...names: Names
  ): { readonly [K in Names[number]]: Fragment } {
    const scoped: Record<string, Fragment> = {};
    for (const name of names) {
      scoped[name] = this.var(name);
    }
    return deepFreeze(scoped) as { readonly [K in Names[number]]: Fragment };
  }
}

class SecretsCtx {
  readonly secret = createDynamicTokenFactory("secrets");

  scope<const Names extends readonly string[]>(
    ...names: Names
  ): { readonly [K in Names[number]]: Fragment } {
    const scoped: Record<string, Fragment> = {};
    for (const name of names) {
      scoped[name] = this.secret(name);
    }
    return deepFreeze(scoped) as { readonly [K in Names[number]]: Fragment };
  }
}

class VarsCtx {
  readonly var = createDynamicTokenFactory("vars");

  scope<const Names extends readonly string[]>(
    ...names: Names
  ): { readonly [K in Names[number]]: Fragment } {
    const scoped: Record<string, Fragment> = {};
    for (const name of names) {
      scoped[name] = this.var(name);
    }
    return deepFreeze(scoped) as { readonly [K in Names[number]]: Fragment };
  }
}

class MatrixCtx {
  readonly value = createDynamicTokenFactory("matrix");
}

class JobCtx {
  readonly status = token("job.status");
  readonly container = token("job.container");
  readonly container_id = token("job.container.id");
  readonly container_network = token("job.container.network");
  readonly services = {
    id: (serviceId: string) => token(`job.services.${serviceId}.id` as RawToken),
    network: (serviceId: string) =>
      token(`job.services.${serviceId}.network` as RawToken),
    ports: (serviceId: string) => token(`job.services.${serviceId}.ports` as RawToken),
  } as const;
}

class JobsCtx {
  readonly result = (jobId: string) => token(`jobs.${jobId}.result` as RawToken);
  readonly output = (jobId: string, outputName: string) =>
    token(`jobs.${jobId}.outputs.${outputName}` as RawToken);
}

class StepsCtx {
  readonly conclusion = (stepId: string) =>
    token(`steps.${stepId}.conclusion` as RawToken);
  readonly outcome = (stepId: string) => token(`steps.${stepId}.outcome` as RawToken);
  readonly output = (stepId: string, outputName: string) =>
    token(`steps.${stepId}.outputs.${outputName}` as RawToken);
}

class NeedsCtx {
  readonly result = (jobId: string) => token(`needs.${jobId}.result` as RawToken);
  readonly output = (jobId: string, outputName: string) =>
    token(`needs.${jobId}.outputs.${outputName}` as RawToken);
}

class RunnerCtx {
  readonly name = token("runner.name");
  readonly os = token("runner.os");
  readonly arch = token("runner.arch");
  readonly temp = token("runner.temp");
  readonly tool_cache = token("runner.tool_cache");
  readonly debug = token("runner.debug");
  readonly environment = token("runner.environment");
}

class StrategyCtx {
  readonly fail_fast = token("strategy.fail-fast");
  readonly job_index = token("strategy.job-index");
  readonly job_total = token("strategy.job-total");
  readonly max_parallel = token("strategy.max-parallel");
}

class InputsCtx {
  readonly value = createDynamicTokenFactory("inputs");
}

function deepFreeze<T>(object: T): T {
  if (object && typeof object === "object" && !Object.isFrozen(object)) {
    Object.freeze(object);
    for (const value of Object.values(object as Record<string, unknown>)) {
      deepFreeze(value);
    }
  }
  return object;
}

export type ContextObjectKey =
  | "github"
  | "env"
  | "secrets"
  | "vars"
  | "matrix"
  | "job"
  | "jobs"
  | "steps"
  | "needs"
  | "runner"
  | "strategy"
  | "inputs";

class ContextNamespace {
  readonly github = deepFreeze(new GitHubCtx());
  readonly env = deepFreeze(new EnvCtx());
  readonly secrets = deepFreeze(new SecretsCtx());
  readonly vars = deepFreeze(new VarsCtx());
  readonly matrix = deepFreeze(new MatrixCtx());
  readonly job = deepFreeze(new JobCtx());
  readonly jobs = deepFreeze(new JobsCtx());
  readonly steps = deepFreeze(new StepsCtx());
  readonly needs = deepFreeze(new NeedsCtx());
  readonly runner = deepFreeze(new RunnerCtx());
  readonly strategy = deepFreeze(new StrategyCtx());
  readonly inputs = deepFreeze(new InputsCtx());
  readonly fn = fn;
  readonly raw = raw;

  token(path: RawToken): Fragment {
    return token(path);
  }

  fragment(inner: string): Fragment {
    return fragment(inner);
  }

  wrap(inner: string): WorkflowExpression {
    return wrap(inner);
  }

  expr(strings: TemplateStringsArray, ...values: ExprInterpolationValue[]): WorkflowExpression {
    return expr(strings, ...values);
  }

  pick<const Keys extends readonly ContextObjectKey[]>(
    ...keys: Keys
  ): { readonly [K in Keys[number]]: ContextNamespace[K] } {
    const selection: Partial<Record<ContextObjectKey, unknown>> = {};
    for (const key of keys) {
      selection[key] = this[key];
    }
    return deepFreeze(selection) as {
      readonly [K in Keys[number]]: ContextNamespace[K];
    };
  }
}

export const ctx = deepFreeze(new ContextNamespace());

