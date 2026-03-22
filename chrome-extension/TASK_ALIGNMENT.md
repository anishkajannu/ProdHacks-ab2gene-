# GrantFlow Task Alignment

This extension folder is organized around the Task 1 checklist.

## Current milestone

`1.3 - Field Detection & Fuzzy Matching Engine`

Implemented now:

- Manifest V3 extension shell
- Popup UI
- Content script DOM scanner
- Heuristic field classification into canonical schema keys
- Unknown/low-context fields surfaced for review in popup output

## File map

- `manifest.json`
  Scaffolding for Task `1.2`
- `content.js`
  Scanner and field inference for Task `1.3`
- `popup.html`, `popup.css`, `popup.js`
  Inspection UI for Task `1.2` and early `1.4`

## Recommended next sequence

1. Extract canonical schema into its own versioned data file
2. Add stronger fuzzy matching thresholds and review buckets
3. Persist per-site manual mappings in `chrome.storage.sync`
4. Add fill execution with synthetic `input` and `change` events
5. Add undo and field-highlighting overlays
