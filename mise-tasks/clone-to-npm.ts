#!/usr/bin/env bun

//MISE description="Republish from jsr to npm"
//USAGE flag "--publish" help="Publish the package (otherwise just dry run)"
//USAGE flag "--version <version>" help="The version to publish (default latest)"
//USAGE flag "--tag <tag>" help="The tag to publish (default latest)"
//USAGE flag "-d --directory <path>" help="The directory to use for the publish (default random tmp directory)"

import { $ } from "bun";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { usage_directory, usage_publish, usage_version, usage_tag } =
  process.env;

const DRY_RUN = usage_publish !== "true";
const VERSION = usage_version || "latest";
const TAG = usage_tag || "latest";
const DIRECTORY = usage_directory || mkdtempSync(join(tmpdir(), "tmp-npm-pkg"));

console.log("Republishing from jsr to npm");

process.chdir(import.meta.dirname);

process.chdir(DIRECTORY);

console.log("Cloning into directory", DIRECTORY);

await $`bunx jsr add @jlarky/gha-ts@${VERSION}`;

process.chdir(join(DIRECTORY, "node_modules/@jlarky/gha-ts"));

await $`bun pm pkg set name=@jlarky/gha-ts`;

console.log("Publishing to npm");

const answer = confirm(`Continue with ${DRY_RUN ? "dry run" : "publish"}?`);
if (!answer) {
  console.log("Aborting");
  process.exit(0);
}

console.log("Starting npm");

const proc = Bun.spawn(
  [
    "npm",
    "publish",
    ...(DRY_RUN ? ["--dry-run"] : []),
    "--tag",
    TAG,
    "--access",
    "public",
  ],
  {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  },
);

await proc.exited;
