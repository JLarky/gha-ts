# Hello world example using Bun

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-bun/.github/workflows .github/workflows
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
