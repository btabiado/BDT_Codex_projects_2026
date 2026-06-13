import { rawMasterRows } from "./data/rawMasterData.js";
import { enrichmentOverrides } from "./data/enrichmentOverrides.js";
import { supplementalRecords } from "./data/supplementalRecords.js";
import { applyEnrichmentOverrides } from "./lib/enrichment.js";
import { applyDataCurations, getAnalysisRecords } from "./lib/curateData.js";
import { normalizeRows, MAJOR_SHARKS } from "./lib/normalizeData.js";
import { getGlobalMetrics, getSharkMetrics, getTopCompanies, getIndustryMetrics, getSeasonMetrics, getEpisodeCoverage } from "./lib/metrics.js";
import { getQualityReport } from "./lib/qualityChecks.js";
import { formatCurrency, formatNumber, formatPercent } from "./lib/formatters.js";

const curatedRecords = applyEnrichmentOverrides(applyDataCurations([...normalizeRows(rawMasterRows), ...supplementalRecords]), enrichmentOverrides);
const records = getAnalysisRecords(curatedRecords);
const excludedArtifacts = curatedRecords.length - records.length;
let state = {
  route: "command",
  search: "",
  season: "all",
  shark: "all",
  dealStatus: "all",
  businessStatus: "all",
  industry: "all",
  sort: "alphaScore",
  tsortKey: "",
  tsortDir: "desc",
  page: 1,
  pageSize: 100
};

const app = document.querySelector("#app");
let lastDrawerTrigger = null;

// Deep-link state. The active route plus any non-default filters are mirrored into the
// URL hash (e.g. #/companies?shark=Mark%20Cuban&season=5) so a view can be shared or
// survive a refresh. writeHash uses replaceState, so it never re-fires hashchange.
const HASH_FILTER_KEYS = ["search", "season", "shark", "dealStatus", "businessStatus", "industry"];

