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

// Types for Actions Language Services descriptions.json
type LSDocEntry = {
  description?: string;
  [k: string]: any;
};
type LSDescriptions = {
  root?: Record<string, LSDocEntry>;
  functions?: Record<string, LSDocEntry>;
  github?: Record<string, LSDocEntry>;
  runner?: Record<string, LSDocEntry>;
  env?: Record<string, LSDocEntry>;
  vars?: Record<string, LSDocEntry>;
  job?: Record<string, LSDocEntry>;
  jobs?: Record<string, LSDocEntry>;
  steps?: Record<string, LSDocEntry>;
  secrets?: Record<string, LSDocEntry>;
  strategy?: Record<string, LSDocEntry>;
  matrix?: Record<string, LSDocEntry>;
  needs?: Record<string, LSDocEntry>;
  inputs?: Record<string, LSDocEntry>;
};

const CONTEXT_URLS: Record<string, string> = {
  github:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#github-context",
  env: "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#env-context",
  vars:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#vars-context",
  job: "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#job-context",
  jobs:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#jobs-context",
  steps:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#steps-context",
  runner:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#runner-context",
  secrets:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#secrets-context",
  strategy:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#strategy-context",
  matrix:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#matrix-context",
  needs:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#needs-context",
  inputs:
    "https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#inputs-context",
};
const FUNCTIONS_DOC_URL =
  "https://docs.github.com/en/actions/learn-github-actions/expressions#functions";

type DocOverlay = Record<
  string,
  {
    doc?: string;
    urls?: string[];
    override?: boolean | "true";
  }
>;

// Actions Language Services descriptions.json (subset)
// (merged above)

function pascalCase(s: string): string {
  return s
    .split(/[-_.]/g)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
    .join("");
}

