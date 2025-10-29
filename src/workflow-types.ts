/* Port of pkl-gha Workflow.pkl types into TypeScript (close semantic mirror).
 * Phase 1: minimal runtime logic, focus on parity with upstream.
 */

// Trigger variants (subset; can be extended later)
export interface PushTrigger {
  branches?: string[];
  "branches-ignore"?: string[];
  tags?: string[];
  "tags-ignore"?: string[];
  paths?: string[];
  "paths-ignore"?: string[];
}
export interface PullRequestTrigger {
  branches?: string[];
  "branches-ignore"?: string[];
  types?: string[];
  paths?: string[];
  "paths-ignore"?: string[];
}
export interface WorkflowDispatchTrigger {
  inputs?: Record<
    string,
    {
      description?: string;
      required?: boolean;
      type?: "string" | "boolean" | "number" | "choice" | "environment";
      default?: unknown;
      options?: string[];
      deprecatedMessage?: string;
    }
  >;
}
export interface ScheduleTrigger {
  cron: string[];
}
export interface CheckSuiteTrigger {
  types?: string[];
}
export interface IssuesTrigger {
  types?: string[];
}
export interface IssueCommentTrigger {
  types?: string[];
}
export interface ReleaseTrigger {
  types?: string[];
}
export interface CreateTrigger {}
export interface DeleteTrigger {}
export interface RegistryPackageTrigger {
  types?: string[];
}
export interface PageBuildTrigger {}
export interface WorkflowCallTrigger {
  inputs?: Record<
    string,
    {
      required?: boolean;
      type?: "string" | "boolean" | "number";
      default?: unknown;
      description?: string;
    }
  >;
  secrets?:
    | Record<string, { required?: boolean; description?: string }>
    | "inherit";
  outputs?: Record<string, { description?: string; value: string }>;
}

export interface OnObject {
  push?: PushTrigger;
  pull_request?: PullRequestTrigger;
  workflow_dispatch?: WorkflowDispatchTrigger;
  schedule?: { cron: string }[] | ScheduleTrigger | string[];
  branch_protection_rule?: { types?: string[] };
  check_suite?: CheckSuiteTrigger;
  issues?: IssuesTrigger;
  issue_comment?: IssueCommentTrigger;
  discussion?: { types?: string[] };
  discussion_comment?: { types?: string[] };
  fork?: {};
  gollum?: {};
  release?: ReleaseTrigger;
  create?: CreateTrigger;
  delete?: DeleteTrigger;
  registry_package?: RegistryPackageTrigger;
  page_build?: PageBuildTrigger;
  label?: { types?: string[] };
  merge_group?: { types?: string[] };
  milestone?: { types?: string[] };
  project?: { types?: string[] };
  project_card?: { types?: string[] };
  project_column?: { types?: string[] };
  public?: {};
  pull_request_review?: { types?: string[] };
  pull_request_review_comment?: { types?: string[] };
  pull_request_target?: PullRequestTrigger;
  workflow_call?: WorkflowCallTrigger;
  status?: {};
  watch?: {};
  workflow_run?: {
    types?: string[];
    workflows: string[];
    branches?: string[];
    "branches-ignore"?: string[];
  };
  [key: string]: unknown; // allow extension for unsupported triggers
}

// Permissions & Concurrency
export type PermissionsValue = "read" | "write" | "none";
export type PermissionsAllValue = "read-all" | "write-all";
export type Permissions =
  | Record<string, PermissionsValue>
  | PermissionsAllValue;
export interface ConcurrencyObject {
  group: string;
  "cancel-in-progress"?: boolean | string;
}
export type Concurrency = ConcurrencyObject | string;

// Strategy & Matrix
export interface Strategy {
  matrix?: Record<string, unknown[] | unknown>;
  "fail-fast"?: boolean | string;
  "max-parallel"?: number | string;
}

// Machine types (runs-on)
export interface Machine {
  name?: string;
  group?: string;
  labels?: string[] | string;
}
export type RunsOn = string | string[] | Machine | Machine[];

// Environment
export interface EnvironmentRef {
  name: string;
  url?: string;
}
export type Environment = EnvironmentRef | string;

// Step base types with mutual exclusivity run|uses
export interface StepBase {
  name?: string;
  id?: string;
  if?: string;
  env?: Record<string, string>;
  "working-directory"?: string;
  shell?: string;
  "timeout-minutes"?: number | string;
  "continue-on-error"?: boolean;
}
export interface RunStep extends StepBase {
  run: string;
  uses?: never;
  with?: never;
}
export interface UsesStep extends StepBase {
  uses: string;
  with?: Record<string, unknown>;
  run?: never;
}
export type Step = RunStep | UsesStep;

