import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";
import "./workflows/gha-ts.main";
import "./workflows/example-bun.main";
import "./workflows/example-node.main";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, "../.github/workflows");
  const srcDir = resolve(_dirname, "../.github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, Bun.YAML.stringify).writeWorkflow(
        module.outFile,
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
