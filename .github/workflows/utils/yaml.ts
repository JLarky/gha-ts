import { dump } from "js-yaml";
import type { Stringify } from "@jlarky/gha-ts/render";
import { Workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

export const stringifyYaml: Stringify = (input) =>
  dump(input, { noRefs: true, quotingType: '"', lineWidth: Infinity });

export async function generateWorkflowYaml(
  workflow: Workflow,
  moduleUrl: string, // from import.meta.url
) {
  return generateWorkflow(workflow, stringifyYaml, moduleUrl);
}
