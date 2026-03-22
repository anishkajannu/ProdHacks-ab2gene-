(function () {
  const FIELD_DEFINITIONS = [
    {
      key: "organization_name",
      aliases: [
        "organization name",
        "organisation name",
        "org name",
        "organization",
        "organisation",
        "company name",
        "institution name",
        "entity name",
        "business name",
        "legal name",
        "applicant organization",
        "applicant name",
        "organization legal name",
        "nonprofit name"
      ],
      autocomplete: ["organization", "organization-title"]
    },
    {
      key: "contact_name",
      aliases: [
        "contact name",
        "full name",
        "applicant name",
        "principal investigator",
        "authorized representative",
        "project director",
        "primary contact",
        "contact person",
        "authorized official",
        "point of contact"
      ],
      autocomplete: ["name"]
    },
    { key: "first_name", aliases: ["first name", "given name"], autocomplete: ["given-name"] },
    { key: "last_name", aliases: ["last name", "surname", "family name"], autocomplete: ["family-name"] },
    { key: "middle_initial", aliases: ["middle initial", "middle name", "mi"] },
    { key: "password", aliases: ["password", "create password", "confirm password", "new password"], inputTypes: ["password"] },
    { key: "confirm_password", aliases: ["confirm password", "re enter password", "reenter password", "verify password"], inputTypes: ["password"] },
    { key: "username", aliases: ["username", "user name", "login name", "account username"] },
    { key: "email", aliases: ["email", "e mail", "email address"], autocomplete: ["email"] },
    { key: "phone", aliases: ["phone", "telephone", "phone number", "telephone number", "primary phone number", "organization phone"], autocomplete: ["tel", "tel-national"] },
    { key: "mobile_phone", aliases: ["mobile phone", "mobile phone number", "cell phone", "mobile number", "confirm mobile phone number"], autocomplete: ["tel", "tel-national"] },
    { key: "job_title", aliases: ["job title", "title", "role", "position"], autocomplete: ["organization-title"] },
    { key: "website", aliases: ["website", "web site", "website url", "organization website"], autocomplete: ["url"] },
    { key: "uei", aliases: ["uei", "unique entity identifier", "unique entity id", "sam uei"] },
    { key: "duns", aliases: ["duns", "duns number", "dun and bradstreet", "duns #"] },
    { key: "ein", aliases: ["ein", "tin", "tax id", "taxpayer identification", "federal tax id", "tax id number", "ein tax id"] },
    { key: "year_founded", aliases: ["year founded", "founded year", "organization founded", "year established", "date founded"] },
    { key: "address_line_1", aliases: ["address line 1", "street address", "mailing address", "address", "address 1", "street 1"] },
    { key: "address_line_2", aliases: ["address line 2", "suite", "unit", "apartment", "apt", "address 2", "suite number"] },
    { key: "city", aliases: ["city", "town"], autocomplete: ["address-level2"] },
    { key: "state", aliases: ["state", "province", "region", "state or province"], autocomplete: ["address-level1"] },
    { key: "zip", aliases: ["zip", "zip code", "zipcode", "postal code", "postal", "postal zip"], autocomplete: ["postal-code"] },
    { key: "country", aliases: ["country", "nation"], autocomplete: ["country", "country-name"] },
    { key: "county", aliases: ["county", "parish", "borough"] },
    { key: "project_title", aliases: ["project title", "proposal title", "application title", "program title", "grant title"] },
    {
      key: "project_summary",
      aliases: ["project summary", "project description", "summary", "abstract", "description", "narrative", "proposal summary", "executive summary", "project narrative"]
    },
    { key: "funding_amount", aliases: ["amount requested", "funding amount", "request amount", "budget", "requested amount", "grant amount requested", "total project budget"] },
    { key: "start_date", aliases: ["start date", "project start", "proposed start date"] },
    { key: "end_date", aliases: ["end date", "project end", "proposed end date"] },
    { key: "birth_month", aliases: ["birth month", "month of birth", "date of birth month"] },
    { key: "birth_day", aliases: ["birth day", "day of birth", "date of birth day"] }
  ];

  const INPUT_SELECTOR = [
    "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset'])",
    "textarea",
    "select"
  ].join(", ");

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function dedupe(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function getText(node) {
    return normalizeText(node?.innerText || node?.textContent || "");
  }

  function hasOtherFormControls(node, currentElement) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    const controls = Array.from(node.querySelectorAll(INPUT_SELECTOR));
    return controls.some((control) => control !== currentElement);
  }

  function getPreviousTextNode(element) {
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (hasOtherFormControls(sibling, element)) {
        sibling = sibling.previousElementSibling;
        continue;
      }
      const text = getText(sibling);
      if (text && text.length <= 80 && isLikelyLabelText(text)) {
        return text;
      }
      sibling = sibling.previousElementSibling;
    }
    return "";
  }

  function isLikelyLabelText(text) {
    if (!text) {
      return false;
    }

    const words = text.split(" ").filter(Boolean);
    if (words.length > 8) {
      return false;
    }

    const blockedPhrases = [
      "required fields",
      "all fields",
      "please enter",
      "click here",
      "submit application",
      "grant application",
      "contact information",
      "organization information"
    ];

    return !blockedPhrases.some((phrase) => text.includes(phrase));
  }

  function distanceBetweenRects(a, b) {
    const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
    const dy = Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getNearbyInputs(element) {
    const container = element.closest("form, fieldset, table, section, article, div") || document.body;
    return Array.from(container.querySelectorAll(INPUT_SELECTOR)).filter((node) => node instanceof HTMLElement);
  }

  function isNearestFieldForText(element, nodeRect) {
    const nearbyInputs = getNearbyInputs(element);
    const elementRect = element.getBoundingClientRect();
    const currentDistance = distanceBetweenRects(elementRect, nodeRect);

    for (const input of nearbyInputs) {
      if (input === element || !(input instanceof HTMLElement)) {
        continue;
      }

      const inputRect = input.getBoundingClientRect();
      if (!inputRect.width || !inputRect.height) {
        continue;
      }

      const otherDistance = distanceBetweenRects(inputRect, nodeRect);
      if (otherDistance + 4 < currentDistance) {
        return false;
      }
    }

    return true;
  }

  function getNearbyLayoutText(element) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return [];
    }

    const selector = "label, span, p, td, th, legend, dt, dd, strong, b";
    const candidates = [];

    document.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }
      if (node === element || node.contains(element) || element.contains(node)) {
        return;
      }
      if (hasOtherFormControls(node, element)) {
        return;
      }

      const text = getText(node);
      if (!text || text.length > 70 || !isLikelyLabelText(text)) {
        return;
      }

      const nodeRect = node.getBoundingClientRect();
      if (!nodeRect.width || !nodeRect.height) {
        return;
      }

      if (!isNearestFieldForText(element, nodeRect)) {
        return;
      }

      const verticalAligned = Math.abs(nodeRect.top - rect.top) < 36 || Math.abs(nodeRect.bottom - rect.bottom) < 36;
      const aboveField = nodeRect.bottom <= rect.top + 12 && rect.top - nodeRect.bottom < 48;
      const leftOfField = nodeRect.right <= rect.left + 24 && rect.left - nodeRect.right < 240;

      if (!verticalAligned && !aboveField && !leftOfField) {
        return;
      }

      candidates.push({
        text,
        distance: distanceBetweenRects(rect, nodeRect)
      });
    });

    return candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .map((entry) => entry.text);
  }

  function getLabelSignals(element) {
    const directSignals = [];
    const nearbySignals = [];
    const id = element.id;

    if (id) {
      document.querySelectorAll(`label[for="${CSS.escape(id)}"]`).forEach((label) => {
        const text = getText(label);
        if (isLikelyLabelText(text)) {
          directSignals.push(text);
        }
      });
    }

    const wrappingLabel = element.closest("label");
    if (wrappingLabel) {
      const text = getText(wrappingLabel);
      if (isLikelyLabelText(text)) {
        directSignals.push(text);
      }
    }

    const ariaLabel = normalizeText(element.getAttribute("aria-label"));
    if (ariaLabel && isLikelyLabelText(ariaLabel)) {
      directSignals.push(ariaLabel);
    }

    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      labelledBy
        .split(/\s+/)
        .map((labelId) => document.getElementById(labelId))
        .filter(Boolean)
        .forEach((labelNode) => {
          const text = getText(labelNode);
          if (isLikelyLabelText(text)) {
            directSignals.push(text);
          }
        });
    }

    const previousText = getPreviousTextNode(element);
    if (previousText && isLikelyLabelText(previousText)) {
      nearbySignals.push(previousText);
    }

    getNearbyLayoutText(element).forEach((text) => {
      nearbySignals.push(text);
    });

    const heading = element.closest("fieldset, section, article, form")?.querySelector("legend, h1, h2, h3, h4, h5, h6");
    if (heading && directSignals.length === 0) {
      const text = getText(heading);
      if (isLikelyLabelText(text)) {
        nearbySignals.push(text);
      }
    }

    return {
      direct: dedupe(directSignals),
      nearby: dedupe(nearbySignals)
    };
  }

  function getSelectHints(element) {
    if (element.tagName.toLowerCase() !== "select") {
      return [];
    }

    const options = Array.from(element.querySelectorAll("option"))
      .slice(0, 8)
      .map((option) => normalizeText(option.textContent))
      .filter(Boolean);

    return options;
  }

  function buildSignals(element) {
    const rawLabels = getLabelSignals(element);
    const name = normalizeText(element.getAttribute("name"));
    const id = normalizeText(element.id);
    const placeholder = normalizeText(element.getAttribute("placeholder"));
    const autocomplete = normalizeText(element.getAttribute("autocomplete"));
    const dataField = normalizeText(element.getAttribute("data-field"));
    const dataTestId = normalizeText(element.getAttribute("data-testid"));
    const type = normalizeText(element.getAttribute("type") || element.tagName);
    const selectHints = getSelectHints(element);
    const hasStrongOwnSignal = rawLabels.direct.length > 0 || placeholder.length > 0;
    const labels = {
      direct: rawLabels.direct,
      nearby: hasStrongOwnSignal ? [] : rawLabels.nearby
    };

    return {
      labels,
      allLabels: dedupe([...labels.direct, ...labels.nearby]),
      name,
      id,
      placeholder,
      autocomplete,
      dataField,
      dataTestId,
      type,
      selectHints,
      descriptor: dedupe([
        labels.direct.join(" "),
        labels.nearby.join(" "),
        placeholder,
        name,
        id,
        autocomplete,
        dataField,
        dataTestId,
        type,
        selectHints.join(" ")
      ]).join(" ")
    };
  }

  function includesWholePhrase(haystack, needle) {
    if (!haystack || !needle) {
      return false;
    }

    if (haystack === needle) {
      return true;
    }

    if (haystack.includes(needle)) {
      return true;
    }

    const compactHaystack = haystack.replace(/\s+/g, "");
    const compactNeedle = needle.replace(/\s+/g, "");
    return compactHaystack.includes(compactNeedle);
  }

  function tokenOverlapScore(text, alias) {
    const textWords = text.split(" ").filter(Boolean);
    const aliasWords = alias.split(" ").filter(Boolean);
    if (!textWords.length || !aliasWords.length) {
      return 0;
    }

    let matches = 0;
    aliasWords.forEach((word) => {
      if (textWords.includes(word)) {
        matches += 1;
      }
    });

    return matches / aliasWords.length;
  }

  function scoreDefinition(definition, signals, element) {
    let score = 0;
    const reasons = [];
    const tagName = element.tagName.toLowerCase();
    const type = signals.type;

    definition.aliases.forEach((alias) => {
      signals.labels.direct.forEach((label) => {
        if (includesWholePhrase(label, alias)) {
          score += 0.82;
          reasons.push(`direct label matched "${alias}"`);
        } else {
          const overlap = tokenOverlapScore(label, alias);
          if (overlap >= 0.75) {
            score += 0.46;
            reasons.push(`direct label overlap with "${alias}"`);
          }
        }
      });

      signals.labels.nearby.forEach((label) => {
        if (includesWholePhrase(label, alias)) {
          score += 0.24;
          reasons.push(`nearby text matched "${alias}"`);
        } else {
          const overlap = tokenOverlapScore(label, alias);
          if (overlap >= 0.75) {
            score += 0.16;
            reasons.push(`nearby text overlap with "${alias}"`);
          }
        }
      });

      [signals.name, signals.id, signals.placeholder, signals.dataField, signals.dataTestId].forEach((value) => {
        if (includesWholePhrase(value, alias)) {
          const metadataWeight = value === signals.placeholder ? 0.5 : 0.34;
          score += metadataWeight;
          reasons.push(value === signals.placeholder ? `placeholder matched "${alias}"` : `field metadata matched "${alias}"`);
        } else {
          const overlap = tokenOverlapScore(value, alias);
          if (overlap >= 0.8) {
            const overlapWeight = value === signals.placeholder ? 0.32 : 0.22;
            score += overlapWeight;
            reasons.push(value === signals.placeholder ? `placeholder overlap with "${alias}"` : `metadata overlap with "${alias}"`);
          }
        }
      });

      signals.selectHints.forEach((hint) => {
        if (includesWholePhrase(hint, alias)) {
          score += 0.22;
          reasons.push(`select options hint "${alias}"`);
        }
      });

      const descriptorOverlap = tokenOverlapScore(signals.descriptor, alias);
      if (descriptorOverlap >= 0.8) {
        score += 0.18;
        reasons.push(`descriptor overlap with "${alias}"`);
      }
    });

    (definition.autocomplete || []).forEach((value) => {
      if (signals.autocomplete === value) {
        score += 0.45;
        reasons.push(`autocomplete=${value}`);
      }
    });

    if (definition.inputTypes && definition.inputTypes.includes(type)) {
      score += 0.72;
      reasons.push(`input type=${type}`);
    }

    if (definition.key === "email" && type === "email") {
      score += 0.72;
      reasons.push("input type=email");
    } else if (definition.key === "email" && type && type !== "email" && !signals.labels.direct.some((label) => label.includes("email"))) {
      score -= 0.35;
    }
    if (definition.key === "phone" && type === "tel") {
      score += 0.72;
      reasons.push("input type=tel");
    } else if (definition.key === "phone" && type && type !== "tel" && type !== "text" && !signals.labels.direct.some((label) => label.includes("phone") || label.includes("telephone"))) {
      score -= 0.28;
    }
    if (definition.key === "mobile_phone" && (type === "tel" || signals.descriptor.includes("mobile") || signals.descriptor.includes("cell"))) {
      score += 0.72;
      reasons.push("mobile phone signal");
    }
    if ((definition.key === "start_date" || definition.key === "end_date") && type === "date") {
      score += 0.4;
      reasons.push("input type=date");
    }
    if (definition.key === "middle_initial" && (signals.descriptor.includes("middle initial") || signals.descriptor === "mi")) {
      score += 0.72;
      reasons.push("middle initial signal");
    }
    if (definition.key === "username" && signals.descriptor.includes("username")) {
      score += 0.72;
      reasons.push("username signal");
    }
    if (definition.key === "confirm_password" && signals.descriptor.includes("confirm password")) {
      score += 0.8;
      reasons.push("confirm password signal");
    }
    if (definition.key === "year_founded" && (signals.descriptor.includes("year founded") || signals.descriptor.includes("year established"))) {
      score += 0.75;
      reasons.push("year founded signal");
    }
    if (definition.key === "ein" && (signals.descriptor.includes("tax id") || signals.descriptor.includes("ein"))) {
      score += 0.72;
      reasons.push("tax id signal");
    }
    if (definition.key === "uei" && signals.descriptor.includes("uei")) {
      score += 0.82;
      reasons.push("uei signal");
    }
    if (definition.key === "duns" && signals.descriptor.includes("duns")) {
      score += 0.82;
      reasons.push("duns signal");
    }
    if (definition.key === "birth_month" && tagName === "select") {
      const optionBlob = signals.selectHints.join(" ");
      if (optionBlob.includes("january") || optionBlob.includes("february")) {
        score += 0.65;
        reasons.push("month-like select options");
      }
    }
    if (definition.key === "birth_day" && tagName === "select") {
      const numericOptions = signals.selectHints.filter((hint) => /^\d{1,2}$/.test(hint)).length;
      if (numericOptions >= 5) {
        score += 0.65;
        reasons.push("day-like select options");
      }
    }
    if (definition.key === "project_summary" && element.tagName.toLowerCase() === "textarea") {
      score += 0.12;
      reasons.push("textarea bias");
    }
    if (definition.key === "funding_amount" && (type === "number" || signals.descriptor.includes("amount") || signals.descriptor.includes("budget"))) {
      score += 0.22;
      reasons.push("amount-like field");
    }
    if ((definition.key === "address_line_1" || definition.key === "address_line_2" || definition.key === "city" || definition.key === "state" || definition.key === "zip" || definition.key === "country") && signals.descriptor.includes("address")) {
      score += 0.12;
      reasons.push("address block signal");
    }
    if ((definition.key === "organization_name" || definition.key === "contact_name") && signals.descriptor.includes("applicant")) {
      score += 0.18;
      reasons.push("applicant signal");
    }
    if (definition.key === "job_title" && signals.descriptor.includes("title")) {
      score += 0.18;
      reasons.push("title signal");
    }
    if (definition.key === "country" && element.tagName.toLowerCase() === "select") {
      const optionBlob = signals.selectHints.join(" ");
      if (optionBlob.includes("united states") || optionBlob.includes("canada")) {
        score += 0.35;
        reasons.push("country-like select options");
      }
    }
    if (definition.key === "state" && element.tagName.toLowerCase() === "select") {
      const optionBlob = signals.selectHints.join(" ");
      if (optionBlob.includes("alabama") || optionBlob.includes("california") || optionBlob.includes("new york")) {
        score += 0.35;
        reasons.push("state-like select options");
      }
    }

    if ((definition.key === "email" || definition.key === "phone") && (type === "checkbox" || type === "radio" || tagName === "select")) {
      score -= 0.85;
    }
    if (definition.key === "password" && type !== "password") {
      score -= 0.8;
    }
    if ((definition.key === "birth_month" || definition.key === "birth_day") && tagName !== "select") {
      score -= 0.5;
    }

    return {
      fieldKey: definition.key,
      confidence: Math.max(0, Math.min(score, 0.99)),
      reasons: dedupe(reasons).slice(0, 4)
    };
  }

  function dampenDuplicateMatches(results) {
    const duplicateSensitiveKeys = new Set(["email", "phone"]);
    const grouped = new Map();

    results.forEach((result, index) => {
      if (!duplicateSensitiveKeys.has(result.fieldKey)) {
        return;
      }

      const normalizedLabel = normalizeText(result.label || result.placeholder || result.name || result.id);
      const groupKey = `${result.fieldKey}:${normalizedLabel || "unlabeled"}`;
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      grouped.get(groupKey).push({ result, index });
    });

    grouped.forEach((entries) => {
      if (entries.length < 2) {
        return;
      }

      entries.sort((a, b) => b.result.confidence - a.result.confidence);
      for (let i = 1; i < entries.length; i += 1) {
        const entry = entries[i].result;
        entry.confidence = Math.max(0.2, Number((entry.confidence - 0.28).toFixed(2)));
        entry.confidenceBucket = classifyConfidence(entry.confidence);
        entry.reasons = dedupe([...entry.reasons, "duplicate match dampened"]);
        if (entry.confidence < 0.28) {
          entry.fieldKey = "unknown";
          entry.confidenceBucket = "low";
        }
      }
    });

    return results;
  }

  function applyFallbacks(bestMatch, signals, element) {
    const type = signals.type;
    const descriptor = signals.descriptor;

    if (bestMatch.confidence < 0.35) {
      if (type === "email") {
        return { fieldKey: "email", confidence: 0.76, reasons: ["fallback from input type=email"] };
      }
      if (type === "tel") {
        return { fieldKey: "phone", confidence: 0.76, reasons: ["fallback from input type=tel"] };
      }
      if (type === "password") {
        return { fieldKey: "password", confidence: 0.76, reasons: ["fallback from input type=password"] };
      }
      if (signals.descriptor.includes("confirm password")) {
        return { fieldKey: "confirm_password", confidence: 0.82, reasons: ["confirm password descriptor fallback"] };
      }
      if (signals.descriptor.includes("username")) {
        return { fieldKey: "username", confidence: 0.8, reasons: ["username descriptor fallback"] };
      }
      if (type === "date" && descriptor.includes("start")) {
        return { fieldKey: "start_date", confidence: 0.58, reasons: ["date field with start signal"] };
      }
      if (type === "date" && descriptor.includes("end")) {
        return { fieldKey: "end_date", confidence: 0.58, reasons: ["date field with end signal"] };
      }
      if (element.tagName.toLowerCase() === "textarea") {
        return { fieldKey: "project_summary", confidence: 0.42, reasons: ["textarea fallback for narrative field"] };
      }
      if (signals.autocomplete === "given-name") {
        return { fieldKey: "first_name", confidence: 0.8, reasons: ["autocomplete given-name"] };
      }
      if (signals.autocomplete === "family-name") {
        return { fieldKey: "last_name", confidence: 0.8, reasons: ["autocomplete family-name"] };
      }
      if (signals.autocomplete === "postal-code") {
        return { fieldKey: "zip", confidence: 0.8, reasons: ["autocomplete postal-code"] };
      }
      if (signals.autocomplete === "address-level2") {
        return { fieldKey: "city", confidence: 0.8, reasons: ["autocomplete address-level2"] };
      }
      if (signals.autocomplete === "address-level1") {
        return { fieldKey: "state", confidence: 0.8, reasons: ["autocomplete address-level1"] };
      }
      if (signals.autocomplete === "country" || signals.autocomplete === "country-name") {
        return { fieldKey: "country", confidence: 0.8, reasons: ["autocomplete country"] };
      }
      if (signals.descriptor.includes("zip") || signals.descriptor.includes("postal")) {
        return { fieldKey: "zip", confidence: 0.55, reasons: ["zip/postal descriptor fallback"] };
      }
      if (signals.descriptor.includes("city")) {
        return { fieldKey: "city", confidence: 0.55, reasons: ["city descriptor fallback"] };
      }
      if (signals.descriptor.includes("state") || signals.descriptor.includes("province")) {
        return { fieldKey: "state", confidence: 0.55, reasons: ["state/province descriptor fallback"] };
      }
      if (signals.descriptor.includes("country")) {
        return { fieldKey: "country", confidence: 0.55, reasons: ["country descriptor fallback"] };
      }
      if (signals.descriptor.includes("organization") || signals.descriptor.includes("organisation") || signals.descriptor.includes("legal name")) {
        return { fieldKey: "organization_name", confidence: 0.55, reasons: ["organization descriptor fallback"] };
      }
      if (signals.descriptor.includes("middle initial")) {
        return { fieldKey: "middle_initial", confidence: 0.78, reasons: ["middle initial descriptor fallback"] };
      }
      if (signals.descriptor.includes("primary phone")) {
        return { fieldKey: "phone", confidence: 0.82, reasons: ["primary phone descriptor fallback"] };
      }
      if (signals.descriptor.includes("mobile phone") || signals.descriptor.includes("cell phone")) {
        return { fieldKey: "mobile_phone", confidence: 0.82, reasons: ["mobile phone descriptor fallback"] };
      }
      if (signals.descriptor.includes("year founded") || signals.descriptor.includes("year established")) {
        return { fieldKey: "year_founded", confidence: 0.8, reasons: ["year founded descriptor fallback"] };
      }
      if (signals.descriptor.includes("tax id") || signals.descriptor.includes("ein")) {
        return { fieldKey: "ein", confidence: 0.82, reasons: ["ein descriptor fallback"] };
      }
      if (signals.descriptor.includes("uei")) {
        return { fieldKey: "uei", confidence: 0.82, reasons: ["uei descriptor fallback"] };
      }
      if (signals.descriptor.includes("duns")) {
        return { fieldKey: "duns", confidence: 0.82, reasons: ["duns descriptor fallback"] };
      }
      if (signals.descriptor.includes("birth month")) {
        return { fieldKey: "birth_month", confidence: 0.62, reasons: ["birth month descriptor fallback"] };
      }
      if (signals.descriptor.includes("birth day")) {
        return { fieldKey: "birth_day", confidence: 0.62, reasons: ["birth day descriptor fallback"] };
      }
    }

    return bestMatch;
  }

  function classifyConfidence(confidence) {
    if (confidence >= 0.75) {
      return "high";
    }
    if (confidence >= 0.45) {
      return "review";
    }
    return "low";
  }

  function inferField(element) {
    const signals = buildSignals(element);

    let bestMatch = {
      fieldKey: "unknown",
      confidence: 0,
      reasons: []
    };

    FIELD_DEFINITIONS.forEach((definition) => {
      const candidate = scoreDefinition(definition, signals, element);
      if (candidate.confidence > bestMatch.confidence) {
        bestMatch = candidate;
      }
    });

    bestMatch = applyFallbacks(bestMatch, signals, element);

    if (bestMatch.confidence < 0.22) {
      bestMatch = {
        fieldKey: "unknown",
        confidence: bestMatch.confidence,
        reasons: bestMatch.reasons.length ? bestMatch.reasons : ["no strong mapping signals found"]
      };
    }

    return {
      ...bestMatch,
      confidenceBucket: classifyConfidence(bestMatch.confidence),
      descriptor: signals.descriptor,
      labelSignals: signals.allLabels
    };
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 &&
      rect.height > 0 &&
      style.visibility !== "hidden" &&
      style.display !== "none";
  }

  function buildDomPath(element) {
    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part += `#${current.id}`;
        parts.unshift(part);
        break;
      }

      if (current.classList.length > 0) {
        part += `.${Array.from(current.classList).slice(0, 2).join(".")}`;
      }

      parts.unshift(part);
      current = current.parentElement;
    }

    return parts.join(" > ");
  }

  function scanFields() {
    const results = [];

    document.querySelectorAll(INPUT_SELECTOR).forEach((element, index) => {
      if (!(element instanceof HTMLElement) || !isVisible(element) || element.disabled || element.readOnly) {
        return;
      }

      const inference = inferField(element);
      const rect = element.getBoundingClientRect();

      results.push({
        index,
        tagName: element.tagName.toLowerCase(),
        type: element.getAttribute("type") || element.tagName.toLowerCase(),
        name: element.getAttribute("name") || "",
        id: element.id || "",
        placeholder: element.getAttribute("placeholder") || "",
        label: inference.labelSignals.join(" | "),
        fieldKey: inference.fieldKey,
        confidence: Number(inference.confidence.toFixed(2)),
        confidenceBucket: inference.confidenceBucket,
        reasons: inference.reasons,
        descriptor: inference.descriptor,
        path: buildDomPath(element),
        position: {
          top: Math.round(rect.top + window.scrollY),
          left: Math.round(rect.left + window.scrollX)
        }
      });
    });

    return dampenDuplicateMatches(results).sort((a, b) => b.confidence - a.confidence);
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "GRANT_HELPER_SCAN_FIELDS") {
      sendResponse({
        url: window.location.href,
        title: document.title,
        fields: scanFields()
      });
      return true;
    }

    return false;
  });
})();
