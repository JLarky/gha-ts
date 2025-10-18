import { Workflow, workflow } from "../src/workflow-types";
import { checkout } from "../src/actions/common";
import { setupGo, setupJava } from "../src/actions/setup";
import { cache } from "../src/actions/cache";
import { uploadPagesArtifact, deployPages } from "../src/actions/pages";

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
