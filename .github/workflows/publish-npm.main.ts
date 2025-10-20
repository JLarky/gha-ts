#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { checkoutAndInstallMise } from "./utils/steps";

const wf = workflow({
  name: "Publish to npm",
  on: {
    push: {
      branches: ["feat-npm-publish"],
      tags: ["v*"],
    },
  },
  permissions: {
    "id-token": "write",
    contents: "read",
  },
  jobs: {
    publishNpm: {
      name: "Publish to npm",
      "runs-on": "ubuntu-latest",
      steps: [
        {
          name: "Extract version from tag",
          id: "version",
          run: `VERSION="\${{ github.ref }}"
VERSION="\${VERSION#refs/tags/v}"
echo "version=\${VERSION}" >> "$GITHUB_OUTPUT"`,
        },
        {
          name: "Hello world",
          run: `echo "Hello world! Publishing version \${{ steps.version.outputs.version }}"`,
        },
        ...checkoutAndInstallMise(),
        {
          name: "Publish package",
          env: {
            NPM_CONFIG_PROVENANCE: "true",
          },
          run: "mise run clone-to-npm --publish --ci --version 0.0.7",
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
