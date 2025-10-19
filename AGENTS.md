## Project: gha-ts

Note: This project uses Mise and Bun instead of Node.js (npm/yarn). Use `mise run` tasks and Bun commands; see [@CONTRIBUTING.md](CONTRIBUTING.md).

### Purpose
- Provide a 1:1 TypeScript port of `stefma/pkl-gha` so that GitHub Actions workflows and prebuilt actions defined in Pkl (`Workflow.pkl`, `Context.pkl`, `Action.pkl`, and `actions/*.pkl`) can be authored in TypeScript and rendered to YAML.
- Stay as close as possible to the upstream Pkl semantics so patches from upstream can be applied with minimal churn.

### Design constraints
- Parity-first: mirror Pkl field names, option mappings, and behavior (including idiosyncrasies) in TypeScript.
- YAML rendering uses Bun’s built-in YAML: see [Bun YAML API](https://bun.com/docs/api/yaml).
- File naming: kebab-case for multi-word filenames.
- Aggregated `Action` object mirrors `Action.pkl` (including legacy aliases where applicable).

### Scope mapping (TS ↔ Pkl)
- `src/workflow-types.ts` ↔ `Workflow.pkl` (triggers, jobs, steps, permissions, concurrency; includes runs-on/schedule normalization and on-is-set validation).
- `src/context.ts`, `src/context-full.ts` ↔ `Context.pkl` (generic expression builders and named accessors).
- `src/action.ts` ↔ `Action.pkl` (exports for all common/prebuilt actions).
- `src/actions/{common,artifact,cache,pages,setup}.ts` ↔ `actions/{Common,Artifact,Cache,Pages,Setup}.pkl`.
- `src/render/yaml.ts` corresponds to the `output` renderer block in `Workflow.pkl` (header + stable key ordering + converters).

### Non-goals (for now)
- JSON Schema validation is out of scope for this repo and may be provided by a separate package later.

### Usage
- Generate workflows: `mise run workflows:build` → outputs to `.github/workflows/*.generated.yml`.

### Status
- Core parity complete for `Workflow`, `Context`, `Action`, and `actions/*`. Further examples and golden tests can be added next to guard semantics.



### Contributing

See [@CONTRIBUTING.md](CONTRIBUTING.md) for formatting, tests, publishing, and development guidelines.
