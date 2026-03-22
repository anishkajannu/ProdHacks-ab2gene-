const statusNode = document.getElementById("status");
const resultsNode = document.getElementById("results");
const scanButton = document.getElementById("scan-button");

function setStatus(message) {
  statusNode.textContent = message;
}

function renderFields(payload) {
  const fields = payload.fields || [];
  const summary = summarizeFields(fields);

  if (fields.length === 0) {
    resultsNode.innerHTML = "<p class=\"field-meta\">No visible form fields were detected on this page.</p>";
    return;
  }

  resultsNode.innerHTML = `
    <section class="summary-card">
      <p class="summary-line">High confidence: ${summary.high}</p>
      <p class="summary-line">Needs review: ${summary.review}</p>
      <p class="summary-line">Unknown: ${summary.low}</p>
    </section>
  ` + fields
    .map((field) => {
      const title = field.fieldKey === "unknown" ? "Unknown field" : field.fieldKey.replace(/_/g, " ");
      const label = field.label || field.placeholder || field.name || field.id || "Unlabeled field";
      const reasons = (field.reasons || []).join(", ");
      const bucketLabel = field.confidenceBucket === "high"
        ? "High confidence"
        : field.confidenceBucket === "review"
          ? "Review"
          : "Unknown";

      return `
        <section class="field-card field-card--${escapeHtml(field.confidenceBucket)}">
          <h2>${escapeHtml(title)}</h2>
          <p class="field-meta">${escapeHtml(label)}</p>
          <p class="field-meta">${escapeHtml(field.tagName)} · ${escapeHtml(field.type)}</p>
          <p class="field-meta">${escapeHtml(field.path)}</p>
          <span class="confidence">${escapeHtml(bucketLabel)} · ${Math.round(field.confidence * 100)}%</span>
          <p class="field-meta">${escapeHtml(reasons || "No keyword match, fallback heuristic only")}</p>
          <p class="field-meta">${escapeHtml(field.descriptor)}</p>
        </section>
      `;
    })
    .join("");
}

function summarizeFields(fields) {
  return fields.reduce((acc, field) => {
    if (field.confidenceBucket === "high") {
      acc.high += 1;
    } else if (field.confidenceBucket === "review") {
      acc.review += 1;
    } else {
      acc.low += 1;
    }
    return acc;
  }, { high: 0, review: 0, low: 0 });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function scanCurrentPage() {
  setStatus("Running Task 1.3 scan on the current page...");
  resultsNode.innerHTML = "";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus("Could not find the active tab.");
    return;
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: "GRANT_HELPER_SCAN_FIELDS" }).catch(() => null);

  if (!response) {
    setStatus("This page did not respond. Try refreshing the tab and scanning again.");
    return;
  }

  setStatus(`Task 1.3 scan complete. Found ${response.fields.length} visible field${response.fields.length === 1 ? "" : "s"} on this page.`);
  renderFields(response);
}

scanButton.addEventListener("click", () => {
  scanCurrentPage().catch((error) => {
    console.error(error);
    setStatus("Scan failed. Check the extension console for details.");
  });
});
