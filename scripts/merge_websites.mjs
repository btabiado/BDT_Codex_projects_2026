// Merge locally-collected company websites (/tmp/websites.json) into the enrichment
// overlay as `website` + `websiteStatus` (up | blocked | down | unreachable).
// Collected by scripts/collect_websites equivalent: curl each cited sharktankblog
// page, regex-extract the company homepage (domain-name match), then curl it for a
// liveness status. Pure local — no API/swarm. Never overwrites an existing website.
//
// Usage: node scripts/merge_websites.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enrichmentOverrides as existing } from "../Sharktank/src/data/enrichmentOverrides.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "/tmp/websites.json";
const OVERRIDES_PATH = path.join(ROOT, "Sharktank/src/data/enrichmentOverrides.js");
const DRY = process.argv.includes("--dry");
const VALID = new Set(["up", "blocked", "down", "unreachable"]);

const collected = JSON.parse(fs.readFileSync(SRC, "utf8"));
const merged = JSON.parse(JSON.stringify(existing));
const stats = { input: Object.keys(collected).length, applied: 0, skipExisting: 0, skipInvalid: 0 };
const byStatus = {};

for (const [id, v] of Object.entries(collected)) {
  if (!v || !/^https:\/\/\S+$/i.test(v.website || "") || !VALID.has(v.websiteStatus)) { stats.skipInvalid += 1; continue; }
  const entry = merged[id] || (merged[id] = {});
  if (entry.website) { stats.skipExisting += 1; continue; }
  entry.website = v.website;
  entry.websiteStatus = v.websiteStatus;
  byStatus[v.websiteStatus] = (byStatus[v.websiteStatus] || 0) + 1;
  stats.applied += 1;
}

console.log("Website merge stats:", JSON.stringify(stats, null, 2));
console.log("By status:", JSON.stringify(byStatus, null, 2));

if (!DRY) {
  fs.writeFileSync(OVERRIDES_PATH, `export const enrichmentOverrides = ${JSON.stringify(merged, null, 2)};\n`);
  console.log(`Wrote ${OVERRIDES_PATH}`);
} else {
  console.log("(dry run — no file written)");
}