function jsDoc(lines: string[], doc?: string, docUrls?: string[]): string {
  const rows: string[] = [];
  if (doc && doc.trim().length > 0) {
    for (const ln of doc.split("\n")) {
      rows.push(ln.trimEnd());
    }
  }
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
  if (prop === "event" && ctxPath === "${this.base}") {
    return `/**
 * Unstructured object under ${ctxPath}.${prop}
 */
get event() { return makeFragmentTree(\`${ctxPath}.event\`); }`;
  }
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
  lines.push(`${jsDoc([], obj.doc, obj.docUrls)}export class ${className} {`);
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

function genFn(
  functions: Record<string, FuncSigDesc[]>,
  fnDocs?: Record<string, { doc?: string; urls?: string[] }>,
): string {
  const lines: string[] = [];
  lines.push(`import { toInner, type ExprValue } from "../src/expr-core";`);
  lines.push(`export const fn = {`);
  for (const [key, overloads] of Object.entries(functions)) {
    const methodName = overloads[0]?.name || key;
    const entry = fnDocs?.[methodName];
    const doc = entry?.doc?.trim();
    const urls = entry?.urls && entry.urls.length ? entry.urls : [FUNCTIONS_DOC_URL];
    const js = jsDoc([], doc, urls);
    lines.push(
      `${js}  ${methodName}: (...args: ExprValue[]) => \`${methodName}(\${args.map(toInner).join(", ")})\`,`,
    );
  }
  lines.push(`} as const;`);
  return lines.join("\n");
}

function applyDocOverlay(desc: TypeDesc, basePath: string, overlay: DocOverlay) {
  const ov = overlay[basePath];
  if (ov) {
    const hasExistingDoc = !!(desc.doc && desc.doc.trim().length > 0);
    const hasExistingUrls = !!(desc.docUrls && desc.docUrls.length > 0);
    const overrideFlag = ov.override === true || ov.override === "true";

    if (ov.doc) {
      if (hasExistingDoc && ov.doc.trim() !== desc.doc!.trim()) {
        if (!overrideFlag) {
          console.warn(`[doc-overlay] Overriding existing doc at ${basePath}`);
        }
      } else if (!hasExistingDoc && overrideFlag) {
        console.warn(
          `[doc-overlay] override=true but no existing doc at ${basePath}`,
        );
      }
      desc.doc = ov.doc;
    }
    if (ov.urls) {
      if (hasExistingUrls) {
        if (!overrideFlag) {
          console.warn(
            `[doc-overlay] Overriding existing docUrls at ${basePath}`,
          );
        }
      } else if (!hasExistingUrls && overrideFlag) {
        console.warn(
          `[doc-overlay] override=true but no existing docUrls at ${basePath}`,
        );
      }
      desc.docUrls = ov.urls;
    }
  }
  if (desc.kind === "object" && desc.props) {
    for (const [prop, child] of Object.entries(desc.props)) {
      applyDocOverlay(child, `${basePath}.${prop}`, overlay);
    }
  }
}

function applyDefaultUrls(desc: TypeDesc, basePath: string) {
  const root = basePath.split(".")[0]!;
  const url = CONTEXT_URLS[root];
  if (url && (!desc.docUrls || desc.docUrls.length === 0)) {
    desc.docUrls = [url];
  }
  if (desc.kind === "object" && desc.props) {
    for (const [prop, child] of Object.entries(desc.props)) {
      applyDefaultUrls(child, `${basePath}.${prop}`);
    }
  }
}

function setDocAtPath(vars: Record<string, TypeDesc>, path: string, doc?: string) {
  if (!doc) return;
  const parts = path.split(".");
  const root = parts.shift()!;
  let node = vars[root];
  if (!node) return;
  if (parts.length === 0) {
    node.doc = doc;
    return;
  }
  for (const p of parts) {
    if (!node || node.kind !== "object" || !node.props) return;
    node = node.props[p];
  }
  if (node) node.doc = doc;
}

function applyLanguageServicesDocs(
  vars: Record<string, TypeDesc>,
  ls: LSDescriptions,
): Record<string, { doc?: string; urls?: string[] }> {
  // contexts at root
  if (ls.root) {
    for (const [ctx, ent] of Object.entries(ls.root)) {
      setDocAtPath(vars, ctx, ent.description);
    }
  }
  // specific context fields
  const sectionToCtx: Array<[keyof LSDescriptions, string]> = [
    ["github", "github"],
    ["runner", "runner"],
    ["env", "env"],
    ["vars", "vars"],
    ["job", "job"],
    ["jobs", "jobs"],
    ["steps", "steps"],
    ["secrets", "secrets"],
    ["strategy", "strategy"],
    ["matrix", "matrix"],
    ["needs", "needs"],
    ["inputs", "inputs"],
  ];
  for (const [section, ctx] of sectionToCtx) {
    const table = ls[section];
    if (!table) continue;
    for (const [prop, ent] of Object.entries(table)) {
      setDocAtPath(vars, `${ctx}.${prop}`, ent.description);
    }
  }
  // function docs
  const fndocs: Record<string, { doc?: string; urls?: string[] }> = {};
  if (ls.functions) {
    for (const [name, ent] of Object.entries(ls.functions)) {
      if (ent.description) fndocs[name] = { doc: ent.description };
    }
  }
  return fndocs;
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
  const lsPath = join(
    repoRoot,
    "scripts",
    "github",
    "descriptions.json",
  );
  const contextsOverlayPath = join(
    repoRoot,
    "scripts",
    "doc-overlays.contexts.json",
  );
  const functionsOverlayPath = join(
    repoRoot,
    "scripts",
    "doc-overlays.functions.json",
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
  // Optional Actions Language Services descriptions
  let lsDocs: LSDescriptions | undefined;
  let fnDocMap: Record<string, { doc?: string; urls?: string[] }> = {};
  try {
    lsDocs = JSON.parse(await readFile(lsPath, "utf8")) as LSDescriptions;
  } catch {
    // optional
  }
  if (lsDocs) {
    fnDocMap = applyLanguageServicesDocs(vars, lsDocs);
  }
  // Optional functions overlay docs
  try {
    const fnOverlay = JSON.parse(
      await readFile(functionsOverlayPath, "utf8"),
    ) as Record<string, { doc?: string; urls?: string[]; override?: boolean | "true" }>;
    for (const [name, ent] of Object.entries(fnOverlay)) {
      if (!ent) continue;
      const has = !!fnDocMap[name]?.doc;
      const override = ent.override === true || ent.override === "true";
      if (ent.doc && (override || !has)) {
        fnDocMap[name] = { ...(fnDocMap[name] || {}), doc: ent.doc };
      }
      if (ent.urls && ent.urls.length) {
        fnDocMap[name] = { ...(fnDocMap[name] || {}), urls: ent.urls };
      }
    }
  } catch {
    // optional
  }
  // Optional doc overlay for contexts
  let contextsOverlay: DocOverlay = {};
  try {
    contextsOverlay = JSON.parse(
      await readFile(contextsOverlayPath, "utf8"),
    ) as DocOverlay;
  } catch {
    // ignore if missing
  }
  if (contextsOverlay && Object.keys(contextsOverlay).length > 0) {
    for (const [ctx, desc] of Object.entries(vars)) {
      applyDocOverlay(desc, ctx, contextsOverlay);
    }
  }

  const header = `/* Auto-generated from actionlint JSON. Do not edit by hand. */
import { token, type Fragment, makeFragmentTree } from "../src/expr-core";
`;

  const classDecls: string[] = [];
  const ctxProps: string[] = [];

  for (const [ctx, desc] of Object.entries(vars)) {
    // ensure urls defaulted
    applyDefaultUrls(desc, ctx);
    const className = `${pascalCase(ctx)}Ctx`;
    if (desc.kind !== "object") continue;
    const classCode = genObjectClass(className, ctx, desc, []);
    classDecls.push(classCode);
    const propDoc = jsDoc([], desc.doc, desc.docUrls)
      .split("\n")
      .map((l) => (l.length ? "  " + l : l))
      .join("\n");
    if (propDoc.trim().length > 0) ctxProps.push(propDoc);
    ctxProps.push(`  ${ctx} = new ${className}(${JSON.stringify(ctx)});`);
  }

  const fnCode = genFn(fns, fnDocMap);

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
