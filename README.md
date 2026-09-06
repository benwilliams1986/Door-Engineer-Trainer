# DoorTech Training Simulator

A GitHub Pages-ready browser training simulator for roller shutters, automatic gates and traffic barriers.

## What is included

- Visual workshop bays for roller shutters, gates and barriers
- Searchable manufacturer/equipment catalogue
- Verified/unverified content status
- Training-job engine
- Interactive shutter controls and photocell beam simulation
- Conductor/terminal puzzle engine
- XP and scoring
- Expandable JSON content model
- GitHub Pages deployment workflow
- First verified seed lesson: **GfA TS 971 / PES/4.5TOF/POT conductor functions**

## Important safety/content rule

This project is a **training aid**. Manufacturer-specific electrical content must be checked against the exact product manual, software/firmware revision and applicable standards before a record is marked `"verified": true`.

Never treat a generic simulation or an unverified catalogue record as installation instructions.

## Why the catalogue contains placeholders

There is no practical static list of "all makes and models": manufacturers release, revise and discontinue equipment continuously.

The repository therefore separates:

1. **Verified equipment records** — exact model + checked documentation + model-specific lessons.
2. **Expansion records** — manufacturer/product-family placeholders that make it easy to add exact models later.

The simulator should never invent a terminal number or wiring connection merely to fill the database.

## Run locally

Because the site loads JSON with `fetch()`, use a local web server rather than double-clicking `index.html`.

With Python installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a new GitHub repository, for example `doortech-training-simulator`.
2. Upload the **contents** of this folder to the repository.
3. Commit to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, select **GitHub Actions** if GitHub asks.
6. The included `.github/workflows/pages.yml` deploys the site automatically.
7. Open the deployment URL shown by GitHub after the workflow completes.

## Add a manufacturer/model

Add an object to `data/equipment.json`:

```json
{
  "id": "manufacturer-model",
  "manufacturer": "Manufacturer",
  "make_id": "manufacturer",
  "model": "Exact model",
  "type": "Industrial door control",
  "sector": "roller-shutter",
  "verified": false,
  "summary": "Exact description",
  "training": ["identification"],
  "source_note": "Manual/reference still to be checked."
}
```

Only change `verified` to `true` once the exact manual/version has been reviewed.

For larger model-specific content, create:

```text
equipment/<manufacturer>/<model>/
  config.json
  terminals.json
  faults.json
  lessons.json
```

## Recommended catalogue roadmap

### Roller shutters / industrial doors
- GfA Elektromaten
- Somfy
- Ellard
- Link Controls
- Teleco Automation
- Hörmann
- Marantec
- other UK/EU industrial-door systems

### Automatic gates
- CAME
- FAAC
- BFT
- Nice
- Benincà
- Roger Technology
- DEA System
- V2
- GIBIDI
- Marantec

### Traffic barriers
- CAME
- FAAC
- BFT
- Nice
- Benincà
- Roger Technology
- DEA and other verified barrier ranges

## Content roadmap

- Actual product photos or licensed training illustrations
- Panel-face and PCB hotspot maps
- Wiring drag/drop and cable tracing
- Virtual multimeter
- Parameter/programming menus
- Limit setup
- Safety-edge diagnostics
- Photocell alignment tests
- Loop detector tests
- Encoders
- Radio/access control
- Random faults
- Timed engineer call-outs
- Apprentice / Engineer / Senior Engineer difficulty
- Progress persistence
- Video lesson player
- Admin/content editor

## First verified seed source

The first lesson is based on GfA UK TS 971 product information and the UK-approved-accessory documentation for the PES/4.5TOF/POT TOF photocell. Keep the source references in the model folder when expanding or revising the lesson.
