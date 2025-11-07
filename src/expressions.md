# Expression Helpers

Production-ready helpers for building type-safe GitHub Actions expressions.

## Overview

The `expressions` module provides a modern, type-safe DSL for building GitHub Actions expressions with automatic quoting, validation, and a fluent API.

## Key Features

- **Type-safe context accessors** - Access GitHub Actions contexts with full TypeScript support
- **Auto-quoting** - Plain strings are automatically quoted, context tokens are not
- **Expression validation** - Prevents double-wrapping with explicit error messages
- **Function helpers** - All GitHub Actions functions with proper escaping
- **Fragment abstraction** - Compose expressions from reusable fragments
- **Tagged templates** - Natural syntax using template literals

## Quick Start

```typescript
import { expr, ctx, fn } from 'gha-ts/expressions';

// Simple context access
const runName = expr`${ctx.github.workflow} - ${ctx.github.ref}`;
// => ${{ github.workflow - github.ref }}

// With functions
const condition = expr`${fn.endsWith(ctx.github.head_ref, '-run-tests')}`;
// => ${{ endsWith(github.head_ref, '-run-tests') }}

// Complex expressions with fallback
const title = expr`${ctx.github.head_ref || ctx.github.ref}`;
// => ${{ github.head_ref || github.ref }}
```

## API Reference

### `expr` Tagged Template

Build expressions using template literals:

```typescript
expr`${ctx.github.ref}` // ${{ github.ref }}
expr`${ctx.github.event_name} == 'push'` // ${{ github.event_name == 'push' }}
```

### Context Object (`ctx`)

Access all GitHub Actions contexts:

#### `ctx.github`

```typescript
ctx.github.workflow       // github.workflow
ctx.github.ref            // github.ref
ctx.github.sha            // github.sha
ctx.github.event_name     // github.event_name
ctx.github.head_ref       // github.head_ref
ctx.github.base_ref       // github.base_ref
ctx.github.repository     // github.repository
ctx.github.actor          // github.actor

// Event payloads
ctx.github.event.pull_request.title
ctx.github.event.pull_request.number
ctx.github.event.merge_group.head_ref

// Custom event path
ctx.github.eventPath('issue.number')
```

#### `ctx.env`

```typescript
ctx.env.var('NODE_VERSION')  // env.NODE_VERSION
ctx.env.var('CI')            // env.CI
```

#### `ctx.secrets`

```typescript
ctx.secrets.secret('API_KEY')       // secrets.API_KEY
ctx.secrets.secret('GITHUB_TOKEN')  // secrets.GITHUB_TOKEN
```

#### `ctx.matrix`

```typescript
ctx.matrix.value('os')           // matrix.os
ctx.matrix.value('node-version') // matrix.node-version
```

#### `ctx.steps`

```typescript
ctx.steps.output('build', 'version')    // steps.build.outputs.version
ctx.steps.conclusion('test')            // steps.test.conclusion
ctx.steps.outcome('test')               // steps.test.outcome
```

#### `ctx.needs`

```typescript
ctx.needs.output('build', 'version')  // needs.build.outputs.version
ctx.needs.result('test')              // needs.test.result
```

#### `ctx.inputs`

```typescript
ctx.inputs.get('environment')  // inputs.environment
```

#### `ctx.vars`

```typescript
ctx.vars.get('DEPLOY_REGION')  // vars.DEPLOY_REGION
```

#### `ctx.runner`

```typescript
ctx.runner.os          // runner.os
ctx.runner.arch        // runner.arch
ctx.runner.temp        // runner.temp
ctx.runner.tool_cache  // runner.tool_cache
```

#### `ctx.job`

```typescript
ctx.job.status               // job.status
ctx.job.container.id         // job.container.id
ctx.job.service('redis', 'id')  // job.services.redis.id
```

#### `ctx.strategy`

```typescript
ctx.strategy.fail_fast     // strategy.fail-fast
ctx.strategy.job_index     // strategy.job-index
ctx.strategy.job_total     // strategy.job-total
ctx.strategy.max_parallel  // strategy.max-parallel
```

### Function Helpers (`fn`)

All GitHub Actions expression functions:

```typescript
// Status checks
fn.always()      // always()
fn.success()     // success()
fn.failure()     // failure()
fn.cancelled()   // cancelled()

// String functions
fn.contains(ctx.github.ref, 'main')
// => contains(github.ref, 'main')

fn.startsWith(ctx.github.ref, 'refs/heads/')
// => startsWith(github.ref, 'refs/heads/')

fn.endsWith(ctx.github.head_ref, '-test')
// => endsWith(github.head_ref, '-test')

// Formatting
fn.format('PR {0} #{1}', ctx.github.event.pull_request.title, 123)
// => format('PR {0} #{1}', github.event.pull_request.title, 123)

fn.join(ctx.matrix.value('os'), ', ')
// => join(matrix.os, ', ')

// File operations
fn.hashFiles('package.json', 'bun.lock')
// => hashFiles('package.json', 'bun.lock')

// JSON operations
fn.toJSON(ctx.matrix.value('config'))
// => toJSON(matrix.config)

fn.fromJSON(ctx.needs.output('build', 'matrix'))
// => fromJSON(needs.build.outputs.matrix)
```

### Utility Functions

#### `wrap(inner: string): WorkflowExpr`

Wraps an expression string with `${{ }}`:

```typescript
wrap('github.ref')  // ${{ github.ref }}
```

Throws if already wrapped.

#### `unwrap(expr: WorkflowExpr): string`

Extracts inner content from a wrapped expression:

