import { UsesStep } from "../workflow-types";
import { uses } from "../workflow-types";

export type WithValue = string | number | boolean;

export function buildWith<T extends Record<string, any>>(
  opts: T | undefined,
): Record<string, WithValue> | undefined {
  if (!opts) return undefined;
  const out: Record<string, WithValue> = {};
  for (const [key, value] of Object.entries(opts)) {
    if (value === undefined || value === null) continue;
    out[key] = value as WithValue;
  }
  return Object.keys(out).length ? out : undefined;
}

// Checkout action
export interface CheckoutOptions {
  ref?: string; // maps directly
  "fetch-depth"?: number;
  repository?: string;
  path?: string;
  token?: string;
  "ssh-key"?: string;
  "persist-credentials"?: boolean;
  clean?: boolean;
  filter?: string;
  "sparse-checkout"?: string;
  "sparse-checkout-cone-mode"?: boolean;
  lfs?: boolean;
  submodules?: boolean | "recursive";
}
export function checkout(options: CheckoutOptions = {}): UsesStep {
  return uses("actions/checkout@v4", buildWith(options));
}

// AddToProject action
export interface AddToProjectOptions {
  "java-version"?: string;
  "project-url"?: string;
  "github-token"?: string;
  labeled?: string | boolean;
  "label-operator"?: string;
}
export function addToProject(options: AddToProjectOptions = {}): UsesStep {
  return uses("actions/add-to-project@v1", buildWith(options));
}

// GitHub Script action
export interface GitHubScriptOptions {
  script?: string;
  "github-token"?: string;
  debug?: boolean;
  "user-agent"?: string;
  previews?: string;
  "result-encoding"?: string;
  retries?: number;
  "retry-exempt-status-codes"?: string;
  "base-url"?: string;
}
export function githubScript(options: GitHubScriptOptions = {}): UsesStep {
  return uses("actions/github-script@v7", buildWith(options));
}

// Labeler action
export interface LabelerOptions {
  "repo-token"?: string;
  "configuration-path"?: string;
  "sync-labels"?: boolean;
  dot?: string | boolean;
  "pr-number"?: number | string;
}
export function labeler(options: LabelerOptions = {}): UsesStep {
  return uses("actions/labeler@v5", buildWith(options));
}

// Delete Package Version action
export interface DeletePackageVersionOptions {
  "package-version-ids"?: string;
  owner?: string;
  "package-name"?: string;
  "package-type"?: string;
  "num-old-versions-to-delete"?: number | string;
  "min-versions-to-keep"?: number | string;
  "ignore-versions"?: string;
  "delete-only-pre-release-versions"?: boolean | string;
  "delete-only-untagged-versions"?: boolean | string;
  token?: string;
}
export function deletePackageVersion(
  options: DeletePackageVersionOptions = {},
): UsesStep {
  return uses("actions/delete-package-versions@v5", buildWith(options));
}

// Go Dependency Submission action
export interface GoDependencySubmissionOptions {
  token?: string;
  metadata?: string;
  "go-mod-path"?: string;
  "go-build-target"?: string;
  "snapshot-sha"?: string;
  "snapshot-ref"?: string;
  "detector-name"?: string;
  "detector-version"?: string;
  "detector-url"?: string;
}
export function goDependencySubmission(
  options: GoDependencySubmissionOptions = {},
): UsesStep {
  return uses("actions/go-dependency-submission@v2", buildWith(options));
}

// Attest SBOM action
export interface AttestSbomOptions {
  "sbom-path"?: string;
}
export function attestSbom(options: AttestSbomOptions = {}): UsesStep {
  return uses("attest-sbom@v2", buildWith(options));
}

// AI Inference action
export interface AiInferenceOptions {
  prompt?: string;
  "prompt-file"?: string;
  model?: string;
  endpoint?: string;
  "system-prompt"?: string;
  "system-prompt-file"?: string;
  "max-tokens"?: number | string;
  token?: string;
}
export function aiInference(options: AiInferenceOptions = {}): UsesStep {
  return uses("actions/ai-inference@v1", buildWith(options));
}

