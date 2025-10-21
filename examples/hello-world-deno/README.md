# Hello world example using Deno

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-deno/.github/workflows .github/workflows
```

or create file `.github/workflows/hello-world.main.ts` manually:

```ts
#!/usr/bin/env -S deno --allow-write=.
import YAML from "npm:yaml";
import { workflow } from "jsr:@jlarky/gha-ts/workflow-types";
import { checkout } from "jsr:@jlarky/gha-ts/actions";
import { generateWorkflow } from "jsr:@jlarky/gha-ts/cli";

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

Run the workflow:

```bash
chmod +x .github/workflows/hello-world.main.ts
.github/workflows/hello-world.main.ts # builds .github/workflows/hello-world.generated.yml
```

Or in watch mode:

```bash
deno run --watch --allow-write=. .github/workflows/hello-world.main.ts # watches for changes and rebuilds the workflow
```
