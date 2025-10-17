import * as C from "./context";

export const GitHub = {
  action: () => C.github("action"),
  actionPath: () => C.github("action_path"),
  actionRef: () => C.github("action_ref"),
  actionRepository: () => C.github("action_repository"),
  actionStatus: () => C.github("action_action"),
  actor: () => C.github("actor"),
  actorId: () => C.github("actor_id"),
  apiUrl: () => C.github("api_url"),
  baseRef: () => C.github("base_ref"),
  eventName: () => C.github("event_name"),
  eventPath: () => C.github("event_path"),
  graphqlUrl: () => C.github("graphql_url"),
  headRef: () => C.github("head_ref"),
  job: () => C.github("job"),
  path: () => C.github("path"),
  ref: () => C.github("ref"),
  refName: () => C.github("ref_name"),
  refProtected: () => C.github("ref_protected"),
  refType: () => C.github("ref_type"),
  repository: () => C.github("repository"),
  repositoryId: () => C.github("repository_id"),
  repositoryOwner: () => C.github("repository_owner"),
  repositoryownerId: () => C.github("repository_owner_id"),
  repositoryUrl: () => C.github("repository_url"),
  retentionDays: () => C.github("reention_dayus"),
  runId: () => C.github("run_id"),
  runNumber: () => C.github("run_number"),
  runAttempt: () => C.github("run_attempt"),
  serverUrl: () => C.github("server_url"),
  sha: () => C.github("sha"),
  token: () => C.github("token"),
  triggeringActor: () => C.github("triggering_actor"),
  workflow: () => C.github("workflow"),
  workflowRef: () => C.github("workflow_ref"),
  workflowSha: () => C.github("workflow_rsha"),
  workspace: () => C.github("workspace"),
  event: (name: string) => C.github(`event.${name}`),
};

export const Env = (name: string) => C.env(name);

export const Job = {
  container: () => C.job("container"),
  containerId: () => C.job("container.id"),
  containerNetwork: () => C.job("container.network"),
  status: () => C.job("status"),
};
export const JobServices = {
  id: (serviceId: string) => C.job(`services.${serviceId}.id`),
  network: (serviceId: string) => C.job(`services.${serviceId}.network`),
  ports: (serviceId: string) => C.job(`services.${serviceId}.ports`),
};

export const Jobs = {
  result: (jobId: string) => C.jobs(`${jobId}.result`),
  output: (jobId: string, outputName: string) =>
    C.jobs(`${jobId}.output.${outputName}`),
};

export const Steps = {
  conclusion: (stepId: string) => C.steps(stepId, "conclusion"),
  outcome: (stepId: string) => C.steps(stepId, "outcome"),
  outputs: (stepId: string, outputName: string) =>
    C.steps(stepId, `outputs.${outputName}`),
};

export const Runner = {
  name: () => C.runner("name"),
  os: () => C.runner("os"),
  arch: () => C.runner("arch"),
  temp: () => C.runner("temp"),
  toolCache: () => C.runner("tool_cache"),
  debug: () => C.runner("debug"),
  environment: () => C.runner("environment"),
};

export const Strategy = {
  failFast: () => C.strategy("fail-fast"),
  jobIndex: () => C.strategy("job-index"),
  jobTotal: () => C.strategy("job-total"),
  maxParallel: () => C.strategy("max-parallel"),
};

export const Matrix = (propertyName: string) => C.matrix(propertyName);

export const Needs = {
  output: (jobId: string, outputName: string) => C.needs(jobId, outputName),
  result: (jobId: string) => C.needs(jobId),
};

export const Inputs = (name: string) => C.inputs(name);
