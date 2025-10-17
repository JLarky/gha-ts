/* Helpers to build GitHub Actions expression strings */

function expr(path: string): string {
  return "${{ " + path + " }}";
}

// Generic builders
export function github(name: string): string {
  return expr(`github.${name}`);
}
export function env(name: string): string {
  return expr(`env.${name}`);
}
export function job(name: string): string {
  return expr(`job.${name}`);
}
export function jobs(name: string): string {
  return expr(`jobs.${name}`);
}
export function steps(id: string, field: string): string {
  return expr(`steps.${id}.${field}`);
}
export function runner(name: string): string {
  return expr(`runner.${name}`);
}
export function secrets(name: string): string {
  return expr(`secrets.${name}`);
}
export function strategy(name: string): string {
  return expr(`strategy.${name}`);
}
export function matrix(name: string): string {
  return expr(`matrix.${name}`);
}
export function needs(jobId: string, output?: string): string {
  return output
    ? expr(`needs.${jobId}.outputs.${output}`)
    : expr(`needs.${jobId}`);
}
export function inputs(name: string): string {
  return expr(`inputs.${name}`);
}

// Common direct fields (convenience wrappers)
export const githubRef = () => github("ref");
export const githubSha = () => github("sha");
export const githubRepository = () => github("repository");
export const githubActor = () => github("actor");
export const githubEventName = () => github("event_name");
export const githubWorkflow = () => github("workflow");
export const githubEvent = (path: string) => expr(`github.event.${path}`);
