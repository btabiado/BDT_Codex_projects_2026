#!/usr/bin/env python3
"""Extract the Shark Tank master workbook into an ES module data file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


DEFAULT_SHEET = "All_Pitches_Master"


def jsonable(value):
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--sheet", default=DEFAULT_SHEET)
    parser.add_argument("--output", type=Path, default=Path("Shark-Tank/src/data/rawMasterData.js"))
    args = parser.parse_args()

    df = pd.read_excel(args.workbook, sheet_name=args.sheet, header=2)
    records = []
    for row in df.to_dict(orient="records"):
        records.append({key: jsonable(value) for key, value in row.items()})

    args.output.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    args.output.write_text(
        "// Generated from shark_tank_MASTER_CLEAN.xlsx. Rebuild with scripts/import_workbook.py.\n"
        f"export const rawMasterRows = {payload};\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} records to {args.output}")


if __name__ == "__main__":
    main()
