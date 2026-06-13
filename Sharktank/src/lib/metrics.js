import { calculateAlphaScores } from "./alphaScore.js";
import { MAJOR_SHARKS } from "./normalizeData.js";

export function getGlobalMetrics(records) {
  const totalPitches = records.length;
  const totalDeals = records.filter((record) => record.dealStatus === "deal").length;
  const knownStatus = records.filter((record) => record.businessStatus !== "unknown");
  const activeBusinesses = records.filter((record) => record.businessStatus === "active").length;
  const revenueRecords = records.filter((record) => typeof record.revenueAmount === "number");
  const totalRevenue = revenueRecords.reduce((sum, record) => sum + record.revenueAmount, 0);
  return {
    totalPitches,
    totalDeals,
    dealRate: totalPitches ? totalDeals / totalPitches : 0,
    activeBusinesses,
    knownBusinesses: knownStatus.length,
    survivalRate: knownStatus.length ? activeBusinesses / knownStatus.length : null,
    totalRevenue,
    averageRevenue: revenueRecords.length ? totalRevenue / revenueRecords.length : null
  };
}

export function getSeasonMetrics(records) {
  const grouped = new Map();
  for (const record of records) {
    const season = record.season ?? "Unknown";
    if (!grouped.has(season)) grouped.set(season, []);
    grouped.get(season).push(record);
  }
  return [...grouped.entries()]
    .map(([season, rows]) => ({ season, ...getGlobalMetrics(rows) }))
    .sort((a, b) => {
      if (a.season === "Unknown") return 1;
      if (b.season === "Unknown") return -1;
      return Number(a.season) - Number(b.season);
    });
}

// Official US Shark Tank episode counts per season (Wikipedia "List of Shark Tank
// episodes"). Season 17 is in progress — its count reflects episodes aired/scheduled
// to date (update as new seasons air). Used to measure how many aired episodes the
// dataset represents (an episode counts as "present" if it has >=1 pitch).
const EPISODES_PER_SEASON = {
  1: 14, 2: 9, 3: 15, 4: 26, 5: 29, 6: 29, 7: 29, 8: 24, 9: 24,
  10: 23, 11: 24, 12: 25, 13: 24, 14: 22, 15: 22, 16: 20, 17: 18
};
const ONGOING_SEASONS = new Set([17]);

export function getEpisodeCoverage(records) {
  const present = new Map();
  for (const record of records) {
    if (record.season == null) continue;
    if (!present.has(record.season)) present.set(record.season, new Set());
    if (record.episode != null) present.get(record.season).add(record.episode);
  }
  const bySeason = Object.keys(EPISODES_PER_SEASON)
    .map(Number)
    .sort((a, b) => a - b)
    .map((season) => {
      const expected = EPISODES_PER_SEASON[season];
      const have = Math.min(present.get(season)?.size ?? 0, expected);
      return { season, present: have, expected, missing: expected - have, pct: expected ? have / expected : 0, ongoing: ONGOING_SEASONS.has(season) };
    });
  const totalPresent = bySeason.reduce((sum, s) => sum + s.present, 0);
  const totalExpected = bySeason.reduce((sum, s) => sum + s.expected, 0);
  return {
    bySeason,
    overall: { present: totalPresent, expected: totalExpected, missing: totalExpected - totalPresent, pct: totalExpected ? totalPresent / totalExpected : 0 }
  };
}

export function getWebsiteHealth(records) {
  const withSite = records.filter((r) => r.website);
  const byStatus = {};
  for (const r of withSite) byStatus[r.websiteStatus] = (byStatus[r.websiteStatus] || 0) + 1;
  const live = (byStatus.up || 0) + (byStatus.blocked || 0);
  return {
    total: records.length,
    withSite: withSite.length,
    live,
    livePctOfTracked: withSite.length ? live / withSite.length : 0,
    up: byStatus.up || 0,
    blocked: byStatus.blocked || 0,
    down: (byStatus.down || 0) + (byStatus.unreachable || 0)
  };
}

