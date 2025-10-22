# Contributing

## Install dependencies

Use mise to install dependencies:

```bash
mise run install
# or
mise x bun -- bun install
```

## Mise tasks

Common tasks are available via mise:

- format: Format TypeScript files with oxfmt

```bash
mise run format
```

- test: Run tests with Bun

```bash
mise run test
```

- validate-published-package: Validate that the published package works

```bash
mise run validate-published-package
```

- workflows:build: Generate GitHub Actions workflows from TypeScript

```bash
mise run workflows:build
```

- workflows:clear: Remove generated GitHub Actions workflows

```bash
mise run workflows:clear
```

- actionlint: Run actionlint against workflows

```bash
mise run actionlint
```

## Publishing

Set the new version in `jsr.json` and push to `main`.

When `jsr.json` changes on `main`, the Create Release workflow (`.github/workflows/create-release.main.ts`) automatically creates a draft prerelease on GitHub with tag `v<version>`.

- Review the draft on [Releases](https://github.com/JLarky/gha-ts/releases), adjust notes, and publish it.

To publish the package to npm, run on your machine (CI pipeline doesn't work yet):

```bash
mise run clone-to-npm --publish
```

## Development

### Helpful links

* [GitHub Actions workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
* [JSON Scheme for GitHub Actions workflow files](https://json.schemastore.org/github-workflow.json)
* [GitHub Action lint](https://rhysd.github.io/actionlint/)

