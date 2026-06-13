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
| Data quality score | 78/100 |
| Unknown deal status | 0 |
| Deal rows missing investors | 0 |
| Unknown business status | 171 |
| Missing parsed revenue | 330 |
| Missing description | 1 |
| Unclassified industry | 52 |
| Likely boilerplate/import-name artifacts | 0 |
| Research queue items | 345 |
| Priority 1 queue items | 0 |

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
| s15e4-monosuit | 15 | 4 | Monosuit | revenue | https://en.wikipedia.org/wiki/Shark_Tank_season_15 |
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
| s13e2-long-wharf | 13 | 2 | Long Wharf | revenue | https://www.sharktankblog.com/business/long-wharf-supply-company/ |
| s13e3-oathaus | 13 | 3 | OatHaus | revenue | https://www.sharktankblog.com/business/oat-haus/ |
| s13e3-flasky-flowers | 13 | 3 | Flasky Flowers | revenue | https://www.sharktankblog.com/business/flasky-flowers/ |
| s13e5-beulr | 13 | 5 | Beulr | revenue | https://www.sharktankblog.com/business/beulr/ |
| s13e8-the-real-elf | 13 | 8 | The Real Elf | revenue | https://sharktankblog.com/business/the-real-elf/ |
| s13e8-santa-s-enchanted-mailbox | 13 | 8 | Santa's Enchanted Mailbox | revenue, description, industry | https://www.sharktank-api.dev/episodes |
| s13e10-smart-tire-company | 13 | 10 | Smart Tire Company | revenue | https://sharktankblog.com/business/the-smart-tire-company/ |
| s13e18-umaro | 13 | 18 | Umaro | revenue | https://www.sharktankblog.com/business/umaro/ |
| s12e6-k9-mask | 12 | 6 | K9 Mask | revenue | https://www.sharktankblog.com/business/k9-mask/ |
| s12e9-sharks-mark-barbara-kevin-lori-daymond-electra | 12 | 9 | Electra | revenue | https://sharktankblog.com/business/electra/ |
| s12e9-his-and-her-bar | 12 | 9 | His and Her Bar | revenue | https://www.sharktankblog.com/business/his-and-her-bar/ |
| s12e10-sharks-mark-kevin-lori-barbara-alex-rodriguez-slice-of-sauce | 12 | 10 | Slice of Sauce | revenue | https://sharktankblog.com/business/slice-of-sauce/ |
| s12e11-brumachen | 12 | 11 | Brumachen | revenue | https://www.sharktankblog.com/business/brumachen/ |
| s12e12-sharks-mark-barbara-kevin-lori-daymond-yono-clip | 12 | 12 | Yono Clip | revenue | https://www.sharktankblog.com/business/yono-clip/ |
| s12e14-byoot-company | 12 | 14 | Byoot Company | revenue | https://sharktankblog.com/business/byoot-company/ |

## Queue Items by Season

| Season | Queue items |
| ---: | ---: |
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
