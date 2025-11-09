/* Auto-generated from actionlint JSON. Do not edit by hand. */
import { token, type Fragment } from "../src/expr-core";

export class EnvCtx {
  constructor(private readonly base: string = "env") {}
  /**
   * Mapped entries under ${this.base}.
   */
  any(name: string) {
    return token(`${this.base}.${name}` as any);
  }
}

export class GithubCtx {
  constructor(private readonly base: string = "github") {}
  /**
   * The name of the action currently running, or the [`id`](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsid) of a step. GitHub removes special characters, and uses the name `__run` when the current step runs a script without an `id`. If you use the same action more than once in the same job, the name will include a suffix with the sequence number with underscore before it. For example, the first script you run will have the name `__run`, and the second script will be named `__run_2`. Similarly, the second invocation of `actions/checkout` will be `actionscheckout2`.
   */
  get action(): Fragment {
    return token(`${this.base}.action` as any);
  }
  /**
   * The path where an action is located. This property is only supported in composite actions. You can use this path to access files located in the same repository as the action, for example by changing directories to the path: `cd ${{ github.action_path }}`.
   */
  get action_path(): Fragment {
    return token(`${this.base}.action_path` as any);
  }
  /**
   * For a step executing an action, this is the ref of the action being executed. For example, `v2`.
   */
  get action_ref(): Fragment {
    return token(`${this.base}.action_ref` as any);
  }
  /**
   * For a step executing an action, this is the owner and repository name of the action. For example, `actions/checkout`.
   */
  get action_repository(): Fragment {
    return token(`${this.base}.action_repository` as any);
  }
  /**
   * For a composite action, the current result of the composite action.
   */
  get action_status(): Fragment {
    return token(`${this.base}.action_status` as any);
  }
  /**
   * The username of the user that triggered the initial workflow run. If the workflow run is a re-run, this value may differ from `github.triggering_actor`. Any workflow re-runs will use the privileges of `github.actor`, even if the actor initiating the re-run (`github.triggering_actor`) has different privileges.
   */
  get actor(): Fragment {
    return token(`${this.base}.actor` as any);
  }
  /**
   * The account ID of the person or app that triggered the initial workflow run. For example, `1234567`. Note that this is different from the actor username.
   */
  get actor_id(): Fragment {
    return token(`${this.base}.actor_id` as any);
  }
  /**
   * The URL of the GitHub REST API.
   */
  get api_url(): Fragment {
    return token(`${this.base}.api_url` as any);
  }
  /**
   * Note: Undocumented
   */
  get artifact_cache_size_limit(): Fragment {
    return token(`${this.base}.artifact_cache_size_limit` as any);
  }
  /**
   * The `base_ref` or target branch of the pull request in a workflow run. This property is only available when the event that triggers a workflow run is either `pull_request` or `pull_request_target`.
   */
  get base_ref(): Fragment {
    return token(`${this.base}.base_ref` as any);
  }
  /**
   * Path on the runner to the file that sets environment variables from workflow commands. This file is unique to the current step and is a different file for each step in a job. For more information, see "[Workflow commands for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#setting-an-environment-variable)."
   */
  get env(): Fragment {
    return token(`${this.base}.env` as any);
  }
  /**
   * The full event webhook payload. You can access individual properties of the event using this context. This object is identical to the webhook payload of the event that triggered the workflow run, and is different for each event. The webhooks for each GitHub Actions event is linked in "[Events that trigger workflows](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows)." For example, for a workflow run triggered by the [`push` event](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#push), this object contains the contents of the [push webhook payload](https://docs.github.com/webhooks-and-events/webhooks/webhook-events-and-payloads#push).
   */
  /**
   * Unstructured object under ${this.base}.event
   */
  event(path: string) {
    return token(`${this.base}.event.${path}` as any);
  }
  /**
   * The name of the event that triggered the workflow run.
   */
  get event_name(): Fragment {
    return token(`${this.base}.event_name` as any);
  }
  /**
   * The path to the file on the runner that contains the full event webhook payload.
   */
  get event_path(): Fragment {
    return token(`${this.base}.event_path` as any);
  }
  /**
   * The URL of the GitHub GraphQL API.
   */
  get graphql_url(): Fragment {
    return token(`${this.base}.graphql_url` as any);
  }
  /**
   * The `head_ref` or source branch of the pull request in a workflow run. This property is only available when the event that triggers a workflow run is either `pull_request` or `pull_request_target`.
   */
  get head_ref(): Fragment {
    return token(`${this.base}.head_ref` as any);
  }
  /**
 * The [`job_id`](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_id) of the current job.
Note: This context property is set by the Actions runner, and is only available within the execution `steps` of a job. Otherwise, the value of this property will be `null`.
 */
  get job(): Fragment {
    return token(`${this.base}.job` as any);
  }
  /**
   * Note: Undocumented
   */
  get output(): Fragment {
    return token(`${this.base}.output` as any);
  }
  /**
   * Path on the runner to the file that sets system PATH variables from workflow commands. This file is unique to the current step and is a different file for each step in a job. For more information, see "[Workflow commands for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-system-path)."
   */
  get path(): Fragment {
    return token(`${this.base}.path` as any);
  }
  /**
   * The fully-formed ref of the branch or tag that triggered the workflow run. For workflows triggered by `push`, this is the branch or tag ref that was pushed. For workflows triggered by `pull_request`, this is the pull request merge branch. For workflows triggered by `release`, this is the release tag created. For other triggers, this is the branch or tag ref that triggered the workflow run. This is only set if a branch or tag is available for the event type. The ref given is fully-formed, meaning that for branches the format is `refs/heads/<branch_name>`, for pull requests it is `refs/pull/<pr_number>/merge`, and for tags it is `refs/tags/<tag_name>`. For example, `refs/heads/feature-branch-1`.
   */
  get ref(): Fragment {
    return token(`${this.base}.ref` as any);
  }
  /**
   * The short ref name of the branch or tag that triggered the workflow run. This value matches the branch or tag name shown on GitHub. For example, `feature-branch-1`.
   */
  get ref_name(): Fragment {
    return token(`${this.base}.ref_name` as any);
  }
  /**
   * `true` if branch protections are configured for the ref that triggered the workflow run.
   */
  get ref_protected(): Fragment {
    return token(`${this.base}.ref_protected` as any);
  }
  /**
   * The type of ref that triggered the workflow run. Valid values are `branch` or `tag`.
   */
  get ref_type(): Fragment {
    return token(`${this.base}.ref_type` as any);
  }
  /**
   * The owner and repository name. For example, `octocat/Hello-World`.
   */
  get repository(): Fragment {
    return token(`${this.base}.repository` as any);
  }
  /**
   * The ID of the repository. For example, `123456789`. Note that this is different from the repository name.
   */
  get repository_id(): Fragment {
    return token(`${this.base}.repository_id` as any);
  }
  /**
   * The repository owner's username. For example, `octocat`.
   */
  get repository_owner(): Fragment {
    return token(`${this.base}.repository_owner` as any);
  }
  /**
   * The repository owner's account ID. For example, `1234567`. Note that this is different from the owner's name.
   */
  get repository_owner_id(): Fragment {
    return token(`${this.base}.repository_owner_id` as any);
  }
  /**
   * Note: Undocumented
   */
  get repository_visibility(): Fragment {
    return token(`${this.base}.repository_visibility` as any);
  }
  /**
   * repositoryUrl
   */
  get repositoryurl(): Fragment {
    return token(`${this.base}.repositoryurl` as any);
  }
  /**
   * The number of days that workflow run logs and artifacts are kept.
   */
  get retention_days(): Fragment {
    return token(`${this.base}.retention_days` as any);
  }
  /**
   * A unique number for each attempt of a particular workflow run in a repository. This number begins at 1 for the workflow run's first attempt, and increments with each re-run.
   */
  get run_attempt(): Fragment {
    return token(`${this.base}.run_attempt` as any);
  }
  /**
   * A unique number for each workflow run within a repository. This number does not change if you re-run the workflow run.
   */
  get run_id(): Fragment {
    return token(`${this.base}.run_id` as any);
  }
  /**
   * A unique number for each run of a particular workflow in a repository. This number begins at 1 for the workflow's first run, and increments with each new run. This number does not change if you re-run the workflow run.
   */
  get run_number(): Fragment {
    return token(`${this.base}.run_number` as any);
  }
  /**
   * The source of a secret used in a workflow. Possible values are `None`, `Actions`, `Dependabot`, or `Codespaces`.
   */
  get secret_source(): Fragment {
    return token(`${this.base}.secret_source` as any);
  }
  /**
   * The URL of the GitHub server. For example: `https://github.com`.
   */
  get server_url(): Fragment {
    return token(`${this.base}.server_url` as any);
  }
  /**
   * The commit SHA that triggered the workflow. The value of this commit SHA depends on the event that triggered the workflow. For more information, see "[Events that trigger workflows](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows)." For example, `ffac537e6cbbf934b08745a378932722df287a53`.
   */
  get sha(): Fragment {
    return token(`${this.base}.sha` as any);
  }
  /**
   * Note: Undocumented
   */
  get state(): Fragment {
    return token(`${this.base}.state` as any);
  }
  /**
   * Note: Undocumented
   */
  get step_summary(): Fragment {
    return token(`${this.base}.step_summary` as any);
  }
  /**
 * A token to authenticate on behalf of the GitHub App installed on your repository. This is functionally equivalent to the `GITHUB_TOKEN` secret. For more information, see "[Automatic token authentication](https://docs.github.com/actions/security-guides/automatic-token-authentication)."
Note: This context property is set by the Actions runner, and is only available within the execution `steps` of a job. Otherwise, the value of this property will be `null`.
 */
  get token(): Fragment {
    return token(`${this.base}.token` as any);
  }
  /**
   * The username of the user that initiated the workflow run. If the workflow run is a re-run, this value may differ from `github.actor`. Any workflow re-runs will use the privileges of `github.actor`, even if the actor initiating the re-run (`github.triggering_actor`) has different privileges.
   */
  get triggering_actor(): Fragment {
    return token(`${this.base}.triggering_actor` as any);
  }
  /**
   * The name of the workflow. If the workflow file doesn't specify a `name`, the value of this property is the full path of the workflow file in the repository.
   */
  get workflow(): Fragment {
    return token(`${this.base}.workflow` as any);
  }
  /**
   * The ref path to the workflow. For example, `octocat/hello-world/.github/workflows/my-workflow.yml@refs/heads/my_branch`.
   */
  get workflow_ref(): Fragment {
    return token(`${this.base}.workflow_ref` as any);
  }
  /**
   * The commit SHA for the workflow file.
   */
  get workflow_sha(): Fragment {
    return token(`${this.base}.workflow_sha` as any);
  }
  /**
   * The default working directory on the runner for steps, and the default location of your repository when using the [`checkout`](https://github.com/actions/checkout) action.
   */
  get workspace(): Fragment {
    return token(`${this.base}.workspace` as any);
  }
}

