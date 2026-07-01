"""
Processes all PDFs in the pdfs/ directory.

Usage:
    python scripts/process_all.py
    python scripts/process_all.py --force   # re-process already-done countries

PDF naming: use the English country name as the filename, e.g. Portugal.pdf, Italy.pdf.
"""

import argparse
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).parent.parent
PDFS_DIR = ROOT / "pdfs"
FRONTEND_DATA = ROOT / "frontend" / "src" / "data"

# All 27 EU member states: English name → ISO alpha-2 code
EU_NAME_TO_CODE = {
    "Austria": "AT", "Belgium": "BE", "Bulgaria": "BG", "Croatia": "HR",
    "Cyprus": "CY", "Czechia": "CZ", "Czech Republic": "CZ",
    "Denmark": "DK", "Estonia": "EE", "Finland": "FI", "France": "FR",
    "Germany": "DE", "Greece": "GR", "Hungary": "HU", "Ireland": "IE",
    "Italy": "IT", "Latvia": "LV", "Lithuania": "LT", "Luxembourg": "LU",
    "Malta": "MT", "Netherlands": "NL", "Poland": "PL", "Portugal": "PT",
    "Romania": "RO", "Slovakia": "SK", "Slovenia": "SI", "Spain": "ES",
    "Sweden": "SE",
}

EXTRACT_SCRIPT = Path(__file__).parent / "extract_country_data.py"


def already_done(code: str) -> bool:
    return (FRONTEND_DATA / f"{code}.json").exists()


def main():
    parser = argparse.ArgumentParser(description="Process all PDFs in pdfs/")
    parser.add_argument("--force", action="store_true", help="Re-process already-done countries")
    parser.add_argument("--api-key", help="Gemini API key (or set GEMINI_API_KEY env var)")
    args = parser.parse_args()

    pdfs = sorted(PDFS_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in pdfs/")
        print("Drop your PDF files into the pdfs/ folder and run again.")
        sys.exit(0)

    results = {"ok": [], "skipped": [], "failed": [], "unknown": []}

    for pdf in pdfs:
        country = pdf.stem
        code = EU_NAME_TO_CODE.get(country)

        if not code:
            print(f"  SKIP  {pdf.name} — unrecognized name (expected e.g. 'Portugal.pdf')")
            results["unknown"].append(pdf.name)
            continue

        if not args.force and already_done(code):
            print(f"  SKIP  {country} ({code}) — already processed")
            results["skipped"].append(country)
            continue

        print(f"\n{'─' * 50}")
        print(f"  Processing: {country} ({code})")
        print(f"{'─' * 50}")

        cmd = [sys.executable, str(EXTRACT_SCRIPT), "--pdf", str(pdf), "--country", country, "--code", code]
        if args.api_key:
            cmd += ["--api-key", args.api_key]

        result = subprocess.run(cmd, cwd=ROOT)
        if result.returncode == 0:
            results["ok"].append(country)
        else:
            results["failed"].append(country)

        if pdf != pdfs[-1]:
            time.sleep(5)

    print(f"\n{'=' * 50}")
    print(f"  Done.")
    if results["ok"]:      print(f"  Processed : {', '.join(results['ok'])}")
    if results["skipped"]: print(f"  Skipped   : {', '.join(results['skipped'])}")
    if results["failed"]:  print(f"  Failed    : {', '.join(results['failed'])}")
    if results["unknown"]: print(f"  Unknown   : {', '.join(results['unknown'])}")


if __name__ == "__main__":
    main()
