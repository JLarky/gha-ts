# Enterprise-focused example using Node.js

This example shows how to author a workflow in TypeScript that is friendly to enterprise setups (private registries, minimal permissions, caching) and render it to YAML.

## Install gha-ts

```bash
npx jsr add -D @jlarky/gha-ts && npx nypm add -D yaml # jsr
# or
npx nypm add -D @jlarky/gha-ts yaml # npm
```

## Create the workflow file

Create `.github/workflows/enterprise-node.main.ts`:

```ts
#!/usr/bin/env -S node --no-warnings
import YAML from "yaml";
import { workflow } from "@jlarky/gha-ts/workflow-types";
import { checkout, setupNode } from "@jlarky/gha-ts/actions";
import { generateWorkflow } from "@jlarky/gha-ts/cli";

export const wf = workflow({
  name: "Enterprise CI (Node)",
  on: {
    push: { branches: ["main"] },
    pull_request: {},
    workflow_dispatch: {},
  },
  // Keep permissions minimal by default; adjust as needed
  permissions: { contents: "read" },
  jobs: {
    build: {
      "runs-on": "ubuntu-latest",
      strategy: { matrix: { node: ["18", "20", "22"] } },
      steps: [
        checkout({ "fetch-depth": 0 }),
        setupNode({
          "node-version": "${{ matrix.node }}",
          cache: "npm",
          "cache-dependency-path": "package-lock.json",
          // Configure for your private registry (GitHub Packages shown)
          "registry-url": "https://npm.pkg.github.com",
          scope: "@your-scope", // org or user name for GitHub Packages
          "always-auth": true,
          token: "${{ secrets.NPM_TOKEN }}", // or GITHUB_TOKEN if allowed
        }),
        { name: "Install", run: "npm ci" },
        { name: "Test", run: "npm test --ignore-scripts" },
      ],
    },
  },
});

await generateWorkflow(wf, YAML.stringify, import.meta.url);
```

## Run the workflow

```bash
chmod +x .github/workflows/enterprise-node.main.ts
.github/workflows/enterprise-node.main.ts # builds .github/workflows/enterprise-node.generated.yml
```

## Watch mode

```bash
node --watch --no-warnings .github/workflows/enterprise-node.main.ts # watches for changes and rebuilds the workflow
```

## Notes for enterprise/GHAS

- **Private registries**: Set `registry-url`, `scope`, and `always-auth`. Provide `token` via `secrets.NPM_TOKEN` (or `GITHUB_TOKEN` if permitted).
- **GitHub Packages on GHES**: Use `https://npm.pkg.<your-ghes-host>` and set `scope` to your org or user.
- **Least-privilege permissions**: Keep `permissions` minimal; add specific scopes (e.g., `id-token: "write"`) only when required.