function favoriteIndustry(records) {
  const counts = new Map();
  for (const record of records) {
    const industry = record.industry || "Unclassified";
    counts.set(industry, (counts.get(industry) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function parseEquityPercent(dealTermsRaw) {
  const raw = String(dealTermsRaw ?? "");
  const forMatch = raw.match(/\bfor\s+(\d+(?:\.\d+)?)\s*%/i);
  const equityMatch = raw.match(/(\d+(?:\.\d+)?)\s*%\s*(?:equity|stake|of\s+(?:the\s+)?company)/i);
  const match = forMatch ?? equityMatch;
  return match ? Number(match[1]) / 100 : null;
}

export function getInvestorRevenueAttribution(record) {
  if (typeof record.revenueAmount !== "number" || record.investors.length === 0) return 0;
  const equityShare = typeof record.revenueAttributionPercent === "number" ? record.revenueAttributionPercent : parseEquityPercent(record.dealTermsRaw);
  if (equityShare !== null) return record.revenueAmount * (equityShare / record.investors.length);
  return record.revenueAmount / record.investors.length;
}

function isPortfolioInvestment(record) {
  return record.postShowDealStatus !== "not_closed" && record.excludeFromSharkScoring !== true;
}

export function getSharkMetrics(records, sharks = MAJOR_SHARKS) {
  const base = sharks.map((sharkName) => {
    const portfolio = records.filter((record) => record.investors.includes(sharkName) && isPortfolioInvestment(record));
    const knownStatus = portfolio.filter((record) => record.businessStatus !== "unknown");
    const activeCompanies = portfolio.filter((record) => record.businessStatus === "active").length;
    const revenuePortfolio = portfolio.filter((record) => typeof record.revenueAmount === "number");
    const totalRevenue = revenuePortfolio.reduce((sum, record) => sum + record.revenueAmount, 0);
    const attributedRevenue = revenuePortfolio.reduce((sum, record) => sum + getInvestorRevenueAttribution(record), 0);
    const successfulDeals = portfolio.filter((record) => record.businessStatus === "active" || (record.revenueAmount ?? 0) > 0).length;
    const largest = revenuePortfolio.slice().sort((a, b) => b.revenueAmount - a.revenueAmount)[0];
    // Close ratio: of the deals this shark struck ON AIR (handshake), how many
    // actually closed after due diligence? Computed over VERIFIED deals only (those
    // with a researched post-show status), so the ratio is not biased by how much of
    // each shark's slate has been researched yet. verifiedDeals exposes the sample size.
    const onAir = records.filter((record) => record.investors.includes(sharkName) && record.dealStatus === "deal");
    const verified = onAir.filter((record) => record.postShowDealStatus === "closed" || record.postShowDealStatus === "not_closed");
    const notClosedDeals = verified.filter((record) => record.postShowDealStatus === "not_closed").length;
    const verifiedClosed = verified.length - notClosedDeals;
    return {
      sharkName,
      totalDeals: portfolio.length,
      activeCompanies,
      survivalRate: knownStatus.length ? activeCompanies / knownStatus.length : null,
      totalRevenue,
      attributedRevenue,
      averageRevenue: revenuePortfolio.length ? totalRevenue / revenuePortfolio.length : null,
      largestWinner: largest?.companyName ?? null,
      favoriteIndustry: favoriteIndustry(portfolio),
      dealSuccessRate: portfolio.length ? successfulDeals / portfolio.length : 0,
      revenueCoverage: portfolio.length ? revenuePortfolio.length / portfolio.length : 0,
      onAirDeals: onAir.length,
      verifiedDeals: verified.length,
      verifiedClosed,
      notClosedDeals,
      closeRatio: verified.length ? verifiedClosed / verified.length : null
    };
  });
  return calculateAlphaScores(base).sort((a, b) => b.alphaScore - a.alphaScore);
}

export function getTopCompanies(records, { limit = 10, dealStatus } = {}) {
  return records
    .filter((record) => (dealStatus ? record.dealStatus === dealStatus : true))
    .filter((record) => typeof record.revenueAmount === "number")
    .slice()
    .sort((a, b) => b.revenueAmount - a.revenueAmount)
    .slice(0, limit);
}

export function getIndustryMetrics(records) {
  const grouped = new Map();
  for (const record of records) {
    const industry = record.industry || "Unclassified";
    if (!grouped.has(industry)) grouped.set(industry, []);
    grouped.get(industry).push(record);
  }
  return [...grouped.entries()]
    .map(([industry, rows]) => {
      const global = getGlobalMetrics(rows);
      return { industry, ...global };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}
