# 🧭 Citation Compass

### Find credible academic citations for any sentence, instantly.

Citation Compass is a web-based tool I built to help students, writers, and researchers quickly locate **reliable academic references** for any statement.  
It connects to scholarly databases like **Semantic Scholar**, **CrossRef**, and **arXiv** to return relevant citations — complete with titles, authors, abstracts, and publication info.

---

## 🚀 Features

- Paste or type any sentence and get academic sources that support it.
- Smart NLP query expansion to improve search accuracy.
- Searches across multiple databases (Semantic Scholar, CrossRef, arXiv).
- Clean, responsive UI built for quick reference lookup.
- Option to export or copy citations in common formats (APA/MLA).
- Future support for Chrome extension integration.

---

## 🧠 Tech Stack

- **Frontend:** React (Vite) + TypeScript + Tailwind CSS + shadcn-ui  
- **Backend:** FastAPI (Python) / Node.js (optional for API aggregation)  
- **NLP:** spaCy + SentenceTransformers for keyword expansion  
- **APIs:** Semantic Scholar, CrossRef, arXiv  

---

## 🧩 Architecture Overview

```
User Input (sentence)
        ↓
Frontend (React form)
        ↓
Backend API (FastAPI)
        ↓
→ NLP Query Expansion
→ Parallel API Calls (Semantic Scholar, CrossRef, arXiv)
        ↓
Ranked Citation Results (JSON)
        ↓
Displayed on Web Interface
```

---

## ⚙️ Getting Started

### https://citationcompass.vercel.app
---

## 🧾 Example Search

> “Transformers have revolutionized natural language processing by enabling parallel sequence modeling.”

**Results:**
- *Attention Is All You Need* — Vaswani et al., 2017  
- *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding* — Devlin et al., 2018  

---

## 🎯 Vision

Citation Compass aims to make credible research information more accessible — whether you’re writing a thesis, article, or academic paper.  
No more switching between tabs or manually searching for citations — just paste your sentence and get instant, verifiable sources.
