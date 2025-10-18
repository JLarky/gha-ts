[![GitHub Release](https://img.shields.io/github/v/release/JLarky/gha-ts?include_prereleases)](https://github.com/JLarky/gha-ts/releases/latest)
[![GitHub License](https://img.shields.io/github/license/JLarky/gha-ts)](https://github.com/JLarky/gha-ts/blob/main/LICENSE)

# <img src="icon.png" alt="gha-ts" width="55"/> gha-ts

A TypeScript library for writing GitHub Actions workflows and rendering them to YAML.

- Parity-first with `stefma/pkl-gha` semantics
- Stable YAML rendering (Bun’s `Bun.YAML` or npm `yaml`)

## What?

Author GitHub Actions workflows in TypeScript with strong typing and helpful validation, then render to YAML for `.github/workflows/`.

- **Strong typing**: Catch errors at build-time instead of in CI.
- **Deterministic YAML**: Stable key ordering and converters.

## Install

If using Bun:

```bash
bunx jsr add -D @jlarky/gha-ts # or bun add -D @jlarky/gha-ts
```

If using Node.js:

```bash
npx nypm add -D @jlarky/gha-ts yaml # or npx jsr add -D @jlarky/gha-ts
```

Notes:
- Bun users will import YAML from bun and node user will use `yaml` from npm.

## Quickstart

Create a workflow module at `.github/src/ci.ts`:

```ts
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";

export default workflow({
  name: "CI",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
  },
  jobs: {
    test: {
      "runs-on": "ubuntu-latest",
      steps: [
        checkout({ fetchDepth: 0 }),
        { name: "Run unit tests", run: "bun test" },
      ],
    },
  },
});
```

### Build script (Bun)

`.github/build.ts`:

```ts
#!/usr/bin/env bun
import { YAML } from "bun";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, ".github/workflows");
  const srcDir = resolve(_dirname, ".github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, YAML.stringify).writeWorkflow(
        module.outFile,
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
bun run -watch .github/build.ts
```

### Build script (Node.js)

`.github/build.ts`:

```ts
#!/usr/bin/env node
import YAML from "yaml";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, ".github/workflows");
  const srcDir = resolve(_dirname, ".github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, YAML.stringify).writeWorkflow(
        module.outFile,
      );
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run:

```bash
chmod +x .github/build.ts
.github/build.ts
```

## Examples

- Real workflows for this repo live in `.github/src` and render to `.github/workflows`.
- Additional usage examples: `src/examples/`.

## License

MIT

## Alternatives

- [ghats](https://github.com/koki-develop/ghats)
- [github-actions-workflow-ts](https://github.com/emmanuelnk/github-actions-workflow-ts)
- [github-actions-wac](https://github.com/webiny/github-actions-wac)
- [github-actions-typing](https://github.com/typesafegithub/github-actions-typing)
- [actions-toolkit](https://github.com/actions/toolkit)

Non JavaScript/TypeScript:

- [pkl-gha](https://github.com/stefma/pkl-gha)
- [kotlin-github-actions-dsl](https://github.com/nefilim/kotlin-github-actions-dsl)
- [github-workflows-kt](https://github.com/typesafegithub/github-workflows-kt)
