# Hello world example using built-in github actions version of node (Node.js 20, that can't run TS files)

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-node-20/.github/workflows .github/workflows
```

or create the file `.github/workflows/hello-world.main.mjs` manually

```js
#!/usr/bin/env node
// @ts-check
import YAML from "yaml";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    exampleJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ "fetch-depth": 0 }),
        { name: "Test", run: "echo 'Hello, world!'" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
```

Install gha-ts:

```bash
npx jsr add -D @jlarky/gha-ts && npx nypm add -D yaml # jsr
# or
npx nypm add -D @jlarky/gha-ts yaml # npm
```

Run the workflow:

```bash
chmod +x .github/workflows/hello-world.main.mjs
.github/workflows/hello-world.main.mjs # builds .github/workflows/hello-world.generated.yml
```

Or in watch mode:

```bash
node --watch .github/workflows/hello-world.main.mjs # watches for changes and rebuilds the workflow
```
