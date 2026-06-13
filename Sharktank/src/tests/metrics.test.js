import test from "node:test";
import assert from "node:assert/strict";
import { rawMasterRows } from "../data/rawMasterData.js";
import { enrichmentOverrides } from "../data/enrichmentOverrides.js";
import { supplementalRecords } from "../data/supplementalRecords.js";
import { applyEnrichmentOverrides } from "../lib/enrichment.js";
import { applyDataCurations, getAnalysisRecords } from "../lib/curateData.js";
import { normalizeRows } from "../lib/normalizeData.js";
import { getGlobalMetrics, getSharkMetrics, getTopCompanies, getIndustryMetrics, getSeasonMetrics, parseEquityPercent, getInvestorRevenueAttribution } from "../lib/metrics.js";

const curatedRecords = applyEnrichmentOverrides(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords]), enrichmentOverrides);
const records = getAnalysisRecords(curatedRecords);

test("calculates global KPIs from records", () => {
  const metrics = getGlobalMetrics(records);
  assert.equal(records.length, 1436);
  assert.equal(metrics.totalPitches, records.length);
  assert.equal(metrics.totalDeals, 881); // 834 + 47 deals resolved by the sourced backfill overlay
  assert.ok(metrics.dealRate > 0);
  assert.ok(metrics.totalRevenue > 0);
});

test("calculates shark metrics and rankings", () => {
  const sharks = getSharkMetrics(records);
  assert.ok(sharks.length >= 6);
  assert.ok(sharks.every((metric) => metric.alphaScore >= 0 && metric.alphaScore <= 100));
  assert.equal(sharks[0].alphaScore >= sharks[1].alphaScore, true);
  assert.ok(sharks.every((metric) => typeof metric.attributedRevenue === "number"));
});

test("returns top companies and industry metrics", () => {
  assert.equal(getTopCompanies(records, { limit: 3 }).length, 3);
  assert.equal(getTopCompanies(records, { limit: 1 })[0].companyName, "Bombas");
  assert.ok(getIndustryMetrics(records).some((metric) => metric.industry === "Food"));
});

test("aggregates per-season metrics in ascending order", () => {
  const seasons = getSeasonMetrics(records);
  assert.ok(seasons.length >= 16);
  const numbered = seasons.filter((season) => season.season !== "Unknown");
  assert.equal(numbered[0].season, 1);
  for (let i = 1; i < numbered.length; i += 1) {
    assert.ok(numbered[i].season > numbered[i - 1].season);
  }
  assert.equal(seasons.reduce((sum, season) => sum + season.totalPitches, 0), records.length);
  assert.ok(seasons.every((season) => season.dealRate >= 0 && season.dealRate <= 1));
});

test("attributes revenue using deal equity when available", () => {
  const bombas = records.find((record) => record.companyName === "Bombas");
  assert.equal(parseEquityPercent(bombas.dealTermsRaw), 0.175);
  assert.equal(getInvestorRevenueAttribution(bombas), 350_000_000);
});

test("excludes Bombas from Daymond shark scoring while keeping the company record", () => {
  const bombas = records.find((record) => record.companyName === "Bombas");
  const daymond = getSharkMetrics(records).find((metric) => metric.sharkName === "Daymond John");
  assert.equal(bombas.excludeFromSharkScoring, true);
  assert.equal(daymond.largestWinner === "Bombas", false);
  assert.equal(daymond.totalRevenue < bombas.revenueAmount, true);
});

test("applies Season 16 finale enrichment overrides", () => {
  const deviledEgg = records.find((record) => record.id === "s16e20-deviled-egg-co");
  const tickMitt = records.find((record) => record.id === "s16e20-tick-mitt");
  assert.equal(deviledEgg.dealStatus, "deal");
  assert.deepEqual(deviledEgg.investors, ["Mark Cuban", "Barbara Corcoran"]);
  assert.equal(tickMitt.dealStatus, "no_deal");
});

test("excludes not-closed post-show deals from shark portfolio scoring", () => {
  const morrison = records.find((record) => record.id === "s16e19-morrison-outdoors");
  const mark = getSharkMetrics(records).find((metric) => metric.sharkName === "Mark Cuban");
  const allMarkRevenue = records
    .filter((record) => record.investors.includes("Mark Cuban") && typeof record.revenueAmount === "number")
    .reduce((sum, record) => sum + record.revenueAmount, 0);
  assert.equal(morrison.dealStatus, "deal");
  assert.equal(morrison.postShowDealStatus, "not_closed");
  assert.equal(allMarkRevenue - mark.totalRevenue, morrison.revenueAmount);
});

test("curates known import artifacts without deleting source rows", () => {
  assert.equal(supplementalRecords.length, 72);
  assert.equal(curatedRecords.length, 1480);
  assert.equal(curatedRecords.filter((record) => record.isArtifact).length, 44);
  assert.equal(records.some((record) => record.companyName === "COMPANY"), false);
  assert.ok(records.some((record) => record.companyName === "Touch Up Cup"));
  assert.ok(records.some((record) => record.companyName === "Blueland"));
  assert.ok(records.some((record) => record.id === "s17e18-pi00a"));
});
