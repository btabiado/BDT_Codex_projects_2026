const INVESTOR_ALIASES = new Map([
  ["mark", "Mark Cuban"],
  ["mark cuban", "Mark Cuban"],
  ["m cuban", "Mark Cuban"],
  ["lori", "Lori Greiner"],
  ["lori greiner", "Lori Greiner"],
  ["kevin", "Kevin O'Leary"],
  ["kevin o'leary", "Kevin O'Leary"],
  ["kevin o’leary", "Kevin O'Leary"],
  ["mr wonderful", "Kevin O'Leary"],
  ["barbara", "Barbara Corcoran"],
  ["barbara corcoran", "Barbara Corcoran"],
  ["daymond", "Daymond John"],
  ["daymond john", "Daymond John"],
  ["robert", "Robert Herjavec"],
  ["robert herjavec", "Robert Herjavec"]
]);

export const MAJOR_SHARKS = [
  "Mark Cuban",
  "Lori Greiner",
  "Kevin O'Leary",
  "Barbara Corcoran",
  "Daymond John",
  "Robert Herjavec"
];

export function normalizeDealStatus(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["y", "yes", "deal", "true", "1"].includes(normalized)) return "deal";
  if (["n", "no", "no deal", "false", "0"].includes(normalized)) return "no_deal";
  return "unknown";
}

export function normalizeBusinessStatus(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["y", "yes", "active", "still in business", "true", "1"].includes(normalized) || normalized.startsWith("y ")) return "active";
  if (["n", "no", "inactive", "closed", "out of business", "false", "0"].includes(normalized) || normalized.startsWith("n ")) return "inactive";
  return "unknown";
}

export function parseRevenue(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).replace(/\u00a0/g, " ").trim();
  if (!raw || /not publicly disclosed|undisclosed|unknown|n\/a|none|tbd/i.test(raw)) return null;
  const moneyMatch = raw.match(/\$\s*(-?\d[\d,]*(?:\.\d+)?)\s*(billion|million|thousand|bn|b|m|k)?/i);
  const compactMatch = raw.match(/(?:^|[^\d$])(-?\d+(?:\.\d+)?)\s*(billion|million|bn|b|m)\b/i);
  const match = moneyMatch ?? compactMatch;
  if (!match) return null;
  const amount = Number(String(match[1]).replace(/,/g, ""));
  const suffix = String(match[2] ?? "").toLowerCase();
  const multiplier = ["b", "bn", "billion"].includes(suffix)
    ? 1_000_000_000
    : ["m", "million"].includes(suffix)
      ? 1_000_000
      : ["k", "thousand"].includes(suffix)
        ? 1_000
        : 1;
  return amount * multiplier;
}

export function standardizeInvestorName(value) {
  const key = String(value ?? "").trim().replace(/\./g, "").toLowerCase();
  return INVESTOR_ALIASES.get(key) ?? String(value ?? "").trim();
}

export function splitInvestors(value) {
  const raw = String(value ?? "").trim();
  if (!raw || /pending verification|tbd/i.test(raw)) return [];
  return raw
    .replace(/\(verbal\)/gi, "")
    .split(/,|;| and | & /i)
    .map(standardizeInvestorName)
    .filter(Boolean);
}

function firstPresent(row, fields) {
  for (const field of fields) {
    const value = row[field];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function firstUrl(value) {
  const raw = String(value ?? "").trim();
  return raw.match(/https?:\/\/[^\s|;]+/i)?.[0] ?? null;
}

function deriveIndustry(companyName, description) {
  const text = `${companyName} ${description ?? ""}`.toLowerCase();
  const rules = [
    ["Food", /\b(food|snack|sauce|coffee|tea|meal|restaurant|bakery|cake|cookie|protein|lobster|pie|oat|bagel|drink|beverage|candy|chocolate|pancake)\b/],
    ["Apparel", /\b(apparel|clothing|shirt|socks|shoe|fashion|wear|jacket|dress|bra|swim|sweater)\b/],
    ["Health", /\b(health|medicine|medical|therapy|fitness|wellness|skin|dental|sleep|baby|children|oral)\b/],
    ["Beauty", /\b(beauty|cosmetic|skincare|hair|makeup|salon|spa)\b/],
    ["Consumer Goods", /\b(home|kitchen|clean|tool|device|gadget|container|storage|sponge|bottle|accessory)\b/],
    ["Pet", /\b(pet|dog|cat|animal)\b/],
    ["Sports", /\b(sport|sports|fitness|exercise|game|outdoor|bike|golf|tailgate)\b/],
    ["Automotive", /\b(car|auto|vehicle|truck|motorcycle)\b/],
    ["Technology", /\b(app|software|online|digital|bluetooth|electronic|internet|platform|website)\b/],
    ["Education", /\b(education|school|student|learn|book|college)\b/],
    ["Services", /\b(service|subscription|delivery|marketplace|rental|franchise)\b/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] ?? "Unclassified";
}

export function makePitchId(row) {
  const season = Number.parseInt(row.Season, 10);
  const episode = Number.parseInt(row.Episode ?? row["Episode (Season)"], 10);
  const company = String(row["Company / Product"] ?? row.Company ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `s${Number.isFinite(season) ? season : "x"}e${Number.isFinite(episode) ? episode : "x"}-${company}`;
}

export function normalizeRow(row) {
  const companyName = String(row["Company / Product"] ?? row.Company ?? row.Product ?? "").trim() || "Unknown Company";
  const season = Number.parseInt(row.Season, 10);
  const episode = Number.parseInt(row.Episode ?? row["Episode (Season)"], 10);
  const revenueRaw = firstPresent(row, ["Revenue", "Total revenue (best available)"]);
  const description = firstPresent(row, ["Short Description", "Description"]);
  const sourceRaw = firstPresent(row, ["Source URL", "Source URL(s)"]);
  const industry = firstPresent(row, ["Industry"]) ?? deriveIndustry(companyName, description);
  return {
    id: makePitchId({ ...row, "Company / Product": companyName }),
    season: Number.isFinite(season) ? season : null,
    episode: Number.isFinite(episode) ? episode : null,
    airDate: row["Air Date"] || null,
    companyName,
    description: description || null,
    dealStatus: normalizeDealStatus(row["Deal? (Y/N)"] ?? row["Deal?"] ?? row.Deal),
    dealTermsRaw: row["Deal Terms"] || null,
    investors: splitInvestors(row.Investors),
    businessStatus: normalizeBusinessStatus(row["Still in Business? (Y/N)"] ?? row["Still in business today? (Y/N)"] ?? row["Still in Business"]),
    revenueRaw: revenueRaw ? String(revenueRaw).trim() : null,
    revenueAmount: parseRevenue(revenueRaw),
    revenueDate: row["Revenue Date"] || row["Revenue as-of date"] || null,
    sourceUrl: firstUrl(sourceRaw),
    sourceUrlsRaw: sourceRaw || null,
    industry
  };
}

export function normalizeRows(rows) {
  return rows.map(normalizeRow);
}
