import { resolve } from "path";
import { createSerializer } from "../render";
import { buildWorkflowTriggers } from "../examples/workflow-triggers";
import { buildPrebuildActions } from "../examples/prebuild-actions";
import type { Workflow } from "../workflow-types";

function writeWorkflow(filePath: string, workflow: Workflow) {
  createSerializer(workflow, Bun.YAML.stringify).writeWorkflow(filePath);
}

async function main() {
  const workflowsDir = resolve(process.cwd(), ".github/workflows");
  writeWorkflow(
    resolve(workflowsDir, "workflow-triggers.generated.yml"),
    buildWorkflowTriggers(),
  );
  writeWorkflow(
    resolve(workflowsDir, "prebuild-actions.generated.yml"),
    buildPrebuildActions(),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
