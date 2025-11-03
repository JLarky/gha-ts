#!/usr/bin/env -S node
// @ts-check
import { workflow } from "@jlarky/gha-ts/workflow-types";

import { generateWorkflowYaml } from "./utils/yaml.ts";
import { lines } from "@jlarky/gha-ts/utils";
import { checkoutStep, setupNodeStep } from "./utils/steps.ts";

const wf = workflow({
  name: "Check gha-ts workflows converted",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    checkTypeScript: {
      name: "Check TypeScript",
      "runs-on": "ubuntu-latest",
      steps: [
        checkoutStep({ "fetch-depth": 0 }),
        {
          name: "Install dependencies",
          run: lines("cd .github/workflows && npm ci"),
        },
        {
          name: "Check TypeScript",
          run: lines("cd .github/workflows && npm run type-check"),
        },
      ],
    },
    checkGhaTsWorkflowsConverted: {
      name: "Check gha-ts workflows converted",
      "runs-on": "ubuntu-latest",
      steps: [
        checkoutStep({ "fetch-depth": 0 }),
        setupNodeStep({ "node-version": "22" }),
        {
          name: "Install production dependencies",
          run: lines("cd .github/workflows && npm ci --omit=dev"),
        },
        {
          name: "Clear generated workflows",
          run: lines(`rm -f .github/workflows/*.generated.yml`),
        },
        {
          name: "Generate TS workflows to yaml",
          run: lines`.github/workflows/utils/build-cli.ts`,
        },
        {
          name: "Verify if TS workflows are converted",
          run: lines`
            CHANGED="$(git --no-pager diff --name-only)";
            if [ -n "$CHANGED" ]; then
              echo "::error title=TS workflows are not up to date::Run 'mise run wf-build' locally, commit, and push.";
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
                echo "Run: mise run wf-build";
                echo;
                echo "Then commit the updated files and push.";
                echo;
                echo "Changed files:";
                echo;
                echo "$CHANGED" | awk '{print "- " $0}';
              } >> "$GITHUB_STEP_SUMMARY";
              exit 1;
            fi
          `,
        },
      ],
    },
  },
});

await generateWorkflowYaml(wf, import.meta.url);