```typescript
unwrap('${{ github.ref }}')  // 'github.ref'
```

#### `fragment(inner: string): Fragment`

Creates a composable expression fragment:

```typescript
const ref = fragment('github.ref');
expr`${ref}`  // ${{ github.ref }}
```

#### `token(path: RawToken): Fragment`

Creates a context token fragment:

```typescript
const ref = token('github.ref');
expr`${ref}`  // ${{ github.ref }}
```

#### `raw(value: string): Fragment`

Creates an explicitly quoted literal:

```typescript
const str = raw("complex'string");
expr`${str}`  // ${{ 'complex'\''string' }}
```

## Real-World Examples

### Workflow with Dynamic Run Name

```typescript
import { workflow } from 'gha-ts/workflow-types';
import { expr, ctx } from 'gha-ts/expressions';

const wf = workflow({
  name: 'CI',
  'run-name': expr`${ctx.github.event_name} - ${ctx.github.head_ref || ctx.github.ref}`,
  on: { push: {}, pull_request: {} },
  jobs: { /* ... */ }
});
```

### Conditional Job Execution

```typescript
import { expr, ctx, fn } from 'gha-ts/expressions';

const job = {
  'runs-on': 'ubuntu-latest',
  if: expr`${ctx.github.event_name} == 'merge_group' || ${fn.endsWith(ctx.github.head_ref, '-run-tests')}`,
  steps: [/* ... */]
};
```

### Matrix with Cache Key

```typescript
import { expr, ctx, fn } from 'gha-ts/expressions';

const job = {
  strategy: {
    matrix: { os: ['ubuntu-latest', 'macos-latest'] }
  },
  steps: [
    {
      uses: 'actions/cache@v4',
      with: {
        key: expr`${ctx.runner.os}-node-${fn.hashFiles('package.json', 'bun.lock')}`
      }
    }
  ]
};
```

### Step Output Conditional

```typescript
import { expr, ctx, fn } from 'gha-ts/expressions';

const step = {
  name: 'Upload coverage',
  if: expr`${fn.success()} && ${ctx.steps.output('test', 'coverage')} > 80`,
  uses: 'actions/upload-artifact@v4'
};
```

### Secrets and Environment Variables

```typescript
import { expr, ctx } from 'gha-ts/expressions';

const step = {
  name: 'Deploy',
  env: {
    API_KEY: expr`${ctx.secrets.secret('DEPLOY_KEY')}`,
    NODE_ENV: expr`${ctx.env.var('ENVIRONMENT')}`,
    REGION: expr`${ctx.vars.get('DEPLOY_REGION')}`
  },
  run: './deploy.sh'
};
```

### Dynamic Matrix from Job Output

```typescript
import { expr, ctx, fn } from 'gha-ts/expressions';

const job = {
  needs: ['setup'],
  strategy: {
    matrix: expr`${fn.fromJSON(ctx.needs.output('setup', 'matrix-config'))}`
  },
  steps: [/* ... */]
};
```

## Design Principles

### Auto-Quoting

Plain strings are automatically quoted, while context tokens and expressions are not:

```typescript
expr`${'hello'}`           // ${{ 'hello' }}
expr`${ctx.github.ref}`    // ${{ github.ref }}
```

### Explicit Validation

The system fails fast on double-wrapping:

```typescript
wrap('${{ github.ref }}')  // ❌ throws Error
unwrap('github.ref')       // ❌ throws Error
```

Use `unwrap()` for intentional unwrapping:

```typescript
const expr1 = expr`${ctx.github.ref}`;
const inner = unwrap(expr1);  // ✅ 'github.ref'
```

### Type Safety

All context accessors return `Fragment` objects that can be composed:

```typescript
const ref = ctx.github.ref;  // Fragment
expr`${ref}`                 // ${{ github.ref }}
```

### Composability

Fragments can be reused and combined:

```typescript
const isMain = fn.contains(ctx.github.ref, 'main');
const isPush = expr`${ctx.github.event_name} == 'push'`;
const condition = expr`${isMain} && ${isPush}`;
```

## Migration from Legacy Helpers

The old context helpers (`context.ts`, `context-full.ts`) are still available but deprecated:

```typescript
// Old way
import { github } from 'gha-ts/context';
const ref = github('ref');  // ${{ github.ref }}

// New way
import { expr, ctx } from 'gha-ts/expressions';
const ref = expr`${ctx.github.ref}`;  // ${{ github.ref }}
```

Benefits of the new API:
- Type-safe context paths
- Auto-quoting of strings
- Function helpers with proper escaping
- Explicit validation
- Better composition

## TypeScript Types

```typescript
// Core types
type WorkflowExpr = `\${{ ${string} }}`;
type RawToken = `${RawTokenPrefix}.${string}`;
type RawTokenPrefix = 
  | 'github' | 'env' | 'matrix' | 'needs' 
  | 'steps' | 'secrets' | 'vars' | 'runner'
  | 'job' | 'jobs' | 'strategy' | 'inputs';

// Fragment interface
interface Fragment {
  readonly inner: string;
  toString(): string;
  wrap(): WorkflowExpr;
}
```

## See Also

- [GitHub Actions Expressions Documentation](https://docs.github.com/en/actions/learn-github-actions/expressions)
- [GitHub Actions Contexts Documentation](https://docs.github.com/en/actions/learn-github-actions/contexts)
- [`workflow-types.ts`](./workflow-types.ts) - Workflow type definitions
- [`examples/expressions-demo.ts`](../examples/expressions-demo.ts) - Complete example
