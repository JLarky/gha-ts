import { UsesStep } from '../workflow-types';
import { uses } from '../workflow-types';

export type WithValue = string | number | boolean;
export type CamelToKebabMap = Record<string, string>;

export function buildWith<T extends Record<string, any>>(
  opts: T | undefined,
  mapping: CamelToKebabMap,
): Record<string, WithValue> | undefined {
  if (!opts) return undefined;
  const out: Record<string, WithValue> = {};
  for (const [camel, value] of Object.entries(opts)) {
    if (value === undefined || value === null) continue;
    const key = mapping[camel] || camel;
    out[key] = value as WithValue;
  }
  return Object.keys(out).length ? out : undefined;
}

// Checkout action
export interface CheckoutOptions {
  ref?: string; // maps directly
  fetchDepth?: number; // fetch-depth
  repository?: string;
  path?: string;
  token?: string;
  sshKey?: string; // ssh-key
  persistCredentials?: boolean; // persist-credentials
  clean?: boolean;
  filter?: string; // filter
  sparseCheckout?: string; // sparse-checkout
  sparseCheckoutConeMode?: boolean; // sparse-checkout-cone-mode
  lfs?: boolean; // lfs
  submodules?: boolean | 'recursive'; // submodules
}
const checkoutMap: CamelToKebabMap = {
  fetchDepth: 'fetch-depth',
  sshKey: 'ssh-key',
  persistCredentials: 'persist-credentials',
  sparseCheckout: 'sparse-checkout',
  sparseCheckoutConeMode: 'sparse-checkout-cone-mode',
};
export function checkout(options: CheckoutOptions = {}): UsesStep {
  return uses('actions/checkout@v4', buildWith(options, checkoutMap));
}

// AddToProject action (note vendor typo hava-version)
export interface AddToProjectOptions {
  javaVersion?: string; // hava-version (typo maintained for parity)
  projectUrl?: string; // project-url
  githubToken?: string; // github-token
  labeled?: string | boolean; // labeled
  labelOperator?: string; // label-operator
}
const addToProjectMap: CamelToKebabMap = {
  javaVersion: 'hava-version',
  projectUrl: 'project-url',
  githubToken: 'github-token',
  labelOperator: 'label-operator',
};
export function addToProject(options: AddToProjectOptions = {}): UsesStep {
  return uses('actions/add-to-project@v1', buildWith(options, addToProjectMap));
}

// GitHub Script action
export interface GitHubScriptOptions {
  script?: string; // script
  githubToken?: string; // github-token
  debug?: boolean; // debug
  userAgent?: string; // user-agent
  previews?: string; // previews
  resultEncoding?: string; // result-encoding
  retries?: number; // retries
  retryExemptStatusCodes?: string; // retry-exempt-status-codes
  baseUrl?: string; // base-url
}
const githubScriptMap: CamelToKebabMap = {
  githubToken: 'github-token',
  userAgent: 'user-agent',
  resultEncoding: 'result-encoding',
  retryExemptStatusCodes: 'retry-exempt-status-codes',
  baseUrl: 'base-url',
};
export function githubScript(options: GitHubScriptOptions = {}): UsesStep {
  return uses('actions/github-script@v7', buildWith(options, githubScriptMap));
}

// Labeler action
export interface LabelerOptions {
  repoToken?: string; // repo-token
  configurationPath?: string; // configuration-path
  syncLabels?: boolean; // sync-labels
  dot?: string | boolean; // dot
  prNumber?: number | string; // pr-number
}
const labelerMap: CamelToKebabMap = {
  repoToken: 'repo-token',
  configurationPath: 'configuration-path',
  syncLabels: 'sync-labels',
  prNumber: 'pr-number',
};
export function labeler(options: LabelerOptions = {}): UsesStep {
  return uses('actions/labeler@v5', buildWith(options, labelerMap));
}

