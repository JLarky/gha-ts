#!/usr/bin/env bun
import { YAML } from "bun";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { publishJsr } from "./utils/jobs";
import { checkoutAndInstallMise } from "./utils/steps";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Test gha-ts",
  on: {
    push: {},
  },
  jobs: {
    formatTest: {
      name: "Format Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Format Check",
          run: "mise run format:check",
        },
      ],
    },
    miseTest: {
      name: "Mise Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Test gha-ts",
          run: "mise run test",
        },
      ],
    },
    dryRunPublish: publishJsr({ dryRun: true }),
    tryPublishedPackage: {
      name: "Try Published Package",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Run the test",
          run: "mise run validate-published-package",
        },
      ],
    },
    checkGhaTsWorkflowsConverted: {
      name: "Check gha-ts workflows converted",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Install dependencies",
          run: "mise run install",
        },
        {
          name: "Clear generated workflows",
          run: "mise run workflows:clear",
        },
        {
          name: "Generate TS workflows to yaml",
          run: "mise run workflows:build",
        },
        {
          name: "Verify if TS workflows are converted",
          run: `CHANGED="$(git --no-pager diff --name-only)";
            if [ -n "$CHANGED" ]; then
              echo "::error title=TS workflows are not up to date::Run 'mise run workflows:build' locally, commit, and push.";
              echo "::group::Changed files";
              echo "$CHANGED";
              echo "::endgroup::";
              while IFS= read -r file; do
                [ -z "$file" ] && continue;
                echo "::notice file=$file,line=1,title=Changed file::Update generated YAML for this file";
              done <<< "$CHANGED";
              {
                echo "### TS workflows are not up to date";
                echo;
                echo "Run: mise run workflows:build";
                echo;
                echo "Then commit the updated files and push.";
                echo;
                echo "Changed files:";
                echo;
                echo "$CHANGED" | sed 's/^/- /';
              } >> "$GITHUB_STEP_SUMMARY";
              exit 1;
            fi`,
        },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
