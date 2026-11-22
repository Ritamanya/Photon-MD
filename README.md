<div align="center">
  <img src="renderer/icon.png" alt="Photon MD Logo" width="96" />
  <h1>Photon MD</h1>
  <p><strong>A zero-framework visual Markdown editor built from scratch.</strong></p>

  <p>
    <a href="https://github.com/Ritamanya/Photon-MD/releases/latest">
      <img src="https://img.shields.io/badge/Download-Windows%20.exe-2563eb?style=for-the-badge&logo=windows" alt="Download for Windows" />
    </a>
    <img src="https://img.shields.io/badge/Version-1.0.0-10b981?style=for-the-badge" alt="Version 1.0.0" />
    <img src="https://img.shields.io/badge/Engine-Zero--Framework%20DOM-f59e0b?style=for-the-badge" alt="Zero-Framework DOM" />
  </p>
</div>

---

## Why Photon MD?

Most modern Markdown editors wrap heavy third-party frameworks like CodeMirror or ProseMirror. **Photon MD** is powered by a custom-built, dependency-free editing engine written in vanilla JavaScript, HTML, and CSS inside Electron—giving you live visual rendering, instant tables, math, and crisp vector PDFs out of the box with zero plugins required.

---

## Features (v1.0.0)

* **Custom Live-Rendering Engine:** Built from scratch using `.lc` (leaf container) and `.upc` (unpacked container) DOM packing for fast, responsive inline editing.
* **Interactive 6×6 Table Picker & Inline Editing:** Insert Markdown tables visually and edit cells directly with a floating row/column toolbar—no manual pipe (`|`) alignment needed.
* **MathJax Support:** Live inline (`$...$`) and centered full-width display (`$$...$$`) LaTeX equation rendering.
* **Syntax-Highlighted Code Blocks:** Automatic language detection and syntax highlighting for fenced code blocks.
* **Structured Block-Based Undo / Redo:** Full `Ctrl+Z` / `Ctrl+Y` history stack that preserves rendered tables, code blocks, cell edits, and exact cursor position.
* **Multi-Page Vector PDF Export:** Export notes directly to clean, print-ready A4 PDFs with cursor artifacts automatically stripped.
* **Local Vault Explorer:** Open any local folder, browse nested directories, and create, save (`Ctrl+S`), or delete `.md` files directly on disk.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + B` | Bold selection / insert bold markers |
| `Ctrl + I` | Italicize selection / insert italic markers |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + S` | Save current note |
| `Ctrl + P` | Print / Export PDF |

---

## Installation (Windows)

1. Go to the [**Releases**](https://github.com/Ritamanya/Photon-MD/releases/latest) page.
2. Download either:
    * **`Photon MD Setup 1.0.0.exe`** — Standard Windows installer.
    * **`Photon MD 1.0.0.exe`** — Portable version (no installation required).
3. Run the executable and click **Open Vault** to start writing.

---

## Run From Source

```bash
git clone [https://github.com/Ritamanya/Photon-MD.git](https://github.com/Ritamanya/Photon-MD.git)
cd Photon-MD
npm install
npm start
```

To build the Windows `.exe` locally:

```bash
npm run build
```

---

## Roadmap (v2.0)

* **Native `/graph{}` and `/chart{}` Widgets:** Render interactive plots and charts directly inside notes.
* **Quick Switcher (`Ctrl+K`) & Vault-Wide Search (`Ctrl+Shift+F`):** Jump across large vaults in milliseconds.
* **`[[Wiki-Links]]` & Backlinks:** Connect notes into a personal knowledge base.
* **Offline Local AI (Ollama):** Built-in inline commands (`/ask`, `/summarize`, `/quiz`) running 100% locally.

---

## Author

Built by **Ritamanya Bhattacharjee** ([@Ritamanya](https://github.com/Ritamanya)).
Email me: [ritamanyabhattacharjee@gmail.com](mailto:ritamanyabhattacharjee@gmail.com)

---

## License

**Copyright © 2026 Ritamanya Bhattacharjee. All Rights Reserved.**

Official compiled releases of **Photon MD** are free to download and use (for commercial purposes also). The source code is publicly viewable for transparency and evaluation, but copying, modifying, or using the core architecture in other applications is strictly prohibited without prior written permission. See the [LICENSE](LICENSE) file for full terms.