// Jobs
export interface DefaultJob {
  name?: string;
  "runs-on": RunsOn;
  if?: string;
  permissions?: Permissions;
  env?: Record<string, string>;
  steps: Step[];
  needs?: string | string[];
  strategy?: Strategy;
  concurrency?: Concurrency;
  "timeout-minutes"?: number | string;
  "continue-on-error"?: boolean | string;
  container?: { image: string; env?: Record<string, string>; options?: string };
  services?: Record<
    string,
    { image: string; env?: Record<string, string>; ports?: (string | number)[] }
  >;
  defaults?: { run?: { shell?: string; "working-directory"?: string } };
  environment?: Environment;
  outputs?: Record<string, string>; // expression strings
}
export interface ReusableJob {
  name?: string;
  uses: string; // path or org/repo/.github/workflows/file.yml@ref
  with?: Record<string, unknown>;
  secrets?: Record<string, string> | "inherit";
  permissions?: Permissions;
  if?: string;
  needs?: string | string[];
  strategy?: Strategy;
  concurrency?: Concurrency;
  "timeout-minutes"?: number | string;
  env?: Record<string, string>;
}
export type Job = DefaultJob | ReusableJob;

export interface Workflow {
  name: string;
  "run-name"?: string;
  on: OnObject | string | string[];
  env?: Record<string, string>;
  permissions?: Permissions;
  concurrency?: Concurrency;
  defaults?: { run?: { shell?: string; "working-directory"?: string } };
  jobs: Record<string, Job>;
}

// Type guards
export function isRunStep(step: Step): step is RunStep {
  return (step as any).run !== undefined;
}
export function isUsesStep(step: Step): step is UsesStep {
  return (step as any).uses !== undefined;
}
export function isReusableJob(job: Job): job is ReusableJob {
  return (job as any).uses !== undefined && (job as any).steps === undefined;
}
export function isDefaultJob(job: Job): job is DefaultJob {
  return (job as any).steps !== undefined;
}

// Validation: run/uses mutual exclusivity
export function validateStep(step: Step, index?: number, jobId?: string) {
  const hasRun = (step as any).run !== undefined;
  const hasUses = (step as any).uses !== undefined;
  if (hasRun && hasUses)
    throw new Error(
      `Invalid step (job=${jobId} index=${index}): cannot have both run and uses.`,
    );
  if (!hasRun && !hasUses)
    throw new Error(
      `Invalid step (job=${jobId} index=${index}): must have run or uses.`,
    );
}
export function validateWorkflow(wf: Workflow): Workflow {
  // onIsSet equivalent: at least one trigger must be set when 'on' is object
  if (typeof wf.on === "object" && !Array.isArray(wf.on)) {
    const on = wf.on as Record<string, unknown>;
    const hasAny = Object.values(on).some((v) => v !== undefined && v !== null);
    if (!hasAny)
      throw new Error("Workflow.on must specify at least one trigger");
  }
  for (const [jobId, job] of Object.entries(wf.jobs)) {
    if (isDefaultJob(job))
      job.steps.forEach((s, i) => validateStep(s, i, jobId));
  }
  return wf;
}

// Runs-on normalization
export function normalizeRunsOn(ro: RunsOn): string | string[] {
  if (Array.isArray(ro)) {
    return ro.map((r: string | Machine) =>
      typeof r === "string" ? r : machineToString(r),
    );
  }
  return typeof ro === "string" ? ro : machineToString(ro);
}
function machineToString(m: Machine): string {
  if (m.group) return m.group;
  if (m.labels) return Array.isArray(m.labels) ? m.labels.join(",") : m.labels;
  return m.name || "ubuntu-latest";
}

export const permissionsAllRead: PermissionsAllValue = "read-all";
export const permissionsAllWrite: PermissionsAllValue = "write-all";

// Simple factories to aid composition
export function workflow(def: Workflow): Workflow {
  return def;
}
export function job(def: DefaultJob): DefaultJob {
  return def;
}
export function uses(
  action: string,
  withOpts?: Record<string, unknown>,
  opts: Omit<UsesStep, "uses" | "with"> = {},
): UsesStep {
  return {
    uses: action,
    ...(withOpts && { with: withOpts }),
    ...opts,
  } as UsesStep;
}
export function run(script: string, opts: Omit<RunStep, "run"> = {}): RunStep {
  return { run: script, ...opts } as RunStep;
}
