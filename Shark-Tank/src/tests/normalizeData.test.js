import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDealStatus, normalizeBusinessStatus, parseRevenue, splitInvestors, normalizeRow } from "../lib/normalizeData.js";

test("normalizes deal and business statuses", () => {
  assert.equal(normalizeDealStatus("Y"), "deal");
  assert.equal(normalizeDealStatus("Deal"), "deal");
  assert.equal(normalizeDealStatus("No Deal"), "no_deal");
  assert.equal(normalizeDealStatus("maybe"), "unknown");
  assert.equal(normalizeBusinessStatus("Still in Business"), "active");
  assert.equal(normalizeBusinessStatus("Y (EST)"), "active");
  assert.equal(normalizeBusinessStatus("closed"), "inactive");
  assert.equal(normalizeBusinessStatus("N (acquired/merged)"), "inactive");
});

test("parses compact revenue values", () => {
  assert.equal(parseRevenue("$1.2M"), 1_200_000);
  assert.equal(parseRevenue("$12M annual revenue (reported)"), 12_000_000);
  assert.equal(parseRevenue("$500,000"), 500_000);
  assert.equal(parseRevenue(">$4M annual sales"), 4_000_000);
  assert.equal(parseRevenue("1B"), 1_000_000_000);
  assert.equal(parseRevenue("Unknown"), null);
});

test("splits and standardizes investor names", () => {
  assert.deepEqual(splitInvestors("Mark, Lori & Kevin"), ["Mark Cuban", "Lori Greiner", "Kevin O'Leary"]);
});

test("normalizes a raw row into a pitch record", () => {
  const record = normalizeRow({
    Season: "2",
    "Episode (Season)": "5",
    "Company / Product": "Test Co",
    "Deal?": "Deal",
    Investors: "M. Cuban",
    "Still in business today? (Y/N)": "Yes",
    "Total revenue (best available)": "$2M annual revenue",
    "Source URL(s)": "https://example.com/a ; https://example.com/b"
  });
  assert.equal(record.id, "s2e5-test-co");
  assert.equal(record.dealStatus, "deal");
  assert.deepEqual(record.investors, ["Mark Cuban"]);
  assert.equal(record.revenueAmount, 2_000_000);
  assert.equal(record.sourceUrl, "https://example.com/a");
});
