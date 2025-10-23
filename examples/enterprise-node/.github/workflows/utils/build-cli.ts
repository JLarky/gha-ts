#!/usr/bin/env -S node --no-warnings

import { glob } from "node:fs/promises";

process.chdir(import.meta.dirname);

const promises: Promise<void>[] = [];

for await (const entry of glob("../*.main.ts")) {
  promises.push(import(entry));
}

await Promise.all(promises);
