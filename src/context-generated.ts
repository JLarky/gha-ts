/* Auto-generated from actionlint JSON. Do not edit by hand. */
import { token, type Fragment } from "../src/expr-core";


export class EnvCtx {
  constructor(private readonly base: string = "env") {}
  /**
 * Mapped entries under ${this.base}.
 */
any(name: string) { return token(`${this.base}.${name}` as any); }
}

export class GithubCtx {
  constructor(private readonly base: string = "github") {}
  get action(): Fragment { return token(`${this.base}.action` as any); }
  /**
 * Note: Composite actions only
 */
get action_path(): Fragment { return token(`${this.base}.action_path` as any); }
  /**
 * Note: Composite actions only
 */
get action_ref(): Fragment { return token(`${this.base}.action_ref` as any); }
  get action_repository(): Fragment { return token(`${this.base}.action_repository` as any); }
  /**
 * Note: Composite actions only
 */
get action_status(): Fragment { return token(`${this.base}.action_status` as any); }
  /**
 * Note: Composite actions only
 */
get actor(): Fragment { return token(`${this.base}.actor` as any); }
  get actor_id(): Fragment { return token(`${this.base}.actor_id` as any); }
  get api_url(): Fragment { return token(`${this.base}.api_url` as any); }
  /**
 * Note: Undocumented
 */
get artifact_cache_size_limit(): Fragment { return token(`${this.base}.artifact_cache_size_limit` as any); }
  /**
 * Note: Undocumented
 */
get base_ref(): Fragment { return token(`${this.base}.base_ref` as any); }
  get env(): Fragment { return token(`${this.base}.env` as any); }
  /**
 * Note: Stricter type check for this payload would be possible
 */
/**
 * Unstructured object under ${this.base}.event
 */
event(path: string) { return token(`${this.base}.event.${path}` as any); }
  /**
 * Note: Stricter type check for this payload would be possible
 */
get event_name(): Fragment { return token(`${this.base}.event_name` as any); }
  get event_path(): Fragment { return token(`${this.base}.event_path` as any); }
  get graphql_url(): Fragment { return token(`${this.base}.graphql_url` as any); }
  get head_ref(): Fragment { return token(`${this.base}.head_ref` as any); }
  get job(): Fragment { return token(`${this.base}.job` as any); }
  /**
 * Note: Undocumented
 */
get output(): Fragment { return token(`${this.base}.output` as any); }
  /**
 * Note: Undocumented
 */
get path(): Fragment { return token(`${this.base}.path` as any); }
  get ref(): Fragment { return token(`${this.base}.ref` as any); }
  get ref_name(): Fragment { return token(`${this.base}.ref_name` as any); }
  get ref_protected(): Fragment { return token(`${this.base}.ref_protected` as any); }
  get ref_type(): Fragment { return token(`${this.base}.ref_type` as any); }
  get repository(): Fragment { return token(`${this.base}.repository` as any); }
  get repository_id(): Fragment { return token(`${this.base}.repository_id` as any); }
  get repository_owner(): Fragment { return token(`${this.base}.repository_owner` as any); }
  get repository_owner_id(): Fragment { return token(`${this.base}.repository_owner_id` as any); }
  /**
 * Note: Undocumented
 */
get repository_visibility(): Fragment { return token(`${this.base}.repository_visibility` as any); }
  /**
 * repositoryUrl
 */
get repositoryurl(): Fragment { return token(`${this.base}.repositoryurl` as any); }
  /**
 * repositoryUrl
 */
get retention_days(): Fragment { return token(`${this.base}.retention_days` as any); }
  get run_attempt(): Fragment { return token(`${this.base}.run_attempt` as any); }
  get run_id(): Fragment { return token(`${this.base}.run_id` as any); }
  get run_number(): Fragment { return token(`${this.base}.run_number` as any); }
  get secret_source(): Fragment { return token(`${this.base}.secret_source` as any); }
  get server_url(): Fragment { return token(`${this.base}.server_url` as any); }
  get sha(): Fragment { return token(`${this.base}.sha` as any); }
  /**
 * Note: Undocumented
 */
get state(): Fragment { return token(`${this.base}.state` as any); }
  /**
 * Note: Undocumented
 */
get step_summary(): Fragment { return token(`${this.base}.step_summary` as any); }
  /**
 * Note: Undocumented
 */
get token(): Fragment { return token(`${this.base}.token` as any); }
  get triggering_actor(): Fragment { return token(`${this.base}.triggering_actor` as any); }
  get workflow(): Fragment { return token(`${this.base}.workflow` as any); }
  get workflow_ref(): Fragment { return token(`${this.base}.workflow_ref` as any); }
  get workflow_sha(): Fragment { return token(`${this.base}.workflow_sha` as any); }
  get workspace(): Fragment { return token(`${this.base}.workspace` as any); }
}

