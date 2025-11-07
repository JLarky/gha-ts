/**
 * Modern expression builder for GitHub Actions workflows.
 *
 * This module provides a type-safe DSL for building GitHub Actions expressions
 * with automatic quoting, validation, and a fluent API.
 *
 * @example
 * ```ts
 * import { expr, ctx, fn } from 'gha-ts/expressions';
 *
 * // Simple context access
 * const runName = expr`${ctx.github.workflow} - ${ctx.github.ref}`;
 *
 * // With functions
 * const condition = expr`${fn.endsWith(ctx.github.head_ref, '-run-tests')}`;
 *
 * // Complex expressions with fallback
 * const title = expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`;
 * ```
 *
 * Key features:
 * - Auto-quotes plain strings in expressions
 * - Explicit validation to prevent double-wrapping
 * - Type-safe context accessors
 * - Function helpers with proper escaping
 * - Fragment abstraction for composable expressions
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Valid GitHub Actions context prefixes that can be used as tokens.
 */
export type RawTokenPrefix =
  | "github"
  | "env"
  | "matrix"
  | "needs"
  | "steps"
  | "secrets"
  | "vars"
  | "runner"
  | "job"
  | "jobs"
  | "strategy"
  | "inputs";

/**
 * A raw context token like `github.ref` or `env.NODE_VERSION`.
 */
export type RawToken = `${RawTokenPrefix}.${string}`;

/**
 * A properly wrapped GitHub Actions expression: `${{ expression }}`.
 */
export type WorkflowExpr = `\${{ ${string} }}`;

// ============================================================================
// Fragment Abstraction
// ============================================================================

/**
 * Represents an unwrapped piece of an expression that can be composed.
 * Fragments can be combined and then wrapped into a final WorkflowExpr.
 */
export interface Fragment {
  /** The unwrapped expression content */
  readonly inner: string;
  /** Returns the inner content as a string */
  toString(): string;
  /** Wraps this fragment into a complete WorkflowExpr */
  wrap(): WorkflowExpr;
}

class FragmentImpl implements Fragment {
  readonly inner: string;

  constructor(inner: string) {
    this.inner = inner;
  }

  toString(): string {
    return this.inner;
  }

  wrap(): WorkflowExpr {
    return wrap(this.inner);
  }
}

/**
 * Creates a fragment from an unwrapped expression string.
 */
export function fragment(inner: string): Fragment {
  return new FragmentImpl(inner);
}

/**
 * Creates a fragment from a context token path.
 *
 * @example
 * ```ts
 * const ref = token('github.ref');
 * expr`${ref}`; // ${{ github.ref }}
 * ```
 */
export function token(path: RawToken): Fragment {
  return fragment(path);
}

// ============================================================================
// Escaping & Quoting
// ============================================================================

/**
 * Escapes single quotes in a string for use in GitHub Actions expressions.
 */
