import { describe, expect, test } from "bun:test";
import { toYamlReadyObject } from "../src/render/yaml";
import { workflow, job, run, Workflow } from "@jlarky/gha-ts/workflow-types";

describe("normalization", () => {
  test("runs-on machine/group/labels normalize to strings", () => {
    const wf: Workflow = workflow({
      name: "norm runs-on",
      on: ["push"],
      jobs: {
        a: job({ "runs-on": { group: "ubuntu-latest" }, steps: [run(":")] }),
        b: job({
          "runs-on": { labels: ["ubuntu-latest", "xlarge"] },
          steps: [run(":")],
        }),
        c: job({
          "runs-on": [{ name: "ignored" }, "ubuntu-latest"],
          steps: [run(":")],
        }),
      },
    });
    const obj = toYamlReadyObject(wf);
    const jobs: any = (obj as any).jobs;
    expect(jobs.a["runs-on"]).toBe("ubuntu-latest");
    expect(jobs.b["runs-on"]).toEqual("ubuntu-latest,xlarge");
    expect(jobs.c["runs-on"]).toEqual(["ignored", "ubuntu-latest"]);
  });

  test("schedule array/object forms normalize to {cron}", () => {
    const wf1: Workflow = workflow({
      name: "norm schedule",
      on: { schedule: ["0 0 * * *", "*/10 * * * *"] } as any,
      jobs: { j: job({ "runs-on": "ubuntu-latest", steps: [run(":")] }) },
    });
    const wf2: Workflow = workflow({
      name: "norm schedule 2",
      on: { schedule: { cron: ["0 0 * * *", "*/10 * * * *"] } } as any,
      jobs: { j: job({ "runs-on": "ubuntu-latest", steps: [run(":")] }) },
    });
    const obj1 = toYamlReadyObject(wf1);
    const obj2 = toYamlReadyObject(wf2);
    expect((obj1 as any).on.schedule).toEqual([
      { cron: "0 0 * * *" },
      { cron: "*/10 * * * *" },
    ]);
    expect((obj2 as any).on.schedule).toEqual([
      { cron: "0 0 * * *" },
      { cron: "*/10 * * * *" },
    ]);
  });
});
