import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

import { Workflow } from "../workflow-types";
import { HEADER, toYamlReadyObject } from "./yaml";

export type Stringify = (
  input: unknown,
  replacer?: undefined | null,
  space?: string | number,
) => string;

export type RenderOptions = {
  header?: string;
  stringify?: Stringify;
};

export class Serializer {
  constructor(
    private workflow: Workflow,
    private options?: RenderOptions,
  ) {}

  public setOptions(options: RenderOptions): Serializer {
    this.options = { ...this.options, ...options };
    return this;
  }

  public setStringify(stringify: Stringify): Serializer {
    return this.setOptions({ stringify });
  }

  public setHeader(header: string): Serializer {
    return this.setOptions({ header });
  }

  public stringifyWorkflow(): string {
    const obj = toYamlReadyObject(this.workflow);
    if (this.options?.stringify) {
      const yamlBodyRaw = this.options.stringify(obj, null, 2);
      const yamlBody = preferBlockScalarForRun(yamlBodyRaw);
      return (
        (this.options?.header ?? HEADER) +
        yamlBody +
        (yamlBody.endsWith("\n") ? "" : "\n")
      );
    }
    return JSON.stringify(obj, null, 2);
  }

  public writeWorkflow(filePath: string): void {
    const str = this.stringifyWorkflow();
    const dir = dirname(filePath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, str, "utf8");
  }
}

export function createSerializer(
  workflow: Workflow,
  stringify?: Stringify,
): Serializer {
  return new Serializer(workflow, stringify ? { stringify } : undefined);
}

/**
 * Convert YAML lines like:
 *   run: "echo a\necho b"
 * into block scalars:
 *   run: |
 *     echo a
 *     echo b
 *
 * We only transform values for keys named `run` when the scalar contains
 * explicit `\n` sequences. Single-line strings are left as-is.
 */
function preferBlockScalarForRun(yaml: string): string {
  // Match lines of the form: <indent>run: "..." (with any escaped chars inside)
  const runLineRegex = /^(\s*run:\s*)"((?:[^"\\]|\\.)*)"\s*$/gm;

  return yaml.replace(runLineRegex, (_full, prefix: string, encoded: string) => {
    // Only convert if the value contains at least one newline escape
    if (!encoded.includes("\\n")) return _full;

    // Determine base indentation (spaces before 'run:')
    const indentEnd = prefix.indexOf("run:");
    const baseIndent = indentEnd >= 0 ? prefix.slice(0, indentEnd) : "";

    // Best-effort unescape of the YAML double-quoted content we emit
    let decoded = encoded
      // newlines first to expand into multiple lines
      .replace(/\\n/g, "\n")
      // tabs
      .replace(/\\t/g, "\t")
      // escaped quotes
      .replace(/\\"/g, '"')
      // escaped backslashes (last)
      .replace(/\\\\/g, "\\");

    const lines = decoded.split("\n");
    const header = `${baseIndent}run: |\n`;
    const body = lines.map((l) => `${baseIndent}  ${l}`).join("\n");
    return header + body;
  });
}