// Delete Package Version action
export interface DeletePackageVersionOptions {
  packageVersionIds?: string; // package-version-ids
  owner?: string; // owner
  packageName?: string; // package-name
  packageType?: string; // package-type
  numOldVersionsToDelete?: number | string; // num-old-versions-to-delete
  minVersionsToKeep?: number | string; // min-versions-to-keep
  ignoreVersions?: string; // ignore-versions
  deleteOnlyPreReleaseVersions?: boolean | string; // delete-only-pre-release-versions
  deleteOnlyUntaggedVersions?: boolean | string; // delete-only-untagged-versions
  token?: string; // token
}
const deletePackageVersionMap: CamelToKebabMap = {
  packageVersionIds: 'package-version-ids',
  packageName: 'package-name',
  packageType: 'package-type',
  numOldVersionsToDelete: 'num-old-versions-to-delete',
  minVersionsToKeep: 'min-versions-to-keep',
  ignoreVersions: 'ignore-versions',
  deleteOnlyPreReleaseVersions: 'delete-only-pre-release-versions',
  deleteOnlyUntaggedVersions: 'delete-only-untagged-versions',
};
export function deletePackageVersion(options: DeletePackageVersionOptions = {}): UsesStep {
  return uses('actions/delete-package-versions@v5', buildWith(options, deletePackageVersionMap));
}

// Go Dependency Submission action
export interface GoDependencySubmissionOptions {
  token?: string; // token
  metadata?: string; // metadata
  goModPath?: string; // go-mod-path
  goBuildTarget?: string; // go-build-target
  snapshotSha?: string; // snapshot-sha
  snapshotRef?: string; // snapshot-ref
  detectorName?: string; // detector-name
  detectorVersion?: string; // detector-version
  detectorUrl?: string; // detector-url
}
const goDepSubMap: CamelToKebabMap = {
  goModPath: 'go-mod-path',
  goBuildTarget: 'go-build-target',
  snapshotSha: 'snapshot-sha',
  snapshotRef: 'snapshot-ref',
  detectorName: 'detector-name',
  detectorVersion: 'detector-version',
  detectorUrl: 'detector-url',
};
export function goDependencySubmission(options: GoDependencySubmissionOptions = {}): UsesStep {
  return uses('actions/go-dependency-submission@v2', buildWith(options, goDepSubMap));
}

// Attest SBOM action
export interface AttestSbomOptions { sbomPath?: string }
const attestSbomMap: CamelToKebabMap = { sbomPath: 'sbom-path' };
export function attestSbom(options: AttestSbomOptions = {}): UsesStep {
  return uses('attest-sbom@v2', buildWith(options, attestSbomMap));
}

// AI Inference action
export interface AiInferenceOptions {
  prompt?: string; // prompt
  promptFile?: string; // prompt-file
  model?: string; // model
  endpoint?: string; // endpoint
  systemPrompt?: string; // system-prompt
  systemPromptFile?: string; // system-prompt-file
  maxTokens?: number | string; // max-tokens
  token?: string; // token
}
const aiInferenceMap: CamelToKebabMap = {
  promptFile: 'prompt-file',
  systemPrompt: 'system-prompt',
  systemPromptFile: 'system-prompt-file',
  maxTokens: 'max-tokens',
};
export function aiInference(options: AiInferenceOptions = {}): UsesStep {
  return uses('actions/ai-inference@v1', buildWith(options, aiInferenceMap));
}

