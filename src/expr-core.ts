// Core expression and fragment helpers (inspired by example.main.ts)
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
  | "strategy"
  | "inputs"
  | "jobs";
export type RawToken = `${RawTokenPrefix}.${string}`;

export interface Fragment<S = "any"> {
  readonly inner: string;
  toString(): string;
  wrap(): string;
  // phantom brand to distinguish scopes at compile time
  readonly __scope?: S;
}

class FragmentImpl<S = "any"> implements Fragment<S> {
  readonly inner: string;
  readonly __scope: S | undefined;
  constructor(inner: string) {
    this.inner = inner;
    this.__scope = undefined;
  }
  toString(): string {
    return this.inner;
  }
  wrap(): string {
    return wrap(this.inner);
  }
}

export function token<S = "any">(path: string): Fragment<S> {
  return new FragmentImpl<S>(path);
}

export function wrap(inner: string): string {
  if (inner.includes("${{")) {
    const cleaned = inner.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
    throw new Error(
      `Expression already wrapped! Did you mean to use: ${cleaned.trim()}. Use unwrap() to unwrap explicitly.`,
    );
  }
  return `${"${{"} ${inner.trim()} }}`;
}

export function unwrap(expr: string): string {
  if (!expr.startsWith("${{ ") || !expr.endsWith(" }}")) {
    throw new Error(
      'Cannot unwrap: expression must start with "${{ " and end with " }}"',
    );
  }
  return expr.slice(4, -3);
}

export function expr(
  parts: TemplateStringsArray,
  ...vals: Array<ExprInterpolationValue>
): string {
  let inner = "";
  for (let i = 0; i < parts.length; i++) {
    inner += parts[i];
    if (i < vals.length) {
      const val = vals[i];
      if (val !== undefined) inner += toInner(val);
    }
  }
  return wrap(inner);
}

export type AnyFragment = Fragment<any>;
export type ExprInterpolationValue = AnyFragment | RawToken | string;
export type ExprValue = AnyFragment | RawToken | string;

function escapeSingle(str: string): string {
  return str.replace(/'/g, "\\'");
}

export function raw(value: string): Fragment {
  return token(`'${escapeSingle(value)}'`);
}

export function toInner(v: ExprValue): string {
  if (typeof v === "string") {
    if (v.startsWith("${{")) return unwrap(v);
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
      "strategy",
      "inputs",
      "jobs",
    ];
    if (prefixes.some((p) => v.startsWith(`${p}.`))) return v;
    if (/[()]/.test(v) || /[|&<>!=]/.test(v)) {
      return v;
    }
    return `'${escapeSingle(v)}'`;
  }
  if (typeof v === "object" && v !== null && "inner" in v) {
    return (v as Fragment).inner;
  }
  return String(v);
}

// No scoped expr tags; a single expr is used everywhere.

// Generic fragment tree proxy for property-style access (e.g., github.event.*)
export function makeFragmentTree<S = "any">(prefix: string): any {
  const handler: ProxyHandler<any> = {
    get(_t, prop) {
      if (prop === "inner") return `${prefix}`;
      if (prop === "toString") return () => `${prefix}`;
      if (prop === "wrap") return () => token<S>(`${prefix}`).wrap();
      return makeFragmentTree<S>(
        prefix ? `${prefix}.${String(prop)}` : String(prop),
      );
    },
    has(_t, prop) {
      if (prop === "inner" || prop === "wrap" || prop === "toString")
        return true;
      return true;
    },
  };
  return new Proxy({}, handler);
}