function escapeSingle(str: string): string {
  return str.replace(/'/g, "'\\''");
}

/**
 * Creates a quoted literal fragment for edge cases where you need
 * explicit control over string literals.
 *
 * @example
 * ```ts
 * expr`${raw("some'complex'string")}`;
 * ```
 */
export function raw(value: string): Fragment {
  return fragment(`'${escapeSingle(value)}'`);
}

// ============================================================================
// Wrapping & Unwrapping
// ============================================================================

/**
 * Wraps an expression string with `${{ }}`, ensuring no double-wrapping.
 *
 * @throws {Error} If the input is already wrapped (contains `${{`)
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
  return `\${{ ${trimmed} }}` as WorkflowExpr;
}

/**
 * Unwraps a WorkflowExpr to extract its inner content.
 * Only removes the outer `${{ }}` wrapper, leaving any nested expressions intact.
 *
 * @example
 * ```ts
 * const expr1 = expr`${ctx.github.ref}`;
 * const inner = unwrap(expr1); // 'github.ref'
 * ```
 */
export function unwrap(expression: WorkflowExpr): string {
  if (!expression.startsWith("${{ ") || !expression.endsWith(" }}")) {
    throw new Error(
      'Cannot unwrap: expression must start with "${{ " and end with " }}"',
    );
  }

  // Remove the outer "${{ " (4 chars) and " }}" (3 chars) wrapper
  return expression.slice(4, -3);
}

/**
 * Internal helper to unwrap an expression if it's wrapped, otherwise return as-is.
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

// ============================================================================
// Auto-Quoting
// ============================================================================

/**
 * Auto-quotes plain strings, while handling Fragments, WorkflowExprs, and RawTokens appropriately.
 */
function autoQuoteIfNeeded(
  value: string | Fragment | RawToken | WorkflowExpr,
): string {
  // If it's a Fragment, extract inner
  if (typeof value === "object" && value !== null && "inner" in value) {
    return (value as Fragment).inner;
  }

  // If it's a string
  if (typeof value === "string") {
    // If it's a WorkflowExpr (unwrap it)
    if (value.startsWith("${{")) {
      return unwrapMaybe(value);
    }

    // If it's a RawToken (starts with known prefix), use as-is
    const prefixes: RawTokenPrefix[] = [
      "github",
      "env",
      "matrix",
      "needs",
      "steps",
      "secrets",
      "vars",
      "runner",
      "job",
      "jobs",
      "strategy",
      "inputs",
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
 * Converts various value types to their inner expression representation.
 */
function toInner(
  v: Fragment | RawToken | WorkflowExpr | string | number | boolean,
): string {
  if (typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }

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
      "job",
      "jobs",
      "strategy",
      "inputs",
    ];
    if (prefixes.some((prefix) => v.startsWith(`${prefix}.`))) {
      return v;
    }

    // Check if it looks like an expression fragment (contains function calls, operators, etc.)
    if (/[()]/.test(v) || /[|&<>!=]/.test(v) || v.includes(" ") || v.includes(",")) {
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

// ============================================================================
// Expression Builder
// ============================================================================

/**
 * Values that can be interpolated in an expr template.
 */
type ExprInterpolationValue =
  | Fragment
  | RawToken
  | WorkflowExpr
  | string
  | number
  | boolean
  | undefined;

/**
 * Tagged template function for building GitHub Actions expressions.
 *
 * @example
 * ```ts
 * // Simple context access
 * expr`${ctx.github.ref}`
 * // => ${{ github.ref }}
 *
 * // With operators
 * expr`${ctx.github.event_name} == 'push'`
 * // => ${{ github.event_name == 'push' }}
 *
 * // With functions
 * expr`${fn.contains(ctx.github.ref, 'main')}`
 * // => ${{ contains(github.ref, 'main') }}
 * ```
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

// ============================================================================
// Function Helpers
// ============================================================================

/**
 * Values that can be used as function arguments.
 */
type ExprValue = Fragment | RawToken | WorkflowExpr | string;

/**
 * GitHub Actions expression functions.
 *
 * @see https://docs.github.com/en/actions/learn-github-actions/expressions#functions
 */
export const fn = {
  /**
   * Returns true if the workflow was not cancelled.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#always
   */
  always: (): string => "always()",

  /**
   * Returns true if all previous steps have succeeded.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#success
   */
  success: (): string => "success()",

  /**
   * Returns true if any previous step has failed.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#failure
   */
  failure: (): string => "failure()",

  /**
   * Returns true if the workflow was cancelled.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#cancelled
   */
  cancelled: (): string => "cancelled()",

  /**
   * Returns true if searchString contains searchValue.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#contains
   */
  contains: (searchString: ExprValue, searchValue: ExprValue): string =>
    `contains(${autoQuoteIfNeeded(searchString)}, ${autoQuoteIfNeeded(searchValue)})`,

  /**
   * Returns true if searchString starts with searchValue.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#startswith
   */
  startsWith: (searchString: ExprValue, searchValue: string): string =>
    `startsWith(${autoQuoteIfNeeded(searchString)}, '${escapeSingle(searchValue)}')`,

  /**
   * Returns true if searchString ends with searchValue.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#endswith
   */
  endsWith: (searchString: ExprValue, searchValue: string): string =>
    `endsWith(${autoQuoteIfNeeded(searchString)}, '${escapeSingle(searchValue)}')`,

  /**
   * Replaces values in a format string.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#format
   *
   * @example
   * ```ts
   * fn.format('Hello {0} {1}!', 'GitHub', 'Actions')
   * // => format('Hello {0} {1}!', 'GitHub', 'Actions')
   * ```
   */
  format: (template: string, ...values: ExprValue[]): string => {
    if (!/\{\d+}/.test(template)) {
      throw new Error("format template must contain placeholders like {0}");
    }
    return `format('${escapeSingle(template)}', ${values.map(autoQuoteIfNeeded).join(", ")})`;
  },

  /**
   * Concatenates values in an array into a string.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#join
   */
  join: (array: ExprValue, separator = ","): string =>
    `join(${autoQuoteIfNeeded(array)}, '${escapeSingle(separator)}')`,

  /**
   * Returns a hash for files matching the glob pattern.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#hashfiles
   */
  hashFiles: (...paths: ExprValue[]): string =>
    `hashFiles(${paths.map(autoQuoteIfNeeded).join(", ")})`,

  /**
   * Converts a value to a JSON string.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#tojson
   */
  toJSON: (value: ExprValue): string => `toJSON(${autoQuoteIfNeeded(value)})`,

  /**
   * Parses a JSON string.
   * @see https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson
   */
  fromJSON: (json: ExprValue): string => `fromJSON(${autoQuoteIfNeeded(json)})`,
} as const;

// ============================================================================
// Context Accessors
// ============================================================================

/**
 * GitHub context properties.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#github-context
 */
class GitHubCtx {
  /** The name of the workflow */
  workflow = token("github.workflow" as RawToken);

  /** The git ref (branch or tag name) */
  ref = token("github.ref" as RawToken);

  /** The commit SHA */
  sha = token("github.sha" as RawToken);

  /** The name of the event that triggered the workflow */
  event_name = token("github.event_name" as RawToken);

  /** The head ref for pull requests */
  head_ref = token("github.head_ref" as RawToken);

  /** The base ref for pull requests */
  base_ref = token("github.base_ref" as RawToken);

  /** The repository owner and name */
  repository = token("github.repository" as RawToken);

  /** The repository owner */
  repository_owner = token("github.repository_owner" as RawToken);

  /** The person or app that triggered the workflow */
  actor = token("github.actor" as RawToken);

  /** The run ID */
  run_id = token("github.run_id" as RawToken);

  /** The run number */
  run_number = token("github.run_number" as RawToken);

  /** The run attempt number */
  run_attempt = token("github.run_attempt" as RawToken);

  /** The job ID */
  job = token("github.job" as RawToken);

  /** The ref name */
  ref_name = token("github.ref_name" as RawToken);

  /** The ref type (branch or tag) */
  ref_type = token("github.ref_type" as RawToken);

  /** Event payload accessors */
  event = {
    pull_request: {
      title: token("github.event.pull_request.title" as RawToken),
      number: token("github.event.pull_request.number" as RawToken),
      head: {
        ref: token("github.event.pull_request.head.ref" as RawToken),
        sha: token("github.event.pull_request.head.sha" as RawToken),
      },
      base: {
        ref: token("github.event.pull_request.base.ref" as RawToken),
        sha: token("github.event.pull_request.base.sha" as RawToken),
      },
    },
    merge_group: {
      head_ref: token("github.event.merge_group.head_ref" as RawToken),
      base_ref: token("github.event.merge_group.base_ref" as RawToken),
      head_sha: token("github.event.merge_group.head_sha" as RawToken),
      base_sha: token("github.event.merge_group.base_sha" as RawToken),
    },
  } as const;

  /**
   * Access arbitrary event payload properties.
   * @example ctx.github.eventPath('issue.number')
   */
  eventPath(path: string): Fragment {
    return token(`github.event.${path}` as RawToken);
  }
}

/**
 * Environment variable context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#env-context
 */
class EnvCtx {
  /**
   * Access an environment variable.
   * @example ctx.env.var('NODE_VERSION')
   */
  var(name: string): Fragment {
    return token(`env.${name}` as RawToken);
  }
}

/**
 * Secrets context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#secrets-context
 */
class SecretsCtx {
  /**
   * Access a secret.
   * @example ctx.secrets.secret('API_KEY')
   */
  secret(name: string): Fragment {
    return token(`secrets.${name}` as RawToken);
  }
}

/**
 * Matrix context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#matrix-context
 */
class MatrixCtx {
  /**
   * Access a matrix value.
   * @example ctx.matrix.value('node-version')
   */
  value(name: string): Fragment {
    return token(`matrix.${name}` as RawToken);
  }
}

/**
 * Steps context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#steps-context
 */
class StepsCtx {
  /**
   * Access a step's output.
   * @example ctx.steps.output('build', 'artifact-path')
   */
  output(stepId: string, outputName: string): Fragment {
    return token(`steps.${stepId}.outputs.${outputName}` as RawToken);
  }

  /**
   * Access a step's conclusion.
   * @example ctx.steps.conclusion('build')
   */
  conclusion(stepId: string): Fragment {
    return token(`steps.${stepId}.conclusion` as RawToken);
  }

  /**
   * Access a step's outcome.
   * @example ctx.steps.outcome('build')
   */
  outcome(stepId: string): Fragment {
    return token(`steps.${stepId}.outcome` as RawToken);
  }
}

/**
 * Needs context (job dependencies).
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#needs-context
 */
class NeedsCtx {
  /**
   * Access a job's output.
   * @example ctx.needs.output('build', 'version')
   */
  output(jobId: string, outputName: string): Fragment {
    return token(`needs.${jobId}.outputs.${outputName}` as RawToken);
  }

  /**
   * Access a job's result.
   * @example ctx.needs.result('build')
   */
  result(jobId: string): Fragment {
    return token(`needs.${jobId}.result` as RawToken);
  }
}

/**
 * Inputs context (for reusable workflows and actions).
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#inputs-context
 */
class InputsCtx {
  /**
   * Access an input value.
   * @example ctx.inputs.get('environment')
   */
  get(name: string): Fragment {
    return token(`inputs.${name}` as RawToken);
  }
}

/**
 * Vars context (configuration variables).
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#vars-context
 */
class VarsCtx {
  /**
   * Access a configuration variable.
   * @example ctx.vars.get('DEPLOY_REGION')
   */
  get(name: string): Fragment {
    return token(`vars.${name}` as RawToken);
  }
}

/**
 * Runner context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#runner-context
 */
class RunnerCtx {
  /** The runner's OS (Linux, Windows, macOS) */
  os = token("runner.os" as RawToken);

  /** The runner's architecture (X86, X64, ARM, ARM64) */
  arch = token("runner.arch" as RawToken);

  /** The runner's name */
  name = token("runner.name" as RawToken);

  /** The runner's temp directory */
  temp = token("runner.temp" as RawToken);

  /** The runner's tool cache directory */
  tool_cache = token("runner.tool_cache" as RawToken);
}

/**
 * Job context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#job-context
 */
class JobCtx {
  /** The job's status (success, failure, cancelled) */
  status = token("job.status" as RawToken);

  /** The job's container info */
  container = {
    id: token("job.container.id" as RawToken),
    network: token("job.container.network" as RawToken),
  } as const;

  /**
   * Access a service container's properties.
   * @example ctx.job.service('redis', 'id')
   */
  service(serviceName: string, property: string): Fragment {
    return token(`job.services.${serviceName}.${property}` as RawToken);
  }
}

/**
 * Strategy context.
 * @see https://docs.github.com/en/actions/learn-github-actions/contexts#strategy-context
 */
class StrategyCtx {
  /** Whether to fail fast */
  fail_fast = token("strategy.fail-fast" as RawToken);

  /** The current job index */
  job_index = token("strategy.job-index" as RawToken);

  /** The total number of jobs */
  job_total = token("strategy.job-total" as RawToken);

  /** The maximum number of parallel jobs */
  max_parallel = token("strategy.max-parallel" as RawToken);
}

/**
 * Root context object providing access to all GitHub Actions contexts.
 *
 * @example
 * ```ts
 * import { ctx } from 'gha-ts/expressions';
 *
 * ctx.github.ref        // github.ref
 * ctx.env.var('NODE')   // env.NODE
 * ctx.secrets.secret('TOKEN')  // secrets.TOKEN
 * ```
 */
class Ctx {
  /** GitHub context */
  github = new GitHubCtx();

  /** Environment variables context */
  env = new EnvCtx();

  /** Secrets context */
  secrets = new SecretsCtx();

  /** Matrix context */
  matrix = new MatrixCtx();

  /** Steps context */
  steps = new StepsCtx();

  /** Needs context (job dependencies) */
  needs = new NeedsCtx();

  /** Inputs context (reusable workflows/actions) */
  inputs = new InputsCtx();

  /** Configuration variables context */
  vars = new VarsCtx();

  /** Runner context */
  runner = new RunnerCtx();

  /** Job context */
  job = new JobCtx();

  /** Strategy context */
  strategy = new StrategyCtx();

  /** Function helpers (aliased for convenience) */
  fn = fn;

  /** Raw literal helper (aliased for convenience) */
  raw = raw;

  /**
   * Create a custom token from any path.
   * @example ctx.token('custom.path')
   */
  token(path: RawToken): Fragment {
    return token(path);
  }
}

/**
 * Context object providing access to all GitHub Actions contexts and helpers.
 *
 * @example
 * ```ts
 * import { ctx, expr } from 'gha-ts/expressions';
 *
 * // Access contexts
 * const ref = ctx.github.ref;
 * const env = ctx.env.var('NODE_VERSION');
 *
 * // Use in expressions
 * const condition = expr`${ctx.github.event_name} == 'push'`;
 * ```
 */
export const ctx = new Ctx();
