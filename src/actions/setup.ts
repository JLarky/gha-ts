import { uses, UsesStep } from "../workflow-types";
import { buildWith } from "./common";

export interface SetupNodeOptions {
  "node-version"?: string;
  cache?: "npm" | "pnpm" | "yarn";
  "cache-dependency-path"?: string;
  "registry-url"?: string;
  scope?: string;
  "always-auth"?: boolean | string;
  "node-version-file"?: string;
  architecture?: string;
  "check-latest"?: boolean | string;
  token?: string;
  mirror?: string;
  "mirror-token"?: string;
}
export function setupNode(options: SetupNodeOptions = {}): UsesStep {
  return uses("actions/setup-node@v4", buildWith(options));
}

export interface SetupJavaOptions {
  distribution?: "temurin" | "zulu" | string;
  "java-version"?: string;
  cache?: "maven" | "gradle" | "sbt";
  "java-version-file"?: string;
  "java-package"?: string;
  architecture?: string;
  jdkFile?: string;
  "check-latest"?: boolean | string;
  "server-id"?: string;
  "server-username"?: string;
  "server-password"?: string;
  "settings-path"?: string;
  "overwrite-settings"?: boolean | string;
  "gpg-private-key"?: string;
  "gpg-passphrase"?: string;
  "job-status"?: string;
  token?: string;
  "mvn-toolchain-id"?: string;
  "mvn-toolchain-vendor"?: string;
}
export function setupJava(opts: SetupJavaOptions): UsesStep {
  return uses("actions/setup-java@v4", buildWith(opts));
}

export interface SetupPythonOptions {
  "python-version"?: string;
  cache?: "pip";
  "python-version-file"?: string;
  architecture?: string;
  "check-latest"?: boolean | string;
  token?: string;
  "cache-dependency-path"?: string;
  "update-environment"?: boolean | string;
  "allow-prereleases"?: boolean | string;
  freethreaded?: boolean | string;
}
export function setupPython(opts: SetupPythonOptions): UsesStep {
  return uses("actions/setup-python@v5", buildWith(opts));
}

export interface SetupGoOptions {
  "go-version"?: string;
  "go-version-file"?: string;
  "check-latest"?: boolean | string;
  token?: string;
  cache?: boolean | string;
  "cache-dependency-path"?: string;
  architecture?: string;
}
export function setupGo(opts: SetupGoOptions = {}): UsesStep {
  return uses("actions/setup-go@v5", buildWith(opts));
}

export interface SetupDotnetOptions {
  "dotnet-version"?: string;
  "dotnet-quality"?: string;
  "global-json-file"?: string;
  "source-url"?: string;
  owner?: string;
  "config-file"?: string;
  cache?: boolean | string;
  "cache-dependency-path"?: string;
}
export function setupDotnet(opts: SetupDotnetOptions = {}): UsesStep {
  return uses("actions/setup-dotnet@v4", buildWith(opts));
}

export interface SetupBunOptions {
  "bun-version"?: string;
  "bun-version-file"?: string;
  "bun-download-url"?: string;
  "registry-url"?: string;
  scope?: string;
}
export function setupBun(opts: SetupBunOptions = {}): UsesStep {
  return uses("oven-sh/setup-bun@v2", buildWith(opts));
}
