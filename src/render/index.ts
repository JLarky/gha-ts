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
      const yamlBody = this.options.stringify(obj, null, 2);
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
