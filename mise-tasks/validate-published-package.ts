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

process.chdir(DIRECTORY);

console.log("Cloning into directory", DIRECTORY);

const script = `
#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Validation workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    validationJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
`;

Bun.write("build.ts", script.trimStart());

await $`chmod +x build.ts`;

await $`rm -rf node_modules .npmrc bun.lock`;

const failures: string[] = [];

const testString = `/build.generated.yml\n1 GitHub Actions workflow was generated\n`;

if (!SKIP_NPM) {
  await $`bun add @jlarky/gha-ts@${NPM_VERSION}`;

  const text = (await $`./build.ts`.throws(false)).text();
  console.log([text]);
  if (!text.includes(testString)) {
    failures.push("npm");
  }
}

if (!SKIP_JSR) {
  await $`bunx jsr add @jlarky/gha-ts@${JSR_VERSION}`;

  const text = (await $`./build.ts`.throws(false)).text();
  console.log([text]);
  if (!text.includes(testString)) {
    failures.push("jsr");
  }
}

if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
