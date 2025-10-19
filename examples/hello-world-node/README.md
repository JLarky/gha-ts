# Hello world example using Node.js

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-node/.github/workflows .github/workflows
```

or create the file `.github/workflows/hello-world.main.ts` manually

```ts
#!/usr/bin/env node --no-warnings
import YAML from "yaml";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

export const wf = workflow({
  name: "Example workflow",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    exampleJob: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
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
chmod +x .github/workflows/hello-world.main.ts
.github/workflows/hello-world.main.ts # builds .github/workflows/hello-world.generated.yml
```

Or in watch mode:

```bash
node --watch --no-warnings .github/workflows/hello-world.main.ts # watches for changes and rebuilds the workflow
```
