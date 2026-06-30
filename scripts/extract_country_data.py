"""
Extracts structured country data from a PDF guide using the Gemini API.
Saves the result as a validated JSON file matching schema/country_schema.json.

Usage:
    python scripts/extract_country_data.py --pdf Portugal.pdf --country Portugal --code PT
    python scripts/extract_country_data.py --pdf Italy.pdf --country Italy --code IT

Requirements:
    pip install google-genai pymupdf jsonschema python-dotenv
"""

import argparse
import json
import os
import sys
from pathlib import Path

import fitz  # PyMuPDF
import jsonschema
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()  # loads .env from current directory automatically

SCHEMA_PATH = Path(__file__).parent.parent / "schema" / "country_schema.json"
OUTPUT_DIR = Path(__file__).parent.parent / "data"

# Static currency map — not in PDFs, maintained here.
# Most EU countries use EUR; exceptions listed explicitly.
EU_CURRENCIES = {
    "AT": "EUR", "BE": "EUR", "CY": "EUR", "EE": "EUR",
    "FI": "EUR", "FR": "EUR", "DE": "EUR", "GR": "EUR",
    "IE": "EUR", "IT": "EUR", "LV": "EUR", "LT": "EUR",
    "LU": "EUR", "MT": "EUR", "NL": "EUR", "PT": "EUR",
    "SK": "EUR", "SI": "EUR", "ES": "EUR", "HR": "EUR",
    # Non-euro EU members
    "BG": "BGN",  # Bulgarian lev
    "CZ": "CZK",  # Czech koruna
    "DK": "DKK",  # Danish krone
    "HU": "HUF",  # Hungarian forint
    "PL": "PLN",  # Polish zloty
    "RO": "RON",  # Romanian leu
    "SE": "SEK",  # Swedish krona
}

EXTRACTION_PROMPT = """
You are a structured data extractor for an EU student immigration platform.

Below is raw text extracted from a PDF guide about studying in {country} as a non-EU student.

Your task: extract all relevant data and return a SINGLE valid JSON object that strictly
follows the schema provided. Do not include any explanation, markdown fences, or extra text —
only the raw JSON object.

Rules:
- If a value is not mentioned in the document, use null (not an empty string).
- For arrays that have no data, use [].
- All EUR amounts should be numbers (not strings).
- Dates should be "YYYY-MM-DD" strings.
- country_code must be the ISO 3166-1 alpha-2 code (e.g. "PT" for Portugal).
- last_updated should be today's date: {today}.
- Keep descriptions concise and factual — no marketing language.
- The "tips" array should contain the practical advice section.
- The "common_mistakes" array should list errors students commonly make.

=== JSON SCHEMA ===
{schema}

=== PDF TEXT ===
{pdf_text}

Return only the JSON object.
"""


def extract_text_from_pdf(pdf_path: Path) -> str:
    doc = fitz.open(str(pdf_path))
    pages = []
    for page in doc:
        text = page.get_text().strip()
        if text:
            pages.append(text)
    doc.close()
    return "\n\n--- PAGE BREAK ---\n\n".join(pages)


def call_gemini(prompt: str, api_key: str) -> str:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )
    return response.text


def validate_against_schema(data: dict, schema: dict) -> list[str]:
    validator = jsonschema.Draft7Validator(schema)
    errors = [f"{e.json_path}: {e.message}" for e in validator.iter_errors(data)]
    return errors


def main():
    parser = argparse.ArgumentParser(description="Extract EU country study data from PDF")
    parser.add_argument("--pdf", required=True, help="Path to the PDF file")
    parser.add_argument("--country", required=True, help="Country name (e.g. Portugal)")
    parser.add_argument("--code", required=True, help="ISO 3166-1 alpha-2 country code (e.g. PT)")
    parser.add_argument("--api-key", help="Gemini API key (or set GEMINI_API_KEY env var)")
    parser.add_argument("--output", help="Output JSON file path (default: data/<code>.json)")
    parser.add_argument("--skip-validation", action="store_true", help="Skip JSON schema validation")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: Provide --api-key or set the GEMINI_API_KEY environment variable.", file=sys.stderr)
        sys.exit(1)

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    schema = json.loads(SCHEMA_PATH.read_text())
    schema_str = json.dumps(schema, indent=2)

    from datetime import date
    today = date.today().isoformat()

    print(f"[1/4] Extracting text from {pdf_path.name}...")
    pdf_text = extract_text_from_pdf(pdf_path)
    print(f"      {len(pdf_text)} characters extracted across {pdf_text.count('PAGE BREAK') + 1} pages")

    prompt = EXTRACTION_PROMPT.format(
        country=args.country,
        today=today,
        schema=schema_str,
        pdf_text=pdf_text,
    )

    print("[2/4] Calling Gemini API...")
    raw_response = call_gemini(prompt, api_key)

    print("[3/4] Parsing JSON response...")
    try:
        data = json.loads(raw_response)
    except json.JSONDecodeError as e:
        print(f"ERROR: Gemini returned invalid JSON: {e}", file=sys.stderr)
        print("Raw response saved to debug_response.txt")
        Path("debug_response.txt").write_text(raw_response)
        sys.exit(1)

    # Ensure country/code fields are set correctly even if Gemini missed them
    data.setdefault("country", args.country)
    data.setdefault("country_code", args.code.upper())
    data.setdefault("last_updated", today)
    # Currency is not in PDFs — inject from static map
    data["currency"] = EU_CURRENCIES.get(args.code.upper(), "EUR")

    if not args.skip_validation:
        print("[4/4] Validating against schema...")
        errors = validate_against_schema(data, schema)
        if errors:
            print(f"WARNING: {len(errors)} schema validation issue(s):")
            for err in errors[:10]:
                print(f"  - {err}")
            if len(errors) > 10:
                print(f"  ... and {len(errors) - 10} more")
        else:
            print("      Schema validation passed.")

    output_path = Path(args.output) if args.output else OUTPUT_DIR / f"{args.code.upper()}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\nData saved to: {output_path}")

    print("\nRegistering in frontend...")
    from add_country import add_country
    add_country(args.code)


if __name__ == "__main__":
    main()
