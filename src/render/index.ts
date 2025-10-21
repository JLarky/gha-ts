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

  // Sentinel used to mark strings that should be rendered as YAML block scalars
  // We encode the original value as base64 to avoid escaping issues during
  // the YAML stringify phase, then replace the sentinel with a block literal
  // in the final output while preserving indentation.
  private static readonly BLOCK_SENTINEL = "__GHA_TS_BLOCK__";

  private static toBase64(input: string): string {
    // Node and Bun both provide Buffer
    return Buffer.from(input, "utf8").toString("base64");
  }

  private static fromBase64(input: string): string {
    return Buffer.from(input, "base64").toString("utf8");
  }

  // Walk an arbitrary object and, for any step `run` string that contains
  // newlines, replace it with a sentinel-encoded string. This allows us to
  // post-process the YAML and emit a block scalar (`|-") for readability.
  private static markMultilineRunValues(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((v) => Serializer.markMultilineRunValues(v));
    }
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (k === "run" && typeof v === "string" && v.includes("\n")) {
          out[k] = `${Serializer.BLOCK_SENTINEL}:${Serializer.toBase64(v)}`;
        } else {
          out[k] = Serializer.markMultilineRunValues(v);
        }
      }
      return out;
    }
    return value;
  }

  // Replace sentinel-marked `run` values that the YAML stringifier emitted as a
  // normal quoted string with an actual YAML block scalar. The regex preserves
  // original indentation and uses `|-` chomping to avoid adding a trailing
  // newline.
  private static replaceSentinelsWithBlockScalars(yamlText: string): string {
    const pattern = new RegExp(
      // capture indentation and quoted sentinel payload on a single line
      String.raw`^([ \t]*)run:[ \t]*(["'])${Serializer.BLOCK_SENTINEL}:(.+?)\2[ \t]*$`,
      "gm",
    );
    return yamlText.replace(pattern, (_m, indent: string, _q: string, b64: string) => {
      const decoded = Serializer.fromBase64(b64);
      const contentIndent = indent + "  ";
      const lines = decoded.split("\n");
      const block =
        indent + "run: |-" + "\n" +
        lines.map((ln) => contentIndent + ln).join("\n");
      return block;
    });
  }

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
    // Mark multiline `run` values before stringification so we can convert them
    // into YAML block scalars afterwards in a renderer-agnostic way.
    const objWithBlocks = Serializer.markMultilineRunValues(obj);
    if (this.options?.stringify) {
      const yamlBodyRaw = this.options.stringify(objWithBlocks, null, 2);
      const yamlBody = Serializer.replaceSentinelsWithBlockScalars(yamlBodyRaw);
      return (
        (this.options?.header ?? HEADER) +
        yamlBody +
        (yamlBody.endsWith("\n") ? "" : "\n")
      );
    }
    return JSON.stringify(objWithBlocks, null, 2);
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