// Create GitHub App Token action (large permission surface)
export interface CreateGitHubAppTokenOptions {
  appId?: string; // app-id
  privateKey?: string; // private-key
  owner?: string; // owner
  repositories?: string; // repositories
  skipTokenRevoke?: boolean | string; // skip-token-revoke
  githubApiUrl?: string; // github-api-url
  // Permissions (allow string values as raw)
  permissionActions?: string; // permission-actions
  permissionAdministration?: string; // permission-administration
  permissionChecks?: string; // permission-checks
  permissionCodespaces?: string; // permission-codespaces
  permissionContents?: string; // permission-contents
  permissionDependabotSecrets?: string; // permission-dependabot-secrets
  permissionDeployments?: string; // permission-deployments
  permissionEmailAddresses?: string; // permission-email-addresses
  permissionEnvironments?: string; // permission-environments
  permissionFollowers?: string; // permission-followers
  permissionGitSshKeys?: string; // permission-git-ssh-keys
  permissionGpgKeys?: string; // permission-gpg-keys
  permissionInteractionLimits?: string; // permission-interaction-limits
  permissionIssues?: string; // permission-issues
  permissionMembers?: string; // permission-members
  permissionMetadata?: string; // permission-metadata
  permissionOrganizationAdministration?: string; // permission-organization-administration
  permissionOrganizationAnnouncementBanners?: string; // permission-organization-announcement-banners
  permissionOrganizationCopilotSeatManagement?: string; // permission-organization-copilot-seat-management
  permissionOrganizationCustomOrgRoles?: string; // permission-organization-custom-org-roles
  permissionOrganizationCustomProperties?: string; // permission-organization-custom-properties
  permissionOrganizationCustomRoles?: string; // permission-organization-custom-roles
  permissionOrganizationEvents?: string; // permission-organization-events
  permissionOrganizationHooks?: string; // permission-organization-hooks
  permissionOrganizationPackages?: string; // permission-organization-packages
  permissionOrganizationPersonalAccessTokenRequests?: string; // permission-organization-personal-access-token-requests
  permissionOrganizationPersonalAccessTokens?: string; // permission-organization-personal-access-tokens
  permissionOrganizationPlan?: string; // permission-organization-plan
  permissionOrganizationProjects?: string; // permission-organization-projects
  permissionOrganizationSecrets?: string; // permission-organization-secrets
  permissionOrganizationSelfHostedRunners?: string; // permission-organization-self-hosted-runners
  permissionOrganizationUserBlocking?: string; // permission-organization-user-blocking
  permissionPackages?: string; // permission-packages
  permissionPages?: string; // permission-pages
  permissionProfile?: string; // permission-profile
  permissionPullRequests?: string; // permission-pull-requests
  permissionRepositoryCustomProperties?: string; // permission-repository-custom-properties
  permissionRepositoryHooks?: string; // permission-repository-hooks
  permissionRepositoryProjects?: string; // permission-repository-projects
  permissionSecretScanningAlerts?: string; // permission-secret-scanning-alerts
  permissionSecrets?: string; // permission-secrets
  permissionSecurityEvents?: string; // permission-security-events
  permissionSingleFile?: string; // permission-single-file
  permissionStarring?: string; // permission-starring
  permissionStatuses?: string; // permission-statuses
  permissionTeamDiscussions?: string; // permission-team-discussions
  permissionVulnerabilityAlerts?: string; // permission-vulnerability-alerts
  permissionWorkflows?: string; // permission-workflows
}
const createGitHubAppTokenMap: CamelToKebabMap = {
  appId: 'app-id',
  privateKey: 'private-key',
  owner: 'owner',
  repositories: 'repositories',
  skipTokenRevoke: 'skip-token-revoke',
  githubApiUrl: 'github-api-url',
  permissionActions: 'permission-actions',
  permissionAdministration: 'permission-administration',
  permissionChecks: 'permission-checks',
  permissionCodespaces: 'permission-codespaces',
  permissionContents: 'permission-contents',
  permissionDependabotSecrets: 'permission-dependabot-secrets',
  permissionDeployments: 'permission-deployments',
  permissionEmailAddresses: 'permission-email-addresses',
  permissionEnvironments: 'permission-environments',
  permissionFollowers: 'permission-followers',
  permissionGitSshKeys: 'permission-git-ssh-keys',
  permissionGpgKeys: 'permission-gpg-keys',
  permissionInteractionLimits: 'permission-interaction-limits',
  permissionIssues: 'permission-issues',
  permissionMembers: 'permission-members',
  permissionMetadata: 'permission-metadata',
  permissionOrganizationAdministration: 'permission-organization-administration',
  permissionOrganizationAnnouncementBanners: 'permission-organization-announcement-banners',
  permissionOrganizationCopilotSeatManagement: 'permission-organization-copilot-seat-management',
  permissionOrganizationCustomOrgRoles: 'permission-organization-custom-org-roles',
  permissionOrganizationCustomProperties: 'permission-organization-custom-properties',
  permissionOrganizationCustomRoles: 'permission-organization-custom-roles',
  permissionOrganizationEvents: 'permission-organization-events',
  permissionOrganizationHooks: 'permission-organization-hooks',
  permissionOrganizationPackages: 'permission-organization-packages',
  permissionOrganizationPersonalAccessTokenRequests: 'permission-organization-personal-access-token-requests',
  permissionOrganizationPersonalAccessTokens: 'permission-organization-personal-access-tokens',
  permissionOrganizationPlan: 'permission-organization-plan',
  permissionOrganizationProjects: 'permission-organization-projects',
  permissionOrganizationSecrets: 'permission-organization-secrets',
  permissionOrganizationSelfHostedRunners: 'permission-organization-self-hosted-runners',
  permissionOrganizationUserBlocking: 'permission-organization-user-blocking',
  permissionPackages: 'permission-packages',
  permissionPages: 'permission-pages',
  permissionProfile: 'permission-profile',
  permissionPullRequests: 'permission-pull-requests',
  permissionRepositoryCustomProperties: 'permission-repository-custom-properties',
  permissionRepositoryHooks: 'permission-repository-hooks',
  permissionRepositoryProjects: 'permission-repository-projects',
  permissionSecretScanningAlerts: 'permission-secret-scanning-alerts',
  permissionSecrets: 'permission-secrets',
  permissionSecurityEvents: 'permission-security-events',
  permissionSingleFile: 'permission-single-file',
  permissionStarring: 'permission-starring',
  permissionStatuses: 'permission-statuses',
  permissionTeamDiscussions: 'permission-team-discussions',
  permissionVulnerabilityAlerts: 'permission-vulnerability-alerts',
  permissionWorkflows: 'permission-workflows',
};
export function createGitHubAppToken(options: CreateGitHubAppTokenOptions = {}): UsesStep {
  return uses('actions/create-github-app-token@v2', buildWith(options, createGitHubAppTokenMap));
}

