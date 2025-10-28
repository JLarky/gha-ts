#!/usr/bin/env -S node --no-warnings
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflowYaml } from "./utils/yaml.ts";
import { lines } from "@jlarky/gha-ts/utils";

const wf = workflow({
  name: "Check gha-ts workflows converted",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    checkGhaTsWorkflowsConverted: {
      name: "Check gha-ts workflows converted",
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ "fetch-depth": 0 }),
        { name: "Install dependencies", run: "mise run install" },
        { name: "Clear generated workflows", run: "rm -f .github/workflows/*.generated.yml" },
        { name: "Generate TS workflows to yaml", run: "mise run wf-build" },
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
