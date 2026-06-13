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
| Data quality score | 30/100 |
| Unknown deal status | 64 |
| Deal rows missing investors | 708 |
| Unknown business status | 1238 |
| Missing parsed revenue | 1268 |
| Missing description | 439 |
| Unclassified industry | 641 |
| Likely boilerplate/import-name artifacts | 0 |
| Research queue items | 1327 |
| Priority 1 queue items | 76 |

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
| s17e1-doublesoul | 17 | 1 | Doublesoul | businessStatus | https://www.sharktankblog.com/business/doublesoul/ |
| s17e1-z-coil | 17 | 1 | Z-Coil | revenue | https://www.sharktankblog.com/business/z-coil/ |
| s17e2-impeccable-chicken | 17 | 2 | Impeccable Chicken | revenue | https://www.sharktankblog.com/business/impeccable-chicken/ |
| s17e4-retrievair | 17 | 4 | RetrievAir | businessStatus | https://www.sharktankblog.com/business/retrievair/ |
| s17e6-shalom-japan | 17 | 6 | Shalom Japan | businessStatus, revenue | https://www.sharktankblog.com/business/shalom-japan/ |
| s17e9-cabana-boys | 17 | 9 | Cabana Boys | businessStatus | https://www.sharktankblog.com/business/cabana-boys/ |
| s17e10-left-field | 17 | 10 | Left Field | businessStatus, revenue | https://www.sharktankblog.com/business/left-field/ |
| s17e11-somnia | 17 | 11 | Somnia+ | revenue | https://www.sharktankblog.com/business/somnia/ |
| s17e17-hibertec | 17 | 17 | HiberTec | revenue | https://www.sharktankblog.com/business/hibertec/ |
| s17e18-parrot-finance | 17 | 18 | Parrot Finance | revenue | https://www.sharktankblog.com/business/parrot-finance/ |
| s16e1-little-saints | 16 | 1 | Little Saints | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/little-saints/ |
| s16e1-trufit-customs | 16 | 1 | TruFit Customs | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/trufit-customs/ |
| s16e1-1587-sneakers | 16 | 1 | 1587 Sneakers | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/1587-sneakers/ |
| s16e1-card-io | 16 | 1 | Card.io | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/card-io/ |
| s16e2-top-sail-steamer | 16 | 2 | Top Sail Steamer | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/topsail-steamer/ |
| s16e2-life-raft-treats | 16 | 2 | Life Raft Treats | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/life-raft-treats/ |
| s16e2-bucketgolf | 16 | 2 | BucketGolf | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/bucketgolf/ |
| s16e2-rigstrips | 16 | 2 | RigStrips | dealStatus, businessStatus, revenue, description, industry | https://sharktankblog.com/business/rigstrips/ |
| s16e3-yardsale | 16 | 3 | Yardsale | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/yardsale/ |
| s16e3-kobee-s-co | 16 | 3 | Kobee’s Co. | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/kobees/ |
| s16e3-sugardoh | 16 | 3 | Sugardoh | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/sugardoh/ |
| s16e3-doatnut | 16 | 3 | Doatnut | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/doatnut/ |
| s16e4-finneato-fysh-foods | 16 | 4 | Finneato Fysh Foods | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/finneato-fysh-foods/ |
| s16e4-terrashroom | 16 | 4 | Terrashroom | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/terrashroom/ |
| s16e4-moonies | 16 | 4 | Moonies | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/moonies/ |
| s16e4-nineteentwenty | 16 | 4 | NineteenTwenty | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/nineteentwenty/ |
| s16e5-chalkless | 16 | 5 | Chalkless | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/chalkless/ |
| s16e5-chompshop | 16 | 5 | ChompShop | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/chompshop/ |
| s16e5-y-all-sweet | 16 | 5 | Y’all Sweet | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/yall-sweet-tea/ |
| s16e5-creator-camp | 16 | 5 | Creator Camp | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/creator-camp/ |
| s16e6-pepper-pong | 16 | 6 | Pepper Pong | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/pepper-pong-shark-tank-season-16/ |
| s16e6-taverns-to-go | 16 | 6 | Taverns To Go | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/taverns-to-go-shark-tank-season-16/ |
| s16e6-kaans-designs | 16 | 6 | Kaans Designs | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/kaans-designs-shark-tank-season-16/ |
| s16e6-foam-cooler | 16 | 6 | Foam Cooler | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/foam-cooler-shark-tank-season-16/ |
| s16e7-coordinates | 16 | 7 | Coordinates | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/coordinates-shark-tank-season-16/ |
| s16e7-gnome-advent-calendar | 16 | 7 | Gnome Advent Calendar | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/gnome-advent-calendar-shark-tank-season-16/ |
| s16e7-snow-scholars | 16 | 7 | Snow Scholars | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/snow-scholars-shark-tank-season-16/ |
| s16e7-wildcoat | 16 | 7 | Wildcoat | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/wildcoat-shark-tank-season-16/ |
| s16e8-bro-glo | 16 | 8 | Bro Glo | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/bro-glo-shark-tank-season-16/ |
| s16e8-triplelite | 16 | 8 | TripleLite | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/triplelite/ |

## Queue Items by Season

| Season | Queue items |
| ---: | ---: |
| 17 | 10 |
| 16 | 66 |
| 15 | 16 |
| 14 | 87 |
| 13 | 96 |
| 12 | 99 |
| 11 | 96 |
| 10 | 92 |
| 9 | 92 |
| 8 | 91 |
| 7 | 113 |
| 6 | 108 |
| 5 | 115 |
| 4 | 103 |
| 3 | 60 |
| 2 | 36 |
| 1 | 47 |
