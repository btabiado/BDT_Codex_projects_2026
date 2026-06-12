const abc = {
  1: "https://abc.com/news/3c238079-f92e-4193-ab77-e17d78caa34b/category/2887649",
  2: "https://abc.com/news/39efee56-63a6-40a0-bfed-bd577fe2291f/category/2887649",
  3: "https://abc.com/news/42f8a3cc-29b0-4610-925d-6289a0ffc350/category/2887649",
  4: "https://abc.com/news/3cd5b6df-2cc1-4f6b-813c-fe81488b824f/category/2887649",
  5: "https://abc.com/news/a3df71d5-c066-4c11-b589-2d27d7fad2d2/category/2887649",
  6: "https://abc.com/news/116a8052-a9b5-448e-b86a-5789b9009940/category/2887649",
  7: "https://abc.com/news/ecb65312-99e2-4ea4-bf84-cfbfb4ae9488/category/2887649",
  8: "https://abc.com/news/5af50601-cffa-4e90-be5e-e175a66ef91e/category/2887649",
  9: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  10: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  11: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  12: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  13: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  14: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  15: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  16: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  17: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923",
  18: "https://abc.com/news/920582c3-2083-45bc-81c9-95e33c5a76e9/category/706923"
};

const dates = {
  1: "2025-09-24",
  2: "2025-10-01",
  3: "2025-10-08",
  4: "2025-10-22",
  5: "2025-11-05",
  6: "2025-11-12",
  7: "2025-12-10",
  8: "2026-01-07",
  9: "2026-01-14",
  10: "2026-01-21",
  11: "2026-01-28",
  12: "2026-03-04",
  13: "2026-03-11",
  14: "2026-03-18",
  15: "2026-03-25",
  16: "2026-04-08",
  17: "2026-04-15",
  18: "2026-04-22"
};

function stb(slug) {
  return `https://www.sharktankblog.com/business/${slug}/`;
}

function row({ episode, slug, name, description, deal, investors = [], terms = null, revenueRaw = null, revenueAmount = null, revenueAttributionPercent = null, industry, active = true, confidence = "high" }) {
  const sourceUrl = stb(slug);
  return {
    id: `s17e${episode}-${slug}`,
    sourceType: "supplemental",
    season: 17,
    episode,
    airDate: dates[episode],
    companyName: name,
    description,
    dealStatus: deal,
    dealTermsRaw: terms,
    investors,
    businessStatus: active ? "active" : "unknown",
    revenueRaw,
    revenueAmount,
    revenueAttributionPercent,
    revenueDate: `${dates[episode]} pitch / Season 17 research`,
    sourceUrl,
    sourceUrlsRaw: `${abc[episode]} | ${sourceUrl}`,
    industry,
    enrichmentConfidence: confidence
  };
}

