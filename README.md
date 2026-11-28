<div align="center">

# ✦ Photon MD

**A blazing-fast, zero-framework desktop Markdown & LaTeX editor engineered from scratch with Vanilla JavaScript, CSS, and Electron.**

![Version](https://img.shields.io/badge/version-1.4.0-0891b2?style=flat-square)
![Engine](https://img.shields.io/badge/engine-Custom_DOM-eab308?style=flat-square)
![LaTeX](https://img.shields.io/badge/LaTeX-MathJax_v3-0f766e?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows_%7C_Electron-1e293b?style=flat-square)
![License](https://img.shields.io/badge/license-Source--Available-b45309?style=flat-square)

</div>

---

## Preview

<table>
  <tr>
    <td align="center"><b>Photon Eclipse (Dark)</b></td>
    <td align="center"><b>Photon Daylight (Light)</b></td>
  </tr>
  <tr>
    <td><img src="assets/photon-eclipse.png" alt="Photon MD Eclipse Dark Theme" /></td>
    <td><img src="assets/photon-daylight.png" alt="Photon MD Daylight Light Theme" /></td>
  </tr>
</table>

---

## Why Photon MD?

Most desktop Markdown editors wrap heavy third-party code editors (CodeMirror, Monaco, ProseMirror) or rely on a stack of community plugins just to deliver live math, clean tables, and print-ready PDFs.

**Photon MD** is built from the ground up with **zero third-party editor frameworks** and **100% offline-first assets** (bundled MathJax v3, Plus Jakarta Sans, and JetBrains Mono). Your notes stay pure, portable `.md` files on your local disk—no accounts, no subscriptions, and zero cloud lock-in.

---

## Key Features

### Live Authoring & Recursive Rendering
* **Instant Inline & Nested Formatting:** Live rendering for `**bold**`, `*italic*`, `` `inline code` ``, checkboxes (`[]`), and inline HTML—including nested combinations such as bold wrapping italics and live equations.
* **MathJax v3 LaTeX Engine:** Scoped microtask typesetting for inline (`$...$`) and display (`$$...$$`) equations, including full support inside table cells.
* **Blockquotes & Notes (`> `):** Multi-depth notes (`>`, `>>`) that seamlessly merge consecutive lines into a single styled card, with `Enter` continuation and empty-line exit.
* **Hanging-Indent Lists:** Bullet lists (`*`, `-`, `+`, `&`) keep wrapped lines cleanly aligned beneath the text rather than snapping to the left margin.
* **Smart Selection Wrapping:** Highlight any text and press `(`, `{`, `[`, `$`, `` ` ``, or `*` to wrap it immediately without losing focus.

### Interactive Tables & Syntax-Highlighted Code
* **Zero-Friction Table Grid:** Insert tables up to `6 × 6` directly from the toolbar with muted placeholder cells ready to type into immediately. Supports `Tab` / `Shift + Tab` navigation (auto-appends a new row at the end), `ArrowUp` / `ArrowDown` column jumping, floating row/column controls, inline Markdown, and live MathJax inside cells.
* **Fenced Code Blocks (` ```lang `):** Dedicated language header bars and a custom single-pass tokenizer highlighting comments, strings, keywords, types, numbers, and function calls.

### Print-Ready PDFs
* **Photon Daylight & Photon Eclipse:** Switch instantaneously between Light and Dark themes featuring Solar Gold → Prism Cyan spectrum underlines on `H1` / `H2`, gold accent bars on `H3`, and centered `✦` optical-beam horizontal dividers (`---`).
* **Automatic Daylight Vector PDF Export:** Write comfortably in Dark Mode at night and export crisp, white-paper vector PDFs with full branding and vector MathJax equations—no manual theme switching required.

### Native Grapheme & Indic Script Support
* Powered by `Intl.Segmenter` (`granularity: 'grapheme'`) and a dedicated IME composition pipeline so complex scripts like **Bengali (Avro Phonetic)** conjuncts (`যুক্তাক্ষর`) edit, select, and backspace as atomic visual units without splitting Unicode code points.

### Local Vault Workspace
* Open any folder on your machine as a vault, browse nested directories and `.md` files in the collapsible sidebar, create new notes inline, and save or export straight to disk.

---

## Architecture: Custom DOM Engine

Instead of handing the document over to a bloated framework or a single fragile `contenteditable` block, Photon MD runs on a proprietary flat-line DOM engine developed from scratch in **vanilla javascript**:

| Layer | Implementation |
| :--- | :--- |
| **Line & Container Hierarchy** | Each line is a `.line` container holding grapheme-level `.lc` character nodes and inline rich containers (`.bc`, `.ic`, `.mc`, `.linecc`, `.hc`, `.bltc`, `.bqc`). |
| **Inactive Line Packing (`.upc`)** | When the cursor leaves a line, contiguous `.lc` nodes collapse into compact `.upc` text nodes via `helperlcpacker()`, keeping DOM node counts low and scrolling fast. Clicking or arrowing into a `.upc` unpacks it at the exact clicked grapheme offset. |
| **Lossless Markdown Round-Tripping** | Every rendered container stores its exact Markdown source in an `rwmd` attribute, enabling instant explosion for editing and clean `.md` export via `mdexporter()`. |
| **Scoped Microtask MathJax** | Newly closed `.mc` nodes trigger `MathJax.typesetPromise([node])` inside `queueMicrotask`, avoiding full-document reflows while typing. |
| **Block-Level Undo / Redo** | Debounced snapshot history (`Ctrl + Z` / `Ctrl + Y`) preserves cursor block index, grapheme offset, tables, code blocks, and horizontal rules. |

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + B` | Bold selection / insert `****` |
| `Ctrl + I` | Italic selection / insert `**` |
| `Ctrl + S` | Save current `.md` note |
| `Ctrl + P` | Print / Export vector PDF |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |
| `Ctrl + ← / →` | Jump by word |
| `Shift + Arrows` | Extend text selection |
| `(`, `{`, `[`, `$`, `` ` ``, `*` *(with selection)* | Wrap highlighted text |
| `Tab` / `Shift + Tab` *(in table)* | Next / previous cell (auto-adds row at end) |
| `↑` / `↓` *(in table)* | Move vertically within the same column |

---

## Download (Windows)

Pre-compiled Windows binaries are free to download and use from the **[Releases](../../releases)** page:

* **`Photon MD Setup 1.4.0.exe`** — Standard Windows Installer *(recommended)*
* **`Photon MD 1.4.0.exe`** — Portable Executable *(run directly, no installation required)*

---

## Roadmap (`v1.5.0+`)
* [ ] Additional built-in themes (Parchment, Prism, Aurora, Ember)
* [ ] Custom device font support
* [ ] Callout badges inside blockquotes (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`)
* [ ] Live word count, reading time, and cursor line/column indicator in the footer
* [ ] Quick Heading Outline & Vault Switcher palette

---

## License

**Photon MD Software License** — Copyright © 2026 **Ritamanya Bhattacharjee**. All Rights Reserved.

* **Free Binary Use:** Anyone may download, install, and use the official pre-compiled binaries of Photon MD free of charge for personal, educational, or commercial note-taking.
* **Source-Available (Restricted):** This repository is publicly visible strictly for transparency, learning, and evaluation. Copying, modifying, redistributing, creating derivative works, or incorporating any portion of the source code or its DOM-packing/rendering architecture into another project without prior written permission is prohibited.

See the full terms in the [`LICENSE`](LICENSE) file.