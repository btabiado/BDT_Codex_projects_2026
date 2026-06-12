import test from "node:test";
import assert from "node:assert/strict";
import { rawMasterRows } from "../data/rawMasterData.js";
import { normalizeRows } from "../lib/normalizeData.js";
import { getQualityReport } from "../lib/qualityChecks.js";

test("builds a data quality report", () => {
  const report = getQualityReport(normalizeRows(rawMasterRows));
  assert.ok(report.overallScore >= 0 && report.overallScore <= 100);
  assert.ok(report.completeness.length > 0);
  assert.ok(report.seasonCoverage.length > 0);
  assert.ok(report.seasonCoverage.some((season) => season.season === 17));
  assert.equal(typeof report.revenueQuality.missing, "number");
});
