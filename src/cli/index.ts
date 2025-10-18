import { resolve } from "path";
import { Workflow } from "../workflow-types";

export type WorkflowModule = {
  outFile: string;
  workflow: Workflow;
};

export async function scanWorkflows(opts: { srcDir: string; outDir: string }) {
  const out: WorkflowModule[] = [];
  const workflowFiles = await Array.fromAsync(
    new Bun.Glob("*.ts").scan({ cwd: opts.srcDir }),
  );

  for (const file of workflowFiles) {
    const filePath = resolve(opts.srcDir, file);
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

    out.push({
      outFile: resolve(opts.outDir, outputFileName),
      workflow: workflowObj,
    });
  }
  return out;
}

export async function generateWorkflows(opts: {
  srcModules: WorkflowModule[];
  onModule: (module: WorkflowModule) => Promise<void> | void;
}) {
  for (const module of opts.srcModules) {
    await opts.onModule(module);
  }
  if (opts.srcModules.length === 0) {
    console.warn("No GitHub Actions workflows found");
  } else {
    console.log(
      opts.srcModules.length +
        " GitHub Actions workflow" +
        (opts.srcModules.length === 1 ? " was" : "s were") +
        " generated",
    );
  }
}
