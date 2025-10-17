import { uses, UsesStep } from "../workflow-types";
import { buildWith, CamelToKebabMap } from "./common";

export interface ConfigurePagesOptions {
  staticSiteGenerator?: string; // static_site_generator
  generatorConfigFile?: string; // generator_config_file
  token?: string; // token
  enablement?: string; // enablement
}
const configurePagesMap: CamelToKebabMap = {
  staticSiteGenerator: "static_site_generator",
  generatorConfigFile: "generator_config_file",
};
export function configurePages(opts: ConfigurePagesOptions = {}): UsesStep {
  return uses("actions/configure-pages@v5", buildWith(opts, configurePagesMap));
}

export interface UploadPagesArtifactOptions {
  path: string;
  name?: string;
}
export function uploadPagesArtifact(
  opts: UploadPagesArtifactOptions,
): UsesStep {
  return uses("actions/upload-pages-artifact@v3", buildWith(opts, {}));
}

export interface DeployPagesOptions {
  token?: string; // token
  timeout?: string | number; // timeout
  errorCount?: string | number; // error_count
  reportingInterval?: string | number; // reporting_interval
  artifactName?: string; // artifact_name
  preview?: boolean | string; // preview
}
const deployPagesMap: CamelToKebabMap = {
  errorCount: "error_count",
  reportingInterval: "reporting_interval",
  artifactName: "artifact_name",
};
export function deployPages(opts: DeployPagesOptions = {}): UsesStep {
  return uses("actions/deploy-pages@v4", buildWith(opts, deployPagesMap));
}

export interface JekyllBuildPagesOptions {
  source?: string; // source
  destination?: string; // destination
  future?: boolean | string; // future
  buildRevision?: string; // build_revision
  verbose?: boolean | string; // verbose
  token?: string; // token
}
const jekyllMap: CamelToKebabMap = { buildRevision: "build_revision" };
export function jekyllBuildPages(opts: JekyllBuildPagesOptions = {}): UsesStep {
  return uses("actions/jekyll-build-pages@v1", buildWith(opts, jekyllMap));
}
