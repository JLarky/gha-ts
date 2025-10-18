import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "./utils/steps";

export default workflow({
  name: "Update Pkl Workflows",
  on: {
    pull_request: {},
  } as any,
  jobs: {
    checkActionUpdate: {
      "runs-on": "ubuntu-latest",
      if: "github.event.pull_request.user.login == 'dependabot[bot]'",
      outputs: {
        shouldUpdatePklWorkflows:
          "${{ steps.dependabotMetadata.outputs.package-ecosystem == 'github-action' }}",
        previousDependencyName:
          "${{ steps.dependencyName.outputs.previous-dependency-name }}",
        newDependencyName:
          "${{ steps.dependencyName.outputs.new-dependency-name }}",
      },
      steps: [
        {
          name: "Fetch dependabot metadata",
          id: "dependabotMetadata",
          uses: "dependabot/fetch-metadata@v2",
        },
        {
          name: "Get dependency name",
          id: "dependencyName",
          run: "echo '${{ steps.dependabotMetadata.outputs.updated-dependencies-json }}' > deps.json\ndependency_name=$(jq -r '.[0].dependencyName' deps.json)\nprevious_version=$(jq -r '.[0].prevVersion' deps.json)\nnew_version=$(jq -r '.[0].newVersion' deps.json)\necho \"previous-dependency-name=$dependency_name@v$previous_version\" >> $GITHUB_OUTPUT\necho \"new-dependency-name=$dependency_name@v$new_version\" >> $GITHUB_OUTPUT",
        },
      ],
    },
    updatePklWorkflows: {
      "runs-on": "ubuntu-latest",
      needs: "checkActionUpdate",
      if: "${{ needs.checkActionUpdate.outputs.shouldUpdatePklWorkflows }}",
      permissions: {
        contents: "write",
      },
      steps: [
        checkout({
          ref: "${{ github.event.pull_request.head.ref }}",
        }),
        {
          name: "Update dependencies in pkl files",
          run: 'SEARCH_DIR=".github/pkl-workflows"\nOLD="${{ needs.checkActionUpdate.outputs.previousDependencyName }}"\nNEW="${{ needs.checkActionUpdate.outputs.newDependencyName }}"\ngrep -rl -- "$OLD" "$SEARCH_DIR" | while read -r file; do\n  echo "Updating $file"\n  sed -i "s|$OLD|$NEW|g" "$file"\ndone',
        },
        {
          name: "Commit and push changes",
          run: 'git config --global user.name "github-actions[bot]"\ngit config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"\ngit commit -am "Update pkl workflows"\ngit push origin',
        },
      ],
    },
  },
});
