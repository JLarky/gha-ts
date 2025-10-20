#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { generateWorkflow } from "@jlarky/gha-ts/cli";
import { checkoutAndInstallMise } from "./utils/steps";

const wf = workflow({
  name: "Create Release",
  on: {
    push: {
      branches: ["main"],
      paths: ["jsr.json"],
    },
  },
  permissions: {
    contents: "write",
  },
  jobs: {
    "create-release": {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Get version from jsr.json",
          id: "get_version",
          run: `echo "version=$(bun -e "console.log(require('./jsr.json').version)")" >> "$GITHUB_OUTPUT"`,
        },
        {
          name: "Create Release",
          uses: "softprops/action-gh-release@v2",
          with: {
            tag_name: `v\${{ steps.get_version.outputs.version }}`,
            draft: true,
            make_latest: true,
          },
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
