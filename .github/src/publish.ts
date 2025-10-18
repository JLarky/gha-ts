import { workflow } from "../../src/workflow-types";
import { checkoutAndInstallMise } from "./utils/steps";

export default workflow({
  name: "Publish",
  on: {
    push: {
      branches: ["main", "feat--jsr-publish"],
    },
  },
  permissions: {
    contents: "read",
    "id-token": "write",
  },
  jobs: {
    publish: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Publish package",
          run: "bunx jsr publish",
        },
      ],
    },
  },
});
