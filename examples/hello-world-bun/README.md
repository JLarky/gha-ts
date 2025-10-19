# Hello world example using Bun

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-bun/.github/workflows .github/workflows
```

or create file `.github/workflows/hello-world.main.ts` manually:

```ts
#!/usr/bin/env bun
import { YAML } from "bun";
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
bunx jsr add -D @jlarky/gha-ts # jsr
# or
bunx nypm add -D @jlarky/gha-ts # npm
```

Run the workflow:

```bash
chmod +x .github/workflows/hello-world.main.ts
.github/workflows/hello-world.main.ts # builds .github/workflows/hello-world.generated.yml
```

Or in watch mode:

```bash
bun run --watch .github/workflows/hello-world.main.ts # watches for changes and rebuilds the workflow
```
