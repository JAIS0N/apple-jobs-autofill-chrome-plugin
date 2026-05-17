# Apple Careers Autofill Extension

A Chrome/Edge browser extension that autofills job description fields on Apple's careers portal (`jobs.apple.com`) by parsing your LaTeX resume on the fly.

---

## The Problem

Apple's careers portal has a resume autofill widget on the "Add Resume" step that is supposed to parse your uploaded resume and pre-populate the Profile Information form. For many users, this widget never loads — it just shows an infinite spinner.

After digging into the browser DevTools, the root cause turned out to be a chain of issues:

1. **The LinkedIn widget (`awliWidget`) depends on `platform.linkedin.com/in.js`** being loaded successfully to render the autofill UI buttons.
2. **Ad blockers or privacy extensions** (uBlock Origin, etc.) block this LinkedIn script, causing an `ERR_BLOCKED_BY_CLIENT` error.
3. Without that script, the widget throws an uncaught React error and the autofill section never renders — even the "Autofill from Resume" button (which has nothing to do with LinkedIn) stays hidden.
4. Even after disabling blockers, Apple appears to A/B test which widget version users see. Some users get both "Autofill from Resume" and "Apply with LinkedIn". Others only get the LinkedIn option — with no way to force the resume parser.

Since the autofill widget is unreliable and resume-tailoring per role is important, this extension bypasses the problem entirely by parsing your LaTeX resume directly and injecting the matching bullet points into each form field.

---

## What It Does

- Parses your LaTeX resume in the popup — no files stored, no data sent anywhere
- Detects all employer/job description card sections on the Apple careers Profile Information page
- Matches each card to the right employer by reading the employer name input
- Injects the corresponding bullet points directly into the job description textareas using React's internal setter (so the form registers the values correctly on submit)

---

## Installation

This extension is not on the Chrome Web Store. Install it in developer mode:

1. Download or clone this repository
2. Go to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Toggle **Developer mode** on (top-right corner)
4. Click **Load unpacked**
5. Select the extension folder

The extension icon will appear in your browser toolbar.

---

## Usage

1. Go to [jobs.apple.com](https://jobs.apple.com) and start applying for a role
2. Upload your resume on the **Add Resume** step and click **Continue**
3. On the **Profile Information** step, fill in your employer names (or let LinkedIn autofill do it if it works for you)
4. Click the extension icon in the toolbar
5. Paste your LaTeX resume into the text area
6. Click **Autofill job descriptions**

The extension parses your LaTeX on the spot, matches each form card to the right employer, and fills every job description field. The status bar shows how many employers were matched and flags any it couldn't find.

Nothing is saved — paste fresh each time, or keep the popup open while you apply.

---

## How the LaTeX Parser Works

The parser looks for job header lines — any line that contains both a `\company{...}` tag and a year or date. It extracts the company name from the tag, then collects every `\item` beneath it as bullet points until the next employer header.

Your LaTeX format is used as-is. A block like this:

```latex
\noindent Software Engineer, \company{Ancestry} -- Lehi, UT \hfill Feb.\ 2026 -- Present
\begin{itemize}
  \item Built compliance auditing tool across 1000+ repos...
  \item Reduced PII detection false positives by 95\%...
\end{itemize}
```

becomes the key `ancestry` mapped to those two bullet points, which gets injected into the Ancestry card on the form.

Employer matching is case-insensitive and uses `includes()` — so `ancestry` matches `"Ancestry.com"`, `"Ancestry (Lehi, UT)"`, etc. Keep `\company{}` values short and unambiguous.

---

## Files

```
apple-autofill-extension/
├── manifest.json   # Extension config (permissions, host matches)
├── content.js      # Form detection, employer matching, field injection
├── popup.html      # Extension popup UI (LaTeX textarea + fill button)
├── popup.js        # LaTeX parser + messaging to content script
└── icon.png        # Toolbar icon
```

---

## Why Not Just Use LinkedIn Autofill?

LinkedIn autofill pulls from a single fixed profile. If you tailor different resumes for different roles, LinkedIn fills every application with the same generic profile — defeating the purpose of tailoring. This extension reads whichever LaTeX resume you paste, so you stay in control of what goes into each application.

---

## Limitations

- Only works on `jobs.apple.com` (host permission is scoped to that domain)
- Employer matching is fuzzy string match — if Apple's form pre-populates an employer name very differently from your `\company{}` value, you may need to adjust it
- Requires Developer Mode (cannot be published to the Chrome Web Store without a developer account)

---

## Contributing

PRs welcome — especially for adding support for other career portals (Google, Meta, Amazon, etc.) that have similar autofill issues.

---

## License

MIT
