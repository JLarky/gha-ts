# Enterprise Node Example

This example demonstrates how to use **gha-ts** with Node.js in an enterprise-grade setup, using a local workflow utilities module for code organization and reusability.

## Features

- **TypeScript workflows**: Author workflows with strong typing and validation
- **Modular utilities**: Custom utilities in `.github/workflows/utils/` for code reuse
- **Node.js compatible**: Uses Node.js with `js-yaml` for YAML generation (no Bun required)
- **Custom YAML serialization**: Fine-tuned YAML output with consistent formatting

## Structure

```
.github/
├── workflows/
│   ├── utils/
│   │   ├── yaml.ts          # Custom YAML generation utilities
│   │   └── build-cli.ts     # Build script to generate workflows
│   ├── hello-world.main.ts  # Example workflow definition
│   └── hello-world.generated.yml  # Generated workflow (output)
├── mise.toml              # Mise task configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Install dependencies

```bash
cd .github
npm install
```

Or use Mise (if installed):

```bash
mise run install
```

### Generate workflows

```bash
node workflows/utils/build-cli.ts
```

Or with Mise:

```bash
mise run wf-build
```

### Watch for changes

Automatically rebuild workflows when TypeScript files change:

```bash
node --watch --no-warnings workflows/utils/build-cli.ts
```

Or with Mise:

```bash
mise run wf-watch
```

## Key Components

### `hello-world.main.ts`

Defines a simple GitHub Actions workflow with checkout and echo steps:

```typescript
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
```

### `utils/yaml.ts`

Provides custom YAML serialization using `js-yaml`:

- `stringifyYaml`: Custom YAML formatter with quote handling
- `generateWorkflowYaml`: Helper to generate and write workflow YAML files

### `utils/build-cli.ts`

Build script that discovers and executes all `.main.ts` workflow files, generating corresponding `.generated.yml` outputs.

## Customization

### Adding a new workflow

1. Create a new TypeScript file: `.github/workflows/my-workflow.main.ts`
2. Define your workflow using the gha-ts API
3. Call `generateWorkflowYaml(wf, import.meta.url)` to generate the YAML file
4. Run the build script to generate the output

### Modifying YAML output

Edit `utils/yaml.ts` to adjust YAML formatting:

```typescript
export const stringifyYaml: Stringify = (input) =>
  dump(input, { quotingType: '"', lineWidth: Infinity });
```

## Dependencies

- `@jlarky/gha-ts`: TypeScript library for GitHub Actions workflows
- `js-yaml`: YAML serialization
- `@types/node`: TypeScript types for Node.js

## Learn More

- [gha-ts Documentation](https://github.com/JLarky/gha-ts)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