export class InputsCtx {
  constructor(private readonly base: string = "inputs") {}
}

export class JobCtx {
  constructor(private readonly base: string = "job") {}
  get check_run_id(): Fragment {
    return token(`${this.base}.check_run_id` as any);
  }
  get container() {
    return new JobCtx_Container(`${this.base}.container`);
  }
  /**
   * Mapped entries under ${this.base}.services
   */
  any(name: string) {
    return token(`${this.base}.services.${name}` as any);
  }
  get status(): Fragment {
    return token(`${this.base}.status` as any);
  }
}

export class JobCtx_Container {
  constructor(private readonly base: string = "job.container") {}
  get id(): Fragment {
    return token(`${this.base}.id` as any);
  }
  get network(): Fragment {
    return token(`${this.base}.network` as any);
  }
}

export class MatrixCtx {
  constructor(private readonly base: string = "matrix") {}
}

export class NeedsCtx {
  constructor(private readonly base: string = "needs") {}
}

export class RunnerCtx {
  constructor(private readonly base: string = "runner") {}
  /**
   * The architecture of the runner executing the job. Possible values are `X86`, `X64`, `ARM`, or `ARM64`.
   */
  get arch(): Fragment {
    return token(`${this.base}.arch` as any);
  }
  /**
   * This is set only if [debug logging](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging) is enabled, and always has the value of `1`. It can be useful as an indicator to enable additional debugging or verbose logging in your own job steps.
   */
  get debug(): Fragment {
    return token(`${this.base}.debug` as any);
  }
  /**
   * https://github.com/github/docs/issues/32443
   * https://github.com/github/docs/issues/32443
   */
  get environment(): Fragment {
    return token(`${this.base}.environment` as any);
  }
  /**
   * The name of the runner executing the job.
   */
  get name(): Fragment {
    return token(`${this.base}.name` as any);
  }
  /**
   * The operating system of the runner executing the job. Possible values are `Linux`, `Windows`, or `macOS`.
   */
  get os(): Fragment {
    return token(`${this.base}.os` as any);
  }
  /**
   * The path to a temporary directory on the runner. This directory is emptied at the beginning and end of each job. Note that files will not be removed if the runner's user account does not have permission to delete them.
   */
  get temp(): Fragment {
    return token(`${this.base}.temp` as any);
  }
  /**
   * The path to the directory containing preinstalled tools for GitHub-hosted runners. For more information, see "[About GitHub-hosted runners](https://docs.github.com/actions/reference/specifications-for-github-hosted-runners/#supported-software)."
   */
  get tool_cache(): Fragment {
    return token(`${this.base}.tool_cache` as any);
  }
}

