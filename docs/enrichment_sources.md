# Enrichment Source Strategy

Use source tiers so every update has a clear evidence trail.

## Tier 1: Official Roster Sources

- ABC episode guide: https://abc.com/show/535e2b07-18a9-4d94-9803-9ed8257b9d23/episode-guide
- ABC businesses/products pages, such as Season 16 Episode 20: https://abc.com/news/c0e5b439-24ab-426b-886a-4a32db38d4d9/category/2887649
- ABC/Disney press pages for air dates, official loglines, and press photos.

Use for company names, episode mapping, air dates, official descriptions, and company links. ABC usually does not give final deal terms.

## Tier 2: Deal-Term Sources

- Shark Tank Blog episode and company pages, such as https://www.sharktankblog.com/business/bombas/ and https://www.sharktankblog.com/business/deviled-egg-co/
- Reputable recaps and interviews when Shark Tank Blog is missing or conflicts.

Use for on-air deal status, investors, ask, valuation, final handshake terms, and pitch revenue. Mark contested fields as medium confidence.

## Tier 3: Current Business Status

- Official company sites and stores.
- Active social/press pages when company site is unavailable.

Use for active/inactive status, current product availability, and post-show developments. Treat revenue claims as company-reported unless independently verified.

## Tier 4: Revenue and Post-Air Updates

- Reputable press such as Inc., Forbes, Fortune, Business Insider, CNBC, Food & Wine, local business journals, or investor/company interviews.
- Company press pages only when third-party coverage is unavailable.

Store publication date and whether the number is annual revenue, lifetime sales, forecast, valuation, units sold, or sales-at-pitch.

## Data Model Recommendation

Keep separate fields for:

- `airedDealStatus`: on-screen handshake/no-deal result.
- `postShowDealStatus`: whether the deal reportedly closed after due diligence.
- `revenueType`: annual revenue, lifetime sales, forecast, valuation, units, sales-at-pitch, or unknown.
- `sourceConfidence`: high, medium, low.

This avoids mixing show outcomes, current company performance, and investor economics into one unstable field.

## Local Workflow

- Use `Sharktank/src/data/supplementalRecords.js` for companies missing from the workbook extract.
- Use `Sharktank/src/data/enrichmentOverrides.js` for verified corrections to existing workbook rows.
- Run `node scripts/build_gap_report.mjs` after every enrichment batch.
- Run `node --test Sharktank/src/tests/*.test.js` before deploying.
