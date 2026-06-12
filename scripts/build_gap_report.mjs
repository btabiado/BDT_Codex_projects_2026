import fs from "node:fs";
import path from "node:path";
import { rawMasterRows } from "../Sharktank/src/data/rawMasterData.js";
import { enrichmentOverrides } from "../Sharktank/src/data/enrichmentOverrides.js";
import { supplementalRecords } from "../Sharktank/src/data/supplementalRecords.js";
import { applyEnrichmentOverrides } from "../Sharktank/src/lib/enrichment.js";
import { applyDataCurations, getAnalysisRecords } from "../Sharktank/src/lib/curateData.js";
import { normalizeRows, MAJOR_SHARKS } from "../Sharktank/src/lib/normalizeData.js";
import { getQualityReport } from "../Sharktank/src/lib/qualityChecks.js";

const curatedRecords = applyEnrichmentOverrides(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords]), enrichmentOverrides);
const records = getAnalysisRecords(curatedRecords);

function hasLikelyBoilerplateName(record) {
  return /^(sharks:|mark |daymond |lori |kevin |barbara |robert )/i.test(record.companyName);
}

function missingFields(record) {
  const fields = [];
  if (record.dealStatus === "unknown") fields.push("dealStatus");
  if (record.dealStatus === "deal" && record.investors.length === 0) fields.push("investors");
  if (record.businessStatus === "unknown") fields.push("businessStatus");
  if (record.revenueAmount === null || record.revenueAmount === undefined) fields.push("revenue");
  if (!record.description) fields.push("description");
  if (record.industry === "Unclassified") fields.push("industry");
  if (hasLikelyBoilerplateName(record)) fields.push("companyName");
  return fields;
}

function priority(record, fields) {
  if (record.season >= 17) return 1;
  if (record.season >= 16 && fields.some((field) => ["dealStatus", "investors", "revenue"].includes(field))) return 1;
  if (fields.includes("companyName")) return 1;
  if (record.dealStatus === "deal" && fields.includes("investors")) return 2;
  if (fields.includes("revenue") || fields.includes("businessStatus")) return 3;
  return 4;
}

const queue = records
  .map((record) => {
    const fields = missingFields(record);
    return {
      id: record.id,
      priority: priority(record, fields),
      season: record.season,
      episode: record.episode,
      companyName: record.companyName,
      missingFields: fields,
      currentSource: record.sourceUrl,
      sourceSearchHint: `${record.companyName} Shark Tank Season ${record.season} Episode ${record.episode} deal revenue investors`
    };
  })
  .filter((item) => item.missingFields.length > 0)
  .sort((a, b) => a.priority - b.priority || (b.season ?? 0) - (a.season ?? 0) || (a.episode ?? 0) - (b.episode ?? 0));

const report = getQualityReport(records);
const counts = {
  workbookRows: rawMasterRows.length,
  supplementalRows: supplementalRecords.length,
  sourceRows: curatedRecords.length,
  analysisRows: records.length,
  quarantinedArtifacts: curatedRecords.filter((record) => record.isArtifact).length,
  cleanedCompanyNames: curatedRecords.filter((record) => record.curationNotes?.some((note) => note.includes("companyName cleaned"))).length,
  qualityScore: report.overallScore,
  unknownDealStatus: records.filter((record) => record.dealStatus === "unknown").length,
  dealRowsMissingInvestors: records.filter((record) => record.dealStatus === "deal" && record.investors.length === 0).length,
  unknownBusinessStatus: records.filter((record) => record.businessStatus === "unknown").length,
  missingRevenue: records.filter((record) => record.revenueAmount === null || record.revenueAmount === undefined).length,
  missingDescription: records.filter((record) => !record.description).length,
  unclassifiedIndustry: records.filter((record) => record.industry === "Unclassified").length,
  likelyBoilerplateNames: records.filter((record) => /^(sharks:|mark |daymond |lori |kevin |barbara |robert )/i.test(record.companyName)).length,
  queueItems: queue.length,
  priorityOneItems: queue.filter((item) => item.priority === 1).length
};

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/research_queue.json", `${JSON.stringify(queue, null, 2)}\n`);

const priorityExamples = queue.slice(0, 40);
const bySeason = new Map();
for (const item of queue) {
  bySeason.set(item.season ?? "Unknown", (bySeason.get(item.season ?? "Unknown") ?? 0) + 1);
}

const markdown = `# Shark Tank Data Enrichment Gap Report

Generated from the normalized workbook, supplemental records, and enrichment overrides.

## Current Gap Counts

| Metric | Count |
| --- | ---: |
| Workbook rows | ${counts.workbookRows} |
| Supplemental rows | ${counts.supplementalRows} |
| Source rows | ${counts.sourceRows} |
| Analysis rows after artifact quarantine | ${counts.analysisRows} |
| Quarantined import artifacts | ${counts.quarantinedArtifacts} |
| Cleaned company names | ${counts.cleanedCompanyNames} |
| Data quality score | ${counts.qualityScore}/100 |
| Unknown deal status | ${counts.unknownDealStatus} |
| Deal rows missing investors | ${counts.dealRowsMissingInvestors} |
| Unknown business status | ${counts.unknownBusinessStatus} |
| Missing parsed revenue | ${counts.missingRevenue} |
| Missing description | ${counts.missingDescription} |
| Unclassified industry | ${counts.unclassifiedIndustry} |
| Likely boilerplate/import-name artifacts | ${counts.likelyBoilerplateNames} |
| Research queue items | ${counts.queueItems} |
| Priority 1 queue items | ${counts.priorityOneItems} |

## Research Priority Rules

1. Season 17, Season 16 missing deal/investor/revenue rows, and obvious import artifacts.
2. Historical deal rows missing investor names.
3. Missing revenue or active/inactive business status.
4. Lower-impact description/industry gaps.

## Recommended Source Order

1. Official ABC episode/business pages for official roster, air date, company names, descriptions, and company URLs.
2. Shark Tank Blog company pages for broad deal outcome, investor, ask, and sales-at-pitch fields.
3. Company websites for active/inactive status and product availability.
4. Reputable press/interviews for recent revenue, distribution, post-air status, and whether on-air deals closed.
5. Video clips or recap transcripts to verify contested deal terms.

## Priority 1 Examples

| ID | Season | Episode | Company | Missing fields | Current source |
| --- | ---: | ---: | --- | --- | --- |
${priorityExamples
  .map((item) => `| ${item.id} | ${item.season ?? ""} | ${item.episode ?? ""} | ${item.companyName.replaceAll("|", "\\|")} | ${item.missingFields.join(", ")} | ${item.currentSource ?? ""} |`)
  .join("\n")}

## Queue Items by Season

| Season | Queue items |
| ---: | ---: |
${[...bySeason.entries()]
  .sort((a, b) => Number(b[0]) - Number(a[0]))
  .map(([season, count]) => `| ${season} | ${count} |`)
  .join("\n")}
`;

fs.writeFileSync("docs/data_enrichment_gap_report.md", markdown);
console.log(JSON.stringify(counts, null, 2));
