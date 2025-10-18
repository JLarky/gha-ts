import { workflow } from "../../src/workflow-types";
import { checkoutAndInstallPkl } from "./utils/steps";

export default workflow({
  name: "CreateRelease",
  on: {
    push: {
      tags: ["*"],
    } as any,
  } as any,
  permissions: {
    contents: "write",
  },
  jobs: {
    createRelease: {
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutAndInstallPkl(),
        {
          name: "Package pkl module",
          run: "pkl project package",
        },
        {
          name: "Extract version number from tag",
          run: 'VERSION_NUMBER=${{ github.ref_name }}\nVERSION_NUMBER=${VERSION_NUMBER#*@}\necho "VERSION_NUMBER=$VERSION_NUMBER" >> $GITHUB_ENV',
        },
        {
          uses: "softprops/action-gh-release@v2",
          with: {
            files: ".out/com.github.action@${{ env.VERSION_NUMBER }}/*",
            fail_on_unmatched_files: true,
            prerelease: true,
            draft: true,
          },
        },
      ],
    },
  },
});
