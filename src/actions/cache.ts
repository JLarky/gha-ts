import { UsesStep, uses } from "../workflow-types";
import { buildWith } from "./common";

export interface CacheOptions {
  path?: string;
  key?: string;
  "restore-keys"?: string;
  "upload-chunk-size"?: number | string;
  enableCrossOsArchive?: boolean | string; // enableCrossOsArchive (camel upstream)
  "fail-on-cache-miss"?: boolean | string;
  "lookup-only"?: boolean | string;
  "save-always"?: boolean | string;
}
export function cache(options: CacheOptions = {}): UsesStep {
  return uses("actions/cache@v4", buildWith(options));
}

export interface CacheRestoreOptions {
  path: string | string[];
  key: string;
  "restore-keys"?: string | string[];
  enableCrossOsArchive?: boolean; // enableCrossOsArchive (already camel-case upstream)
}
export function cacheRestore(options: CacheRestoreOptions): UsesStep {
  return uses("actions/cache/restore@v4", buildWith(options));
}

export interface CacheSaveOptions {
  path: string | string[];
  key: string;
  enableCrossOsArchive?: boolean;
}
export function cacheSave(options: CacheSaveOptions): UsesStep {
  return uses("actions/cache/save@v4", buildWith(options));
}
