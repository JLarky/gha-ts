import { UsesStep, uses } from "../workflow-types";
import { buildWith } from "./common";

export interface UploadArtifactOptions {
  name?: string;
  path: string | string[];
  "retention-days"?: number;
  "if-no-files-found"?: "warn" | "error" | "ignore";
  "compression-level"?: number | string;
  overwrite?: boolean | string;
  "include-hidden-files"?: boolean | string;
}
export function uploadArtifact(options: UploadArtifactOptions): UsesStep {
  return uses("actions/upload-artifact@v4", buildWith(options));
}

export interface UploadArtifactMergeOptions {
  name?: string;
  pattern?: string;
  "separate-directories"?: boolean | string;
  "retention-days"?: number;
  "compression-level"?: number | string;
  "delete-merged"?: boolean | string;
  "include-hidden-files"?: boolean | string;
}
export function uploadArtifactMerge(
  options: UploadArtifactMergeOptions = {},
): UsesStep {
  return uses("actions/upload-artifact/merge@v4", buildWith(options));
}

export interface DownloadArtifactOptions {
  name?: string;
  "artifact-ids"?: string;
  path?: string;
  pattern?: string;
  "github-token"?: string;
  repository?: string;
  "run-id"?: string;
  "merge-multiple"?: boolean;
}
export function downloadArtifact(
  options: DownloadArtifactOptions = {},
): UsesStep {
  return uses("actions/download-artifact@v4", buildWith(options));
}
