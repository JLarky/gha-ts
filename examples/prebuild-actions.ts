import { Workflow, workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { setupGo, setupJava } from "@jlarky/gha-ts/actions";
import { cache } from "@jlarky/gha-ts/actions";
import { uploadPagesArtifact, deployPages } from "@jlarky/gha-ts/actions";

export function buildPrebuildActions(): Workflow {
  return workflow({
    name: "Check prebuild actions",
    on: { push: {} } as any,
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
}
