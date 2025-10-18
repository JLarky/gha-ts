[![GitHub Release](https://img.shields.io/github/v/release/JLarky/gha-ts?include_prereleases)](https://github.com/JLarky/gha-ts/releases/latest)
[![GitHub License](https://img.shields.io/github/license/JLarky/gha-ts)](https://github.com/JLarky/gha-ts/blob/main/LICENSE)

# <img src="icon.png" alt="gha-ts" width="55"/> gha-ts

TypeScript-first authoring for GitHub Actions workflows, rendered to YAML.

This project is a parity-focused TypeScript port of `stefma/pkl-gha` so you can author workflows in TypeScript while preserving upstream Pkl semantics and output shape.

### Why?

- **Strong typing**: Author workflows in TypeScript with compile-time checks instead of raw YAML.
- **Parity-first**: Mirrors Pkl field names/behavior to minimize churn vs. upstream.
- **Stable YAML**: Deterministic key ordering and a standard header; plugs into `Bun.YAML.stringify` or any YAML stringifier.

### Requirements

- Bun ≥ 1.1 to run the generator (uses `Bun.Glob`). You can still render with other YAML libs by passing their `stringify` function.

## Install

Using jsr (recommended with Bun):

```bash
bunx jsr add @jlarky/gha-ts
```

## Quickstart

1) Create a workflow module at `.github/src/ci.ts`:

```ts
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout } from "@jlarky/gha-ts/actions";
import { secrets } from "@jlarky/gha-ts/context";

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
        {
          name: "Setup nexus credentials",
          run: [
            "mkdir -p ~/.gradle",
            `echo "systemProp.nexusUsername=${secrets("NEXUS_USERNAME")}" >> ~/.gradle/gradle.properties`,
            `echo "systemProp.nexusPassword=${secrets("NEXUS_PASSWORD")}" >> ~/.gradle/gradle.properties`,
          ].join("\n"),
        },
        { name: "Test android app", run: "./gradlew testDebugUnitTest" },
      ],
    },
  },
});
```

2) Add a Bun build script at `.github/build.ts`:

```ts
#!/usr/bin/env bun
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { generateWorkflows, scanWorkflows } from "@jlarky/gha-ts/cli";
import { createSerializer } from "@jlarky/gha-ts/render";

async function main() {
  const _dirname = dirname(fileURLToPath(import.meta.url));
  const workflowsDir = resolve(_dirname, "../.github/workflows");
  const srcDir = resolve(_dirname, "../.github/src");

  await generateWorkflows({
    srcModules: await scanWorkflows({ srcDir, outDir: workflowsDir }),
    onModule: async (module) => {
      createSerializer(module.workflow, Bun.YAML.stringify).writeWorkflow(
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

3) Generate YAML:

```bash
bun run --watch .github/build.ts
```

This writes `.github/workflows/ci.generated.yml`. You can also wire this into `mise`:

```toml
[tasks."workflows:build"]
description = "Generate GitHub Actions workflows from TypeScript"
run = "bun run .github/build.ts"
sources = [".github/build.ts", ".github/**/*.ts", "src/**/*.ts"]
outputs = [".github/workflows/*.generated.yml"]
```

## API overview

- `@jlarky/gha-ts/workflow-types`: core types and helpers (`workflow`, `run`, `uses`), validation, normalization.
- `@jlarky/gha-ts/actions`: prebuilt action helpers (e.g. `checkout`, `setupNode`, `cache`).
- `@jlarky/gha-ts/action`: aggregated `Action` object if you prefer a single namespace.
- `@jlarky/gha-ts/context`: expression builders for `${{ ... }}` (e.g. `secrets("MY_SECRET")`).
- `@jlarky/gha-ts/render`: `createSerializer(workflow, stringify?)` to produce stable YAML or write to disk.
- `@jlarky/gha-ts/cli` (Bun): `scanWorkflows` and `generateWorkflows` to discover `.ts` modules and emit YAML.

See `src/examples` and `tests` for more patterns (permissions ordering, schedule normalization, etc.).

## Design notes

- Parity-focused with upstream Pkl (`Workflow.pkl`, `Context.pkl`, `Action.pkl`, and `actions/*.pkl`).
- Stable key ordering and header via the renderer; pass any `stringify` (e.g. `Bun.YAML.stringify`).

## License

MIT — see `LICENSE`.
