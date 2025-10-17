import { Workflow, workflow } from "../workflow-types";
import { checkout } from "../actions/common";
import { setupGo, setupJava } from "../actions/setup";
import { cache } from "../actions/cache";
import { uploadPagesArtifact, deployPages } from "../actions/pages";

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
