# Axiodynamic Annotation Tool

<div align="center">
# Axiodynamic Annotation Tool

<div align="center">

![Screenshot](docs/screenshot.png)
[![Status](https://img.shields.io/badge/status-production-brightgreen)]()
[![Demo](https://img.shields.io/badge/demo-live-blue)](https://alankleden.com/annotation-tool-multilingual/)
[![Languages](https://img.shields.io/badge/languages-FR%20|%20EN%20|%20ES%20|%20ZH-orange)]()
[![OSF](https://img.shields.io/badge/OSF-rm42h-blue)](https://osf.io/rm42h)
[![License](https://img.shields.io/badge/license-CC--BY--4.0-lightgrey)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Alan-Kleden/axiodynamic-annotation-tool?style=social)](https://github.com/Alan-Kleden/axiodynamic-annotation-tool)

**Multilingual web application for annotating institutional discourse with axiodynamic metrics**

[🚀 Try Demo](https://alankleden.com/annotation-tool-multilingual/) • [📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/Alan-Kleden/axiodynamic-annotation-tool/issues) • [💡 OSF Project](https://osf.io/rm42h)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Data Model](#data-model)
- [Security](#security)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Citation](#citation)
- [License](#license)

---

## 🎯 Overview

A web-based annotation tool for measuring **axiodynamic signatures** in institutional texts using two key metrics:

- **Fc** (Conative Force) — the intensity of will/drive toward a goal (0–5)
- **Fi** (Inhibitory Force) — internal constraints limiting action (0–5)

### Why This Tool?

Traditional discourse analysis focuses on **what** institutions say. This tool measures **how strongly** they commit to action and **what holds them back** — enabling quantitative analysis of institutional volition across languages and domains.

### Research Context

Part of the **Discursive Telotopic Signatures** project, preregistered on [OSF](https://osf.io/rm42h). Used for validating automated lexicon extraction in political, legal, and policy discourse.

---

## ✨ Features

### Core Functionality
- 🌍 **4 languages**: French, English, Spanish, Chinese (Simplified)
- 📊 **12 excerpts** per annotation session
- 💾 **Auto-save** with LocalStorage (resume interrupted sessions)
- 📥 **JSONL export** (one-click download)
- 🎓 **PDF certificates** with automated email delivery (optional)
- 📱 **Mobile-friendly** responsive design

### Technical Highlights
- ⚡ **Zero dependencies** — pure vanilla JavaScript
- 🔒 **Privacy-first** — annotations stored client-side by default
- 🔌 **Optional backend** — PHP endpoints for server-side storage
- 🎨 **Accessible** — designed to align with WCAG 2.1 AA best practices
- ⌨️ **Keyboard shortcuts** — annotate without touching the mouse

---

## 🚀 Quick Start

### Try It Now (No Installation)

Visit the live demo: **https://alankleden.com/annotation-tool-multilingual/**

### Local Testing (1 minute)

```bash
# Clone the repository
git clone https://github.com/Alan-Kleden/axiodynamic-annotation-tool.git
cd axiodynamic-annotation-tool

# Open in browser (no server needed)
# Windows
start index.html
# macOS
open index.html
# Linux (most desktops)
xdg-open index.html
```

That's it! The tool works 100% client-side for testing.

---

## 📦 Installation

### Option A: Static Hosting (Recommended)

Deploy to **GitHub Pages**, **Netlify**, or any static host:

```text
# Build is not needed - just upload these files:
index.html
app.js
i18n.js
EN_data.js
FR_data.js
ES_data.js
ZH_data.js
```

### Option B: PHP Backend (For Certificates & Storage)

**Requirements:**
- Apache/Nginx with PHP 7.4+
- SMTP account for email delivery
- SSL certificate (mandatory for production)

**Directory structure:**
```text
/public_html/annotation-tool/
├── index.html
├── app.js
├── i18n.js
├── EN_data.js
├── FR_data.js
├── ES_data.js
├── ZH_data.js
├── api/
│   ├── send_certificate.php
│   ├── submit.php
│   ├── fpdf.php
│   └── font/              # FPDF fonts
├── data/                  # Server-side annotations
│   ├── .htaccess          # Deny all access
│   └── annotations.jsonl
├── certificates/          # Generated PDFs
│   └── .htaccess          # Deny all access
└── cgu/                   # Terms & privacy policy
    ├── en.html
    ├── fr.html
    ├── es.html
    └── zh.html
```

**Environment configuration (`.htaccess`):**
```apache
# NEVER commit this file to Git!
SetEnv SMTP_HOST smtp.hostinger.com
SetEnv SMTP_PORT 465
SetEnv SMTP_USER noreply@alankleden.com
SetEnv SMTP_PASSWORD "your-secure-password"
```

**Secure data folders:**
```apache
# data/.htaccess
Require all denied

# certificates/.htaccess
Options -Indexes
<FilesMatch "\.pdf$">
  Require all denied
</FilesMatch>
```

**Nginx equivalent:**
```nginx
location ^~ /annotation-tool/data/ { 
    deny all; 
}
location ^~ /annotation-tool/certificates/ { 
    deny all; 
}
```

---

## 💡 Usage

### Annotation Workflow

1. **Select language** — FR, EN, ES, or ZH
2. **Read instructions** — understand Fc (will) vs Fi (constraints)
3. **Annotate 12 excerpts:**
   - Rate **Fc** (0–5): How strongly does the text push toward its goal?
   - Rate **Fi** (0–5): What internal factors limit or block action?
   - Add notes (optional)
4. **Export data** — download JSONL file
5. **Get certificate** (optional) — enter email to receive PDF

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`–`5` | Set Fc rating |
| `Shift+1`–`5` | Set Fi rating |
| `N` | Next excerpt |
| `P` | Previous excerpt |
| `E` | Export JSONL |
| `?` | Show help |

### Interpreting Fc and Fi

**Fc (Conative Force)** — *"push toward the goal"*
- `0` = No volition expressed
- `1` = Weak suggestion
- `2` = Moderate intention
- `3` = Clear commitment
- `4` = Strong determination
- `5` = Absolute imperative

**Fi (Inhibitory Force)** — *"internal brakes"*
- `0` = No constraints mentioned
- `1` = Minor considerations
- `2` = Significant hesitations
- `3` = Serious obstacles
- `4` = Major structural barriers
- `5` = Action rendered impossible

### Example Annotations

**Example 1: High Fc, Low Fi**
> "Parliament **must ban** facial recognition **immediately**. We have a **moral duty** to act."

- **Fc = 5** (absolute imperative: "must", "immediately", "moral duty")
- **Fi = 0** (no obstacles mentioned)

**Example 2: Balanced Fc/Fi**
> "We **aim to reduce** emissions by 40%, **though budgetary constraints** may require **phased implementation**."

- **Fc = 3** (clear intention: "aim to")
- **Fi = 3** (serious obstacles: "budgetary constraints", "phased")

**Example 3: Low Fc, High Fi**
> "Reform appears **desirable**, but constitutional **rigidity prevents** meaningful change."

- **Fc = 2** (weak suggestion: "appears desirable")
- **Fi = 5** (impossibility: "prevents")

---

## 📊 Data Model

### JSONL Format

Each annotation is one JSON line in the exported file:

```json
{
  "project_id": "poc_telotopy_t1",
  "doc_id": "FR_2025_001",
  "span": {
    "start": 0,
    "end": 180,
    "text": "Le Parlement doit interdire la reconnaissance faciale..."
  },
  "telos": {
    "label": "prohibition-urgente",
    "source": "endogenous"
  },
  "Fc": {
    "value": 5,
    "principle": "imperatif-moral",
    "note": "Modalité déontique forte (doit)"
  },
  "Fi": {
    "value": 0,
    "principle": "",
    "note": ""
  },
  "theta_deg": 180,
  "quality": {
    "uncertain": false,
    "flag": ""
  },
  "annotator_id": "A01",
  "timestamp": "2025-10-30T08:00:00Z",
  "lang": "fr"
}
```

> **Note:** `theta_deg` encodes alignment (0 = full alignment, 180 = full opposition). Use only if your study needs it.

**Field Definitions**

| Field | Type | Description |
|-------|------|-------------|
| `project_id` | string | Study identifier |
| `doc_id` | string | Unique document ID |
| `span.text` | string | Annotated excerpt (max 500 chars) |
| `telos.label` | string | Perceived institutional goal |
| `telos.source` | enum | `endogenous` (actor's own goal) or `exogenous` (imposed) |
| `Fc.value` | int | Conative force rating (0–5) |
| `Fi.value` | int | Inhibitory force rating (0–5) |
| `theta_deg` | float | Alignment angle (0–180°), optional |
| `annotator_id` | string | Participant identifier |
| `timestamp` | ISO8601 | Annotation completion time |
| `lang` | string | Interface language (fr/en/es/zh) |

---

## 🔒 Security

### Critical Rules

1. **Never commit secrets** to Git  
   Use `.htaccess` or environment variables for credentials; add them to `.gitignore`.

2. **Deny direct access** to sensitive folders
```apache
# data/.htaccess
Require all denied

# certificates/.htaccess
Options -Indexes
<FilesMatch "\.pdf$">
  Require all denied
</FilesMatch>
```

3. **Use HTTPS in production**  
   Required for SMTP authentication and participant data in transit.

4. **Validate all inputs**  
   Validate emails; strip header injections; sanitize any text going into PDFs.

5. **GDPR compliance**  
   Provide privacy policy (`cgu/`), allow data export/deletion; avoid storing emails longer than needed.

**Hardening Checklist**
- [ ] `.htaccess` in `.gitignore`
- [ ] SMTP credentials via environment variables
- [ ] `data/` returns 403
- [ ] `certificates/` returns 403
- [ ] SSL certificate installed
- [ ] Email validation enabled
- [ ] Terms & privacy policy linked
- [ ] Errors do not leak filesystem paths

---

## 🔌 API Reference

### `POST /api/submit.php` — Store annotations (optional)

**Request:**
```json
{
  "project_id": "poc_telotopy_t1",
  "doc_id": "EN_2025_042",
  "span": { "start": 0, "end": 180, "text": "..." },
  "telos": { "label": "reform", "source": "endogenous" },
  "Fc": { "value": 3, "principle": "necessity", "note": "" },
  "Fi": { "value": 2, "principle": "budget", "note": "" },
  "theta_deg": 120,
  "annotator_id": "A03",
  "timestamp": "2025-10-30T10:15:00Z",
  "lang": "en"
}
```

**Response:**
```json
{"ok": true}
```

**Errors:**
- `400` — Invalid JSON or missing fields
- `500` — Server error (check file permissions in `data/`)

---

### `POST /api/send_certificate.php` — Generate & email PDF

**Request:**
```json
{
  "name": "Alice Dupont",
  "email": "alice@example.com",
  "lang": "fr",
  "date": "2025-10-30",
  "excerpts_count": 12
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate sent to alice@example.com"
}
```

**Errors:**
- `400` — Invalid email or missing fields
- `500` — SMTP error (check creds in `.htaccess`)

---

## 🤝 Contributing

Contributions welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** (`git commit -m "feat: add amazing feature"`)
4. **Push** (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

**Guidelines**
- Keep it **vanilla JS** (no build step)
- **UTF-8** everywhere (data files included)
- **Mobile-first** layout
- **Accessibility** (WCAG 2.1 AA best practices)
- Update all **4 language** files

**Bug Reports**
- Browser + version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## 📚 Citation

If you use this tool in your research, please cite:

```bibtex
@software{kleden2025axiodynamic,
  author = {Kleden, Alan},
  title = {Axiodynamic Annotation Tool: Measuring Institutional Volition in Discourse},
  year = {2025},
  url = {https://github.com/Alan-Kleden/axiodynamic-annotation-tool},
  note = {OSF preregistration: https://osf.io/rm42h}
}
```

**Related publications:**
- Kleden, A. (2025). *Discursive Telotopic Signatures: A Framework for Axiodynamic Analysis*. Preprint on OSF.

---

## 🙏 Acknowledgments

- **FPDF** — Lightweight PDF generation library
- **Open Science Framework (OSF)** — Preregistration platform
- **Contributors** — See `CONTRIBUTORS.md`
- **Beta testers** — Thank you for your feedback!

---

## 📄 License

This project is licensed under **Creative Commons Attribution 4.0 International (CC-BY-4.0)**.

You are free to:
- ✅ Share — copy and redistribute
- ✅ Adapt — remix, transform, build upon

Under these terms:
- 📝 Attribution — cite the original work
- 🔓 No additional restrictions

See [LICENSE](LICENSE) for full text.

---

## 📞 Contact

**Author:** Alan Kleden  
**Website:** https://alankleden.com  
**OSF Project:** https://osf.io/rm42h  
**GitHub:** https://github.com/Alan-Kleden  
**Support:** Open an issue at https://github.com/Alan-Kleden/axiodynamic-annotation-tool/issues

---

<div align="center">

**⭐ Star this repo if it helps your research!**

Made with ❤️ for open science

</div>
