import { dirname, resolve } from "path";
import type { Workflow } from "../src/workflow-types";
import { writeWorkflow } from "../src/render/yaml";
import { fileURLToPath } from "url";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, "../.github/workflows");
  const srcDir = resolve(_dirname, "../.github/src");

  // Find all .ts files in .github/src (excluding utils and other non-workflow files)
  const workflowFiles = await Array.fromAsync(
    new Bun.Glob("*.ts").scan({
      cwd: srcDir,
    }),
  );

  for (const file of workflowFiles) {
    const filePath = resolve(srcDir, file);
    const module = (await import(filePath)) as unknown;
    const workflow =
      typeof module === "object" && module !== null && "default" in module
        ? ((module) as Record<string, unknown>).default
        : module;

    if (typeof workflow !== "object" || workflow === null) {
      console.warn(`Skipping ${file}: default export is not a workflow object`);
      continue;
    }

    const workflowObj = workflow as Workflow;
    const workflowName = file.replace(".ts", "");
    const outputFileName = `${workflowName
      .toLowerCase()
      .replace(/\s+/g, "-")}.generated.yml`;

    writeWorkflow(resolve(workflowsDir, outputFileName), workflowObj);
  }
  if (workflowFiles.length === 0) {
    console.warn("No GitHub Actions workflows found");
    process.exit(0);
  } else {
    console.log(
      workflowFiles.length +
        " GitHub Actions workflow" +
        (workflowFiles.length === 1 ? " was" : "s were") +
        " generated successfully in " +
        workflowsDir,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
