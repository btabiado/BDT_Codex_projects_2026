const BOILERPLATE_NAMES = new Set(["COMPANY", "BRANDS", "FOLLOW US", "LEGAL"]);

const PANEL_NAMES = [
  "Alex Rodriguez",
  "A-Rod",
  "Anne Wojcicki",
  "Barbara Corcoran",
  "Barbara",
  "Bethenny Frankel",
  "Blake Mycoskie",
  "Charles Barkley",
  "Daniel Lubetzky",
  "Daniel",
  "Daymond John",
  "Daymond",
  "Jamie Siminoff",
  "Kendra Scott",
  "Kendra",
  "Kevin O'Leary",
  "Kevin",
  "Lori Greiner",
  "Lori",
  "Mark Cuban",
  "Mark",
  "Maria Sharapova",
  "Matt Higgins",
  "Robert Herjavec",
  "Robert",
  "Rohan Oza",
  "Rohan",
  "Sara Blakely"
].sort((a, b) => b.length - a.length);

const HISTORICAL_PREFIX_SEASONS = new Set([11]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripKnownPanelNames(value) {
  let cleaned = value;
  let changed = true;
  while (changed) {
    changed = false;
    for (const name of PANEL_NAMES) {
      const pattern = new RegExp(`^${escapeRegExp(name)}(?:\\s*,\\s*|\\s+and\\s+|\\s+&\\s+|\\s+)`, "i");
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, "");
        changed = true;
        break;
      }
    }
  }
  return cleaned.trim();
}

export function cleanCompanyName(record) {
  const original = String(record.companyName ?? "").trim();
  if (!original) return original;

  if (original.startsWith(",")) return original.replace(/^,\s*/, "").trim();

  if (/^sharks:/i.test(original)) {
    const withoutLabel = original.replace(/^sharks:\s*/i, "");
    const cleaned = stripKnownPanelNames(withoutLabel);
    return cleaned || original;
  }

  const prefixSeason = HISTORICAL_PREFIX_SEASONS.has(record.season) || (record.season === 15 && /^Daymond\s/i.test(original));
  if (prefixSeason) {
    const cleaned = stripKnownPanelNames(original);
    return cleaned || original;
  }

  return original;
}

export function isStructuralArtifact(record) {
  if (record.sourceType !== "supplemental" && record.season === 17) return true;
  const name = String(record.companyName ?? "").trim().toUpperCase();
  if (BOILERPLATE_NAMES.has(name)) return true;
  return record.season === 16 && record.episode === null && String(record.airDate ?? "").toLowerCase() === "nat";
}

export function curateRecord(record) {
  const companyName = cleanCompanyName(record);
  const notes = [];
  if (companyName !== record.companyName) notes.push(`companyName cleaned from "${record.companyName}"`);
  if (record.sourceType !== "supplemental" && record.season === 17) notes.push("quarantined superseded Season 17 workbook import");
  else if (isStructuralArtifact({ ...record, companyName })) notes.push("quarantined structural import artifact");

  return {
    ...record,
    companyName,
    isArtifact: notes.some((note) => note.includes("quarantined")),
    curationNotes: notes
  };
}

export function applyDataCurations(records) {
  return records.map(curateRecord);
}

export function getAnalysisRecords(records) {
  return records.filter((record) => !record.isArtifact);
}
