import { uses, UsesStep } from "../workflow-types";
import { buildWith, CamelToKebabMap } from "./common";

export interface SetupNodeOptions {
  nodeVersion?: string; // node-version
  cache?: "npm" | "pnpm" | "yarn";
  cacheDependencyPath?: string; // cache-dependency-path
  registryUrl?: string; // registry-url
  scope?: string; // scope
  alwaysAuth?: boolean | string; // always-auth
  nodeVersionFile?: string; // node-version-file
  architecture?: string; // architecture
  checkLatest?: boolean | string; // check-latest
  token?: string; // token
  mirror?: string; // mirror
  mirrorToken?: string; // mirror-token
}
const setupNodeMap: CamelToKebabMap = {
  nodeVersion: "node-version",
  nodeVersionFile: "node-version-file",
  cacheDependencyPath: "cache-dependency-path",
  registryUrl: "registry-url",
  alwaysAuth: "always-auth",
  checkLatest: "check-latest",
  mirrorToken: "mirror-token",
};
export function setupNode(options: SetupNodeOptions = {}): UsesStep {
  return uses("actions/setup-node@v4", buildWith(options, setupNodeMap));
}

export interface SetupJavaOptions {
  distribution?: "temurin" | "zulu" | string;
  javaVersion?: string; // java-version
  cache?: "maven" | "gradle" | "sbt";
  javaVersionFile?: string; // java-version-file
  javaPackage?: string; // java-package
  architecture?: string; // architecture
  jdkFile?: string; // jdkFile (as-is per Pkl)
  checkLatest?: boolean | string; // check-latest
  serverId?: string; // server-id
  serverUsername?: string; // server-username
  serverPassword?: string; // server-password
  settingsPath?: string; // settings-path
  overwriteSettings?: boolean | string; // overwrite-settings
  gpgPrivateKey?: string; // gpg-private-key
  gpgPassphrase?: string; // gpg-passphrase
  jobStatus?: string; // job-status
  token?: string; // token
  mvnToolchainId?: string; // mvn-toolchain-id
  mvnToolchainVendor?: string; // mvn-toolchain-vendor
}
const setupJavaMap: CamelToKebabMap = {
  javaVersion: "java-version",
  javaVersionFile: "java-version-file",
  javaPackage: "java-package",
  checkLatest: "check-latest",
  serverId: "server-id",
  serverUsername: "server-username",
  serverPassword: "server-password",
  settingsPath: "settings-path",
  overwriteSettings: "overwrite-settings",
  gpgPrivateKey: "gpg-private-key",
  gpgPassphrase: "gpg-passphrase",
  cacheDependencyPath: "cache-dependency-path",
  jobStatus: "job-status",
  mvnToolchainId: "mvn-toolchain-id",
  mvnToolchainVendor: "mvn-toolchain-vendor",
};
export function setupJava(opts: SetupJavaOptions): UsesStep {
  return uses("actions/setup-java@v4", buildWith(opts, setupJavaMap));
}

export interface SetupPythonOptions {
  pythonVersion?: string;
  cache?: "pip";
  pythonVersionFile?: string; // python-version-file
  architecture?: string; // architecture
  checkLatest?: boolean | string; // check-latest
  token?: string; // token
  cacheDependencyPath?: string; // cache-dependency-path
  updateEnvironment?: boolean | string; // update-environment
  allowPrereleases?: boolean | string; // allow-prereleases
  freethreaded?: boolean | string; // freethreaded
}
const setupPythonMap: CamelToKebabMap = {
  pythonVersion: "python-version",
  pythonVersionFile: "python-version-file",
  checkLatest: "check-latest",
  cacheDependencyPath: "cache-dependency-path",
  updateEnvironment: "update-environment",
  allowPrereleases: "allow-prereleases",
};
export function setupPython(opts: SetupPythonOptions): UsesStep {
  return uses("actions/setup-python@v5", buildWith(opts, setupPythonMap));
}

export interface SetupGoOptions {
  goVersion?: string; // go-version
  goVersionFile?: string; // go-version-file
  checkLatest?: boolean | string; // check-latest
  token?: string; // token
  cache?: boolean | string; // cache
  cacheDependencyPath?: string; // cache-dependency-path
  architecture?: string; // architecture
}
const setupGoMap: CamelToKebabMap = {
  goVersion: "go-version",
  goVersionFile: "go-version-file",
  checkLatest: "check-latest",
  cacheDependencyPath: "cache-dependency-path",
};
export function setupGo(opts: SetupGoOptions = {}): UsesStep {
  return uses("actions/setup-go@v5", buildWith(opts, setupGoMap));
}

export interface SetupDotnetOptions {
  dotnetVersion?: string; // dotnet-version
  dotnetQuality?: string; // dotnet-quality
  globalJsonFile?: string; // global-json-file
  sourceUrl?: string; // source-url
  owner?: string; // owner
  configFile?: string; // config-file
  cache?: boolean | string; // cache
  cacheDependencyPath?: string; // cache-dependency-path
}
const setupDotnetMap: CamelToKebabMap = {
  dotnetVersion: "dotnet-version",
  dotnetQuality: "dotnet-quality",
  globalJsonFile: "global-json-file",
  sourceUrl: "source-url",
  configFile: "config-file",
  cacheDependencyPath: "cache-dependency-path",
};
export function setupDotnet(opts: SetupDotnetOptions = {}): UsesStep {
  return uses("actions/setup-dotnet@v4", buildWith(opts, setupDotnetMap));
}
