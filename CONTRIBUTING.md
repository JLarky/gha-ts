# Contributing

## Code formatting

Format TypeScript files with oxfmt via mise:

```bash
mise run format
```

To verify formatting without writing changes:

```bash
mise run format:check
```


## Tests

Run the test suite via mise:

```bash
mise run test
```

## Publishing

Set new version in `jsr.json` and push.

To publish the package to npm, run:

```bash
mise run clone-to-npm --publish
```

Go to https://github.com/JLarky/gha-ts/releases and create a new release.

## Development

### Helpful links

* [GitHub Actions workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
* [JSON Scheme for GitHub Actions workflow files](https://json.schemastore.org/github-workflow.json)
* [GitHub Action lint](https://rhysd.github.io/actionlint/)

