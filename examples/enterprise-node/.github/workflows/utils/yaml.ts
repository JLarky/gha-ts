import { dump } from "js-yaml";
import { createSerializer, type Stringify } from "@jlarky/gha-ts/render";
import type { Workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { lines } from "@jlarky/gha-ts/utils";

export function yamlToWf(ymlText: string) {
  const { true: on, ...rest } = Bun.YAML.parse(ymlText) as Record<
    string,
    unknown
  >;
  const jsonStr = createSerializer({ ...rest, on } as Workflow, JSON.stringify)
    .setHeader("")
    .stringifyWorkflow();

  return lines(`
    #!/usr/bin/env bun
    import { YAML } from "bun";
    import { workflow } from "@jlarky/gha-ts/workflow-types";
    import { checkout } from "@jlarky/gha-ts/actions";
    import { generateWorkflow } from "@jlarky/gha-ts/cli";

    const wf = workflow(${jsonStr});

    await generateWorkflow(wf, YAML.stringify, import.meta.url);
  `);
}

export const stringifyYaml: Stringify = (input) =>
  dump(input, { quotingType: '"', lineWidth: Infinity });

export async function generateWorkflowYaml(
  workflow: Workflow,
  moduleUrl: string, // from import.meta.url
) {
  return generateWorkflow(workflow, stringifyYaml, moduleUrl);
}
