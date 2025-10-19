import { resolve } from "path";
import { createSerializer } from "@jlarky/gha-ts/render";
import { wf as workflowTriggersWf } from "../examples/workflow-triggers";
import { wf as prebuildActionsWf } from "../examples/prebuild-actions";
import type { Workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflows } from "@jlarky/gha-ts/cli";

function writeWorkflow(filePath: string, workflow: Workflow) {
  createSerializer(workflow, Bun.YAML.stringify).writeWorkflow(filePath);
}

async function main() {
  const workflowsDir = resolve(process.cwd(), ".github/workflows");

  await generateWorkflows({
    srcModules: [
      {
        workflow: workflowTriggersWf,
        outFile: resolve(workflowsDir, "workflow-triggers.generated.yml"),
      },
      {
        workflow: prebuildActionsWf,
        outFile: resolve(workflowsDir, "prebuild-actions.generated.yml"),
      },
    ],
    onModule: (module) => {
      writeWorkflow(module.outFile, module.workflow);
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
