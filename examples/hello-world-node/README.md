# Hello world example using Node.js

Clone the example:

```bash
npx degit JLarky/gha-ts/examples/hello-world-node/.github/workflows .github/workflows
```

Install gha-ts:

```bash
npx jsr add -D @jlarky/gha-ts && npx nypm add -D yaml # jsr
# or
npx nypm add -D @jlarky/gha-ts yaml # npm
```

Run the workflow:

```bash
chmod +x .github/workflows/hello-world.main.ts
.github/workflows/hello-world.main.ts # builds .github/workflows/hello-world.generated.yml
```

Or in watch mode:

```bash
node --watch --no-warnings .github/workflows/hello-world.main.ts # watches for changes and rebuilds the workflow
```
