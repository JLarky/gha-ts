import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkoutAndInstallPkl } from "./utils/steps";

export default workflow({
  name: "Test",
  on: {
    push: {
      branches: ["main"],
    },
    pull_request: {},
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallPkl(),
        {
          name: "Test pkl module",
          "working-directory": ".pkl",
          run: "pkl test",
        },
      ],
    },
  },
});
