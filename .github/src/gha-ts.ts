import { workflow } from "../../src/workflow-types";
import { publishJsr } from "./utils/jobs";
import { checkoutAndInstallMise } from "./utils/steps";

export default workflow({
  name: "Test gha-ts",
  on: {
    push: {},
  },
  jobs: {
    formatTest: {
      name: "Format Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Format Check",
          run: "mise run format:check",
        },
      ],
    },
    miseTest: {
      name: "Mise Test",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallMise(),
        {
          name: "Bun install",
          run: "bun install",
        },
        {
          name: "Test gha-ts",
          run: "mise run test",
        },
      ],
    },
    dryRunPublish: publishJsr({ dryRun: true }),
  },
});
