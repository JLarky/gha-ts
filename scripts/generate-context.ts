#!/usr/bin/env bun
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

type TypeDesc = {
  kind: "string" | "number" | "bool" | "any" | "null" | "object" | "array";
  strict?: boolean;
  props?: Record<string, TypeDesc>;
  mapped?: TypeDesc;
  elem?: TypeDesc;
  doc?: string;
  docUrls?: string[];
};

type FuncSigDesc = {
  name: string;
  ret: TypeDesc;
  params: TypeDesc[];
  varargs?: boolean;
  doc?: string;
  docUrls?: string[];
};

function pascalCase(s: string): string {
  return s
    .split(/[-_.]/g)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
    .join("");
}

function jsDoc(lines: string[], doc?: string, docUrls?: string[]): string {
  const rows: string[] = [];
  if (doc && doc.trim().length > 0) rows.push(doc.trim());
  if (docUrls && docUrls.length > 0) rows.push(...docUrls);
  if (lines.length > 0) rows.push(...lines);
  if (rows.length === 0) return "";
  const body = rows.map((l) => ` * ${l}`).join("\n");
  return `/**\n${body}\n */\n`;
}

function isValidIdentifier(name: string): boolean {
  return /^[$A-Z_a-z][$\w]*$/.test(name);
}

function propDecl(name: string): string {
  return isValidIdentifier(name) ? name : `["${name}"]`;
}

function basePropExpr(prop: string): string {
  return "${this.base}." + prop;
}

function genPrimitiveGetter(
  prop: string,
  pathExpr: string,
  doc?: string,
  urls?: string[],
): string {
  const j = jsDoc([], doc, urls);
  return `${j}get ${propDecl(prop)}(): Fragment { return token(\`${pathExpr}\` as any); }`;
}

function genMappedMethod(
  ctxPath: string,
  prop: string,
  _desc: TypeDesc,
): string {
  // Special names for top-level contexts
  const method =
    prop === "secrets"
      ? "secret"
      : prop === "env" || prop === "vars"
        ? "var"
        : "any";
  return `/**
 * Mapped entries under ${ctxPath}.${prop}
 */
${method}(name: string) { return token(\`${ctxPath}.${prop}.\${name}\` as any); }`;
}

function genEmptyObjectMethod(ctxPath: string, prop: string): string {
  return `/**
 * Unstructured object under ${ctxPath}.${prop}
 */
${prop}(path: string) { return token(\`${ctxPath}.${prop}.\${path}\` as any); }`;
}

function genObjectClass(
  className: string,
  ctxPath: string,
  obj: TypeDesc,
  nested: string[],
): string {
  const lines: string[] = [];
  lines.push(`export class ${className} {`);
  lines.push(
    `  constructor(private readonly base: string = ${JSON.stringify(ctxPath)}) {}`,
  );
  if (obj.props && Object.keys(obj.props).length > 0) {
    for (const [prop, t] of Object.entries(obj.props)) {
      if (t.kind === "object") {
        if (t.props && Object.keys(t.props).length > 0) {
          const childClass = `${className}_${pascalCase(prop)}`;
          nested.push(
            genObjectClass(childClass, `${ctxPath}.${prop}`, t, nested),
          );
          lines.push(
            `  ${jsDoc([], t.doc, t.docUrls)}get ${propDecl(
              prop,
            )}() { return new ${childClass}(\`${basePropExpr(prop)}\`); }`,
          );
        } else if (t.mapped) {
          lines.push(
            `  ${jsDoc([], t.doc, t.docUrls)}${genMappedMethod("${this.base}", prop, t)}`,
          );
        } else {
          lines.push(
            `  ${jsDoc([], t.doc, t.docUrls)}${genEmptyObjectMethod("${this.base}", prop)}`,
          );
        }
      } else {
        lines.push(
          `  ${genPrimitiveGetter(prop, basePropExpr(prop), t.doc, t.docUrls)}`,
        );
      }
    }
  } else if (obj.mapped) {
    lines.push(
      `  ${genMappedMethod("${this.base}", "", obj).replace(/\.\./g, ".")}`,
    );
  }
  lines.push("}");
  return [lines.join("\n"), ...nested].join("\n\n");
}

// (kept for future typed overload generation)

function genFn(functions: Record<string, FuncSigDesc[]>): string {
  const lines: string[] = [];
  lines.push(`import { toInner, type ExprValue } from "../src/expr-core";`);
  lines.push(`export const fn = {`);
  for (const [key, overloads] of Object.entries(functions)) {
    const methodName = overloads[0]?.name || key;
    lines.push(
      `  ${methodName}: (...args: ExprValue[]) => \`${methodName}(\${args.map(toInner).join(", ")})\`,`,
    );
  }
  lines.push(`} as const;`);
  return lines.join("\n");
}

async function main() {
  const repoRoot = process.cwd();
  const varsPath = join(
    repoRoot,
    "scripts",
    "actionlint",
    "builtin-global-variable-types.json",
  );
  const fnsPath = join(
    repoRoot,
    "scripts",
    "actionlint",
    "builtin-func-signatures.json",
  );
  const outPath = join(repoRoot, "src", "context-generated.ts");

  const vars = JSON.parse(await readFile(varsPath, "utf8")) as Record<
    string,
    TypeDesc
  >;
  const fns = JSON.parse(await readFile(fnsPath, "utf8")) as Record<
    string,
    FuncSigDesc[]
  >;

  const header = `/* Auto-generated from actionlint JSON. Do not edit by hand. */
import { token, type Fragment } from "../src/expr-core";
`;

  const classDecls: string[] = [];
  const ctxProps: string[] = [];

  for (const [ctx, desc] of Object.entries(vars)) {
    const className = `${pascalCase(ctx)}Ctx`;
    if (desc.kind !== "object") continue;
    const classCode = genObjectClass(className, ctx, desc, []);
    classDecls.push(classCode);
    ctxProps.push(`  ${ctx} = new ${className}(${JSON.stringify(ctx)});`);
  }

  const fnCode = genFn(fns);

  const ctxAgg = `export class Ctx {
${ctxProps.join("\n")}
}
export const ctx = new Ctx();`;

  const content = [header, classDecls.join("\n\n"), fnCode, ctxAgg].join(
    "\n\n",
  );
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, content, "utf8");
}

await main();