export class SecretsCtx {
  constructor(private readonly base: string = "secrets") {}
  /**
   * Mapped entries under ${this.base}.
   */
  any(name: string) {
    return token(`${this.base}.${name}` as any);
  }
}

export class StepsCtx {
  constructor(private readonly base: string = "steps") {}
}

export class StrategyCtx {
  constructor(private readonly base: string = "strategy") {}
  /**
   * When `true`, all in-progress jobs are canceled if any job in a matrix fails. For more information, see "[Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategyfail-fast)."
   */
  get ["fail-fast"](): Fragment {
    return token(`${this.base}.fail-fast` as any);
  }
  /**
   * The index of the current job in the matrix. **Note:** This number is a zero-based number. The first job's index in the matrix is `0`.
   */
  get ["job-index"](): Fragment {
    return token(`${this.base}.job-index` as any);
  }
  /**
   * The total number of jobs in the matrix. **Note:** This number **is not** a zero-based number. For example, for a matrix with four jobs, the value of `job-total` is `4`.
   */
  get ["job-total"](): Fragment {
    return token(`${this.base}.job-total` as any);
  }
  /**
   * The maximum number of jobs that can run simultaneously when using a matrix job strategy. For more information, see "[Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymax-parallel)."
   */
  get ["max-parallel"](): Fragment {
    return token(`${this.base}.max-parallel` as any);
  }
}

