import { resolve } from "path";
import { writeWorkflow } from "../render/yaml";
import { buildWorkflowTriggers } from "../examples/workflow-triggers";
import { buildPrebuildActions } from "../examples/prebuild-actions";

async function main() {
  const workflowsDir = resolve(process.cwd(), ".github/workflows");
  writeWorkflow(
    resolve(workflowsDir, "workflow-triggers.generated.yml"),
    buildWorkflowTriggers()
  );
  writeWorkflow(
    resolve(workflowsDir, "prebuild-actions.generated.yml"),
    buildPrebuildActions()
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
