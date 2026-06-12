import { rawMasterRows } from "./data/rawMasterData.js";
import { normalizeRows, MAJOR_SHARKS } from "./lib/normalizeData.js";
import { getGlobalMetrics, getSharkMetrics, getTopCompanies, getIndustryMetrics } from "./lib/metrics.js";
import { getQualityReport } from "./lib/qualityChecks.js";
import { formatCurrency, formatNumber, formatPercent } from "./lib/formatters.js";

const records = normalizeRows(rawMasterRows);
let state = {
  route: "command",
  search: "",
  season: "all",
  shark: "all",
  dealStatus: "all",
  businessStatus: "all",
  industry: "all",
  sort: "alphaScore",
  page: 1,
  pageSize: 100
};

const app = document.querySelector("#app");

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

function nav() {
  const routes = [
    ["command", "Command"],
    ["sharks", "Sharks"],
    ["companies", "Companies"],
    ["quality", "Quality"],
    ["hall", "Hall of Fame"],
    ["misses", "Misses"],
    ["industries", "Industries"]
  ];
  return `<nav class="nav">${routes.map(([id, label]) => `<button class="${state.route === id ? "active" : ""}" data-route="${id}">${label}</button>`).join("")}</nav>`;
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

function globalCards(rows) {
  const metrics = getGlobalMetrics(rows);
  const quality = getQualityReport(rows);
  const cards = [
    ["Total Pitches", formatNumber(metrics.totalPitches), "One row equals one company pitch."],
    ["Total Deals", formatNumber(metrics.totalDeals), "Records normalized to deal status."],
    ["Deal Rate", formatPercent(metrics.dealRate), "Total deals divided by total pitches."],
    ["Total Revenue", formatCurrency(metrics.totalRevenue), "Sum of parsed revenue values."],
    ["Active Businesses", formatNumber(metrics.activeBusinesses), "Companies marked active."],
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
    return b.alphaScore - a.alphaScore;
  });
  return `
    <div class="section-heading"><h2>Shark KPI Cards</h2><select data-filter="sort">${option("alphaScore", state.sort, "Alpha Score")}${option("totalRevenue", state.sort, "Revenue")}${option("survivalRate", state.sort, "Survival")}${option("totalDeals", state.sort, "Deal Count")}</select></div>
    <section class="shark-grid">
      ${sorted.map((metric, index) => `
        <article class="shark-card" data-shark="${html(metric.sharkName)}" title="Alpha Score = revenue 40%, survival 30%, deal success 20%, deal volume 10%">
          <div class="avatar">${html(metric.sharkName.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>
          <div><span class="rank">#${index + 1}</span><h3>${html(metric.sharkName)}</h3></div>
          <strong>${metric.alphaScore}</strong>
          <dl>
            <div><dt>Deals</dt><dd>${metric.totalDeals}</dd></div>
            <div><dt>Survival</dt><dd>${formatPercent(metric.survivalRate)}</dd></div>
            <div><dt>Revenue</dt><dd>${formatCurrency(metric.totalRevenue)}</dd></div>
            <div><dt>Largest Winner</dt><dd>${html(metric.largestWinner ?? "N/A")}</dd></div>
            <div><dt>Favorite Industry</dt><dd>${html(metric.favoriteIndustry ?? "N/A")}</dd></div>
          </dl>
          <span class="badge ${metric.dataConfidence}">${metric.dataConfidence} confidence</span>
        </article>`).join("")}
    </section>`;
}

function leaderboard(rows) {
  const metrics = getSharkMetrics(rows);
  return `<section class="panel"><h2>Shark Alpha Leaderboard</h2><table><thead><tr><th>Rank</th><th>Shark</th><th>Alpha</th><th>Revenue</th><th>Survival</th><th>Movement</th></tr></thead><tbody>${metrics.map((metric, index) => `<tr><td>${index + 1}</td><td>${html(metric.sharkName)}</td><td>${metric.alphaScore}</td><td>${formatCurrency(metric.totalRevenue)}</td><td>${formatPercent(metric.survivalRate)}</td><td><span class="muted">New</span></td></tr>`).join("")}</tbody></table></section>`;
}

function commandPage(rows) {
  return `
    <header class="hero"><p>Investor Intelligence</p><h1>Shark Tank Intelligence Platform</h1><span>Who is the best Shark, and what patterns drive success?</span></header>
    ${globalCards(rows)}
    ${sharkCards(rows)}
    ${leaderboard(rows)}
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
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  const page = Math.min(state.page, totalPages);
  const start = (page - 1) * state.pageSize;
  const visibleRows = rows.slice(start, start + state.pageSize);
  return `<section class="panel"><div class="table-head"><div><h2>Company Explorer</h2><p class="muted">${rows.length} companies match the current filters. Showing ${visibleRows.length ? start + 1 : 0}-${Math.min(start + visibleRows.length, rows.length)}.</p></div><div class="pager"><button data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>Previous</button><span>Page ${page} of ${totalPages}</span><button data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""}>Next</button></div></div><table><thead><tr><th>Company</th><th>Season</th><th>Deal</th><th>Investors</th><th>Status</th><th>Revenue</th><th>Source</th></tr></thead><tbody>${visibleRows.map((record) => `<tr class="company-row"><td><button class="linklike" data-company="${html(record.id)}">${html(record.companyName)}</button><small>${html(record.description ?? "")}</small></td><td>S${record.season ?? "?"} E${record.episode ?? "?"}</td><td>${html(record.dealStatus.replace("_", " "))}</td><td>${html(record.investors.join(", ") || "N/A")}</td><td>${html(record.businessStatus)}</td><td>${formatCurrency(record.revenueAmount)}</td><td>${record.sourceUrl ? `<a href="${html(record.sourceUrl)}" target="_blank" rel="noreferrer">Open</a>` : "N/A"}</td></tr>`).join("")}</tbody></table></section><div id="drawer"></div>`;
}

function qualityPage(rows) {
  const report = getQualityReport(rows);
  return `<section class="panel quality-hero"><h2>Data Quality Center</h2><strong>${report.overallScore}/100</strong><p>Weighted completeness, consistency, source coverage, and revenue coverage.</p></section><section class="split"><div class="panel"><h2>Field Completeness</h2><table><thead><tr><th>Field</th><th>Complete</th><th>Missing</th><th>Coverage</th></tr></thead><tbody>${report.completeness.map((field) => `<tr><td><span class="dot ${field.severity}"></span>${field.field}</td><td>${field.complete}</td><td>${field.missing}</td><td>${formatPercent(field.percent)}</td></tr>`).join("")}</tbody></table></div><div class="panel"><h2>Coverage and Exceptions</h2><div class="bars">${report.seasonCoverage.map((item) => `<label>S${item.season}<span style="--w:${Math.max(6, item.count * 8)}%"></span><b>${item.count}</b></label>`).join("")}</div><p>Duplicate groups: ${report.duplicates.length}</p><p>Missing deal investors: ${report.investorQuality.missingDealInvestors}</p><p>Missing revenue: ${report.revenueQuality.missing}</p><p>Missing source URLs: ${report.sourceQuality.missing}</p></div></section>`;
}

function sharksPage(rows) {
  return `${sharkCards(rows)}${leaderboard(rows)}`;
}

function hallPage(rows) {
  return `<section class="panel"><h2>Hall of Fame</h2>${companyList(getTopCompanies(rows, { limit: 12 }))}</section>`;
}

function missesPage(rows) {
  return `<section class="panel"><h2>Biggest Misses</h2>${companyList(getTopCompanies(rows, { limit: 12, dealStatus: "no_deal" }))}</section>`;
}

function industriesPage(rows) {
  const industries = getIndustryMetrics(rows);
  return `<section class="panel"><h2>Industry Analytics</h2><table><thead><tr><th>Industry</th><th>Pitches</th><th>Deal Rate</th><th>Revenue</th><th>Survival</th></tr></thead><tbody>${industries.map((industry) => `<tr><td>${html(industry.industry)}</td><td>${industry.totalPitches}</td><td>${formatPercent(industry.dealRate)}</td><td>${formatCurrency(industry.totalRevenue)}</td><td>${formatPercent(industry.survivalRate)}</td></tr>`).join("")}</tbody></table></section>`;
}

function render() {
  const rows = filteredRecords();
  const pages = {
    command: commandPage,
    sharks: sharksPage,
    companies: companiesPage,
    quality: qualityPage,
    hall: hallPage,
    misses: missesPage,
    industries: industriesPage
  };
  app.innerHTML = `${nav()}${filterBar()}<main>${pages[state.route](rows)}</main>`;
}

document.addEventListener("click", (event) => {
  const route = event.target.closest("[data-route]")?.dataset.route;
  if (route) {
    state.route = route;
    state.page = 1;
    render();
  }
  const shark = event.target.closest("[data-shark]")?.dataset.shark;
  if (shark) {
    state.shark = shark;
    state.route = "companies";
    state.page = 1;
    render();
  }
  const page = event.target.closest("[data-page]")?.dataset.page;
  if (page) {
    state.page = Math.max(1, Number(page));
    render();
  }
  const companyId = event.target.closest("[data-company]")?.dataset.company;
  if (companyId) {
    const record = records.find((item) => item.id === companyId);
    document.querySelector("#drawer").innerHTML = `<aside class="drawer"><button class="close" data-close>Close</button><h2>${html(record.companyName)}</h2><p>${html(record.description ?? "")}</p><dl><div><dt>Season</dt><dd>${record.season ?? "N/A"} / Episode ${record.episode ?? "N/A"}</dd></div><div><dt>Deal Terms</dt><dd>${html(record.dealTermsRaw ?? "N/A")}</dd></div><div><dt>Investors</dt><dd>${html(record.investors.join(", ") || "N/A")}</dd></div><div><dt>Revenue</dt><dd>${html(record.revenueRaw ?? "N/A")}</dd></div><div><dt>Status</dt><dd>${html(record.businessStatus)}</dd></div></dl></aside>`;
  }
  if (event.target.matches("[data-close]")) document.querySelector("#drawer").innerHTML = "";
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

render();
