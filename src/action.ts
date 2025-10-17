// High-level Action object mirroring Action.pkl default exports
import * as Common from "./actions/common";
import * as Artifact from "./actions/artifact";
import * as Cache from "./actions/cache";
import * as Pages from "./actions/pages";
import * as Setup from "./actions/setup";

export const Action = {
  // Default actions
  checkout: Common.checkout,
  addToProject: Common.addToProject,
  gitHubScript: Common.githubScript,
  labeler: Common.labeler,
  deletePackageVersion: Common.deletePackageVersion,
  stale: Common.stale,
  dependencyReviewAction: Common.dependencyReviewAction,
  goDependencySubmission: Common.goDependencySubmission,
  attestSbom: Common.attestSbom,
  aiInference: Common.aiInference,
  createGitHubAppToken: Common.createGitHubAppToken,

  // Artifact actions
  downloadArtifact: Artifact.downloadArtifact,
  uploadArtitact: Artifact.uploadArtifact, // keep misspelling for parity
  uploadArtifactMerge: Artifact.uploadArtifactMerge,

  // Pages actions
  configurePages: Pages.configurePages,
  uploadPagesArtifact: Pages.uploadPagesArtifact,
  jekyllBuildPages: Pages.jekyllBuildPages,
  deployPages: Pages.deployPages,

  // Cache actions
  cache: Cache.cache,
  cacheSave: Cache.cacheSave,
  cacheRestore: Cache.cacheRestore,

  // Setup actions
  setupGo: Setup.setupGo,
  setupNode: Setup.setupNode,
  setupPython: Setup.setupPython,
  setupJava: Setup.setupJava,
  setupDotnet: Setup.setupDotnet,
};

export default Action;
