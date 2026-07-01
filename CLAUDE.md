# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EU Study Guide — a web platform for non-EU students planning to study in European Union countries. Country data is extracted from PDF guides using the Gemini API and stored as structured JSON. A React frontend renders the data as interactive checklists and knowledge bases.

## Tech Stack

- **Data extraction**: Python 3.13 + [Gemini API](https://ai.google.dev/) + PyMuPDF (`fitz`)
- **Data storage**: JSON files per country in `frontend/src/data/` (e.g. `PT.json`, `IT.json`) — single source of truth, no duplication
- **Frontend**: React + Vite + Tailwind CSS
- **Python venv**: `.venv/` — always activate before running scripts

## Common Commands

```bash
# Activate venv
source .venv/bin/activate

# Install Python dependencies
pip install google-genai pymupdf jsonschema python-dotenv

# Process ALL PDFs in pdfs/ at once (recommended)
GEMINI_API_KEY=your_key python scripts/process_all.py

# Re-process a country even if already done
python scripts/process_all.py --force

# Process a single country manually
GEMINI_API_KEY=your_key python scripts/extract_country_data.py \
  --pdf pdfs/Portugal.pdf --country Portugal --code PT

# Validate an existing JSON against the schema
python -c "
import json, jsonschema
schema = json.load(open('schema/country_schema.json'))
data = json.load(open('frontend/src/data/PT.json'))
jsonschema.validate(data, schema)
print('Valid')
"
```

## Project Structure

```
eucountries/
├── pdfs/                        # Drop PDF guides here — one per country, named by country
│   ├── Portugal.pdf
│   ├── Italy.pdf
│   └── ...
├── schema/
│   └── country_schema.json      # Single source of truth for all country data shapes
├── scripts/
│   ├── process_all.py           # Process every PDF in pdfs/ in one command
│   ├── extract_country_data.py  # PDF → Gemini API → validated JSON (single country)
│   └── add_country.py           # Registers extracted JSON into the React frontend
└── frontend/
    └── src/
        ├── data/                # Country JSON files live here — no separate data/ directory
        │   ├── PT.json
        │   ├── IT.json
        │   └── countries.js     # Registry: { PT: { name: 'Portugal' }, ... }
        ├── pages/
        │   ├── Home.jsx
        │   └── CountryPage.jsx
        └── components/CountryPage/
            ├── index.jsx
            ├── CountryHero.jsx
            ├── ApplicationStepper.jsx
            ├── DocumentChecklist.jsx
            ├── FinancialCalculator.jsx
            ├── WorkRules.jsx
            ├── ResidencePermitCard.jsx
            ├── PostStudyWork.jsx
            ├── TipsAccordion.jsx
            └── OfficialLinks.jsx
```

## Adding a New Country

1. Name the PDF after the country in English: `Malta.pdf`, `Greece.pdf`, etc.
2. Drop it into `pdfs/`
3. Run `python scripts/process_all.py` — it finds new PDFs, extracts and validates data, registers the country in the frontend automatically
4. Review `frontend/src/data/<CODE>.json` — fix any `null` fields Gemini missed

That's it. The script handles everything else.

## How the Extraction Works

Each PDF contains answers from **two AI assistants** (Gemini and Claude) covering the same questions. The extraction prompt instructs Gemini to cross-validate both sections:
- Where both agree → use the value
- Where they disagree → prefer the more specific/concrete answer
- Where both are vague → use `null`, never guess

Output goes directly to `frontend/src/data/<CODE>.json`. The `add_country.py` step then registers the country in `countries.js` and `CountryPage.jsx`.

## Data Architecture

### JSON Schema (`schema/country_schema.json`)

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
| `tips` / `common_mistakes` | arrays | Structured advice and pitfalls |

## Schema Evolution

When adding a new field to `country_schema.json`, do not mark it `required` until all existing JSON files have been backfilled. Validate each file manually before adding the constraint.
