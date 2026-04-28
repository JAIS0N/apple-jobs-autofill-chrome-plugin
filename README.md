# Apple Careers Autofill Extension

A Chrome/Edge browser extension that autofills job description fields on Apple's careers portal (`jobs.apple.com`) — tailored per resume type.

---

## The Problem

Apple's careers portal has a resume autofill widget on the "Add Resume" step that is supposed to parse your uploaded resume and pre-populate the Profile Information form. For many users, this widget never loads — it just shows an infinite spinner.

After digging into the browser DevTools, the root cause turned out to be a chain of issues:

1. **The LinkedIn widget (`awliWidget`) depends on `platform.linkedin.com/in.js`** being loaded successfully to render the autofill UI buttons.
2. **Ad blockers or privacy extensions** (uBlock Origin, etc.) block this LinkedIn script, causing an `ERR_BLOCKED_BY_CLIENT` error.
3. Without that script, the widget throws an uncaught React error and the autofill section never renders — even the "Autofill from Resume" button (which has nothing to do with LinkedIn) stays hidden.
4. Even after disabling blockers, Apple appears to A/B test which widget version users see. Some users get both "Autofill from Resume" and "Apply with LinkedIn". Others only get the LinkedIn option — with no way to force the resume parser.

Since the autofill widget is unreliable and resume-tailoring per role is important, this extension bypasses the problem entirely by injecting your pre-written, role-specific bullet points directly into the form fields.

---

## What It Does

- Detects all employer/job description card sections on the Apple careers Profile Information page
- Matches each card to the right employer by reading the employer name input
- Injects your tailored bullet points directly into the job description textareas using React's internal setter (so the form registers the values correctly on submit)
- Supports two resume profiles: **ML Engineer** and **Software Engineer (SDE)**

---

## Installation

This extension is not on the Chrome Web Store. Install it in developer mode:

1. Download or clone this repository
2. Go to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Toggle **Developer mode** on (top-right corner)
4. Click **Load unpacked**
5. Select the `apple-autofill-extension` folder

The extension icon will appear in your browser toolbar.

---

## Usage

1. Go to [jobs.apple.com](https://jobs.apple.com) and start applying for a role
2. Upload your resume on the **Add Resume** step and click **Continue**
3. On the **Profile Information** step, fill in your employer names (or let LinkedIn autofill do it if it works for you)
4. Click the extension icon in the toolbar
5. Select **Machine Learning** or **Software Engineer** depending on the role
6. All job description fields are filled instantly with the matching bullet points

The status message in the popup tells you how many employers were matched and flags any it couldn't find.

---

## Customizing Your Bullet Points

Open `content.js` and edit the `descriptions` object. It has two top-level keys — `ml` and `sde` — each containing employer-keyed bullet point strings.

```js
const descriptions = {
  ml: {
    "your employer name": `• First bullet point.
• Second bullet point.
• Third bullet point.`,
    ...
  },
  sde: {
    "your employer name": `• First bullet point.
• Second bullet point.`,
    ...
  }
};
```

Employer matching is case-insensitive and uses `includes()` — so `"ancestry"` will match `"Ancestry.com"`, `"Ancestry (Lehi, UT)"`, etc. Keep keys short and lowercase.

After editing, go back to `chrome://extensions` and click the **refresh icon** on the extension card to reload it.

---

## Files

```
apple-autofill-extension/
├── manifest.json   # Extension config (permissions, host matches)
├── content.js      # Autofill logic + bullet point descriptions
├── popup.html      # Extension popup UI
├── popup.js        # Popup button handlers + messaging
└── icon.png        # Toolbar icon
```

---

## Why Not Just Use LinkedIn Autofill?

LinkedIn autofill pulls from a single fixed profile. If you tailor different resumes for different roles (ML vs SDE, for example), LinkedIn will fill every application with the same generic profile — defeating the purpose of tailoring. This extension lets you maintain separate, role-specific bullet points and apply them with one click.

---

## Limitations

- Only works on `jobs.apple.com` (host permission is scoped to that domain)
- Employer matching is fuzzy string match — if Apple's form pre-populates an employer name very differently from your key, you may need to adjust the key in `content.js`
- Requires Developer Mode (cannot be published to the Chrome Web Store without a developer account)

---

## Contributing

PRs welcome — especially for adding support for other career portals (Google, Meta, Amazon, etc.) that have similar autofill issues.

---

## License

MIT
