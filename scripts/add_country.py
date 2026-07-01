"""
Registers a country JSON into the React frontend registry.

Runs automatically at the end of extract_country_data.py, or manually:
    python scripts/add_country.py --code AT

Does two things:
  1. Adds entry to frontend/src/data/countries.js
  2. Adds import + DATA entry to frontend/src/pages/CountryPage.jsx

JSON is written directly to frontend/src/data/ by the extraction script — no copy needed.
"""

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
FRONTEND_DATA = ROOT / "frontend" / "src" / "data"
COUNTRIES_JS = FRONTEND_DATA / "countries.js"
COUNTRY_PAGE = ROOT / "frontend" / "src" / "pages" / "CountryPage.jsx"


def add_country(code: str) -> None:
    code = code.upper()
    src = FRONTEND_DATA / f"{code}.json"

    if not src.exists():
        raise FileNotFoundError(f"frontend/src/data/{code}.json not found — run the extraction script first.")

    data = json.loads(src.read_text())
    name = data.get("country", code)

    # 1. Update countries.js
    text = COUNTRIES_JS.read_text()
    entry = f"  {code}: {{ name: '{name}' }},"

    if f"  {code}:" in text:
        print(f"[1/2] {code} already in countries.js — skipped")
    else:
        text = re.sub(
            r"(export const AVAILABLE_COUNTRIES = \{[^}]+?)(\})",
            lambda m: m.group(1) + entry + "\n" + m.group(2),
            text,
            flags=re.DOTALL,
        )
        COUNTRIES_JS.write_text(text)
        print(f"[1/2] Added {code} to countries.js")

    # 2. Update CountryPage.jsx
    text = COUNTRY_PAGE.read_text()
    import_line = f"import {code} from '../data/{code}.json'"

    if import_line in text:
        print(f"[2/2] {code} already imported in CountryPage.jsx — skipped")
    else:
        text = re.sub(
            r"(import \w+ from '\.\./data/\w+\.json'\n)(?!import \w+ from '\.\./data/)",
            lambda m: m.group(1) + import_line + "\n",
            text,
        )
        text = re.sub(
            r"(const DATA = \{)([^}]+)(\})",
            lambda m: m.group(1) + m.group(2).rstrip() + f", {code}" + " " + m.group(3),
            text,
        )
        COUNTRY_PAGE.write_text(text)
        print(f"[2/2] Added {code} import and DATA entry to CountryPage.jsx")

    print(f"\nDone. {name} ({code}) is now available at /country/{code}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Register a country in the React frontend")
    parser.add_argument("--code", required=True, help="ISO 3166-1 alpha-2 country code (e.g. AT)")
    args = parser.parse_args()
    add_country(args.code)
