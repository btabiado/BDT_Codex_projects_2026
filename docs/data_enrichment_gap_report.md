# Shark Tank Data Enrichment Gap Report

Generated from the normalized workbook, supplemental records, and enrichment overrides.

## Current Gap Counts

| Metric | Count |
| --- | ---: |
| Workbook rows | 1408 |
| Supplemental rows | 140 |
| Source rows | 1548 |
| Analysis rows after artifact quarantine | 1504 |
| Quarantined import artifacts | 44 |
| Cleaned company names | 124 |
| Data quality score | 77/100 |
| Unknown deal status | 1 |
| Deal rows missing investors | 4 |
| Unknown business status | 170 |
| Missing parsed revenue | 335 |
| Missing description | 1 |
| Unclassified industry | 51 |
| Likely boilerplate/import-name artifacts | 0 |
| Research queue items | 356 |
| Priority 1 queue items | 11 |

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
| s17e17-hibertec | 17 | 17 | HiberTec | revenue | https://www.sharktankblog.com/business/hibertec/ |
| s17e18-parrot-finance | 17 | 18 | Parrot Finance | revenue | https://www.sharktankblog.com/business/parrot-finance/ |
| s16e1-card-io | 16 | 1 | Card.io | revenue | https://www.sharktankblog.com/business/card-io/ |
| s16e5-y-all-sweet | 16 | 5 | Y’all Sweet | dealStatus, businessStatus, revenue, description, industry | https://www.sharktankblog.com/business/yall-sweet-tea/ |
| s16e7-coordinates | 16 | 7 | Coordinates | revenue | https://www.sharktankblog.com/business/coordinates-shark-tank-season-16/ |
| s16e10-tabeeze | 16 | 10 | Tabeeze | revenue | https://www.sharktankblog.com/business/tabeeze/ |
| s16e14-blackdot | 16 | 14 | Blackdot | revenue | https://www.sharktankblog.com/business/blackdot/ |
| s16e15-dream-park | 16 | 15 | Dream Park | revenue | https://www.sharktankblog.com/business/dream-park/ |
| s16e16-airtulip | 16 | 16 | AirTulip | revenue | https://www.sharktankblog.com/business/airtulip/ |
| s16e17-frame-your-feline | 16 | 17 | Frame Your Feline | revenue | https://www.sharktankblog.com/business/frame-your-feline/ |
| s16e18-fanion | 16 | 18 | Fanion | revenue | https://www.sharktankblog.com/business/fanion/ |
| s8e11-hand-out-gloves | 8 | 11 | Hand Out Gloves | investors | https://www.sharktankblog.com/business/handout-gloves/ |
| s7e11-piperwai | 7 | 11 | PiperWai | investors | https://www.sharktankblog.com/business/piperwai/ |
| s5e11-virtuix-omni | 5 | 11 | Virtuix Omni | investors | https://www.sharktankblog.com/business/virtuix-omni/ |
| s4e5-marz-sprays | 4 | 5 | Marz Sprays | investors | https://www.sharktankblog.com/business/marz-sprays/ |
| s15e4-monosuit | 15 | 4 | Monosuit | businessStatus | https://www.sharktankblog.com/business/monosuit/ |
| s15e8-black-paper-party | 15 | 8 | Black Paper Party | revenue | https://sharktankrecap.com/black-paper-party-update-shark-tank-season-15/ |
| s15e8-pick-up-bricks | 15 | 8 | Pick-Up Bricks | revenue | https://www.sharktankblog.com/business/pick-up-bricks/ |
| s15e9-flywithwine | 15 | 9 | FlyWithWine | revenue | https://www.sharktankblog.com/shark-tank/shark-tank-episodes/season-15-shark-tank-episodes/episode-1509/ |
| s15e11-the-duo | 15 | 11 | The Duo | revenue | https://sharktankrecap.com/the-duo-shareable-umbrella-update-shark-tank-season-15/ |
| s15e13-au-baby | 15 | 13 | AU Baby | revenue | https://sharktankinsights.com/au-baby-shark-tank-update/ |
| s15e15-dogue | 15 | 15 | Dogue | revenue | https://sharktankrecap.com/dogue-artisan-dog-food-update-shark-tank-season-15/ |
| s15e17-chefee | 15 | 17 | Chefee | revenue | https://www.sharktankblog.com/business/chefee/ |
| s15e18-overplay | 15 | 18 | Overplay | revenue | https://www.sharktankblog.com/business/overplay/ |
| s15e19-richualist | 15 | 19 | Richualist | revenue | https://www.sharktankblog.com/business/richualist/ |
| s15e21-hood | 15 | 21 | Hood | revenue | https://www.sharktankblog.com/business/hood/ |
| s14e4-woosh | 14 | 4 | Woosh | revenue | https://sharktankblog.com/business/woosh/ |
| s14e7-action-glow | 14 | 7 | Action Glow | revenue | https://www.slashgear.com/1356348/what-happened-actionglow-lights-shark-tank-season-14/ |
| s14e11-metric-mate | 14 | 11 | Metric Mate | revenue | https://sharktankblog.com/business/metric-mate/ |
| s14e13-copy-keyboard | 14 | 13 | Copy Keyboard | revenue | https://sharktankblog.com/business/copy-keyboard/ |
| s14e13-fryaway | 14 | 13 | FryAway | revenue | https://sharktankblog.com/business/fryaway/ |
| s14e15-surf-band-pro | 14 | 15 | Surf Band Pro | revenue | https://sharktankblog.com/business/surf-band-pro/ |
| s14e16-pluie | 14 | 16 | Pluie | revenue | https://sharktankblog.com/business/pluie/ |
| s14e16-woof | 14 | 16 | Woof | revenue | https://sharktankblog.com/business/woof/ |
| s14e18-happifloss | 14 | 18 | HappiFloss | revenue | https://www.sharktankblog.com/business/happi/ |
| s14e22-influncers-in-the-wild-the-game | 14 | 22 | Influncers in the Wild - The Game | revenue | https://www.sharktankblog.com/business/influencers-in-the-wild/ |
| s13e1-uprising | 13 | 1 | Uprising | revenue | https://www.sharktankblog.com/business/uprising/ |
| s13e1-lion-latch | 13 | 1 | Lion Latch | revenue | https://www.sharktankblog.com/business/lion-latch/ |
| s13e1-paskho | 13 | 1 | Paskho | revenue | https://www.sharktankblog.com/business/paskho/ |
| s13e2-muteme | 13 | 2 | MuteMe | revenue | https://www.sharktankblog.com/business/muteme/ |

## Queue Items by Season

| Season | Queue items |
| ---: | ---: |
| 17 | 2 |
| 16 | 9 |
| 15 | 11 |
| 14 | 10 |
| 13 | 12 |
| 12 | 11 |
| 11 | 22 |
| 10 | 10 |
| 9 | 11 |
| 8 | 18 |
| 7 | 17 |
| 6 | 25 |
| 5 | 36 |
| 4 | 61 |
| 3 | 37 |
| 2 | 17 |
| 1 | 47 |
