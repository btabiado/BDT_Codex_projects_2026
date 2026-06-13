// Merge the dealfill swarm output (/tmp/sharktank-dealfill/chunk-*.json) into the
// overlay: accepted investors for deals that had none, and post-show closure status.
// Strict: https source required, drop "low" confidence, canonicalize investor names,
// never overwrite an existing investors list or postShowDealStatus.
//
// Usage: node scripts/merge_dealfill.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enrichmentOverrides as existing } from "../Sharktank/src/data/enrichmentOverrides.js";
import { rawMasterRows } from "../Sharktank/src/data/rawMasterData.js";
import { supplementalRecords } from "../Sharktank/src/data/supplementalRecords.js";
import { applyDataCurations, getAnalysisRecords } from "../Sharktank/src/lib/curateData.js";
import { normalizeRows, standardizeInvestorName } from "../Sharktank/src/lib/normalizeData.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = "/tmp/sharktank-dealfill";
const OVERRIDES_PATH = path.join(ROOT, "Sharktank/src/data/enrichmentOverrides.js");
const DRY = process.argv.includes("--dry");

// Current investors per record id (so we only fill where empty).
const curInvestors = new Map(getAnalysisRecords(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords])).map((r) => [r.id, r.investors]));
const isHttps = (u) => typeof u === "string" && /^https:\/\/\S+$/i.test(u.trim());

const merged = JSON.parse(JSON.stringify(existing));
const stats = { files: 0, parsed: 0, invApplied: 0, closeApplied: 0, skipInvHas: 0, skipInvBad: 0, skipCloseHas: 0, skipNoSource: 0, skipLow: 0 };
const seen = new Set();

const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /^chunk-.*\.json$/.test(f)).sort() : [];
for (const file of files) {
  stats.files += 1;
  let payload; try { payload = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")); } catch { continue; }
  for (const r of payload.results || []) {
    stats.parsed += 1;
    if (!r || !r.id || seen.has(r.id)) continue;
    seen.add(r.id);
    const low = String(r.confidence).toLowerCase() === "low";
    if (!isHttps(r.source)) { stats.skipNoSource += 1; continue; }
    if (low) { stats.skipLow += 1; continue; }
    const entry = merged[r.id] || {};
    let touched = false;

    // Investors — only fill where the record currently has none.
    if (Array.isArray(r.investors) && r.investors.length) {
      const cur = (entry.investors ?? curInvestors.get(r.id)) || [];
      if (cur.length) { stats.skipInvHas += 1; }
      else {
        const names = [...new Set(r.investors.map((n) => standardizeInvestorName(String(n))).filter((n) => n && /[a-z]/i.test(n) && n.split(/\s+/).length >= 2))];
        if (names.length) { entry.investors = names; touched = true; stats.invApplied += 1; }
        else stats.skipInvBad += 1;
      }
    }
    // Closure — only if not already set.
    if (r.postShowDealStatus === "closed" || r.postShowDealStatus === "not_closed") {
      if (entry.postShowDealStatus) stats.skipCloseHas += 1;
      else {
        entry.postShowDealStatus = r.postShowDealStatus;
        entry.closureSource = r.source.trim();
        if (r.postShowDealStatus === "not_closed" && r.note && !entry.portfolioScoringNote) entry.portfolioScoringNote = `On-air deal did not close: ${String(r.note).trim()}`;
        touched = true; stats.closeApplied += 1;
      }
    }
    if (touched) {
      if (!entry.enrichmentConfidence) entry.enrichmentConfidence = String(r.confidence).toLowerCase() === "high" ? "high" : "medium";
      if (!entry.sourceUrl) entry.sourceUrl = r.source.trim();
      merged[r.id] = entry;
    }
  }
}

console.log("Dealfill merge stats:", JSON.stringify(stats, null, 2));
if (!DRY) { fs.writeFileSync(OVERRIDES_PATH, `export const enrichmentOverrides = ${JSON.stringify(merged, null, 2)};\n`); console.log(`Wrote ${OVERRIDES_PATH}`); }
else console.log("(dry run — no file written)");
