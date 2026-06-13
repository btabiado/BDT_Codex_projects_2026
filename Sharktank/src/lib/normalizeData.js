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

// Deterministic keyword classifier. The workbook has no industry column, so each
// pitch is bucketed from its name + description. Rules are evaluated in order and the
// FIRST match wins, so less-ambiguous categories (Pet, Baby & Kids) are listed before
// broad catch-alls (Consumer Goods, Services). This is an MVP heuristic: it favors
// coverage over precision, so a handful of rows land in a defensible-but-imperfect bucket.
const INDUSTRY_RULES = [
  ["Baby & Kids", /\b(baby|babies|infant|toddler|newborn|diaper|nappy|stroller|nursery|pacifier|teether|teething|crib|onesie|maternity|parenting|kids|kid|children|kid's|kids')\b/],
  ["Pet", /\b(pet|pets|dog|dogs|puppy|cat|cats|kitten|canine|feline|animal|leash|aquarium|litter|veterinary|kennel)\b/],
  ["Beauty", /\b(beauty|cosmetic|cosmetics|skincare|skin care|makeup|make-up|haircare|hair care|salon|spa|nail|nails|lash|lashes|brow|lipstick|fragrance|perfume|cologne|grooming|beard|shave|shaving|razor|deodorant|moisturiz|moisturis|serum|mascara|manicure)\b/],
  ["Health", /\b(health|healthcare|medical|medicine|wellness|supplement|vitamin|nutrition|protein|therapy|therapeutic|dental|dentist|teeth|hearing|posture|brace|prosthetic|hygiene|sanitiz|mask|nasal|cbd|hemp|pain relief|recovery|immune|allergy|menstrual|feminine|diabet|first aid|mobility|sleep|snore|ergonomic|orthopedic)\b/],
  ["Food", /\b(food|snack|snacks|sauce|salsa|spice|seasoning|coffee|tea|meal|meals|restaurant|bakery|bake|cake|cookie|cookies|candy|chocolate|pie|oat|oatmeal|bagel|donut|doughnut|muffin|waffle|pancake|pizza|taco|burger|jerky|popcorn|pasta|noodle|ramen|cheese|yogurt|granola|honey|jam|jelly|pickle|hummus|syrup|vegan|keto|gluten|dessert|ice cream|gelato|smoothie|juice|drink|beverage|soda|kombucha|wine|beer|spirit|vodka|whiskey|cocktail|brew|lobster|seafood|bbq)\b/],
  ["Apparel", /\b(apparel|clothing|clothes|fashion|wear|shirt|t-shirt|tee|pant|pants|jean|jeans|legging|dress|skirt|sock|socks|shoe|shoes|sneaker|boot|sandal|footwear|jacket|coat|hoodie|sweater|sweatshirt|underwear|lingerie|\bbra\b|swimsuit|swimwear|swim|hat|cap|glove|scarf|belt|poncho|denim|garment|textile|fabric|costume|uniform)\b/],
  ["Jewelry & Accessories", /\b(jewelry|jewellery|necklace|bracelet|earring|pendant|watch|watches|handbag|purse|wallet|sunglasses|eyewear|diamond|accessory|accessories)\b/],
  ["Sports", /\b(sport|sports|fitness|gym|workout|exercise|athletic|training|yoga|pilates|running|jogging|cycling|bike|bicycle|ski|snowboard|surf|skate|skateboard|climbing|hiking|camping|fishing|hunting|golf|tennis|basketball|football|soccer|baseball|hockey|boxing|helmet|outdoor|outdoors|kayak|paddle|tailgate)\b/],
  ["Automotive", /\b(car|cars|auto|automotive|vehicle|truck|motorcycle|tire|tyre|windshield|dashboard)\b/],
  ["Technology", /\b(app|apps|software|saas|artificial intelligence|robot|robotic|drone|smart|sensor|wearable|charger|charging|headphone|earbud|earbuds|speaker|speakers|bluetooth|gadget|device|electronic|electronics|battery|technology|digital|online|internet|website|web app|platform|wifi|gps|virtual reality|augmented|3d print|printer|laptop|computer|smartphone|mobile app|tablet|streaming|cyber|cloud|blockchain|crypto)\b/],
  ["Toys & Games", /\b(toy|toys|game|games|puzzle|plush|doll|board game|playset|hobby|card game|gaming)\b/],
  ["Education", /\b(education|educational|school|learning|\blearn\b|teach|tutor|tutoring|course|college|university|student|stem|literacy|homework|curriculum|flashcard|flash card|memoriz|book|books|library)\b/],
  ["Travel", /\b(travel|luggage|suitcase|backpack|carry-on|passport|tourism|vacation|hotel|airline|flight)\b/],
  ["Entertainment", /\b(music|musician|film|movie|video|podcast|media|entertainment|photography|theater|theatre|concert)\b/],
  ["Consumer Goods", /\b(home|kitchen|kitchenware|cookware|household|furniture|mattress|bedding|pillow|blanket|towel|cleaning|clean|cleaner|detergent|laundry|organizer|organization|storage|container|decor|candle|garden|gardening|lawn|patio|tool|tools|hardware|appliance|\bmug\b|\bcup\b|bottle|jar|utensil|vacuum|lighting|lamp|clock|sponge|broom|trash|fridge|refrigerator|gadget)\b/],
  ["Services", /\b(service|services|subscription|subscribe|delivery|deliver|marketplace|rental|\brent\b|franchise|booking|staffing|consulting|insurance|on-demand|membership)\b/]
];

function deriveIndustry(companyName, description) {
  const text = `${companyName} ${description ?? ""}`.toLowerCase();
  return INDUSTRY_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "Unclassified";
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