function writeHash() {
  const params = new URLSearchParams();
  for (const key of HASH_FILTER_KEYS) {
    const value = state[key];
    if (value && value !== "all") params.set(key, value);
  }
  if (state.sort !== "alphaScore") params.set("sort", state.sort);
  if (state.tsortKey) params.set("ts", `${state.tsortKey}:${state.tsortDir}`);
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  const hash = `#/${state.route}${query ? `?${query}` : ""}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function readHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  if (!raw) return;
  const [routePart, queryPart = ""] = raw.split("?");
  if (ROUTES.some(([id]) => id === routePart)) state.route = routePart;
  const params = new URLSearchParams(queryPart);
  for (const key of [...HASH_FILTER_KEYS, "sort"]) {
    if (params.has(key)) state[key] = params.get(key);
  }
  if (params.has("ts")) {
    const [tk, td] = params.get("ts").split(":");
    state.tsortKey = tk || "";
    state.tsortDir = td === "asc" ? "asc" : "desc";
  }
  const page = Number.parseInt(params.get("page"), 10);
  state.page = Number.isFinite(page) && page > 0 ? page : 1;
}

// ---- Sortable tables -------------------------------------------------------
// A table declares its sortable columns; clicking a header sets state.tsortKey/Dir.
// applyTableSort only acts when the active key belongs to the current table, so a
// sort set on one tab harmlessly falls back to the page's natural order elsewhere.
const SORT_LABELS = {
  companyName: "Company", season: "Season", dealStatus: "Deal", businessStatus: "Status",
  revenueAmount: "Revenue", totalPitches: "Pitches", totalDeals: "Deals", dealRate: "Deal Rate",
  survivalRate: "Survival", totalRevenue: "Revenue", industry: "Industry"
};

function announce(message) {
  const node = document.getElementById("liveStatus");
  if (node) node.textContent = message;
}

function sortableTh(label, key, { num = false } = {}) {
  const active = state.tsortKey === key;
  const ariaSort = active ? (state.tsortDir === "asc" ? "ascending" : "descending") : "none";
  const indicator = active ? ` <span class="sort-ind" aria-hidden="true">${state.tsortDir === "asc" ? "↑" : "↓"}</span>` : "";
  const nextDir = active && state.tsortDir === "desc" ? "ascending" : "descending";
  // A native <button> inside the columnheader: keeps the th's aria-sort semantics
  // while exposing a real, keyboard-operable control (WCAG 4.1.2). No tabindex/keydown
  // shim needed — the button activates on Enter/Space natively.
  return `<th scope="col" class="sortable${num ? " num" : ""}" aria-sort="${ariaSort}"><button type="button" class="th-sort" data-sortkey="${html(key)}" aria-label="Sort by ${html(label)}, ${nextDir}">${html(label)}${indicator}</button></th>`;
}

function applyTableSort(rows, validKeys) {
  const key = state.tsortKey;
  if (!key || !validKeys.includes(key)) return rows;
  const dir = state.tsortDir === "asc" ? 1 : -1;
  return rows.slice().sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const aNull = av === null || av === undefined;
    const bNull = bv === null || bv === undefined;
    if (aNull && bNull) return 0;
    if (aNull) return 1; // nulls always last
    if (bNull) return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function html(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function filteredRecords() {
  const term = state.search.trim().toLowerCase();
  return records.filter((record) => {
    const matchesSearch = !term || [record.companyName, record.description, record.industry, record.investors.join(" ")].join(" ").toLowerCase().includes(term);
    const matchesSeason = state.season === "all" || String(record.season) === state.season;
    const matchesShark = state.shark === "all" || record.investors.includes(state.shark);
    const matchesDeal = state.dealStatus === "all" || record.dealStatus === state.dealStatus;
    const matchesBusiness = state.businessStatus === "all" || record.businessStatus === state.businessStatus;
    const matchesIndustry = state.industry === "all" || record.industry === state.industry;
    return matchesSearch && matchesSeason && matchesShark && matchesDeal && matchesBusiness && matchesIndustry;
  });
}

const ROUTES = [
  ["command", "Command"],
  ["sharks", "Sharks"],
  ["companies", "Companies"],
  ["seasons", "Seasons"],
  ["quality", "Quality"],
  ["hall", "Hall of Fame"],
  ["misses", "Misses"],
  ["industries", "Industries"]
];

function nav() {
  return `<nav class="nav" aria-label="Dashboard sections">${ROUTES.map(([id, label]) => `<button class="${state.route === id ? "active" : ""}" data-route="${id}"${state.route === id ? ' aria-current="page"' : ""}>${label}</button>`).join("")}</nav>`;
}

function filterBar() {
  const seasons = unique(records.map((record) => record.season));
  const industries = unique(records.map((record) => record.industry));
  return `
    <section class="filters" aria-label="Dashboard filters">
      <label>Search <input data-filter="search" value="${html(state.search)}" placeholder="Company, shark, industry"></label>
      <label>Season <select data-filter="season"><option value="all">All</option>${seasons.map((season) => option(season, state.season)).join("")}</select></label>
      <label>Shark <select data-filter="shark"><option value="all">All</option>${MAJOR_SHARKS.map((shark) => option(shark, state.shark)).join("")}</select></label>
      <label>Deal <select data-filter="dealStatus"><option value="all">All</option>${option("deal", state.dealStatus, "Deal")}${option("no_deal", state.dealStatus, "No Deal")}${option("unknown", state.dealStatus, "Unknown")}</select></label>
      <label>Status <select data-filter="businessStatus"><option value="all">All</option>${option("active", state.businessStatus, "Active")}${option("inactive", state.businessStatus, "Inactive")}${option("unknown", state.businessStatus, "Unknown")}</select></label>
      <label>Industry <select data-filter="industry"><option value="all">All</option>${industries.map((industry) => option(industry, state.industry)).join("")}</select></label>
    </section>`;
}

function option(value, selected, label = value) {
  return `<option value="${html(value)}" ${String(value) === String(selected) ? "selected" : ""}>${html(label)}</option>`;
}

function copyLink() {
  return `<button class="copylink" type="button" data-copylink title="Copy a shareable link to this exact view">Copy link</button>`;
}

const FILTER_LABELS = { search: "Search", season: "Season", shark: "Shark", dealStatus: "Deal", businessStatus: "Status", industry: "Industry" };

function activeChips() {
  const active = HASH_FILTER_KEYS.filter((key) => state[key] && state[key] !== "all" && state[key] !== "");
  if (!active.length) return "";
  const chips = active
    .map((key) => {
      const value = key === "dealStatus" || key === "businessStatus" ? String(state[key]).replace("_", " ") : state[key];
      return `<button class="chip" type="button" data-clearfilter="${html(key)}" aria-label="Remove ${html(FILTER_LABELS[key])} filter ${html(value)}">${html(FILTER_LABELS[key])}: ${html(value)} <span class="x" aria-hidden="true">×</span></button>`;
    })
    .join("");
  return `<section class="chips" aria-label="Active filters"><span class="chips-label">Filters</span>${chips}<button class="chip chip-clear" type="button" data-clearall>Clear all</button></section>`;
}

function globalCards(rows) {
  const metrics = getGlobalMetrics(rows);
  const quality = getQualityReport(rows);
  const cards = [
    ["Total Pitches", formatNumber(metrics.totalPitches), "One row equals one company pitch."],
    ["Total Deals", formatNumber(metrics.totalDeals), "Records normalized to deal status."],
    ["Deal Rate", formatPercent(metrics.dealRate), "Total deals divided by total pitches."],
    ["Total Revenue", formatCurrency(metrics.totalRevenue), "Sum of parsed revenue values."],
    ["Survival Rate", formatPercent(metrics.survivalRate), `Active among companies with a known status (${formatNumber(metrics.activeBusinesses)} active of ${formatNumber(metrics.knownBusinesses)} known; status unverified for the rest).`],
    ["Data Quality", `${quality.overallScore}/100`, "Completeness less consistency, source, and revenue penalties."]
  ];
  return `<section class="kpi-grid">${cards.map(([label, value, tip]) => `<article class="metric-card" title="${tip}"><span>${label}</span><strong>${value}</strong></article>`).join("")}</section>`;
}

function sharkCards(rows) {
  const metrics = getSharkMetrics(rows);
  const sorted = metrics.slice().sort((a, b) => {
    if (state.sort === "totalRevenue") return b.totalRevenue - a.totalRevenue;
    if (state.sort === "survivalRate") return (b.survivalRate ?? -1) - (a.survivalRate ?? -1);
    if (state.sort === "totalDeals") return b.totalDeals - a.totalDeals;
    if (state.sort === "closeRatio") return (b.closeRatio ?? -1) - (a.closeRatio ?? -1);
    return b.alphaScore - a.alphaScore;
  });
  return `
    <div class="section-heading"><h2>Shark KPI Cards</h2><select data-filter="sort" aria-label="Sort shark cards">${option("alphaScore", state.sort, "Alpha Score")}${option("closeRatio", state.sort, "Close Rate")}${option("totalRevenue", state.sort, "Revenue")}${option("survivalRate", state.sort, "Survival")}${option("totalDeals", state.sort, "Deal Count")}</select></div>
    <section class="shark-grid">
      ${sorted.map((metric, index) => `
        <article class="shark-card" data-shark="${html(metric.sharkName)}" role="button" tabindex="0" aria-label="Show companies ${html(metric.sharkName)} invested in" title="Alpha Score = revenue 40%, survival 30%, deal success 20%, deal volume 10%">
          <div class="avatar">${html(metric.sharkName.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>
          <div><span class="rank">#${index + 1}</span><h3>${html(metric.sharkName)}</h3></div>
          <strong>${metric.alphaScore}</strong>
          <dl>
            <div><dt>Deals</dt><dd>${metric.totalDeals}</dd></div>
            <div title="${metric.verifiedClosed} of ${metric.verifiedDeals} verified on-air deals closed (${metric.notClosedDeals} fell through); closure research preliminary"><dt>Close Rate</dt><dd>${metric.verifiedDeals ? `${formatPercent(metric.closeRatio)} <small>n=${metric.verifiedDeals}</small>` : "—"}</dd></div>
            <div><dt>Survival</dt><dd>${formatPercent(metric.survivalRate)}</dd></div>
            <div><dt>Scored Revenue</dt><dd>${formatCurrency(metric.totalRevenue)}</dd></div>
            <div><dt>Attributed Scored Revenue</dt><dd>${formatCurrency(metric.attributedRevenue)}</dd></div>
            <div><dt>Largest Scored Company</dt><dd>${html(metric.largestWinner ?? "N/A")}</dd></div>
            <div><dt>Favorite Industry</dt><dd>${html(metric.favoriteIndustry ?? "N/A")}</dd></div>
          </dl>
          <span class="badge ${metric.dataConfidence}">${metric.dataConfidence} confidence</span>
        </article>`).join("")}
    </section>`;
}

function leaderboard(rows) {
  const metrics = getSharkMetrics(rows);
  return `<section class="panel"><h2>Shark Alpha Leaderboard</h2><p class="muted">Alpha Score uses scored Shark investments only. <strong>Close Rate</strong> = share of <em>verified</em> on-air handshake deals that actually closed after due diligence — computed over the deals whose post-show outcome has been researched (the "Verified / On-Air" column), so it is not skewed by research coverage. Closure research is preliminary (~125 of 662 deals so far), so read it as directional alongside the sample size. Bombas remains in the database but is excluded from Daymond scoring so company-level sales are not treated as Daymond-owned revenue.</p><table><thead><tr><th>Rank</th><th>Shark</th><th class="num">Alpha</th><th class="num">Close Rate</th><th class="num">Verified / On-Air</th><th class="num">Attributed Scored Revenue</th><th class="num">Scored Revenue</th><th class="num">Survival</th></tr></thead><tbody>${metrics.map((metric, index) => `<tr><td class="num">${index + 1}</td><td>${html(metric.sharkName)}</td><td class="num">${metric.alphaScore}</td><td class="num" title="${metric.verifiedClosed} of ${metric.verifiedDeals} verified deals closed; ${metric.notClosedDeals} fell through">${metric.verifiedDeals ? formatPercent(metric.closeRatio) : "—"}</td><td class="num">${metric.verifiedDeals} / ${metric.onAirDeals}</td><td class="num">${formatCurrency(metric.attributedRevenue)}</td><td class="num">${formatCurrency(metric.totalRevenue)}</td><td class="num">${formatPercent(metric.survivalRate)}</td></tr>`).join("")}</tbody></table></section>`;
}

function commandPage(rows) {
  return `
    <header class="hero"><p>Investor Intelligence</p><h1>Shark Tank Intelligence Platform</h1><span>Who is the best Shark, and what patterns drive success?</span></header>
    ${globalCards(rows)}
    ${leaderboard(rows)}
    ${sharkCards(rows)}
    <section class="split">
      <div class="panel"><h2>Top Investment Draft Board</h2>${companyList(getTopCompanies(rows, { limit: 10 }))}</div>
      <div class="panel"><h2>Biggest Misses Preview</h2>${companyList(getTopCompanies(rows, { limit: 6, dealStatus: "no_deal" }))}</div>
    </section>
    <section class="insights">${insights(rows).map((item) => `<article><span>${html(item.metric)}</span><h3>${html(item.title)}</h3><p>${html(item.body)}</p></article>`).join("")}</section>`;
}

function insights(rows) {
  const topShark = getSharkMetrics(rows)[0];
  const topNoDeal = getTopCompanies(rows, { limit: 1, dealStatus: "no_deal" })[0];
  const global = getGlobalMetrics(rows);
  return [
    { metric: `${topShark.alphaScore}`, title: `${topShark.sharkName} leads Alpha Score`, body: `The current formula rewards revenue, survival, success signals, and deal volume.` },
    { metric: formatCurrency(topNoDeal?.revenueAmount), title: "No-deal outcomes matter", body: `${topNoDeal?.companyName ?? "A no-deal company"} shows why misses deserve their own ranking.` },
    { metric: formatPercent(global.dealRate), title: "Deal rate sets the funnel baseline", body: "Every Shark comparison should be read against the overall pitch-to-deal conversion rate." }
  ];
}

function companyList(rows) {
  if (!rows.length) return `<p class="empty">No companies match the current filters.</p>`;
  return `<ol class="company-list">${rows.map((record) => `<li><span>${html(record.companyName)}</span><strong>${formatCurrency(record.revenueAmount)}</strong><em>${html(record.industry ?? "Unclassified")}</em></li>`).join("")}</ol>`;
}

function companiesPage(rows) {
  const sorted = applyTableSort(rows, ["companyName", "season", "dealStatus", "businessStatus", "revenueAmount"]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / state.pageSize));
  const page = Math.min(state.page, totalPages);
  const start = (page - 1) * state.pageSize;
  const visibleRows = sorted.slice(start, start + state.pageSize);
  const maxRev = Math.max(1, ...rows.map((record) => record.revenueAmount || 0));
  return `<section class="panel"><div class="table-head"><div><h1>Company Explorer</h1><p class="muted">${rows.length} companies match the current filters. Showing ${visibleRows.length ? start + 1 : 0}-${Math.min(start + visibleRows.length, sorted.length)}.</p></div><div class="pager">${copyLink()}<button data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>Previous</button><span>Page ${page} of ${totalPages}</span><button data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""}>Next</button></div></div><table><caption class="sr-only">Companies matching the current filters, sortable by column.</caption><thead><tr>${sortableTh("Company", "companyName")}${sortableTh("Season", "season")}${sortableTh("Deal", "dealStatus")}<th scope="col">Investors</th>${sortableTh("Status", "businessStatus")}${sortableTh("Revenue", "revenueAmount", { num: true })}<th scope="col">Source</th></tr></thead><tbody>${visibleRows.map((record) => {
    const revPct = record.revenueAmount ? Math.round((record.revenueAmount / maxRev) * 100) : 0;
    const revCell = record.revenueAmount
      ? `<td class="num cellbar"><span class="cellbar-fill" style="--w:${revPct}%"></span><b>${formatCurrency(record.revenueAmount)}</b></td>`
      : `<td class="num">${formatCurrency(record.revenueAmount)}</td>`;
    return `<tr class="company-row" data-company="${html(record.id)}"><td><button class="linklike" data-company="${html(record.id)}">${html(record.companyName)}</button><small>${html(record.description ?? "")}</small></td><td>S${record.season ?? "?"} E${record.episode ?? "?"}</td><td>${html(record.dealStatus.replace("_", " "))}</td><td>${html(record.investors.join(", ") || "N/A")}</td><td>${html(record.businessStatus)}</td>${revCell}<td>${record.sourceUrl ? `<a href="${html(record.sourceUrl)}" target="_blank" rel="noreferrer">Open</a>` : "N/A"}</td></tr>`;
  }).join("")}</tbody></table></section><div id="drawer"></div>`;
}

function qualityPage(rows) {
  const report = getQualityReport(rows);
  return `<section class="panel quality-hero"><h1>Data Quality Center</h1><strong>${report.overallScore}/100</strong><p>Weighted completeness, consistency, source coverage, and revenue coverage.</p></section><section class="split"><div class="panel"><h2>Field Completeness</h2><table><caption class="sr-only">Field completeness across all records.</caption><thead><tr><th scope="col">Field</th><th scope="col" class="num">Complete</th><th scope="col" class="num">Missing</th><th scope="col" class="num">Coverage</th></tr></thead><tbody>${report.completeness.map((field) => `<tr><th scope="row"><span class="dot ${field.severity}"></span>${field.field}</th><td class="num">${field.complete}</td><td class="num">${field.missing}</td><td class="num">${formatPercent(field.percent)}</td></tr>`).join("")}</tbody></table></div><div class="panel"><h2>Coverage and Exceptions</h2><div class="bars">${report.seasonCoverage.map((item) => `<label>S${item.season}<span data-w="${Math.max(6, item.count * 8)}%" style="--w:0"></span><b>${item.count}</b></label>`).join("")}</div><p>Quarantined import artifacts: ${excludedArtifacts}</p><p>Duplicate groups: ${report.duplicates.length}</p><p>Missing deal investors: ${report.investorQuality.missingDealInvestors}</p><p>Missing revenue: ${report.revenueQuality.missing}</p><p>Missing source URLs: ${report.sourceQuality.missing}</p></div></section>`;
}

function sharksPage(rows) {
  return `${sharkCards(rows)}${leaderboard(rows)}`;
}

function hallPage(rows) {
  return `<section class="panel"><h1>Hall of Fame</h1>${companyList(getTopCompanies(rows, { limit: 12 }))}</section>`;
}

function missesPage(rows) {
  return `<section class="panel"><h1>Biggest Misses</h1>${companyList(getTopCompanies(rows, { limit: 12, dealStatus: "no_deal" }))}</section>`;
}

function seasonsPage(rows) {
  const seasons = getSeasonMetrics(rows);
  if (!seasons.length) return `<section class="panel"><h2>Season Trends</h2><p class="empty">No seasons match the current filters.</p></section>`;
  const maxPitches = Math.max(1, ...seasons.map((season) => season.totalPitches));
  const pitchBars = seasons
    .map((season) => `<label>S${html(season.season)}<span data-w="${Math.round((season.totalPitches / maxPitches) * 100)}%" style="--w:0"></span><b>${season.totalPitches}</b></label>`)
    .join("");
  const dealBars = seasons
    .map((season) => `<label>S${html(season.season)}<span data-w="${Math.round((season.dealRate ?? 0) * 100)}%" style="--w:0"></span><b>${formatPercent(season.dealRate)}</b></label>`)
    .join("");
  const ordered = applyTableSort(seasons, ["season", "totalPitches", "totalDeals", "dealRate", "survivalRate", "totalRevenue"]);
  const tableRows = ordered
    .map((season) => `<tr><th scope="row">S${html(season.season)}</th><td class="num">${season.totalPitches}</td><td class="num">${season.totalDeals}</td><td class="num">${formatPercent(season.dealRate)}</td><td class="num">${formatPercent(season.survivalRate)}</td><td class="num">${formatCurrency(season.totalRevenue)}</td></tr>`)
    .join("");
  // Episode coverage uses the FULL dataset (not the filtered rows) — it measures how
  // many aired episodes the data represents, which is a property of the whole dataset.
  const coverage = getEpisodeCoverage(records);
  const coverageRows = coverage.bySeason
    .map((s) => `<tr${s.missing > 0 ? ' class="cov-gap"' : ""}><th scope="row">S${s.season}${s.ongoing ? " *" : ""}</th><td class="num">${s.present}</td><td class="num">${s.expected}</td><td class="num">${s.missing || "—"}</td><td class="num cellbar"><span class="cellbar-fill" style="--w:${Math.round(s.pct * 100)}%"></span><b>${formatPercent(s.pct)}</b></td></tr>`)
    .join("");
  return `
    <section class="panel"><div class="table-head"><div><h1>Episode Coverage</h1><p class="muted">Aired episodes represented in the data (an episode counts once it has ≥1 pitch), measured against the official per-season count. S17 (*) is still airing.</p></div><div class="pager"><strong class="cov-headline">${formatPercent(coverage.overall.pct)}</strong></div></div><table><caption class="sr-only">Episode coverage per season.</caption><thead><tr><th scope="col">Season</th><th scope="col" class="num">Present</th><th scope="col" class="num">Aired</th><th scope="col" class="num">Missing</th><th scope="col" class="num">Coverage</th></tr></thead><tbody>${coverageRows}</tbody></table><p class="muted">${coverage.overall.present} of ${coverage.overall.expected} aired episodes present — <strong>${coverage.overall.missing} missing</strong>, almost all in Season 15.</p></section>
    <section class="split">
      <div class="panel"><h2>Pitches per Season</h2><div class="bars">${pitchBars}</div></div>
      <div class="panel"><h2>Deal Rate per Season</h2><div class="bars">${dealBars}</div></div>
    </section>
    <section class="panel"><h2>Season Trends</h2><p class="muted">One row per season. Survival rate covers only companies with a known active/inactive status, so later seasons read low until status is verified.</p><table><caption class="sr-only">Per-season metrics, sortable by column.</caption><thead><tr>${sortableTh("Season", "season")}${sortableTh("Pitches", "totalPitches", { num: true })}${sortableTh("Deals", "totalDeals", { num: true })}${sortableTh("Deal Rate", "dealRate", { num: true })}${sortableTh("Survival", "survivalRate", { num: true })}${sortableTh("Revenue", "totalRevenue", { num: true })}</tr></thead><tbody>${tableRows}</tbody></table></section>`;
}

function industriesPage(rows) {
  const industries = applyTableSort(getIndustryMetrics(rows), ["industry", "totalPitches", "dealRate", "totalRevenue", "survivalRate"]);
  const maxRev = Math.max(1, ...industries.map((industry) => industry.totalRevenue || 0));
  return `<section class="panel"><h1>Industry Analytics</h1><table><caption class="sr-only">Per-industry metrics, sortable by column.</caption><thead><tr>${sortableTh("Industry", "industry")}${sortableTh("Pitches", "totalPitches", { num: true })}${sortableTh("Deal Rate", "dealRate", { num: true })}${sortableTh("Revenue", "totalRevenue", { num: true })}${sortableTh("Survival", "survivalRate", { num: true })}</tr></thead><tbody>${industries.map((industry) => {
    const revPct = industry.totalRevenue ? Math.round((industry.totalRevenue / maxRev) * 100) : 0;
    return `<tr><th scope="row">${html(industry.industry)}</th><td class="num">${industry.totalPitches}</td><td class="num">${formatPercent(industry.dealRate)}</td><td class="num cellbar"><span class="cellbar-fill" style="--w:${revPct}%"></span><b>${formatCurrency(industry.totalRevenue)}</b></td><td class="num">${formatPercent(industry.survivalRate)}</td></tr>`;
  }).join("")}</tbody></table></section>`;
}

function render() {
  const rows = filteredRecords();
  const pages = {
    command: commandPage,
    sharks: sharksPage,
    companies: companiesPage,
    seasons: seasonsPage,
    quality: qualityPage,
    hall: hallPage,
    misses: missesPage,
    industries: industriesPage
  };
  app.innerHTML = `${nav()}${filterBar()}${activeChips()}<main id="main" tabindex="-1">${pages[state.route](rows)}</main>`;
  writeHash();
  animateBars();
}

function animateBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".bars span[data-w]").forEach((el) => {
      el.style.setProperty("--w", el.dataset.w);
    });
  });
}

document.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]")?.dataset.route;
  if (route) {
    state.route = route;
    state.page = 1;
    render();
    return;
  }
  const shark = event.target.closest("[data-shark]")?.dataset.shark;
  if (shark) {
    state.shark = shark;
    state.route = "companies";
    state.page = 1;
    render();
    return;
  }
  const page = event.target.closest("[data-page]")?.dataset.page;
  if (page) {
    state.page = Math.max(1, Number(page));
    render();
    return;
  }
  const sortKey = event.target.closest("[data-sortkey]")?.dataset.sortkey;
  if (sortKey) {
    if (state.tsortKey === sortKey) {
      state.tsortDir = state.tsortDir === "desc" ? "asc" : "desc";
    } else {
      state.tsortKey = sortKey;
      state.tsortDir = "desc";
    }
    state.page = 1;
    render();
    // Re-render destroys the focused header button; restore focus to its replacement
    // and announce the new sort state for screen readers.
    document.querySelector(`[data-sortkey="${sortKey}"]`)?.focus();
    announce(`Sorted by ${SORT_LABELS[sortKey] ?? sortKey}, ${state.tsortDir === "asc" ? "ascending" : "descending"}`);
    return;
  }
  if (event.target.closest("[data-copylink]")) {
    const button = event.target.closest("[data-copylink]");
    navigator.clipboard?.writeText(location.href).then(() => {
      button.textContent = "Copied";
      announce("Link to this view copied to clipboard");
      setTimeout(() => { button.textContent = "Copy link"; }, 1200);
    }).catch(() => {});
    return;
  }
  const clearFilter = event.target.closest("[data-clearfilter]")?.dataset.clearfilter;
  if (clearFilter) {
    state[clearFilter] = clearFilter === "search" ? "" : "all";
    state.page = 1;
    render();
    return;
  }
  if (event.target.closest("[data-clearall]")) {
    for (const key of HASH_FILTER_KEYS) state[key] = key === "search" ? "" : "all";
    state.page = 1;
    render();
    return;
  }
  // Source links inside a company row must open the link, not the detail drawer.
  if (event.target.closest("a")) return;
  const companyTrigger = event.target.closest("[data-company]");
  const companyId = companyTrigger?.dataset.company;
  if (companyId) {
    const record = records.find((item) => item.id === companyId);
    lastDrawerTrigger = companyTrigger;
    const postShowStatus = record.postShowDealStatus ? `<div><dt>Post-show Deal</dt><dd>${html(record.postShowDealStatus.replace("_", " "))}</dd></div>` : "";
    const scoringNote = record.portfolioScoringNote ? `<div><dt>Scoring Note</dt><dd>${html(record.portfolioScoringNote)}</dd></div>` : "";
    document.querySelector("#drawer").innerHTML = `<div class="drawer-backdrop" data-close></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="${html(record.companyName)} details"><button class="close" data-close aria-label="Close details">Close</button><h2>${html(record.companyName)}</h2><p>${html(record.description ?? "")}</p><dl><div><dt>Season</dt><dd>${record.season ?? "N/A"} / Episode ${record.episode ?? "N/A"}</dd></div><div><dt>Deal Terms</dt><dd>${html(record.dealTermsRaw ?? "N/A")}</dd></div>${postShowStatus}<div><dt>Investors</dt><dd>${html(record.investors.join(", ") || "N/A")}</dd></div><div><dt>Revenue</dt><dd>${html(record.revenueRaw ?? "N/A")}</dd></div><div><dt>Status</dt><dd>${html(record.businessStatus)}</dd></div>${scoringNote}</dl></aside>`;
    document.querySelector("#drawer .close")?.focus();
  }
  if (event.target.closest("[data-close]")) closeDrawer();
});

function closeDrawer() {
  const drawer = document.querySelector("#drawer");
  if (!drawer || !drawer.innerHTML) return;
  drawer.innerHTML = "";
  if (lastDrawerTrigger && document.body.contains(lastDrawerTrigger)) lastDrawerTrigger.focus();
  lastDrawerTrigger = null;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
    return;
  }
  // Trap focus inside the open drawer dialog so it honors aria-modal="true".
  if (event.key === "Tab") {
    const drawer = document.querySelector(".drawer");
    if (drawer) {
      const focusables = [...drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
      if (focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    return;
  }
  // Shark cards are role=button (not native), so they need an Enter/Space shim.
  // Sortable headers use a real <button> and activate natively.
  if (event.key === "Enter" || event.key === " ") {
    const activatable = event.target.closest?.("[data-shark]");
    if (activatable) {
      event.preventDefault();
      activatable.click();
    }
  }
});

document.addEventListener("input", (event) => {
  const key = event.target.dataset.filter;
  if (key) {
    state[key] = event.target.value;
    if (key !== "sort") state.page = 1;
    render();
    if (key === "search") {
      const search = document.querySelector('[data-filter="search"]');
      search?.focus();
      search?.setSelectionRange(search.value.length, search.value.length);
    }
  }
});

document.addEventListener("change", (event) => {
  const key = event.target.dataset.filter;
  if (key) {
    state[key] = event.target.value;
    if (key !== "sort") state.page = 1;
    render();
  }
});

window.addEventListener("hashchange", () => {
  readHash();
  render();
});

readHash();
render();