// Dependency Review Action
export interface DependencyReviewActionOptions {
  repoToken?: string; // repo-token
  failOnSeverity?: string; // fail-on-severity
  failOnScopes?: string; // fail-on-scopes
  baseRef?: string; // base-ref
  headRef?: string; // head-ref
  configFile?: string; // config-file
  allowLicenses?: string; // allow-licenses
  denyLicenses?: string; // deny-licenses
  allowDependenciesLicenses?: string; // allow-dependencies-licenses
  allowGhsas?: string; // allow-ghsas
  externalRepoToken?: string; // external-repo-token
  licenseCheck?: string | boolean; // license-check
  vulnerabilityCheck?: string | boolean; // vulnerability-check
  commentSummaryInPr?: string | boolean; // comment-summary-in-pr
  denyPackages?: string; // deny-packages
  denyGroups?: string; // deny-groups
  retryOnSnapshotWarnings?: string | boolean; // retry-on-snapshot-warnings
  retryOnSnapshotWarningsTimeout?: string | number; // retry-on-snapshot-warnings-timeout
  warnOnly?: string | boolean; // warn-only
  showOpenssfScorecard?: string | boolean; // show-openssf-scorecard
  warnOnOpenssfScorecardLevel?: string | number; // warn-on-openssf-scorecard-level
}
const dependencyReviewMap: CamelToKebabMap = {
  repoToken: 'repo-token',
  failOnSeverity: 'fail-on-severity',
  failOnScopes: 'fail-on-scopes',
  baseRef: 'base-ref',
  headRef: 'head-ref',
  configFile: 'config-file',
  allowLicenses: 'allow-licenses',
  denyLicenses: 'deny-licenses',
  allowDependenciesLicenses: 'allow-dependencies-licenses',
  allowGhsas: 'allow-ghsas',
  externalRepoToken: 'external-repo-token',
  licenseCheck: 'license-check',
  vulnerabilityCheck: 'vulnerability-check',
  commentSummaryInPr: 'comment-summary-in-pr',
  denyPackages: 'deny-packages',
  denyGroups: 'deny-groups',
  retryOnSnapshotWarnings: 'retry-on-snapshot-warnings',
  retryOnSnapshotWarningsTimeout: 'retry-on-snapshot-warnings-timeout',
  warnOnly: 'warn-only',
  showOpenssfScorecard: 'show-openssf-scorecard',
  warnOnOpenssfScorecardLevel: 'warn-on-openssf-scorecard-level',
};
export function dependencyReviewAction(options: DependencyReviewActionOptions = {}): UsesStep {
  return uses('actions/dependency-review-action@v4', buildWith(options, dependencyReviewMap));
}

