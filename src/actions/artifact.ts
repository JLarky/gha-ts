import { UsesStep, uses } from "../workflow-types";
import { buildWith, CamelToKebabMap } from "./common";

export interface UploadArtifactOptions {
  name?: string;
  path: string | string[];
  retentionDays?: number; // retention-days
  ifNoFilesFound?: "warn" | "error" | "ignore"; // if-no-files-found
  compressionLevel?: number | string; // compression-level
  overwrite?: boolean | string; // overwrite
  includeHiddenFiles?: boolean | string; // include-hidden-files
}
const uploadMap: CamelToKebabMap = {
  retentionDays: "retention-days",
  ifNoFilesFound: "if-no-files-found",
  compressionLevel: "compression-level",
};
export function uploadArtifact(options: UploadArtifactOptions): UsesStep {
  return uses("actions/upload-artifact@v4", buildWith(options, uploadMap));
}

export interface UploadArtifactMergeOptions {
  name?: string; // name
  pattern?: string; // pattern
  separateDirectories?: boolean | string; // separate-directories
  retentionDays?: number; // retention-days
  compressionLevel?: number | string; // compression-level
  deleteMerged?: boolean | string; // delete-merged
  includeHiddenFiles?: boolean | string; // include-hidden-files
}
const uploadMergeMap: CamelToKebabMap = {
  separateDirectories: "separate-directories",
  retentionDays: "retention-days",
  compressionLevel: "compression-level",
  deleteMerged: "delete-merged",
  includeHiddenFiles: "include-hidden-files",
};
export function uploadArtifactMerge(
  options: UploadArtifactMergeOptions = {}
): UsesStep {
  return uses(
    "actions/upload-artifact/merge@v4",
    buildWith(options, uploadMergeMap)
  );
}

export interface DownloadArtifactOptions {
  name?: string;
  artifactIds?: string;
  path?: string;
  pattern?: string;
  githubToken?: string;
  repository?: string;
  runId?: string;
  mergeMultiple?: boolean; // merge-multiple
}
const downloadMap: CamelToKebabMap = {
  mergeMultiple: "merge-multiple",
  artifactIds: "artifact-ids",
  githubToken: "github-token",
  runId: "run-id",
};
export function downloadArtifact(
  options: DownloadArtifactOptions = {}
): UsesStep {
  return uses("actions/download-artifact@v4", buildWith(options, downloadMap));
}
