#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { $ } from "bun";

const VERSION = process.env.WEBHOOKS_TYPES_VERSION ?? "latest";
const REGISTRY_META = "https://registry.npmjs.org/@octokit/webhooks-types";

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return await res.text();
}

async function main() {
  // Resolve tarball URL from registry
  const metaRes = await fetch(REGISTRY_META);
  if (!metaRes.ok) throw new Error(`Failed to fetch ${REGISTRY_META}`);
  const meta = (await metaRes.json()) as any;
  let resolved = VERSION === "latest" ? meta["dist-tags"]?.latest : VERSION;
  if (!meta.versions?.[resolved]) {
    resolved = meta["dist-tags"]?.latest;
  }
  const pkg = meta.versions?.[resolved];
  if (!pkg?.dist?.tarball)
    throw new Error(`Could not resolve tarball for version ${resolved}`);
  const tarballUrl: string = pkg.dist.tarball;

  // Download tarball to temp
  const tmpBase = (await $`mktemp -d -t webhooks-types.XXXXXXXX`.text()).trim();
  const tmpPath = join(tmpBase, "pkg.tgz");
  const tarData = await fetch(tarballUrl).then((r) => r.arrayBuffer());
  await Bun.write(tmpPath, new Uint8Array(tarData));

  // Extract to temp dir and read index.d.ts (or fallback)
  await $`tar -xzf ${tmpPath} -C ${tmpBase}`.quiet();
  const candidates = [
    join(tmpBase, "package", "index.d.ts"),
    join(tmpBase, "package", "schema.d.ts"),
    join(tmpBase, "index.d.ts"),
    join(tmpBase, "schema.d.ts"),
  ];
  let dts = "";
  for (const c of candidates) {
    try {
      dts = await Bun.file(c).text();
      break;
    } catch {
      // try next
    }
  }
  if (!dts) {
    throw new Error("index.d.ts not found in tarball");
  }
  let license = "License unavailable";
  for (const name of ["LICENSE", "LICENSE.md", "license", "license.md"]) {
    try {
      license = await Bun.file(join(tmpBase, "package", name)).text();
      break;
    } catch {}
  }

  // Prevent closing the header block comment from license content
  license = license.replace(/\*\//g, "* /");

  // Registry metadata details
  const metaLicense: string = pkg.license ?? meta.license ?? "unknown";
  const maintainers: Array<{ name?: string; email?: string }> =
    pkg.maintainers ?? [];
  const maintainersLines =
    maintainers.length > 0
      ? maintainers
          .map((m) => {
            const nm = m.name ?? "";
            const em = m.email ? ` <${m.email}>` : "";
            return ` *  - ${nm}${em}`;
          })
          .join("\n")
      : " *  - unknown";

  const header = `/* Auto-generated: Do not edit by hand.
 * Package: @octokit/webhooks-types@${resolved}
 * Tarball: ${tarballUrl}
 * License (registry): ${metaLicense}
 * Maintainers:
${maintainersLines}
 *
 * Upstream LICENSE (sanitized):
${license
  .split("\n")
  .map((l) => " * " + l)
  .join("\n")}
 */`;

  const augment = `
// Convenience aliases for consumers
export type EventName = WebhookEventName;
export type EventPayload<N extends EventName> = WebhookEventMap[N];
export function narrowEvent<N extends EventName>(
  _name: N,
  _payload: unknown
): asserts _payload is EventPayload<N> {
  // compile-time only
}
`;

  const outPath = join(process.cwd(), "src", "events-generated.ts");
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, header + "\n" + dts + "\n" + augment, "utf8");
  console.log(`Wrote ${outPath}`);
}

await main();
