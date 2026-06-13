# Shark Tank Data Enrichment Gap Report

Generated from the normalized workbook, supplemental records, and enrichment overrides.

## Current Gap Counts

| Metric | Count |
| --- | ---: |
| Workbook rows | 1408 |
| Supplemental rows | 72 |
| Source rows | 1480 |
| Analysis rows after artifact quarantine | 1436 |
| Quarantined import artifacts | 44 |
| Cleaned company names | 124 |
| Data quality score | 61/100 |
| Unknown deal status | 1 |
| Deal rows missing investors | 218 |
| Unknown business status | 170 |
| Missing parsed revenue | 327 |
| Missing description | 1 |
| Unclassified industry | 51 |
| Likely boilerplate/import-name artifacts | 0 |
| Research queue items | 531 |
| Priority 1 queue items | 57 |

## Research Priority Rules

1. Season 17, Season 16 missing deal/investor/revenue rows, and obvious import artifacts.
2. Historical deal rows missing investor names.
3. Missing revenue or active/inactive business status.
4. Lower-impact description/industry gaps.

## Recommended Source Order

1. Official ABC episode/business pages for official roster, air date, company names, descriptions, and company URLs.
2. Shark Tank Blog company pages for broad deal outcome, investor, ask, and sales-at-pitch fields.
3. Company websites for active/inactive status and product availability.
4. Reputable press/interviews for recent revenue, distribution, post-air status, and whether on-air deals closed.
5. Video clips or recap transcripts to verify contested deal terms.

## Priority 1 Examples

