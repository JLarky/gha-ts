#!/usr/bin/env bun

//MISE description="Validate that the published package works"
//USAGE flag "--skip-jsr" help="Skip the jsr validation"
//USAGE flag "--skip-npm" help="Skip the npm validation"
//USAGE flag "--jsr-version <version>" help="The version of jsr to use (default latest)"
//USAGE flag "--npm-version <version>" help="The version of npm to use (default latest)"
//USAGE flag "--directory <path>" help="The directory to use for the validation (default random tmp directory)"

import { $ } from "bun";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const {
  usage_skip_jsr,
  usage_skip_npm,
  usage_jsr_version,
  usage_npm_version,
  usage_directory,
} = process.env;

const SKIP_JSR = usage_skip_jsr === "true";
const SKIP_NPM = usage_skip_npm === "true";
const JSR_VERSION = usage_jsr_version || "latest";
const NPM_VERSION = usage_npm_version || "latest";

const DIRECTORY = usage_directory || mkdtempSync(join(tmpdir(), "tmp-npm-pkg"));

console.log("Testing published package");

process.chdir(import.meta.dirname);

const workflowsDir = await $`(cd ../.github/src && pwd)`.text();

process.chdir(DIRECTORY);

console.log("Cloning into directory", DIRECTORY);

const script = `
#!/usr/bin/env bun
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, ".github/workflows");
  const srcDir = "${workflowsDir.trim()}";

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, Bun.YAML.stringify).writeWorkflow(
        module.outFile
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
`;

Bun.write("build.ts", script.trimStart());

await $`chmod +x build.ts`;

await $`rm -rf node_modules .npmrc bun.lock`;

const failures: string[] = [];

if (!SKIP_NPM) {
  await $`bun add @jlarky/gha-ts@${NPM_VERSION}`;

  const text = (await $`./build.ts`.throws(false)).text();
  console.log([text]);
  if (text !== "4 GitHub Actions workflows were generated\n") {
    failures.push("npm");
  }
}

if (!SKIP_JSR) {
  await $`bunx jsr add @jlarky/gha-ts@${JSR_VERSION}`;

  const text = (await $`./build.ts`.throws(false)).text();
  console.log([text]);
  if (text !== "4 GitHub Actions workflows were generated\n") {
    failures.push("jsr");
  }
}

if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
