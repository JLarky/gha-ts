import { job } from "../../../src/workflow-types";
import { checkoutAndInstallMise } from "./steps";

export function publishJsr(opts: { dryRun?: boolean } = { dryRun: true }) {
  return job({
    name: opts.dryRun ? "Dry run publish package" : "Publish package",
    "runs-on": "ubuntu-latest",
    steps: [
      ...checkoutAndInstallMise(),
      {
        name: opts.dryRun ? "Dry run publish package" : "Publish package",
        run: opts.dryRun ? "bunx jsr publish --dry-run" : "bunx jsr publish",
      },
    ],
  });
}