| ID | Season | Episode | Company | Missing fields | Current source |
| --- | ---: | ---: | --- | --- | --- |
| s17e2-impeccable-chicken | 17 | 2 | Impeccable Chicken | revenue | https://www.sharktankblog.com/business/impeccable-chicken/ |
| s17e10-left-field | 17 | 10 | Left Field | revenue | https://www.sharktankblog.com/business/left-field/ |
| s17e17-hibertec | 17 | 17 | HiberTec | revenue | https://www.sharktankblog.com/business/hibertec/ |
| s17e18-parrot-finance | 17 | 18 | Parrot Finance | revenue | https://www.sharktankblog.com/business/parrot-finance/ |
| s16e1-trufit-customs | 16 | 1 | TruFit Customs | investors | https://www.sharktankblog.com/business/trufit-customs/ |
| s16e1-card-io | 16 | 1 | Card.io | investors, revenue | https://www.sharktankblog.com/business/card-io/ |
| s16e2-top-sail-steamer | 16 | 2 | Top Sail Steamer | investors | https://www.sharktankblog.com/business/topsail-steamer/ |
| s16e2-bucketgolf | 16 | 2 | BucketGolf | investors | https://www.sharktankblog.com/business/bucketgolf/ |
| s16e2-rigstrips | 16 | 2 | RigStrips | investors | https://sharktankblog.com/business/rigstrips/ |
| s16e3-yardsale | 16 | 3 | Yardsale | investors | https://www.sharktankblog.com/business/yardsale/ |
| s16e3-doatnut | 16 | 3 | Doatnut | investors | https://www.sharktankblog.com/doatnut/ |
| s16e4-finneato-fysh-foods | 16 | 4 | Finneato Fysh Foods | investors | https://www.sharktankblog.com/business/finneato-fysh-foods/ |
| s16e4-nineteentwenty | 16 | 4 | NineteenTwenty | investors | https://www.sharktankblog.com/nineteentwenty/ |
| s16e5-chalkless | 16 | 5 | Chalkless | investors | https://www.sharktankblog.com/business/chalkless/ |
| s16e5-chompshop | 16 | 5 | ChompShop | investors | https://www.sharktankblog.com/business/chompshop/ |
| s16e5-y-all-sweet | 16 | 5 | Y’all Sweet | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/yall-sweet-tea/ |
| s16e5-creator-camp | 16 | 5 | Creator Camp | investors | https://www.sharktankblog.com/business/creator-camp/ |
| s16e6-pepper-pong | 16 | 6 | Pepper Pong | investors | https://www.sharktankblog.com/business/pepper-pong-shark-tank-season-16/ |
| s16e6-taverns-to-go | 16 | 6 | Taverns To Go | investors | https://www.sharktankblog.com/business/taverns-to-go-shark-tank-season-16/ |
| s16e6-kaans-designs | 16 | 6 | Kaans Designs | investors | https://www.sharktankblog.com/business/kaans-designs-shark-tank-season-16/ |
| s16e6-foam-cooler | 16 | 6 | Foam Cooler | investors | https://www.sharktankblog.com/business/foam-cooler-shark-tank-season-16/ |
| s16e7-coordinates | 16 | 7 | Coordinates | investors, revenue | https://www.sharktankblog.com/business/coordinates-shark-tank-season-16/ |
| s16e7-snow-scholars | 16 | 7 | Snow Scholars | investors | https://www.sharktankblog.com/business/snow-scholars-shark-tank-season-16/ |
| s16e7-wildcoat | 16 | 7 | Wildcoat | investors | https://www.sharktankblog.com/business/wildcoat-shark-tank-season-16/ |
| s16e8-bro-glo | 16 | 8 | Bro Glo | investors | https://www.sharktankblog.com/business/bro-glo-shark-tank-season-16/ |
| s16e8-triplelite | 16 | 8 | TripleLite | investors | https://www.sharktankblog.com/business/triplelite/ |
| s16e8-pholicious | 16 | 8 | PhoLicious | investors | https://www.sharktankblog.com/business/pholicious/ |
| s16e9-petite-keep | 16 | 9 | Petite Keep | investors | https://www.sharktankblog.com/business/petite-keep/ |
| s16e9-legit-kits | 16 | 9 | Legit Kits | investors | https://www.sharktankblog.com/business/legit-kits/ |
| s16e9-onewith | 16 | 9 | Onewith | investors | https://www.sharktankblog.com/business/onewith/ |
| s16e9-toughcutie | 16 | 9 | ToughCutie | investors | https://www.sharktankblog.com/business/toughcutie/ |
| s16e10-nameberry | 16 | 10 | Nameberry | investors | https://www.sharktankblog.com/business/nameberry/ |
| s16e10-rinseroo | 16 | 10 | Rinseroo | investors | https://www.sharktankblog.com/business/rinseroo/ |
| s16e10-tabeeze | 16 | 10 | Tabeeze | investors, revenue | https://www.sharktankblog.com/business/tabeeze/ |
| s16e11-flamingo | 16 | 11 | FlaminGo | investors | https://www.sharktankblog.com/business/flamingo/ |
| s16e11-lectec | 16 | 11 | Lectec | investors | https://www.sharktankblog.com/business/lectec/ |
| s16e11-bumpeez | 16 | 11 | Bumpeez | investors | https://www.sharktankblog.com/business/bumpeez/ |
| s16e12-kiid-coffee | 16 | 12 | Kiid Coffee | investors | https://www.sharktankblog.com/business/kiid-coffee/ |
| s16e12-goodlove-foods | 16 | 12 | GoodLove Foods | investors | https://www.sharktankblog.com/business/goodlove-foods/ |
| s16e12-remento | 16 | 12 | Remento | investors | https://www.sharktankblog.com/business/remento/ |

## Queue Items by Season

| Season | Queue items |
| ---: | ---: |
| 17 | 4 |
| 16 | 53 |
| 15 | 1 |
| 14 | 15 |
| 13 | 18 |
| 12 | 29 |
| 11 | 37 |
| 10 | 23 |
| 9 | 28 |
| 8 | 28 |
| 7 | 42 |
| 6 | 30 |
| 5 | 45 |
| 4 | 69 |
| 3 | 39 |
| 2 | 23 |
| 1 | 47 |
