// Option 11: Final DSL Design (based on Option 10 with refinements from comparison game)
// Key changes from Option 10:
// - Single tag: `expr` only (removed `gh` alias)
// - Namespace: `ctx` instead of `contexts`
// - Auto-quote plain strings in expressions
// - Explicit validation: fail fast on double-wrapping, use unwrap() helper for intentional unwrap
// - Plain string types (no branding)

// Prefixes that form valid GitHub Actions context tokens
export type RawTokenPrefix =
  | 'github'
  | 'env'
  | 'matrix'
  | 'needs'
  | 'steps'
  | 'secrets'
  | 'vars'
  | 'runner';
export type RawToken = `${RawTokenPrefix}.${string}`;
export type WorkflowExpr = `${'${{'} ${string} }}`; // no brand

// Fragment abstraction (unwrapped piece of expression)
export interface Fragment {
  readonly inner: string; // unwrapped content
  toString(): string; // returns inner
  wrap(): WorkflowExpr; // produce wrapped expression
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

function fragment(inner: string): Fragment {
  return new FragmentImpl(inner);
}

export function token(path: RawToken): Fragment {
  return fragment(path);
}

function escapeSingle(str: string): string {
  return str.replace(/'/g, "\\'");
}

// raw(): produce a quoted literal fragment (for edge cases)
export function raw(value: string): Fragment {
  return fragment(`'${escapeSingle(value)}'`);
}

// wrap() ensures exactly one ${{ }} with explicit validation
export function wrap(inner: string): WorkflowExpr {
  // Explicit validation: fail fast on double-wrapping
  if (inner.includes('${{')) {
    const cleaned = inner.replace(/^\$\{\{\s*|\s*\}\}$/g, '');
    throw new Error(
      `Expression already wrapped! Did you mean to use: ${cleaned.trim()}. Use unwrap() helper for intentional unwrapping.`,
    );
  }
  const trimmed = inner.trim();
  return `${'${{'} ${trimmed} }}` as WorkflowExpr;
}

// Helper function to unwrap an expression (extract inner content)
// Only removes the outer ${{ }} wrapper, leaving any nested expressions intact
// Assumes the expression was created with expr(), so it's already valid and properly formatted
// Since expr() always creates expressions as "${{ <content> }}", we can remove exactly 4 chars from start and 3 from end
export function unwrap(expr: WorkflowExpr): string {
  if (!expr.startsWith('${{ ') || !expr.endsWith(' }}')) {
    throw new Error('Cannot unwrap: expression must start with "${{ " and end with " }}"');
  }

  // Remove the outer "${{ " (4 chars) and " }}" (3 chars) wrapper
  // No need to trim() since wrap() already trims the inner content
  return expr.slice(4, -3);
}

function unwrapMaybe(value: string): string {
  if (value.startsWith('${{')) {
    return value
      .replace(/^\$\{\{\s*/, '')
      .replace(/\s*\}\}$/, '')
      .trim();
  }
  return value;
}

// Auto-quote plain strings (not Fragments, not WorkflowExpr, not RawToken)
function autoQuoteIfNeeded(value: string | Fragment | RawToken | WorkflowExpr): string {
  // If it's already a Fragment, extract inner
  if (typeof value === 'object' && value !== null && 'inner' in value) {
    return (value as Fragment).inner;
  }
  // If it's a WorkflowExpr string (unwrap it)
  if (typeof value === 'string' && value.startsWith('${{')) {
    return unwrapMaybe(value);
  }
  // If it's a RawToken (starts with known prefix), use as-is
  if (typeof value === 'string') {
    const prefixes: RawTokenPrefix[] = [
      'github',
      'env',
      'matrix',
      'needs',
      'steps',
      'secrets',
      'vars',
      'runner',
    ];
    if (prefixes.some((prefix) => value.startsWith(`${prefix}.`))) {
      return value;
    }
    // Plain string - auto-quote it
    return `'${escapeSingle(value)}'`;
  }
  return String(value);
}

// Function helpers (return inner bodies)
type ExprValue = Fragment | RawToken | WorkflowExpr | string;

export const fn = {
  always: () => 'always()',
  success: () => 'success()',
  failure: () => 'failure()',
  cancelled: () => 'cancelled()',
  contains: (a: ExprValue, b: ExprValue) =>
    `contains(${autoQuoteIfNeeded(a)}, ${autoQuoteIfNeeded(b)})`,
  startsWith: (v: ExprValue, prefix: string) =>
    `startsWith(${autoQuoteIfNeeded(v)}, '${escapeSingle(prefix)}')`,
  endsWith: (v: ExprValue, suffix: string) =>
    `endsWith(${autoQuoteIfNeeded(v)}, '${escapeSingle(suffix)}')`,
  format: (template: string, ...values: ExprValue[]) => {
    if (!/\{\d+}/.test(template))
      throw new Error('format template must contain placeholders like {0}');
    return `format('${escapeSingle(template)}', ${values.map(autoQuoteIfNeeded).join(', ')})`;
  },
  join: (arr: ExprValue, sep = ',') => `join(${autoQuoteIfNeeded(arr)}, '${escapeSingle(sep)}')`,
  hashFiles: (...paths: ExprValue[]) => `hashFiles(${paths.map(autoQuoteIfNeeded).join(', ')})`,
  toJSON: (v: ExprValue) => `toJSON(${autoQuoteIfNeeded(v)})`,
  fromJSON: (v: ExprValue) => `fromJSON(${autoQuoteIfNeeded(v)})`,
};

function toInner(v: Fragment | RawToken | WorkflowExpr | string): string {
  if (typeof v === 'string') {
    // Check if it's a WorkflowExpr (unwrap it)
    if (v.startsWith('${{')) {
      return unwrapMaybe(v);
    }
    // Check if it's a RawToken (starts with known prefix)
    const prefixes: RawTokenPrefix[] = [
      'github',
      'env',
      'matrix',
      'needs',
      'steps',
      'secrets',
      'vars',
      'runner',
    ];
    if (prefixes.some((prefix) => v.startsWith(`${prefix}.`))) {
      return v;
    }
    // Check if it looks like an expression fragment (contains function calls, operators, etc.)
    // Expression fragments typically contain: parentheses, operators, or are multi-part
    if (/[()]/.test(v) || /[|&<>!=]/.test(v) || v.includes(' ') || v.includes(',')) {
      // Likely an expression fragment from fn.* helpers - return as-is
      return v;
    }
    // Plain string literal - auto-quote it
    return `'${escapeSingle(v)}'`;
  }
  if (typeof v === 'object' && v !== null && 'inner' in v) {
    return (v as Fragment).inner;
  }
  return unwrapMaybe(String(v));
}

// Single tagged template for building expressions
type ExprInterpolationValue = Fragment | RawToken | WorkflowExpr | string;

export function expr(parts: TemplateStringsArray, ...vals: ExprInterpolationValue[]): WorkflowExpr {
  let inner = '';
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

// Context namespaces
class GitHubCtx {
  workflow = token('github.workflow');
  ref = token('github.ref');
  sha = token('github.sha');
  event_name = token('github.event_name');
  head_ref = token('github.head_ref');
  event = {
    pull_request: {
      title: token('github.event.pull_request.title'),
      number: token('github.event.pull_request.number'),
      head: {
        ref: token('github.event.pull_request.head.ref'),
        sha: token('github.event.pull_request.head.sha'),
      },
      base: {
        ref: token('github.event.pull_request.base.ref'),
        sha: token('github.event.pull_request.base.sha'),
      },
    },
    merge_group: {
      head_ref: token('github.event.merge_group.head_ref'),
      base_ref: token('github.event.merge_group.base_ref'),
      head_sha: token('github.event.merge_group.head_sha'),
      base_sha: token('github.event.merge_group.base_sha'),
    },
  } as const;
}

class EnvCtx {
  var(name: string) {
    return token(`env.${name}` as RawToken);
  }
}

class SecretsCtx {
  secret(name: string) {
    return token(`secrets.${name}` as RawToken);
  }
}

class MatrixCtx {
  value(name: string) {
    return token(`matrix.${name}` as RawToken);
  }
}

class StepsCtx {
  output(step: string, out: string) {
    return token(`steps.${step}.outputs.${out}` as RawToken);
  }
}

class NeedsCtx {
  output(job: string, out: string) {
    return token(`needs.${job}.outputs.${out}` as RawToken);
  }
}

class Ctx {
  github = new GitHubCtx();
  env = new EnvCtx();
  secrets = new SecretsCtx();
  matrix = new MatrixCtx();
  steps = new StepsCtx();
  needs = new NeedsCtx();
  fn = fn;
  raw = raw; // expose raw literal helper for edge cases
  token(path: RawToken) {
    return token(path);
  }
}

export const ctx = new Ctx();

// Examples (using final design)
export const examples = {
  runName: expr`${ctx.github.workflow} - ${ctx.github.ref}`,
  runNameWithFallback: expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`,
  condition_tests: expr`${fn.endsWith(ctx.github.head_ref, '-run-tests')} || ${fn.always()}`,
  contains_ref: expr`${fn.contains(ctx.github.ref, 'develop')}`, // auto-quoted string
  format_example: expr`${fn.format('PR {0} #{1}', ctx.github.event.pull_request.title, ctx.github.event.pull_request.number)}`,
  hash_files: expr`${fn.hashFiles('package.json', 'tsconfig.json')}`, // auto-quoted strings
  steps_output: expr`${ctx.steps.output('build', 'artifact-path')}`,
  env_var: expr`${ctx.env.var('NODE_VERSION')}`,
  secret: expr`${ctx.secrets.secret('API_KEY')}`,
  intentional_unwrap: (() => {
    const expr1 = expr`${ctx.github.ref}`;
    return expr`${unwrap(expr1)}`; // intentional unwrap via unwrap() helper
  })(),
};

// Guidance:
// - Use expr`` for all expressions (run-name, if conditions, etc.)
// - Plain strings are auto-quoted in expressions
// - Use raw() for edge cases where you need explicit control
// - Never manually write ${{ }}; expr tag ensures single wrapping
// - Use unwrap() helper for intentional unwrapping when needed
// - Explicit validation prevents accidental double-wrapping
