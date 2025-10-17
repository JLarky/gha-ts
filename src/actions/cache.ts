import { UsesStep, uses } from "../workflow-types";
import { buildWith, CamelToKebabMap } from "./common";

export interface CacheOptions {
  path?: string; // path
  key?: string; // key
  restoreKeys?: string; // restore-keys
  uploadChunkSize?: number | string; // upload-chunk-size
  enableCrossOsArchive?: boolean | string; // enableCrossOsArchive (camel upstream)
  failOnCacheMiss?: boolean | string; // fail-on-cache-miss
  lookupOnly?: boolean | string; // lookup-only
  saveAlways?: boolean | string; // save-always
}
const cacheMap: CamelToKebabMap = {
  restoreKeys: "restore-keys",
  uploadChunkSize: "upload-chunk-size",
  failOnCacheMiss: "fail-on-cache-miss",
  lookupOnly: "lookup-only",
  saveAlways: "save-always",
};
export function cache(options: CacheOptions = {}): UsesStep {
  return uses("actions/cache@v4", buildWith(options, cacheMap));
}

export interface CacheRestoreOptions {
  path: string | string[];
  key: string;
  restoreKeys?: string | string[]; // restore-keys
  enableCrossOsArchive?: boolean; // enableCrossOsArchive (already camel-case upstream)
}
const restoreMap: CamelToKebabMap = { restoreKeys: "restore-keys" };
export function cacheRestore(options: CacheRestoreOptions): UsesStep {
  return uses("actions/cache/restore@v4", buildWith(options, restoreMap));
}

export interface CacheSaveOptions {
  path: string | string[];
  key: string;
  enableCrossOsArchive?: boolean;
}
export function cacheSave(options: CacheSaveOptions): UsesStep {
  return uses("actions/cache/save@v4", buildWith(options, {}));
}