export class InputsCtx {
  constructor(private readonly base: string = "inputs") {}
}

export class JobCtx {
  constructor(private readonly base: string = "job") {}
  get check_run_id(): Fragment { return token(`${this.base}.check_run_id` as any); }
  get container() { return new JobCtx_Container(`${this.base}.container`); }
  /**
 * Mapped entries under ${this.base}.services
 */
any(name: string) { return token(`${this.base}.services.${name}` as any); }
  get status(): Fragment { return token(`${this.base}.status` as any); }
}

export class JobCtx_Container {
  constructor(private readonly base: string = "job.container") {}
  get id(): Fragment { return token(`${this.base}.id` as any); }
  get network(): Fragment { return token(`${this.base}.network` as any); }
}

export class MatrixCtx {
  constructor(private readonly base: string = "matrix") {}
}

export class NeedsCtx {
  constructor(private readonly base: string = "needs") {}
}

export class RunnerCtx {
  constructor(private readonly base: string = "runner") {}
  get arch(): Fragment { return token(`${this.base}.arch` as any); }
  get debug(): Fragment { return token(`${this.base}.debug` as any); }
  /**
 * https://github.com/github/docs/issues/32443
 * https://github.com/github/docs/issues/32443
 */
get environment(): Fragment { return token(`${this.base}.environment` as any); }
  get name(): Fragment { return token(`${this.base}.name` as any); }
  get os(): Fragment { return token(`${this.base}.os` as any); }
  get temp(): Fragment { return token(`${this.base}.temp` as any); }
  get tool_cache(): Fragment { return token(`${this.base}.tool_cache` as any); }
}

export class SecretsCtx {
  constructor(private readonly base: string = "secrets") {}
  /**
 * Mapped entries under ${this.base}.
 */
any(name: string) { return token(`${this.base}.${name}` as any); }
}

export class StepsCtx {
  constructor(private readonly base: string = "steps") {}
}

export class StrategyCtx {
  constructor(private readonly base: string = "strategy") {}
  get ["fail-fast"](): Fragment { return token(`${this.base}.fail-fast` as any); }
  get ["job-index"](): Fragment { return token(`${this.base}.job-index` as any); }
  get ["job-total"](): Fragment { return token(`${this.base}.job-total` as any); }
  get ["max-parallel"](): Fragment { return token(`${this.base}.max-parallel` as any); }
}

export class VarsCtx {
  constructor(private readonly base: string = "vars") {}
  /**
 * Mapped entries under ${this.base}.
 */
any(name: string) { return token(`${this.base}.${name}` as any); }
}

import { toInner, type ExprValue } from "../src/expr-core";
export const fn = {
  always: (...args: ExprValue[]) => `always(${args.map(toInner).join(", ")})`,
  cancelled: (...args: ExprValue[]) => `cancelled(${args.map(toInner).join(", ")})`,
  contains: (...args: ExprValue[]) => `contains(${args.map(toInner).join(", ")})`,
  endsWith: (...args: ExprValue[]) => `endsWith(${args.map(toInner).join(", ")})`,
  failure: (...args: ExprValue[]) => `failure(${args.map(toInner).join(", ")})`,
  format: (...args: ExprValue[]) => `format(${args.map(toInner).join(", ")})`,
  fromJSON: (...args: ExprValue[]) => `fromJSON(${args.map(toInner).join(", ")})`,
  hashFiles: (...args: ExprValue[]) => `hashFiles(${args.map(toInner).join(", ")})`,
  join: (...args: ExprValue[]) => `join(${args.map(toInner).join(", ")})`,
  startsWith: (...args: ExprValue[]) => `startsWith(${args.map(toInner).join(", ")})`,
  success: (...args: ExprValue[]) => `success(${args.map(toInner).join(", ")})`,
  toJSON: (...args: ExprValue[]) => `toJSON(${args.map(toInner).join(", ")})`,
} as const;

export class Ctx {
  env = new EnvCtx("env");
  github = new GithubCtx("github");
  inputs = new InputsCtx("inputs");
  job = new JobCtx("job");
  matrix = new MatrixCtx("matrix");
  needs = new NeedsCtx("needs");
  runner = new RunnerCtx("runner");
  secrets = new SecretsCtx("secrets");
  steps = new StepsCtx("steps");
  strategy = new StrategyCtx("strategy");
  vars = new VarsCtx("vars");
}
export const ctx = new Ctx();