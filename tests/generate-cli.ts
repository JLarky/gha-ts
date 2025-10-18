import { resolve } from "path";
import { createSerializer } from "../src/render";
import { buildWorkflowTriggers } from "../examples/workflow-triggers";
import { buildPrebuildActions } from "../examples/prebuild-actions";
import type { Workflow } from "../src/workflow-types";
import { generateWorkflows } from "../src/cli";

function writeWorkflow(filePath: string, workflow: Workflow) {
  createSerializer(workflow, Bun.YAML.stringify).writeWorkflow(filePath);
}

async function main() {
  const workflowsDir = resolve(process.cwd(), ".github/workflows");

  await generateWorkflows({
    srcModules: [
      {
        workflow: buildWorkflowTriggers(),
        outFile: resolve(workflowsDir, "workflow-triggers.generated.yml"),
      },
      {
        workflow: buildPrebuildActions(),
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
