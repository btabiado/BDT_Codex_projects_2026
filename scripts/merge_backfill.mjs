// Merge swarm-researched backfill chunks into Sharktank/src/data/enrichmentOverrides.js.
//
// Reads /tmp/sharktank-backfill/chunk-*.json (written by the sharktank-backfill
// workflow) and folds verified, source-cited values into the enrichment overlay.
// Conservative by construction:
//   - never overwrites an existing hand-curated override (keeps the curated entry)
//   - only applies fields that were actually MISSING for that record (per the gap queue)
//   - requires an https source URL; drops "low" confidence
//   - validates enums / types / industry labels; canonicalizes investor + revenue
//   - skips ids that don't correspond to a real analysis record
//
// Usage: node scripts/merge_backfill.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rawMasterRows } from "../Sharktank/src/data/rawMasterData.js";
import { supplementalRecords } from "../Sharktank/src/data/supplementalRecords.js";
import { enrichmentOverrides as existing } from "../Sharktank/src/data/enrichmentOverrides.js";
import { applyDataCurations, getAnalysisRecords } from "../Sharktank/src/lib/curateData.js";
import { normalizeRows, standardizeInvestorName, parseRevenue } from "../Sharktank/src/lib/normalizeData.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHUNK_DIR = "/tmp/sharktank-backfill";
const OVERRIDES_PATH = path.join(ROOT, "Sharktank/src/data/enrichmentOverrides.js");
const QUEUE_PATH = path.join(ROOT, "docs/research_queue.json");
const DRY = process.argv.includes("--dry");

const INDUSTRIES = new Set([
  "Food", "Apparel", "Beauty", "Health", "Consumer Goods", "Pet", "Sports", "Automotive",
  "Technology", "Education", "Services", "Baby & Kids", "Jewelry & Accessories",
  "Toys & Games", "Travel", "Entertainment"
]);
// Queue "missingFields" names -> the override keys they authorize.
const FIELD_MAP = {
  businessStatus: ["businessStatus"],
  dealStatus: ["dealStatus"],
  investors: ["investors"],
  description: ["description"],
  industry: ["industry"],
  revenue: ["revenueAmount", "revenueRaw"]
};

const validRecordIds = new Set(
  getAnalysisRecords(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords])).map((r) => r.id)
);
const missingByID = new Map();
for (const item of JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"))) {
  missingByID.set(item.id, new Set(item.missingFields.flatMap((f) => FIELD_MAP[f] || [])));
}

function isHttps(url) {
  return typeof url === "string" && /^https:\/\/\S+$/i.test(url.trim());
}

const stats = { files: 0, parsed: 0, foundTrue: 0, applied: 0,
  skipExisting: 0, skipUnknownId: 0, skipLow: 0, skipNoSource: 0, skipNoFields: 0, skipBadParse: 0 };
const fieldCounts = {};
const seen = new Set();
const additions = {};

const files = fs.existsSync(CHUNK_DIR)
  ? fs.readdirSync(CHUNK_DIR).filter((f) => f.endsWith(".json")).sort()
  : [];

for (const file of files) {
  stats.files += 1;
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(path.join(CHUNK_DIR, file), "utf8"));
  } catch {
    stats.skipBadParse += 1;
    continue;
  }
  for (const r of payload.results || []) {
    stats.parsed += 1;
    if (!r || !r.id || r.found !== true || !r.override) continue;
    stats.foundTrue += 1;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    if (r.id in existing) { stats.skipExisting += 1; continue; }
    if (!validRecordIds.has(r.id)) { stats.skipUnknownId += 1; continue; }
    if (String(r.confidence).toLowerCase() === "low") { stats.skipLow += 1; continue; }
    const src = r.override.sourceUrl;
    if (!isHttps(src)) { stats.skipNoSource += 1; continue; }

    const allowed = missingByID.get(r.id) || new Set(Object.values(FIELD_MAP).flat());
    const ov = {};
    const o = r.override;

    if (allowed.has("dealStatus") && (o.dealStatus === "deal" || o.dealStatus === "no_deal")) ov.dealStatus = o.dealStatus;
    if (allowed.has("businessStatus") && (o.businessStatus === "active" || o.businessStatus === "inactive")) ov.businessStatus = o.businessStatus;
    if (allowed.has("investors") && Array.isArray(o.investors)) {
      const names = o.investors.map((n) => standardizeInvestorName(String(n))).filter(Boolean);
      if (names.length || o.dealStatus === "no_deal") ov.investors = names;
    }
    if (allowed.has("description") && typeof o.description === "string" && o.description.trim()) ov.description = o.description.trim();
    if (allowed.has("industry") && INDUSTRIES.has(o.industry)) ov.industry = o.industry;
    if (allowed.has("revenueAmount")) {
      let amount = typeof o.revenueAmount === "number" ? o.revenueAmount
        : (o.revenueAmount != null ? parseRevenue(o.revenueAmount) : null);
      if (typeof amount === "number" && Number.isFinite(amount) && amount >= 0) {
        ov.revenueAmount = amount;
        if (typeof o.revenueRaw === "string" && o.revenueRaw.trim()) ov.revenueRaw = o.revenueRaw.trim();
      }
    }

    if (Object.keys(ov).length === 0) { stats.skipNoFields += 1; continue; }
    ov.sourceUrl = src.trim();
    ov.sourceUrlsRaw = typeof o.sourceUrlsRaw === "string" && o.sourceUrlsRaw.trim() ? o.sourceUrlsRaw.trim() : src.trim();
    ov.enrichmentConfidence = String(r.confidence).toLowerCase() === "high" ? "high" : "medium";

    for (const k of Object.keys(ov)) {
      if (["sourceUrl", "sourceUrlsRaw", "enrichmentConfidence"].includes(k)) continue;
      fieldCounts[k] = (fieldCounts[k] || 0) + 1;
    }
    additions[r.id] = ov;
    stats.applied += 1;
  }
}

console.log("Backfill merge stats:", JSON.stringify(stats, null, 2));
console.log("Fields applied:", JSON.stringify(fieldCounts, null, 2));
console.log(`Existing overrides: ${Object.keys(existing).length}; new: ${stats.applied}; total: ${Object.keys(existing).length + stats.applied}`);

if (!DRY) {
  const merged = { ...existing, ...additions };
  const body = `export const enrichmentOverrides = ${JSON.stringify(merged, null, 2)};\n`;
  fs.writeFileSync(OVERRIDES_PATH, body);
  console.log(`Wrote ${OVERRIDES_PATH}`);
} else {
  console.log("(dry run — no file written)");
}
