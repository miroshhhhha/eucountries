# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EU Study Guide — a web platform for non-EU students planning to study in European Union countries. Country data is extracted from PDF guides using the Gemini API and stored as structured JSON. A React frontend renders the data as interactive checklists and knowledge bases.

## Tech Stack

- **Data extraction**: Python 3.13 + [Gemini API](https://ai.google.dev/) + PyMuPDF (`fitz`)
- **Data storage**: JSON files per country in `data/` (e.g. `data/PT.json`, `data/IT.json`)
- **Frontend**: React (planned — no framework scaffolded yet)
- **Python venv**: `.venv/` — always activate before running scripts

## Common Commands

```bash
# Activate venv
source .venv/bin/activate

# Install Python dependencies
pip install google-generativeai pymupdf jsonschema

# Extract data from a PDF
GEMINI_API_KEY=your_key python scripts/extract_country_data.py \
  --pdf Portugal.pdf --country Portugal --code PT

# Extract and skip schema validation (useful when iterating on the schema)
python scripts/extract_country_data.py --pdf Italy.pdf --country Italy --code IT --skip-validation

# Validate an existing JSON file against the schema manually
python -c "
import json, jsonschema
schema = json.load(open('schema/country_schema.json'))
data = json.load(open('data/PT.json'))
jsonschema.validate(data, schema)
print('Valid')
"
```

## Project Structure

```
eucountries/
├── schema/
│   └── country_schema.json      # Single source of truth for all country data shapes
├── scripts/
│   └── extract_country_data.py  # PDF → Gemini API → validated JSON
├── data/
│   └── PT.json                  # Extracted country data (ISO 3166-1 alpha-2 filenames)
├── frontend/
│   └── src/components/CountryPage/
│       ├── index.jsx             # Page root — composes all section components
│       ├── CountryHero.jsx       # Flag, country name, Schengen badge
│       ├── ApplicationStepper.jsx # Ordered visa steps + processing time warning
│       ├── DocumentChecklist.jsx  # Interactive checkbox checklist with progress bar
│       ├── FinancialCalculator.jsx # Live calculator: months × ref value × household size
│       ├── WorkRules.jsx          # Work-while-studying rules and restrictions
│       ├── ResidencePermitCard.jsx # Post-arrival permit stats and documents
│       ├── PostStudyWork.jsx      # Job-seeking permit and work transition
│       ├── TipsAccordion.jsx      # Tabbed accordion: Tips vs Common Mistakes
│       └── OfficialLinks.jsx      # Clickable official source and form links
└── *.pdf                         # Source PDF guides (one per country)
```

## Data Architecture

### JSON Schema (`schema/country_schema.json`)

The schema is the contract between the extractor and the frontend. Every new country PDF must produce a JSON file that validates against it. Key top-level fields:

| Field | Type | Notes |
|---|---|---|
| `country` / `country_code` | string | ISO 3166-1 alpha-2 code used as filename |
| `qualifying_courses` | object | `long_stay` and `short_stay` arrays |
| `visa.types` | array | Visa codes (e.g. D4), validity, entry count |
| `visa.application_process` | object | Steps array + processing_time object |
| `required_documents` | array | Each item has `id`, `mandatory`, `apostille_required` |
| `financial_requirements` | object | `reference_value_monthly_eur` + `calculation_rules` percentages |
| `residence_permit` | object | Authority, validity, required documents after arrival |
| `work_while_studying` | object | Hours limit, notification requirement |
| `post_study_work` | object | Job-seeking period in months, legal basis |
| `official_sources` / `application_forms` | arrays | `name` + `url` pairs |
| `tips` / `common_mistakes` | arrays | Structured with `title`/`body` and `mistake`/`consequence`/`how_to_avoid` |

### Extraction Script (`scripts/extract_country_data.py`)

- Reads PDF text with PyMuPDF, passes it + the full JSON schema to Gemini 1.5 Pro
- Gemini is prompted with `response_mime_type="application/json"` and `temperature=0.1` for deterministic output
- Validates the returned object with `jsonschema.Draft7Validator`
- On JSON parse failure, saves raw response to `debug_response.txt` for inspection
- Output: `data/<CODE>.json`

### Frontend Data Flow

`CountryPage` receives the full country JSON as a `data` prop and passes slices to each section component. No global state — each component is self-contained. The `FinancialCalculator` and `DocumentChecklist` are the only stateful components (local `useState`).

## Adding a New Country

1. Obtain the PDF guide and place it in the project root.
2. Run the extraction script with the correct `--country` and `--code`.
3. Review `data/<CODE>.json` — fix any `null` fields that Gemini missed by editing the JSON directly.
4. Add the country to the frontend country list (once that routing layer exists).

## Schema Evolution

When adding a new field to `country_schema.json`, do not mark it `required` until all existing country JSON files have been backfilled. Run the manual validation command above against each existing file before adding the `required` constraint.
