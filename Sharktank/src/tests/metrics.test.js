import test from "node:test";
import assert from "node:assert/strict";
import { rawMasterRows } from "../data/rawMasterData.js";
import { enrichmentOverrides } from "../data/enrichmentOverrides.js";
import { supplementalRecords } from "../data/supplementalRecords.js";
import { applyEnrichmentOverrides } from "../lib/enrichment.js";
import { applyDataCurations, getAnalysisRecords } from "../lib/curateData.js";
import { normalizeRows } from "../lib/normalizeData.js";
import { getGlobalMetrics, getSharkMetrics, getTopCompanies, getIndustryMetrics, getSeasonMetrics, getEpisodeCoverage, getWebsiteHealth, parseEquityPercent, getInvestorRevenueAttribution } from "../lib/metrics.js";

const curatedRecords = applyEnrichmentOverrides(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords]), enrichmentOverrides);
const records = getAnalysisRecords(curatedRecords);

test("calculates global KPIs from records", () => {
  const metrics = getGlobalMetrics(records);
  assert.equal(records.length, 1504); // +68 Season 15 records added (eps 5-21 backfill)
  assert.equal(metrics.totalPitches, records.length);
  assert.equal(metrics.totalDeals, 929); // grew with the S15 deal records
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

test("computes on-air deal close ratio per shark", () => {
  const sharks = getSharkMetrics(records);
  for (const m of sharks) {
    assert.equal(m.verifiedClosed + m.notClosedDeals, m.verifiedDeals); // ratio is over verified deals only
    assert.ok(m.verifiedDeals <= m.onAirDeals);
    assert.ok(m.closeRatio === null || (m.closeRatio >= 0 && m.closeRatio <= 1));
  }
  // Mark has documented fall-throughs (Morrison Outdoors, plus researched), so his
  // close rate must be below 100% and computed over a real verified sample.
  const mark = sharks.find((m) => m.sharkName === "Mark Cuban");
  assert.ok(mark.notClosedDeals >= 1);
  assert.ok(mark.verifiedDeals > 0);
  assert.ok(mark.closeRatio < 1);
});

test("returns top companies and industry metrics", () => {
  assert.equal(getTopCompanies(records, { limit: 3 }).length, 3);
  assert.equal(getTopCompanies(records, { limit: 1 })[0].companyName, "Bombas");
  assert.ok(getIndustryMetrics(records).some((metric) => metric.industry === "Food"));
});

test("summarizes company website health", () => {
  const web = getWebsiteHealth(records);
  assert.equal(web.total, records.length);
  assert.ok(web.withSite > 800); // ~1080 collected
  assert.equal(web.live, web.up + web.blocked);
  assert.ok(web.live + web.down <= web.withSite);
  assert.ok(web.livePctOfTracked > 0 && web.livePctOfTracked <= 1);
});

test("measures episode coverage against aired-episode counts", () => {
  const cov = getEpisodeCoverage(records);
  assert.equal(cov.overall.expected, 377); // S1-17 per Wikipedia
  assert.equal(cov.bySeason.length, 17);
  assert.ok(cov.overall.present <= cov.overall.expected);
  assert.ok(cov.overall.pct > 0.99 && cov.overall.pct <= 1); // ~99.7% after the S15 backfill
  assert.equal(cov.overall.present + cov.overall.missing, cov.overall.expected);
  // Season 15 was the gap; the eps 5-21 backfill completed it.
  const s15 = cov.bySeason.find((s) => s.season === 15);
  assert.equal(s15.missing, 0);
  // No season can report more present than aired.
  assert.ok(cov.bySeason.every((s) => s.present <= s.expected));
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

test("applies Season 16 early episode backfill overrides", () => {
  const bucketGolf = records.find((record) => record.id === "s16e2-bucketgolf");
  const charCharms = records.find((record) => record.id === "s16e10-charchams");
  assert.equal(bucketGolf.dealStatus, "deal");
  assert.deepEqual(bucketGolf.investors, ["Mark Cuban"]);
  assert.equal(bucketGolf.revenueAmount, 5_900_000);
  assert.equal(charCharms.companyName, "Char Charms");
  assert.equal(charCharms.dealStatus, "no_deal");
});

test("applies Season 17 priority backfill corrections", () => {
  const doublesoul = records.find((record) => record.id === "s17e1-doublesoul");
  const leftField = records.find((record) => record.id === "s17e10-left-field");
  const somnia = records.find((record) => record.id === "s17e11-somnia");
  assert.equal(doublesoul.businessStatus, "active");
  assert.equal(leftField.businessStatus, "inactive");
  assert.equal(leftField.revenueAmount, 0);
  assert.equal(somnia.revenueAmount, 188_000);
});

test("excludes not-closed post-show deals from shark portfolio scoring", () => {
  const morrison = records.find((record) => record.id === "s16e19-morrison-outdoors");
  const mark = getSharkMetrics(records).find((metric) => metric.sharkName === "Mark Cuban");
  const allMarkRevenue = records
    .filter((record) => record.investors.includes("Mark Cuban") && typeof record.revenueAmount === "number")
    .reduce((sum, record) => sum + record.revenueAmount, 0);
  assert.equal(morrison.dealStatus, "deal");
  assert.equal(morrison.postShowDealStatus, "not_closed");
  // Morrison (and any other not_closed Mark deals surfaced by closure research) are
  // excluded from his scored revenue, so the excluded delta covers at least Morrison.
  assert.ok(allMarkRevenue - mark.totalRevenue >= morrison.revenueAmount);
});

test("curates known import artifacts without deleting source rows", () => {
  assert.equal(supplementalRecords.length, 140); // 72 + 68 Season 15 backfill records
  assert.equal(curatedRecords.length, 1548);
  assert.equal(curatedRecords.filter((record) => record.isArtifact).length, 44);
  assert.equal(records.some((record) => record.companyName === "COMPANY"), false);
  assert.ok(records.some((record) => record.companyName === "Touch Up Cup"));
  assert.ok(records.some((record) => record.companyName === "Blueland"));
  assert.ok(records.some((record) => record.id === "s17e18-pi00a"));
});
