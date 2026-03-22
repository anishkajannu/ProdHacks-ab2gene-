# Grant Helper Chrome Extension

This folder contains the first pass of a Chrome extension for grant-website autofill.

It is structured to follow the "Task 1 - Chrome Extension: Grant Autofill" build plan.

Current scope:

- Detect visible form fields on any page
- Infer what each field is likely asking for using labels, placeholders, names, ids, and input types
- Show the detected fields in the extension popup

## Task alignment

- `1.1 Form Audit & Schema Design`
  Current progress: initial canonical field keys live in `content.js` as the first-pass schema map
- `1.2 Extension Scaffolding (Manifest V3)`
  Current progress: manifest, popup, and content script are created
- `1.3 Field Detection & Fuzzy Matching Engine`
  Current progress: DOM scanner is implemented and extracting label/id/name/placeholder/ARIA context
- `1.4 Autofill Execution & UX`
  Not started yet
- `1.5 Testing & Beta Release`
  Not started yet

## Load it in Chrome

1. Open `chrome://extensions`
2. Turn on Developer mode
3. Click Load unpacked
4. Select this folder:

`chrome-extension`

## What it detects so far

- Contact fields like name, email, phone, job title
- Organization fields like company name, UEI, DUNS, EIN
- Address fields
- Project fields like title, summary, funding amount, start/end date

## Next step

Use the detected `fieldKey` values as the map for autofilling from the user's saved grant profile, then add confidence thresholds and a manual-review flow for unmapped fields.
