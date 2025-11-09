# Expressions & Context – TODO

- [ ] Generate typed function overloads from JSON
  - Emit precise TypeScript signatures per overload and varargs instead of `(...args: ExprValue[])`.

- [ ] Strengthen context APIs
  - Add dedicated helpers for dynamic segments: `steps.output(stepId, name)`, `needs.output(jobId, name)`, `jobs(jobId).result`, `matrix(key)`, etc.
  - Provide typed wrappers for mapped contexts: `env.var(name)`, `vars.var(name)`, `secrets.secret(name)`.

- [ ] Improve docs in generated code
  - Normalize and de-duplicate comment text; attach `docUrls` as JSDoc links for quick navigation.
  - Example reference: [inputs context](https://docs.github.com/en/actions/learn-github-actions/contexts#inputs-context).

- [ ] Add golden tests
  - Snapshot-test `ctx` getters and `fn` formatting to YAML for common patterns.
  - Include event-guarded examples (e.g., `github.event.pull_request.*` behind a PR check).

- [ ] Make `fn` safer and more ergonomic
  - Validate `format()` placeholder count at build time when the template is a literal.
  - Add `joinArray(...items)` sugar to avoid using `fromJSON` for simple demos.

- [ ] TS ergonomics
  - Re-export `fn` from `src/context` so consumers import from one place.
  - Brand expression strings (e.g., `type WorkflowExpr = string & { __expr: true }`) to prevent accidental plain strings.

- [ ] Optional richer typing for contexts
  - Emit richer types for `github.event.*` and `inputs.*` for common events (behind a flag), guided by docs.

- [ ] Stability and traceability
  - Pin `actionlint` source ref when fetching; embed the commit in generated JSON headers.

- [ ] CI guardrails
  - Add a job that fails if generator outputs differ from committed files.
  - Run `actionlint` and golden tests automatically in CI.


- [ ] Typed function overloads for fn.* from signatures JSON (with JSDoc).
- [ ] Expand event namespaces beyond push/pr, and keep adding negative type tests for scoped expr.
- [ ] Basic README section for expr/ctx usage with links to official docs.
- [ ] remove "as any"
