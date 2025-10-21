import { uses, UsesStep } from "../workflow-types";
import { buildWith } from "./common";

export interface ConfigurePagesOptions {
  "static-site-generator"?: string;
  "generator-config-file"?: string;
  token?: string;
  enablement?: string;
}
export function configurePages(opts: ConfigurePagesOptions = {}): UsesStep {
  return uses("actions/configure-pages@v5", buildWith(opts));
}

export interface UploadPagesArtifactOptions {
  path: string;
  name?: string;
}
export function uploadPagesArtifact(
  opts: UploadPagesArtifactOptions,
): UsesStep {
  return uses("actions/upload-pages-artifact@v3", buildWith(opts));
}

export interface DeployPagesOptions {
  token?: string;
  timeout?: string | number;
  "error-count"?: string | number;
  "reporting-interval"?: string | number;
  "artifact-name"?: string;
  preview?: boolean | string;
}
export function deployPages(opts: DeployPagesOptions = {}): UsesStep {
  return uses("actions/deploy-pages@v4", buildWith(opts));
}

export interface JekyllBuildPagesOptions {
  source?: string;
  destination?: string;
  future?: boolean | string;
  "build-revision"?: string;
  verbose?: boolean | string;
  token?: string;
}
export function jekyllBuildPages(opts: JekyllBuildPagesOptions = {}): UsesStep {
  return uses("actions/jekyll-build-pages@v1", buildWith(opts));
}
