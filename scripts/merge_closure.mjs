// Merge deal-closure research (/tmp/sharktank-close/chunk-*.json) into the
// enrichment overlay as postShowDealStatus. Only the documented NOT-CLOSED deals
// change the close-ratio metric (everything else is treated as closed), so we apply
// "not_closed" with its source. Conservative: requires https source, drops "low"
// confidence, never overwrites an existing postShowDealStatus.
//
// Usage: node scripts/merge_closure.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { enrichmentOverrides as existing } from "../Sharktank/src/data/enrichmentOverrides.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHUNK_DIR = "/tmp/sharktank-close";
const OVERRIDES_PATH = path.join(ROOT, "Sharktank/src/data/enrichmentOverrides.js");
const DRY = process.argv.includes("--dry");

function isHttps(url) {
  return typeof url === "string" && /^https:\/\/\S+$/i.test(url.trim());
}

const stats = { files: 0, parsed: 0, notClosed: 0, closed: 0, unknown: 0, applied: 0, skipExistingStatus: 0, skipNoSource: 0, skipLow: 0 };
const seen = new Set();
const merged = JSON.parse(JSON.stringify(existing)); // deep clone so we add fields in place

const files = fs.existsSync(CHUNK_DIR)
  ? fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".json") && f !== "_input.json").sort()
  : [];

for (const file of files) {
  stats.files += 1;
  let payload;
  try { payload = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, file), "utf8")); } catch { continue; }
  for (const r of payload.results || []) {
    stats.parsed += 1;
    if (!r || !r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    if (r.status === "not_closed") stats.notClosed += 1;
    else if (r.status === "closed") stats.closed += 1;
    else { stats.unknown += 1; continue; }

    // Apply BOTH closed and not_closed so a deal counts as "verified" (researched);
    // the close ratio is computed over verified deals only, so it isn't biased by how
    // much of each shark's slate has been researched. "unknown" stays implicit.
    if (r.status !== "not_closed" && r.status !== "closed") continue;
    if (merged[r.id] && merged[r.id].postShowDealStatus) { stats.skipExistingStatus += 1; continue; }
    if (String(r.confidence).toLowerCase() === "low") { stats.skipLow += 1; continue; }
    if (!isHttps(r.source)) { stats.skipNoSource += 1; continue; }

    const entry = merged[r.id] || (merged[r.id] = {});
    entry.postShowDealStatus = r.status; // "closed" | "not_closed"
    entry.closureSource = r.source.trim();
    entry.closureConfidence = String(r.confidence).toLowerCase() === "high" ? "high" : "medium";
    if (r.status === "not_closed" && typeof r.note === "string" && r.note.trim() && !entry.portfolioScoringNote) {
      entry.portfolioScoringNote = `On-air deal did not close: ${r.note.trim()}`;
    }
    stats.applied += 1;
  }
}

console.log("Closure merge stats:", JSON.stringify(stats, null, 2));
console.log(`Documented fall-throughs applied (not_closed): ${stats.applied}`);

if (!DRY) {
  fs.writeFileSync(OVERRIDES_PATH, `export const enrichmentOverrides = ${JSON.stringify(merged, null, 2)};\n`);
  console.log(`Wrote ${OVERRIDES_PATH}`);
} else {
  console.log("(dry run — no file written)");
}