export class VarsCtx {
  constructor(private readonly base: string = "vars") {}
  /**
   * Mapped entries under ${this.base}.
   */
  any(name: string) {
    return token(`${this.base}.${name}` as any);
  }
}

import { toInner, type ExprValue } from "../src/expr-core";
export const fn = {
  /**
   * Causes the step to always execute, and returns `true`, even when canceled. The `always` expression is best used at the step level or on tasks that you expect to run even when a job is canceled. For example, you can use `always` to send logs even when a job is canceled.
   */
  always: (...args: ExprValue[]) => `always(${args.map(toInner).join(", ")})`,
  /**
   * Returns `true` if the workflow was canceled.
   */
  cancelled: (...args: ExprValue[]) =>
    `cancelled(${args.map(toInner).join(", ")})`,
  contains: (...args: ExprValue[]) =>
    `contains(${args.map(toInner).join(", ")})`,
  endsWith: (...args: ExprValue[]) =>
    `endsWith(${args.map(toInner).join(", ")})`,
  /**
   * Returns `true` when any previous step of a job fails. If you have a chain of dependent jobs, `failure()` returns `true` if any ancestor job fails.
   */
  failure: (...args: ExprValue[]) => `failure(${args.map(toInner).join(", ")})`,
  format: (...args: ExprValue[]) => `format(${args.map(toInner).join(", ")})`,
  fromJSON: (...args: ExprValue[]) =>
    `fromJSON(${args.map(toInner).join(", ")})`,
  /**
 * Returns a single hash for the set of files that matches the `path` pattern. You can provide a single `path` pattern or multiple `path` patterns separated by commas. The `path` is relative to the `GITHUB_WORKSPACE` directory and can only include files inside of the `GITHUB_WORKSPACE`. This function calculates an individual SHA-256 hash for each matched file, and then uses those hashes to calculate a final SHA-256 hash for the set of files. If the `path` pattern does not match any files, this returns an empty string. For more information about SHA-256, see "[SHA-2](https://wikipedia.org/wiki/SHA-2)."

You can use pattern matching characters to match file names. Pattern matching is case-insensitive on Windows. For more information about supported pattern matching characters, see "[Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet)."
 */
  hashFiles: (...args: ExprValue[]) =>
    `hashFiles(${args.map(toInner).join(", ")})`,
  join: (...args: ExprValue[]) => `join(${args.map(toInner).join(", ")})`,
  startsWith: (...args: ExprValue[]) =>
    `startsWith(${args.map(toInner).join(", ")})`,
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
