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
    survivalRate: knownStatus.length ? activeBusinesses / knownStatus.length : null,
    totalRevenue,
    averageRevenue: revenueRecords.length ? totalRevenue / revenueRecords.length : null
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
      revenueCoverage: portfolio.length ? revenuePortfolio.length / portfolio.length : 0
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
