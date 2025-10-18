import { workflow } from "../../src/workflow-types";
import { checkoutAndInstallPkl } from "./utils/steps";

export default workflow({
  name: "CheckPklWorkflowsConverted",
  on: {
    push: {},
  } as any,
  jobs: {
    checkWorkflowsConverted: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallPkl(),
        {
          name: "Convert pkl workflows to yaml",
          run: 'pkl eval .github/pkl-workflows/*.pkl -o ".github/workflows/%{moduleName}.generated.yml"',
        },
        {
          name: "Verify if pkl actions are converted",
          run: "git diff --exit-code",
        },
      ],
    },
  },
});
