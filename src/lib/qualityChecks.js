const REQUIRED_FIELDS = ["season", "episode", "companyName", "dealStatus"];
const SHOULD_HAVE_FIELDS = ["description", "investors", "businessStatus", "revenueAmount", "sourceUrl", "industry"];

export function getFieldCompleteness(records) {
  const fields = [...REQUIRED_FIELDS, ...SHOULD_HAVE_FIELDS];
  return fields.map((field) => {
    const complete = records.filter((record) => {
      const value = record[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== "" && value !== "unknown";
    }).length;
    return {
      field,
      complete,
      missing: records.length - complete,
      percent: records.length ? complete / records.length : 0,
      severity: complete / Math.max(records.length, 1) >= 0.9 ? "good" : complete / Math.max(records.length, 1) >= 0.65 ? "warn" : "risk"
    };
  });
}

export function findDuplicateCompanies(records) {
  const grouped = new Map();
  for (const record of records) {
    const key = record.companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  }
  return [...grouped.values()].filter((group) => group.length > 1);
}

export function getCoverageBySeason(records) {
  const grouped = new Map();
  for (const record of records) {
    const season = record.season ?? "Unknown";
    grouped.set(season, (grouped.get(season) ?? 0) + 1);
  }
  return [...grouped.entries()].map(([season, count]) => ({ season, count })).sort((a, b) => Number(a.season) - Number(b.season));
}

export function getQualityReport(records) {
  const completeness = getFieldCompleteness(records);
  const duplicates = findDuplicateCompanies(records);
  const missingRevenue = records.filter((record) => record.revenueAmount === null || record.revenueAmount === undefined).length;
  const missingInvestors = records.filter((record) => record.dealStatus === "deal" && record.investors.length === 0).length;
  const missingSources = records.filter((record) => !record.sourceUrl).length;
  const completenessScore = completeness.reduce((sum, field) => sum + field.percent, 0) / Math.max(completeness.length, 1);
  const consistencyPenalty = Math.min(0.25, (duplicates.length + missingInvestors) / Math.max(records.length, 1));
  const sourcePenalty = Math.min(0.15, missingSources / Math.max(records.length, 1));
  const revenuePenalty = Math.min(0.15, missingRevenue / Math.max(records.length, 1));
  const overallScore = Math.round(100 * Math.max(0, completenessScore - consistencyPenalty - sourcePenalty - revenuePenalty));
  return {
    overallScore,
    completeness,
    duplicates,
    seasonCoverage: getCoverageBySeason(records),
    revenueQuality: {
      missing: missingRevenue,
      zeroOrNegative: records.filter((record) => typeof record.revenueAmount === "number" && record.revenueAmount <= 0).length
    },
    investorQuality: {
      missingDealInvestors: missingInvestors
    },
    sourceQuality: {
      missing: missingSources
    }
  };
}