// Create GitHub App Token action (large permission surface)
export interface CreateGitHubAppTokenOptions {
  "app-id"?: string;
  "private-key"?: string;
  owner?: string;
  repositories?: string;
  "skip-token-revoke"?: boolean | string;
  "github-api-url"?: string;
  // Permissions (allow string values as raw)
  "permission-actions"?: string;
  "permission-administration"?: string;
  "permission-checks"?: string;
  "permission-codespaces"?: string;
  "permission-contents"?: string;
  "permission-dependabot-secrets"?: string;
  "permission-deployments"?: string;
  "permission-email-addresses"?: string;
  "permission-environments"?: string;
  "permission-followers"?: string;
  "permission-git-ssh-keys"?: string;
  "permission-gpg-keys"?: string;
  "permission-interaction-limits"?: string;
  "permission-issues"?: string;
  "permission-members"?: string;
  "permission-metadata"?: string;
  "permission-organization-administration"?: string;
  "permission-organization-announcement-banners"?: string;
  "permission-organization-copilot-seat-management"?: string;
  "permission-organization-custom-org-roles"?: string;
  "permission-organization-custom-properties"?: string;
  "permission-organization-custom-roles"?: string;
  "permission-organization-events"?: string;
  "permission-organization-hooks"?: string;
  "permission-organization-packages"?: string;
  "permission-organization-personal-access-token-requests"?: string;
  "permission-organization-personal-access-tokens"?: string;
  "permission-organization-plan"?: string;
  "permission-organization-projects"?: string;
  "permission-organization-secrets"?: string;
  "permission-organization-self-hosted-runners"?: string;
  "permission-organization-user-blocking"?: string;
  "permission-packages"?: string;
  "permission-pages"?: string;
  "permission-profile"?: string;
  "permission-pull-requests"?: string;
  "permission-repository-custom-properties"?: string;
  "permission-repository-hooks"?: string;
  "permission-repository-projects"?: string;
  "permission-secret-scanning-alerts"?: string;
  "permission-secrets"?: string;
  "permission-security-events"?: string;
  "permission-single-file"?: string;
  "permission-starring"?: string;
  "permission-statuses"?: string;
  "permission-team-discussions"?: string;
  "permission-vulnerability-alerts"?: string;
  "permission-workflows"?: string;
}
export function createGitHubAppToken(
  options: CreateGitHubAppTokenOptions = {},
): UsesStep {
  return uses("actions/create-github-app-token@v2", buildWith(options));
}

// Dependency Review Action
export interface DependencyReviewActionOptions {
  "repo-token"?: string;
  "fail-on-severity"?: string;
  "fail-on-scopes"?: string;
  "base-ref"?: string;
  "head-ref"?: string;
  "config-file"?: string;
  "allow-licenses"?: string;
  "deny-licenses"?: string;
  "allow-dependencies-licenses"?: string;
  "allow-ghsas"?: string;
  "external-repo-token"?: string;
  "license-check"?: string | boolean;
  "vulnerability-check"?: string | boolean;
  "comment-summary-in-pr"?: string | boolean;
  "deny-packages"?: string;
  "deny-groups"?: string;
  "retry-on-snapshot-warnings"?: string | boolean;
  "retry-on-snapshot-warnings-timeout"?: string | number;
  "warn-only"?: string | boolean;
  "show-openssf-scorecard"?: string | boolean;
  "warn-on-openssf-scorecard-level"?: string | number;
}
export function dependencyReviewAction(
  options: DependencyReviewActionOptions = {},
): UsesStep {
  return uses("actions/dependency-review-action@v4", buildWith(options));
}

// Stale action (subset mapping)
export interface StaleOptions {
  "repo-token"?: string;
  "stale-issue-message"?: string;
  "stale-pr-message"?: string;
  "close-issue-message"?: string;
  "close-pr-message"?: string;
  "days-before-stale"?: number | string;
  "days-before-issue-stale"?: number | string;
  "days-before-pr-stale"?: number | string;
  "days-before-close"?: number | string;
  "days-before-issue-close"?: number | string;
  "days-before-pr-close"?: number | string;
  "stale-issue-label"?: string;
  "close-issue-label"?: string;
  "exempt-issue-labels"?: string;
  "close-issue-reason"?: string;
  "stale-pr-label"?: string;
  "close-pr-label"?: string;
  "exempt-pr-labels"?: string;
  "operations-per-run"?: number | string;
  "remove-stale-when-updated"?: boolean | string;
  "debug-only"?: boolean | string;
  ascending?: boolean | string;
  "delete-branch"?: boolean | string;
  "start-date"?: string;
}
export function stale(options: StaleOptions = {}): UsesStep {
  return uses("actions/stale@v9", buildWith(options));
}