// Stale action (subset mapping)
export interface StaleOptions {
  repoToken?: string; // repo-token
  staleIssueMessage?: string; // stale-issue-message
  stalePrMessage?: string; // stale-pr-message
  closeIssueMessage?: string; // close-issue-message
  closePrMessage?: string; // close-pr-message
  daysBeforeStale?: number | string; // days-before-stale
  daysBeforeIssueStale?: number | string; // days-before-issue-stale
  daysBeforePrStale?: number | string; // days-before-pr-stale
  daysBeforeClose?: number | string; // days-before-close
  daysBeforeIssueClose?: number | string; // days-before-issue-close
  daysBeforePrClose?: number | string; // days-before-pr-close
  staleIssueLabel?: string; // stale-issue-label
  closeIssueLabel?: string; // close-issue-label
  exemptIssueLabels?: string; // exempt-issue-labels
  closeIssueReason?: string; // close-issue-reason
  stalePrLabel?: string; // stale-pr-label
  closePrLabel?: string; // close-pr-label
  exemptPrLabels?: string; // exempt-pr-labels
  operationsPerRun?: number | string; // operations-per-run
  removeStaleWhenUpdated?: boolean | string; // remove-stale-when-updated
  debugOnly?: boolean | string; // debug-only
  ascending?: boolean | string; // ascending
  deleteBranch?: boolean | string; // delete-branch
  startDate?: string; // start-date
}
const staleMap: CamelToKebabMap = {
  repoToken: 'repo-token',
  staleIssueMessage: 'stale-issue-message',
  stalePrMessage: 'stale-pr-message',
  closeIssueMessage: 'close-issue-message',
  closePrMessage: 'close-pr-message',
  daysBeforeStale: 'days-before-stale',
  daysBeforeIssueStale: 'days-before-issue-stale',
  daysBeforePrStale: 'days-before-pr-stale',
  daysBeforeClose: 'days-before-close',
  daysBeforeIssueClose: 'days-before-issue-close',
  daysBeforePrClose: 'days-before-pr-close',
  staleIssueLabel: 'stale-issue-label',
  closeIssueLabel: 'close-issue-label',
  exemptIssueLabels: 'exempt-issue-labels',
  closeIssueReason: 'close-issue-reason',
  stalePrLabel: 'stale-pr-label',
  closePrLabel: 'close-pr-label',
  exemptPrLabels: 'exempt-pr-labels',
  operationsPerRun: 'operations-per-run',
  removeStaleWhenUpdated: 'remove-stale-when-updated',
  debugOnly: 'debug-only',
  ascending: 'ascending',
  deleteBranch: 'delete-branch',
  startDate: 'start-date',
};
export function stale(options: StaleOptions = {}): UsesStep {
  return uses('actions/stale@v9', buildWith(options, staleMap));
}