export const supplementalRecords = [
  row({ episode: 1, slug: "doublesoul", name: "Doublesoul", description: "Socks brand selling mismatched and comfort-focused socks.", deal: "deal", investors: ["Kendra Scott"], terms: "$500,000 for 10% equity", revenueRaw: "$2.3M 2024 sales; $7.5M projected 2025 sales", revenueAmount: 2300000, industry: "Apparel", active: false }),
  row({ episode: 1, slug: "z-coil", name: "Z-Coil", description: "Footwear brand built around coil-spring heels.", deal: "deal", investors: ["Lori Greiner"], terms: "$250,000 for 50% equity", industry: "Apparel" }),
  row({ episode: 1, slug: "pelagion", name: "Pelagion", description: "Electric watercraft designed for recreation and mobility on the water.", deal: "no_deal", terms: "No deal; ask was $800,000 for 4% equity", investors: [], revenueRaw: "$3.5M sales over prior 5 years; $2M 2024 sales", revenueAmount: 3500000, industry: "Sports" }),
  row({ episode: 1, slug: "dad-strength-brewing", name: "Dad Strength Brewing", description: "Non-alcoholic beer brand positioned for everyday occasions.", deal: "deal", investors: ["Lori Greiner", "Robert Herjavec", "Rashaun Williams"], terms: "$300,000 for 12% total equity", revenueRaw: "$230,000 sales in 10.5 months", revenueAmount: 230000, industry: "Food" }),

  row({ episode: 2, slug: "gerty", name: "Gerty", description: "Utility product focused on portable outdoor and household convenience.", deal: "deal", investors: ["Kevin O'Leary"], terms: "$50,000 for 30% equity", revenueRaw: "About $7,000 revenue from 200 units at pitch", revenueAmount: 7000, industry: "Consumer Goods" }),
  row({ episode: 2, slug: "the-snorinator", name: "The Snorinator", description: "Anti-snoring device.", deal: "deal", investors: ["Lori Greiner", "Michael Strahan"], terms: "$100,000 for 25% equity", revenueRaw: "$325,000 2025 year-to-date sales at pitch", revenueAmount: 325000, industry: "Health" }),
  row({ episode: 2, slug: "impeccable-chicken", name: "Impeccable Chicken", description: "Chicken food product brand.", deal: "deal", investors: ["Lori Greiner", "Kevin O'Leary"], terms: "$200,000 for 15% equity", revenueRaw: "85,000 units sold in 7 months; dollar sales not verified", industry: "Food" }),
  row({ episode: 2, slug: "qb54", name: "QB54", description: "Football tailgate game built around chair targets.", deal: "no_deal", terms: "No deal; ask was $350,000 for 10% equity", investors: [], revenueRaw: "$7.5M lifetime sales; $1.6M 2024 sales", revenueAmount: 7500000, industry: "Sports" }),

  row({ episode: 3, slug: "goodegg", name: "Good Egg", description: "Home goods product for egg storage and kitchen organization.", deal: "deal", investors: ["Chip Gaines", "Joanna Gaines"], terms: "$200,000 for 20% equity", revenueRaw: "$1.1M 2024 revenue", revenueAmount: 1100000, industry: "Consumer Goods" }),
  row({ episode: 3, slug: "repaint-tray", name: "Repaint Studios", description: "Reusable painting tray system.", deal: "deal", investors: ["Barbara Corcoran", "Chip Gaines", "Joanna Gaines"], terms: "$250,000 for 15% equity", revenueRaw: "$1.3M projected 2025 sales", revenueAmount: 1300000, industry: "Consumer Goods" }),
  row({ episode: 3, slug: "pluck-seasonings", name: "Pluck", description: "Organ-meat seasoning blend.", deal: "no_deal", terms: "No deal; ask was $250,000 for 6% equity", investors: [], revenueRaw: "$300,000 2022 sales", revenueAmount: 300000, industry: "Food" }),
  row({ episode: 3, slug: "fundraiser-blankets", name: "Fundraiser Blankets", description: "Blanket company designed around school and team fundraising.", deal: "deal", investors: ["Lori Greiner", "Barbara Corcoran"], terms: "$300,000 for 10% equity", revenueRaw: "$10M projected 2025 revenue", revenueAmount: 10000000, industry: "Consumer Goods" }),

  row({ episode: 4, slug: "alchemize-fightwear", name: "Alchemize Fightwear", description: "Fightwear and athletic apparel brand.", deal: "deal", investors: ["Lori Greiner", "Alexis Ohanian", "Kendra Scott"], terms: "$300,000 for 15% equity", revenueRaw: "$1.8M lifetime sales; $500,000 2024 sales", revenueAmount: 1800000, industry: "Apparel" }),
  row({ episode: 4, slug: "the-sprouting-company", name: "The Sprouting Co.", description: "Sprouting kits and supplies for home-grown sprouts.", deal: "no_deal", terms: "No deal; ask was $500,000 for 5% equity", investors: [], revenueRaw: "$1.5M revenue at pitch", revenueAmount: 1500000, industry: "Food" }),
  row({ episode: 4, slug: "orka-bar", name: "Orka Bar", description: "Protein bar brand.", deal: "deal", investors: ["Lori Greiner"], terms: "$100,000 for 25% equity", revenueRaw: "$35,000 2025 year-to-date sales at pitch", revenueAmount: 35000, industry: "Food" }),
  row({ episode: 4, slug: "retrievair", name: "RetrievAir", description: "Pet product for safer ball retrieval and play.", deal: "deal", investors: ["Alexis Ohanian"], terms: "$776,000 for 15% equity", revenueRaw: "$550,000 ticket sales", revenueAmount: 550000, industry: "Pet", active: false, confidence: "medium" }),

  row({ episode: 5, slug: "freestyle-snacks", name: "Freestyle Snacks", description: "Olive snack brand.", deal: "deal", investors: ["Allison Ellsworth"], terms: "$300,000 for 11% equity", revenueRaw: "$2.2M 2024 sales; tracking $4M-$5M 2025 sales", revenueAmount: 2200000, industry: "Food" }),
  row({ episode: 5, slug: "the-qi-tea", name: "The Qi", description: "Whole-flower tea brand.", deal: "deal", investors: ["Daymond John"], terms: "$200,000 for 20% equity", revenueRaw: "$2.9M lifetime sales; $616,000 2024 sales", revenueAmount: 2900000, industry: "Food" }),
  row({ episode: 5, slug: "lila", name: "Lila", description: "Hands-free pumping and nursing apparel.", deal: "no_deal", terms: "No deal; ask was $200,000 for 5% equity", investors: [], revenueRaw: "About $7M sales in 2021", revenueAmount: 7000000, industry: "Apparel" }),
  row({ episode: 5, slug: "warrior-kid-medic", name: "Warrior Kid Medic", description: "Medical and first-aid education product for children.", deal: "deal", investors: ["Daymond John"], terms: "$50,000 for 20% equity", revenueRaw: "$23,000 2024 sales; $40,000 estimated 2025 sales", revenueAmount: 23000, industry: "Education" }),

  row({ episode: 6, slug: "tantos", name: "Tantos", description: "Snack food brand.", deal: "no_deal", terms: "No deal; ask was $150,000 for 10% equity", investors: [], revenueRaw: "$500,000 revenue in 12 months", revenueAmount: 500000, industry: "Food" }),
  row({ episode: 6, slug: "surf-skull", name: "Surf Skull", description: "Head protection product for surfers.", deal: "deal", investors: ["Daniel Lubetzky"], terms: "$50,000 for 20% equity", revenueRaw: "$100,000 lifetime sales", revenueAmount: 100000, industry: "Sports" }),
  row({ episode: 6, slug: "forte3d", name: "Forte 3D", description: "3D-printed performance insoles.", deal: "deal", investors: ["Lori Greiner"], terms: "$250,000 for 16% equity", revenueRaw: "$350,000 2024 sales; $500,000 projected 2025 sales", revenueAmount: 350000, industry: "Health" }),
  row({ episode: 6, slug: "shalom-japan", name: "Shalom Japan", description: "Japanese-Jewish restaurant and food concept.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$200,000 for 30% equity, contingent", industry: "Food", active: false, confidence: "medium" }),

  row({ episode: 7, slug: "bauble-stockings", name: "Bauble Stockings", description: "Heirloom Christmas stocking gift tradition.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$250,000 for 20% equity", revenueRaw: "$6.3M revenue; 300+ stores", revenueAmount: 6300000, industry: "Consumer Goods" }),
  row({ episode: 7, slug: "mcmiller", name: "McMILLER", description: "Tabletop and party game.", deal: "deal", investors: ["Daniel Lubetzky"], terms: "$200,000 for 9% equity plus $0.99 royalty", revenueRaw: "$12.5M lifetime sales; $3.2M 2024 sales", revenueAmount: 12500000, industry: "Consumer Goods" }),
  row({ episode: 7, slug: "edible-architecture", name: "Edible Architecture", description: "Decorative edible gift and kit brand.", deal: "deal", investors: ["Lori Greiner"], terms: "$150,000 for 18% equity", revenueRaw: "$123,000 2024 revenue", revenueAmount: 123000, industry: "Food" }),
  row({ episode: 7, slug: "the-christmas-carolers", name: "The Christmas Carolers", description: "Professional holiday caroling service.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$125,000 for 60% equity plus $125,000 loan", revenueRaw: "$1M+ lifetime revenue; $250,000 2024 revenue", revenueAmount: 1000000, industry: "Services" }),

  row({ episode: 8, slug: "peesport", name: "Peesport", description: "Portable outdoor urinary solution.", deal: "deal", investors: ["Kevin O'Leary"], terms: "$150,000 for 12% equity plus royalty", revenueRaw: "$500,000 2025 sales", revenueAmount: 500000, industry: "Consumer Goods" }),
  row({ episode: 8, slug: "flightpath", name: "Flightpath Golf", description: "Golf tees designed to improve ball flight.", deal: "no_deal", terms: "No deal; ask was $300,000 for 10% equity", investors: [], revenueRaw: "$11.8M lifetime sales; $4.3M 2024 sales", revenueAmount: 11800000, industry: "Sports" }),
  row({ episode: 8, slug: "nampons", name: "Nampons", description: "Nosebleed tampon product.", deal: "deal", investors: ["Robert Herjavec", "Michael Strahan"], terms: "$350,000 for 10% equity plus $0.10 royalty", revenueRaw: "$3.4M 2024 sales", revenueAmount: 3400000, industry: "Health" }),
  row({ episode: 8, slug: "liquidview", name: "Liquid View", description: "Window-like digital display service.", deal: "no_deal", terms: "No deal; ask was $250,000 for 2.5% equity", investors: [], revenueRaw: "More than $1M 2024 revenue", revenueAmount: 1000000, industry: "Technology" }),

  row({ episode: 9, slug: "bon-appesweet", name: "Bon Appesweet", description: "Sweet snack and confection brand.", deal: "deal", investors: ["Rashaun Williams", "Robert Herjavec"], terms: "$175,000 for 20% equity", revenueRaw: "$526,000 2024 sales", revenueAmount: 526000, industry: "Food" }),
  row({ episode: 9, slug: "sleepy-baby", name: "Sleepy Baby", description: "Baby sleep product.", deal: "deal", investors: ["Kendra Scott"], terms: "$70,000 for 50% equity", revenueRaw: "$21,000 revenue from 331 units", revenueAmount: 21000, industry: "Health" }),
  row({ episode: 9, slug: "makers-social", name: "Makers Social", description: "DIY craft bar and social experience.", deal: "deal", investors: ["Kevin O'Leary"], terms: "$150,000 for 20% equity", revenueRaw: "$546,000 2024 revenue", revenueAmount: 546000, industry: "Services" }),
  row({ episode: 9, slug: "cabana-boys", name: "Cabana Boys", description: "Pool and cabana hospitality service.", deal: "deal", investors: ["Kendra Scott"], terms: "$225,000 for 32% equity", revenueRaw: "$3.6M lifetime sales; $567,000 2025 sales", revenueAmount: 3600000, industry: "Services", active: false, confidence: "medium" }),

  row({ episode: 10, slug: "crowd-compass", name: "Crowd Compass", description: "People-finding device for crowded events.", deal: "deal", investors: ["Kendra Scott", "Daymond John"], terms: "$150,000 for 20% equity", revenueRaw: "$384,000 revenue in 14 months", revenueAmount: 384000, industry: "Technology" }),
  row({ episode: 10, slug: "left-field", name: "Left Field", description: "Sports-focused brand and technology concept.", deal: "deal", investors: ["Alexis Ohanian", "Kendra Scott"], terms: "$200,000 for 8% equity plus 4% advisory shares", revenueAttributionPercent: 0.12, industry: "Sports", active: false, confidence: "medium" }),
  row({ episode: 10, slug: "screen-skinz", name: "Screen Skinz", description: "Decorative screen protection and personalization product.", deal: "deal", investors: ["Alexis Ohanian", "Kevin O'Leary"], terms: "$300,000 for 15% equity plus $1 royalty until $900,000", revenueRaw: "$850,000 sales since 2022", revenueAmount: 850000, industry: "Consumer Goods" }),
  row({ episode: 10, slug: "street-fc", name: "Street FC", description: "Street soccer league and community platform.", deal: "deal", investors: ["Alexis Ohanian"], terms: "$250,000 for 3% equity plus 2% advisory shares", revenueAttributionPercent: 0.05, revenueRaw: "$1.1M 2025 sales", revenueAmount: 1100000, industry: "Sports" }),

  row({ episode: 11, slug: "somnia", name: "Somnia+", description: "Sleep and wellness product.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$100,000 for 17.5% equity", industry: "Health" }),
  row({ episode: 11, slug: "the-yes-girls", name: "The Yes Girls", description: "Marriage proposal and event-planning service.", deal: "no_deal", terms: "No deal; ask was $85,000 for 15% equity", investors: [], revenueRaw: "$374,000 2024 revenue", revenueAmount: 374000, industry: "Services" }),
  row({ episode: 11, slug: "bocceroll", name: "BocceRoll", description: "Portable bocce-style game.", deal: "deal", investors: ["Lori Greiner", "Chip Gaines", "Joanna Gaines"], terms: "$100,000 for 25% equity", revenueRaw: "$1.1M projected 2025 revenue", revenueAmount: 1100000, industry: "Consumer Goods" }),
  row({ episode: 11, slug: "boxblayde", name: "BoxBlayde", description: "Package-opening and cutting tool.", deal: "no_deal", terms: "No deal; ask was $200,000 for 5% equity", investors: [], revenueRaw: "$500,000 2024 revenue", revenueAmount: 500000, industry: "Consumer Goods" }),

  row({ episode: 12, slug: "cranel", name: "Cranel", description: "Fashion and apparel brand.", deal: "no_deal", terms: "No deal; ask was $250,000 for 7% equity", investors: [], revenueRaw: "$3.5M lifetime sales; $1.3M 2023 sales", revenueAmount: 3500000, industry: "Apparel" }),
  row({ episode: 12, slug: "the-chair-blanket", name: "The Chair Blanket", description: "Blanket product designed for chairs and outdoor seating.", deal: "deal", investors: ["Robert Herjavec"], terms: "$200,000 for 20% equity", revenueRaw: "About $400,000 pre-Shark Tank sales", revenueAmount: 400000, industry: "Consumer Goods" }),
  row({ episode: 12, slug: "brce", name: "BRCE", description: "Fashion and apparel accessory brand.", deal: "deal", investors: ["Daniel Lubetzky", "Fawn Weaver"], terms: "$300,000 for 20% equity", revenueRaw: "More than $1.6M sales by air date", revenueAmount: 1600000, industry: "Apparel" }),
  row({ episode: 12, slug: "paco-and-pepper", name: "Paco & Pepper", description: "Pet lifestyle and goods brand.", deal: "no_deal", terms: "No deal; ask was $300,000 for 5% equity", investors: [], revenueRaw: "$1.8M sales at filming; $1.1M 2024 sales", revenueAmount: 1800000, industry: "Pet" }),

  row({ episode: 13, slug: "riptie", name: "RipTie", description: "Hair tie and hair accessory product.", deal: "deal", investors: ["Lori Greiner", "Allison Ellsworth"], terms: "$250,000 for 20% equity", revenueRaw: "$2.7M prior four-year sales; $3.5M expected sales", revenueAmount: 3500000, industry: "Beauty" }),
  row({ episode: 13, slug: "hot-girl-soda", name: "Hot Girl Soda", description: "Better-for-you soda brand.", deal: "no_deal", terms: "No deal; ask was $100,000 for 10% equity", investors: [], revenueRaw: "$8,500 Amazon sales in 2.5 months", revenueAmount: 8500, industry: "Food" }),
  row({ episode: 13, slug: "clean-green-golf-balls", name: "Clean Green Golf Balls", description: "Recovered and recycled golf balls.", deal: "deal", investors: ["Kevin O'Leary", "Robert Herjavec"], terms: "$350,000 for 15% equity plus $1 royalty", revenueRaw: "$6M 2024 sales", revenueAmount: 6000000, industry: "Sports" }),
  row({ episode: 13, slug: "nude-foods-market", name: "Nude Foods Market", description: "Zero-waste grocery store concept.", deal: "deal", investors: ["Kevin O'Leary", "Robert Herjavec"], terms: "$250,000 for 20% equity", revenueRaw: "$1.8M first-store 2025 sales", revenueAmount: 1800000, industry: "Food" }),

  row({ episode: 14, slug: "remplenish", name: "REMplenish", description: "Oral-health hydration and sleep product.", deal: "deal", investors: ["Kevin O'Leary", "Daniel Lubetzky"], terms: "$400,000 for 10% equity", revenueRaw: "$3.9M pre-Shark Tank sales", revenueAmount: 3900000, industry: "Health" }),
  row({ episode: 14, slug: "beer-girl", name: "Beer Girl", description: "Beer brand.", deal: "deal", investors: ["Fawn Weaver"], terms: "$125,000 for 20% equity", revenueRaw: "$140,000 first-year revenue", revenueAmount: 140000, industry: "Food" }),
  row({ episode: 14, slug: "gob", name: "Gob", description: "Reusable or sustainability-focused consumer product.", deal: "no_deal", terms: "No deal; ask was $250,000 for 5% equity", investors: [], revenueRaw: "$40,000 sales", revenueAmount: 40000, industry: "Consumer Goods" }),
  row({ episode: 14, slug: "never-have-i-ever", name: "Never Have I Ever", description: "Party game brand.", deal: "deal", investors: ["Kevin O'Leary"], terms: "$150,000 for 10% equity plus $0.50 royalty until $450,000", revenueRaw: "$900,000 total sales", revenueAmount: 900000, industry: "Consumer Goods" }),

  row({ episode: 15, slug: "r1se", name: "R1SE", description: "Fitness and wellness center concept.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$300,000 for 15% equity plus 3-year payback", revenueRaw: "About $600,000 per year per center", revenueAmount: 600000, industry: "Health" }),
  row({ episode: 15, slug: "hang-hero", name: "Hang Hero", description: "Hanger and closet organization product.", deal: "deal", investors: ["Daymond John"], terms: "$150,000 for 25% equity", revenueRaw: "$240,000 2020 sales; $40,000 2025 sales", revenueAmount: 240000, industry: "Consumer Goods" }),
  row({ episode: 15, slug: "hele-outdoors", name: "Hele Outdoors", description: "Outdoor gear brand.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$75,000 for 12.5% equity", revenueRaw: "$465,000 sales", revenueAmount: 465000, industry: "Sports" }),
  row({ episode: 15, slug: "everything-blocks", name: "Everything Blocks", description: "Building-block toy and accessory brand.", deal: "no_deal", terms: "No deal; ask was $100,000 for 10% equity", investors: [], revenueRaw: "More than $350,000 annual sales", revenueAmount: 350000, industry: "Consumer Goods" }),

  row({ episode: 16, slug: "bloom", name: "Bloom", description: "Wellness and personal-care product.", deal: "deal", investors: ["Daniel Lubetzky"], terms: "$75,000 for 20% equity", revenueRaw: "$220,000 sales in 6 months", revenueAmount: 220000, industry: "Health" }),
  row({ episode: 16, slug: "9strap", name: "9Strap", description: "Athletic and training strap product.", deal: "deal", investors: ["Kevin O'Leary", "Rashaun Williams", "Kendra Scott", "Daniel Lubetzky"], terms: "$800,000 for 20% equity plus $2 royalty until 3x return", revenueRaw: "$1.3M sales", revenueAmount: 1300000, industry: "Sports" }),
  row({ episode: 16, slug: "hundy", name: "HUNDY!", description: "Consumer packaged goods brand.", deal: "no_deal", terms: "No deal; ask was $300,000 for 10% equity", investors: [], revenueRaw: "$300,000 sales; 350 stores", revenueAmount: 300000, industry: "Consumer Goods" }),
  row({ episode: 16, slug: "glimmer-wish", name: "Glimmer Wish", description: "Gift and celebration product brand.", deal: "deal", investors: ["Lori Greiner", "Kendra Scott"], terms: "$200,000 for 15% equity plus $1 royalty until $200,000", revenueRaw: "$1.1M 2024 sales", revenueAmount: 1100000, industry: "Consumer Goods" }),

  row({ episode: 17, slug: "hibertec", name: "HiberTec", description: "Construction and building technology concept.", deal: "deal", investors: ["Barbara Corcoran"], terms: "$1M for 20% equity plus first build contract", revenueRaw: "No prototype or preorders verified at pitch", industry: "Technology", confidence: "medium" }),
  row({ episode: 17, slug: "crowned-skin", name: "Crowned Skin", description: "Skin-care brand.", deal: "deal", investors: ["Rashaun Williams"], terms: "$500,000 for 10% equity plus $1 royalty until $1M", revenueRaw: "$3.8M annual sales; more than $10M lifetime sales", revenueAmount: 10000000, industry: "Beauty" }),
  row({ episode: 17, slug: "powersoul-cafe", name: "PowerSoul Cafe", description: "Healthy quick-service restaurant concept.", deal: "no_deal", terms: "No deal; ask was $750,000 for 5% equity", investors: [], revenueRaw: "About $600,000 sales to date", revenueAmount: 600000, industry: "Food" }),
  row({ episode: 17, slug: "stomp-athletics", name: "STOMP Athletics", description: "Athletic gear and training product.", deal: "deal", investors: ["Kevin O'Leary"], terms: "$50,000 for 15% equity", revenueRaw: "About $220,000 lifetime sales", revenueAmount: 220000, industry: "Sports" }),

  row({ episode: 18, slug: "parrot-finance", name: "Parrot Finance", description: "Personal finance app and platform.", deal: "deal", investors: ["Lori Greiner", "Rashaun Williams"], terms: "$250,000 for 6% equity including advisory shares", revenueRaw: "25,000 users and about $85M connected assets; revenue early", industry: "Technology" }),
  row({ episode: 18, slug: "packd", name: "Pack'd", description: "Bag and packing product brand.", deal: "no_deal", terms: "No deal; ask was $150,000 for 15% equity", investors: [], revenueRaw: "$61,500 prior-year sales; $41,000 year-to-date sales", revenueAmount: 61500, industry: "Consumer Goods" }),
  row({ episode: 18, slug: "dontworry-snacks", name: "DontWorry Snacks", description: "Snack food brand.", deal: "deal", investors: ["Lori Greiner"], terms: "$500,000 for 33.3% equity", revenueRaw: "$2M 2024 sales; $3.3M latest twelve-month sales", revenueAmount: 3300000, industry: "Food" }),
  row({ episode: 18, slug: "pi00a", name: "Pi00a", description: "Consumer pizza or food product brand.", deal: "deal", investors: ["Lori Greiner"], terms: "$200,000 for 12% equity", revenueRaw: "$422,000 lifetime sales; $222,000 prior-year sales", revenueAmount: 422000, industry: "Food" })
];
