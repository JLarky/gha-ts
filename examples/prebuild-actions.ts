#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import {
  checkout,
  setupGo,
  setupJava,
  cache,
  uploadPagesArtifact,
  deployPages,
} from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

export const wf = workflow({
  name: "Check prebuild actions",
  on: { push: {} },
  jobs: {
    "test-various-actions": {
      name: "Test actions",
      "runs-on": "macos-latest",
      steps: [
        checkout(),
        setupGo({ goVersion: "1.17.7" }),
        setupJava({ javaVersion: "17", distribution: "temurin" }),
        cache({
          path: "wiki/README.md",
          key: "wiki-readme-${{ runner.os }}-${{ hashFiles('wiki/generateWikiToc.go') }}",
        }),
        uploadPagesArtifact({ path: "tmp-doc" }),
        { id: "deployment", ...deployPages() },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
