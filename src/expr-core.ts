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

export interface Fragment {
  readonly inner: string;
  toString(): string;
  wrap(): string;
}

class FragmentImpl implements Fragment {
  readonly inner: string;
  constructor(inner: string) {
    this.inner = inner;
  }
  toString(): string {
    return this.inner;
  }
  wrap(): string {
    return wrap(this.inner);
  }
}

export function token(path: string): Fragment {
  return new FragmentImpl(path);
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

export type ExprInterpolationValue = Fragment | RawToken | string;
export type ExprValue = Fragment | RawToken | string;

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
