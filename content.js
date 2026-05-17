function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function setReactValue(el, value) {
  if (!el) return false;
  const proto = Object.getPrototypeOf(el);
  const desc  = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc && desc.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur",   { bubbles: true }));
  return true;
}

function normalize(text) {
  return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function getEmploymentCards() {
  return [...document.querySelectorAll("textarea")].map(textarea => {
    let node = textarea;
    for (let i = 0; i < 8 && node; i++) {
      const text = normalize(node.innerText);
      if (text.includes("employer") && text.includes("job title") && text.includes("job description"))
        return { textarea, container: node };
      node = node.parentElement;
    }
    return null;
  }).filter(Boolean);
}

function extractEmployer(container) {
  const input = [...container.querySelectorAll("input")].find(i => {
    const v = normalize(i.value);
    return v && !["yes","no","month","year"].includes(v) && v.length > 2;
  });
  return input ? normalize(input.value) : "";
}

async function fillDescriptionsWithMap(descMap) {
  const cards = getEmploymentCards();
  let filled = 0, missed = [];

  for (const card of cards) {
    const employer = extractEmployer(card.container);
    const key = Object.keys(descMap).find(k => employer.includes(k));
    if (!key) { if (employer) missed.push(employer); continue; }
    card.textarea.scrollIntoView({ block: "center" });
    await wait(200);
    setReactValue(card.textarea, descMap[key]);
    filled++;
    await wait(250);
  }
  return { filled, total: cards.length, missed };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fill") {
    fillDescriptionsWithMap(message.descMap || {}).then(sendResponse);
    return true;
  }
});
