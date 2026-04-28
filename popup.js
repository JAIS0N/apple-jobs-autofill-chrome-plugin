const status = document.getElementById("status");

function setStatus(msg, type = "") {
  status.textContent = msg;
  status.className = "status " + type;
}

async function run(type) {
  setStatus("Filling fields...", "info");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || !tab.url.includes("jobs.apple.com")) {
    setStatus("Open Apple Careers first", "error");
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (e) {}

  chrome.tabs.sendMessage(tab.id, { action: "fill", type }, (result) => {
    if (chrome.runtime.lastError) {
      setStatus("Reload the page and try again", "error");
      return;
    }

    if (!result) {
      setStatus("No form fields found", "error");
      return;
    }

    const { filled, total, missed } = result;

    if (filled === 0 && total === 0) {
      setStatus("No job description fields found", "error");
    } else if (filled === 0) {
      setStatus(`Found ${total} field(s) — no employers matched`, "error");
    } else if (missed.length > 0) {
      setStatus(`Filled ${filled}/${total} — missed: ${missed.join(", ")}`, "info");
    } else {
      setStatus(`✓ Filled ${filled} employer${filled > 1 ? "s" : ""} successfully`, "success");
    }
  });
}

document.getElementById("btn-ml").addEventListener("click", () => run("ml"));
document.getElementById("btn-sde").addEventListener("click", () => run("sde"));
