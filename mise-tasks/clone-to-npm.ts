#!/usr/bin/env bun

//MISE description="Republish from jsr to npm"
//USAGE flag "--publish" help="Publish the package (otherwise just dry run)"
//USAGE flag "--version <version>" help="The version to publish (default latest)"
//USAGE flag "--tag <tag>" help="The tag to publish (default latest)"
//USAGE flag "--ci" help="Non-interactive mode (skip confirmation)"
//USAGE flag "--skip-publish" help="Skip the publish step"
//USAGE flag "-d --directory <path>" help="The directory to use for the publish (default random tmp directory)"

import { $ } from "bun";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const jsrPackageName = "@jlarky/gha-ts";
const npmPackageName = "@jlarky/gha-ts";
const npmRepositoryUrl = "https://github.com/JLarky/gha-ts";

const { usage_directory, usage_publish, usage_version, usage_tag } =
  process.env;

const DRY_RUN = usage_publish !== "true";
const VERSION = usage_version || "latest";
const TAG = usage_tag || "latest";
const DIRECTORY = usage_directory || mkdtempSync(join(tmpdir(), "tmp-npm-pkg"));
const CI = process.env.usage_ci === "true";
const SKIP_PUBLISH = process.env.usage_skip_publish === "true";

console.log("Republishing from jsr to npm");

process.chdir(import.meta.dirname);

process.chdir(DIRECTORY);

await $`mkdir -p jsr`;

console.log("Cloning into directory", DIRECTORY);

process.chdir(join(DIRECTORY, "jsr"));

await $`bunx jsr add ${jsrPackageName}@${VERSION}`;

process.chdir(DIRECTORY);

await $`cp -r jsr/node_modules/${jsrPackageName}/ npm`;

process.chdir(join(DIRECTORY, "npm"));

await $`bun pm pkg set name=${npmPackageName}`;
await $`bun pm pkg set repository.type=git`;
await $`bun pm pkg set repository.url=git+${npmRepositoryUrl}.git`;
await $`bun pm pkg set publishConfig.provenance=true`;
await $`bun pm pkg set publishConfig.access=public`;

const files = ["README.md", "LICENSE"];
let glob = new Bun.Glob("**/*.{js,js.map}");
for await (const file of glob.scan(".")) files.push(file);
glob = new Bun.Glob("_dist/**/*");
for await (const file of glob.scan(".")) files.push(file);

await $`bun pm pkg set --json files='${JSON.stringify(files)}'`;

await $`cat package.json`;

const npmVersion = await $`mise x node@24 -- npm --version`.text();
const nodeVersion = await $`mise x node@24 -- node --version`.text();

console.log("Publishing to npm with npm version", { npmVersion, nodeVersion });

if (!CI) {
  const answer = confirm(`Continue with ${DRY_RUN ? "dry run" : "publish"}?`);
  if (!answer) {
    console.log("Aborting");
    process.exit(0);
  }
}

if (!SKIP_PUBLISH) {
  console.log("Starting npm");

  const cmd = [
    "mise",
    "x",
    "node@24",
    "--",
    "npm",
    "publish",
    ...(CI ? ["--provenance"] : []),
    ...(DRY_RUN ? ["--dry-run"] : []),
    "--tag",
    TAG,
    "--access",
    "public",
  ];

  console.log("CMD", cmd);

  const proc = Bun.spawn(cmd, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  await proc.exited;
  process.exit(proc.exitCode ?? 0);
}
