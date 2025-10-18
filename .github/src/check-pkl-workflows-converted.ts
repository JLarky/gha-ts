import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkoutAndInstallPkl } from "./utils/steps";

export default workflow({
  name: "Check Pkl workflows converted",
  on: {
    push: {},
  },
  jobs: {
    checkWorkflowsConverted: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallPkl(),
        {
          name: "Convert pkl workflows to yaml",
          run: 'pkl eval .pkl/.github/pkl-workflows/*.pkl -o ".pkl/.github/workflows/%{moduleName}.generated.yml"',
        },
        {
          name: "Verify if pkl actions are converted",
          run: "git diff --exit-code",
        },
      ],
    },
  },
});
