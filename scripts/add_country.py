"""
Registers a newly extracted country JSON into the React frontend.

Runs automatically at the end of extract_country_data.py, or manually:
    python scripts/add_country.py --code AT

Does three things:
  1. Copies data/<CODE>.json → frontend/src/data/<CODE>.json
  2. Adds entry to frontend/src/data/countries.js
  3. Adds import + DATA entry to frontend/src/pages/CountryPage.jsx
"""

import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
FRONTEND_DATA = ROOT / "frontend" / "src" / "data"
COUNTRIES_JS = FRONTEND_DATA / "countries.js"
COUNTRY_PAGE = ROOT / "frontend" / "src" / "pages" / "CountryPage.jsx"


def add_country(code: str) -> None:
    code = code.upper()
    src = DATA_DIR / f"{code}.json"

    if not src.exists():
        raise FileNotFoundError(f"data/{code}.json not found — run the extraction script first.")

    data = json.loads(src.read_text())
    name = data.get("country", code)

    # 1. Copy JSON into frontend
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)
    shutil.copy(src, FRONTEND_DATA / f"{code}.json")
    print(f"[1/3] Copied data/{code}.json → frontend/src/data/{code}.json")

    # 2. Update countries.js
    text = COUNTRIES_JS.read_text()
    entry = f"  {code}: {{ name: '{name}' }},"

    if f"  {code}:" in text:
        print(f"[2/3] {code} already in countries.js — skipped")
    else:
        # Insert before the closing brace of AVAILABLE_COUNTRIES
        text = re.sub(r"(export const AVAILABLE_COUNTRIES = \{[^}]+?)(\})",
                      lambda m: m.group(1) + entry + "\n" + m.group(2),
                      text,
                      flags=re.DOTALL)
        COUNTRIES_JS.write_text(text)
        print(f"[2/3] Added {code} to countries.js")

    # 3. Update CountryPage.jsx
    text = COUNTRY_PAGE.read_text()

    # Add import after the last existing country import
    import_line = f"import {code} from '../data/{code}.json'"
    if import_line in text:
        print(f"[3/3] {code} already imported in CountryPage.jsx — skipped")
    else:
        # Find the last "import XX from '../data/XX.json'" line and insert after it
        text = re.sub(
            r"(import \w+ from '\.\./data/\w+\.json'\n)(?!import \w+ from '\.\./data/)",
            lambda m: m.group(1) + import_line + "\n",
            text,
        )
        # Add to DATA object: { PT, IT } → { PT, IT, AT }
        text = re.sub(
            r"(const DATA = \{)([^}]+)(\})",
            lambda m: m.group(1) + m.group(2).rstrip() + f", {code}" + " " + m.group(3),
            text,
        )
        COUNTRY_PAGE.write_text(text)
        print(f"[3/3] Added {code} import and DATA entry to CountryPage.jsx")

    print(f"\nDone. {name} ({code}) is now available at /country/{code}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Register a country in the React frontend")
    parser.add_argument("--code", required=True, help="ISO 3166-1 alpha-2 country code (e.g. AT)")
    args = parser.parse_args()
    add_country(args.code)
