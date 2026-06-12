import test from "node:test";
import assert from "node:assert/strict";
import { rawMasterRows } from "../data/rawMasterData.js";
import { normalizeRows } from "../lib/normalizeData.js";
import { getGlobalMetrics, getSharkMetrics, getTopCompanies, getIndustryMetrics } from "../lib/metrics.js";

const records = normalizeRows(rawMasterRows);

test("calculates global KPIs from records", () => {
  const metrics = getGlobalMetrics(records);
  assert.equal(records.length, 1408);
  assert.equal(metrics.totalPitches, records.length);
  assert.equal(metrics.totalDeals, 770);
  assert.ok(metrics.dealRate > 0);
  assert.ok(metrics.totalRevenue > 0);
});

test("calculates shark metrics and rankings", () => {
  const sharks = getSharkMetrics(records);
  assert.ok(sharks.length >= 6);
  assert.ok(sharks.every((metric) => metric.alphaScore >= 0 && metric.alphaScore <= 100));
  assert.equal(sharks[0].alphaScore >= sharks[1].alphaScore, true);
});

test("returns top companies and industry metrics", () => {
  assert.equal(getTopCompanies(records, { limit: 3 }).length, 3);
  assert.equal(getTopCompanies(records, { limit: 1 })[0].companyName, "Bombas");
  assert.ok(getIndustryMetrics(records).some((metric) => metric.industry === "Food"));
});
