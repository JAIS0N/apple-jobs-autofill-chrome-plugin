const statusEl = document.getElementById("status");

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = "status " + type;
}

// ── LaTeX → { employerKey: "bullet text" } ───────────────────
function parseLatex(tex) {
  const entries = {};

  // 1. Strip everything that isn't content
  let text = tex
    .replace(/\\company\{([^}]+)\}/g, "__COMPANY__$1__ENDCOMPANY__")
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\\textit\{([^}]+)\}/g, "$1")
    .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, "$1")
    .replace(/\\hfill/g, "  ")
    .replace(/\\textemdash(?:\{\})?/g, "—")
    .replace(/\\noindent\s*/g, "")
    .replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
    .replace(/\\vspace\{[^}]+\}/g, "")
    .replace(/\\item\b/g, "\n• ")
    .replace(/\$[^$]*\$/g, "")
    .replace(/\\\\/g, "\n")
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")
    .replace(/\\[a-zA-Z]+/g, "");

  // 2. Walk line-by-line
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const dateRx = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|19\d\d|20\d\d|present)\b/i;

  let currentKey = null;
  let currentBullets = [];

  function flush() {
    if (currentKey && currentBullets.length > 0) {
      entries[currentKey] = currentBullets.join("\n");
    }
  }

  for (const line of lines) {
    const isBullet = /^•/.test(line);

    // Company tag left by our placeholder
    const companyMatch = line.match(/__COMPANY__(.+?)__ENDCOMPANY__/);
    const hasDate = dateRx.test(line);

    if (companyMatch && hasDate && !isBullet) {
      flush();
      currentKey = companyMatch[1].toLowerCase().trim();
      currentBullets = [];
    } else if (hasDate && !isBullet && line.length > 8) {
      // Fallback: no \company{} but looks like a job header
      // Extract first substantial token before a dash/pipe/comma
      const raw = line.replace(/__COMPANY__|__ENDCOMPANY__/g, "");
      const m = raw.match(/,\s*([^,\-—|]+?)(?:\s*[-—|]|\s{2,}|$)/) ||
                raw.match(/^([^,\-—|]+?)(?:\s*[-—|])/);
      if (m) {
        flush();
        currentKey = m[1].toLowerCase().trim();
        currentBullets = [];
      }
    } else if (isBullet && currentKey) {
      currentBullets.push("• " + line.replace(/^•\s*/, ""));
    }
  }
  flush();

  return entries;
}

// ── Main ──────────────────────────────────────────────────────
document.getElementById("btn-fill").addEventListener("click", async () => {
  const latex = document.getElementById("latex-input").value.trim();
  if (!latex) {
    setStatus("Paste your LaTeX resume first", "error");
    return;
  }

  const descMap = parseLatex(latex);
  const keys = Object.keys(descMap);
  if (keys.length === 0) {
    setStatus("No employers found — check your LaTeX", "error");
    return;
  }

  setStatus(`Parsed ${keys.length} employer${keys.length > 1 ? "s" : ""} — filling…`, "info");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url || !tab.url.includes("jobs.apple.com")) {
    setStatus("Open Apple Careers first", "error");
    return;
  }

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
  } catch (e) {}

  chrome.tabs.sendMessage(tab.id, { action: "fill", descMap }, (result) => {
    if (chrome.runtime.lastError) { setStatus("Reload the page and try again", "error"); return; }
    if (!result) { setStatus("No form fields found", "error"); return; }

    const { filled, total, missed } = result;
    if (filled === 0 && total === 0)  setStatus("No job description fields found", "error");
    else if (filled === 0)            setStatus(`Found ${total} field(s) — no employers matched`, "error");
    else if (missed.length > 0)       setStatus(`Filled ${filled}/${total} — missed: ${missed.join(", ")}`, "info");
    else                              setStatus(`✓ Filled ${filled} employer${filled > 1 ? "s" : ""} successfully`, "success");
  });
});
