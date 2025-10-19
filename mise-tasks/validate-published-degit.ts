#!/usr/bin/env bun

//MISE description="Validate that you can use code examples generated with degit"
//USAGE flag "--degit-branch <branch>" help="The branch to use for the degit (default main)"
//USAGE flag "--examples <example1,example2>" help="The examples to validate (default all)"
//USAGE flag "--skip-degit" help="Skip the degit validation"
//USAGE flag "--skip-install" help="Skip the install validation"
//USAGE flag "--skip-build" help="Skip the build validation"
//USAGE flag "--directory <path>" help="The directory to use for the validation (default random tmp directory)"

import { $, fileURLToPath } from "bun";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EXAMPLES = process.env.usage_examples?.split(",") || [
  "hello-world-bun",
  "hello-world-node",
];
const SKIP_DEGIT = process.env.usage_skip_degit === "true";
const DEGIT_BRANCH = process.env.usage_degit_branch || undefined;
const SKIP_INSTALL = process.env.usage_skip_install === "true";
const SKIP_BUILD = process.env.usage_skip_build === "true";
const DIRECTORY =
  process.env.usage_directory || mkdtempSync(join(tmpdir(), "tmp-degit"));

console.log("Testing published package");

async function runExample(name: string) {
  process.chdir(import.meta.dirname);

  const file = fileURLToPath(
    new URL(`../examples/${name}/README.md`, import.meta.url),
  );

  process.chdir(DIRECTORY);
  console.log("Cloning into directory", DIRECTORY, "for", name);

  if (!SKIP_DEGIT) {
    const text = await $`grep 'npx degit' ${file}`.text();

    const firstLine = text.split("\n")[0];

    let overridden = firstLine.replace("npx degit", "bunx degit --force");

    if (DEGIT_BRANCH) {
      overridden = overridden.replace(
        ".github/workflows .github/workflows",
        `.github/workflows#${DEGIT_BRANCH} .github/workflows`,
      );
      overridden = overridden.replace(
        ".github .github",
        `.github#${DEGIT_BRANCH} .github`,
      );
    }

    console.log([overridden]);

    await $`${{ raw: overridden }}`;
  }

  if (!SKIP_INSTALL) {
    const text = await $`grep '# jsr' ${file}`.text();

    console.log([text]);

    console.log("Installing dependencies");
    await $`${{ raw: text }}`;
  }

  if (!SKIP_BUILD) {
    await $`bash -c 'chmod +x .github/workflows/*.main.*'`;

    const text = await $`grep '# build' ${file}`.text();

    console.log([text]);
    await $`${{ raw: text }}`;
  }

  await $`find . -type f | grep -v node_modules`;
}

const failures: string[] = [];
for (const name of EXAMPLES) {
  try {
    await runExample(name);
  } catch (error) {
    console.error(error);
    failures.push(name);
  }
}

if (failures.length > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
