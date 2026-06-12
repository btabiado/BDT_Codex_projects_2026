export function applyEnrichmentOverrides(records, overrides = {}) {
  return records.map((record) => {
    const override = overrides[record.id];
    return override ? { ...record, ...override } : record;
  });
}
