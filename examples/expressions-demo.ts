#!/usr/bin/env -S mise exec -- bun run
/**
 * Example demonstrating the new expression helpers with workflow-types.
 *
 * This shows how to use expr, ctx, and fn for type-safe GitHub Actions expressions.
 */

import { workflow } from "../src/workflow-types";
import { expr, ctx, fn } from "../src/expressions";
import { lines } from "../src/utils";

// Example workflow using the new expression helpers
const wf = workflow({
  name: "Expression Demo",

  // Use expr for run-name with fallback
  "run-name": expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`,

  on: {
    push: {
      branches: ["main", "develop"],
    },
    pull_request: {
      branches: ["main"],
    },
    merge_group: {},
  },

  // Use expr for concurrency group
  concurrency: {
    group: expr`${ctx.github.workflow} - ${ctx.github.ref}`,
    "cancel-in-progress": true,
  },

  jobs: {
    // Conditional job using functions
    checks: {
      "runs-on": "ubuntu-latest",
      // Use expr with fn.endsWith for complex conditions
      if: expr`${ctx.github.event_name} == 'merge_group' || ${fn.endsWith(ctx.github.head_ref, "-run-tests")}`,
      steps: [
        {
          uses: "actions/checkout@v4",
        },
        {
          name: "Run format checks",
          run: "bun run fmt-check",
        },
      ],
    },

    // Job with matrix and cache
    test: {
      "runs-on": expr`${ctx.matrix.value("os")}`,
      strategy: {
        matrix: {
          os: ["ubuntu-latest", "windows-latest", "macos-latest"],
          node: ["18", "20"],
        },
      },
      steps: [
        {
          uses: "actions/checkout@v4",
        },
        {
          name: "Setup Node.js",
          uses: "actions/setup-node@v4",
          with: {
            "node-version": expr`${ctx.matrix.value("node")}`,
            // Use fn.hashFiles for cache key
            "cache-dependency-path": expr`${fn.hashFiles("package.json", "bun.lock")}`,
          },
        },
        {
          name: "Install dependencies",
          run: "bun install",
        },
        {
          id: "test",
          name: "Run tests",
          run: "bun test",
        },
        {
          name: "Upload coverage",
          // Conditional using fn.success and step output
          if: expr`${fn.success()} && ${ctx.steps.output("test", "coverage")} > 80`,
          uses: "actions/upload-artifact@v4",
          with: {
            name: expr`coverage-${ctx.matrix.value("os")}-${ctx.matrix.value("node")}`,
            path: "coverage/",
          },
        },
      ],
    },

    // Job that depends on previous jobs
    report: {
      "runs-on": "ubuntu-latest",
      needs: ["test"],
      // Use fn.always to run even if previous jobs failed
      if: expr`${fn.always()}`,
      steps: [
        {
          name: "Generate report",
          run: lines`
            echo "Test result: ${ctx.needs.result("test")}"
            echo "All done!"
          `,
        },
        {
          name: "Notify",
          // Use fn.format for formatted output
          run: expr`echo ${fn.format("Build {0} for PR #{1}", ctx.github.sha, ctx.github.event.pull_request.number)}`,
        },
      ],
    },

    // Job using secrets and environment variables
    deploy: {
      "runs-on": "ubuntu-latest",
      needs: ["test"],
      if: expr`${ctx.github.ref} == 'refs/heads/main'`,
      environment: {
        name: "production",
        url: expr`https://example.com`,
      },
      steps: [
        {
          name: "Deploy",
          env: {
            // Use ctx.secrets for sensitive data
            API_KEY: expr`${ctx.secrets.secret("DEPLOY_API_KEY")}`,
            // Use ctx.env for environment variables
            DEPLOY_ENV: expr`${ctx.env.var("ENVIRONMENT")}`,
            // Use ctx.vars for configuration variables
            DEPLOY_REGION: expr`${ctx.vars.get("DEPLOY_REGION")}`,
          },
          run: lines`
            echo "Deploying to production..."
            ./deploy.sh
          `,
        },
      ],
    },

    // Advanced example: dynamic matrix from job output
    "dynamic-test": {
      "runs-on": "ubuntu-latest",
      needs: ["test"],
      strategy: {
        // Use fn.fromJSON to parse matrix from previous job
        matrix: expr`${fn.fromJSON(ctx.needs.output("test", "matrix-config"))}`,
      },
      steps: [
        {
          name: "Run dynamic test",
          run: lines`
            echo "Testing with config: ${ctx.matrix.value("config")}"
          `,
        },
      ],
    },
  },
});

// Output the workflow for inspection
console.log("Generated workflow:");
console.log(JSON.stringify(wf, null, 2));

// In a real scenario, you would render this to YAML:
// import { generateWorkflowYaml } from '../src/render/yaml.js';
// await generateWorkflowYaml(wf, 'demo-workflow.yml');
