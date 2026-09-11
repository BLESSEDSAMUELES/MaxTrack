# MaxTrack Enterprise UI/UX Design System

**Version:** 2.0.1
**Target Aesthetic:** Crisp, Light, Industrial Enterprise Operations Center (Anti-AI Slop)

## ⚠️ Strict Constraints
* **CRITICAL:** Zero backend, state, or workflow modifications. UI/UX and Tailwind classes ONLY.
* **CRITICAL:** Do not alter existing React props, hooks, or API function calls.
* **NO** dark mode.
* **NO** black or dark gray backgrounds.

## 🎨 Color Tokens
* **Background App:** `#F8FAFC`
* **Surface Card:** `#FFFFFF`
* **Surface Hover:** `#F1F5F9`
* **Border Subtle:** `#E2E8F0`
* **Border Active:** `#CBD5E1`
* **Text Primary:** `#0F172A`
* **Text Secondary:** `#475569`
* **Text Muted:** `#64748B`
* **Accent Primary:** `#0284C7`
* **Accent Cyan:** `#0891B2`

### Semantic Colors
* **Success:** Background `#ECFDF5` | Text `#065F46`
* **Warning:** Background `#FEF3C7` | Text `#B45309`
* **Danger:** Background `#FEF2F2` | Text `#991B1B`
* **Bundle:** Background `#F5F3FF` | Text `#6D28D9`

## 🔤 Typography
* **Primary Font:** `'Inter', system-ui, -apple-system, sans-serif`
* **Monospace Font:** `'JetBrains Mono', monospace`

### Scale
* **xs:** 11px
* **sm:** 12.5px
* **base:** 14px
* **lg:** 16px
* **xl:** 20px
* **2xl:** 24px

## 📐 Layout Rules
* **Card Border Radius:** 8px
* **Card Padding:** 20px
* **Grid Gap:** 16px
* **Shadow Elevation:** `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`

## 🧩 Component Guidelines
* **Sidebar:** Fixed vertical layout, 250px width, clean icon + label pairing. Active state marked by a subtle background tint (`#F1F5F9`) and a 3px primary blue left border highlight.
* **Tables:** Borderless rows, hover row background shift to `#F8FAFC`, strictly monospaced data cells for all numbers and metrics.
* **Badges:** Pill shaped, utilizing low-opacity pastel background fills with high-contrast dark text.
* **Charts and Canvas:** Clean white canvas background, crisp anti-aliased trajectory lines, interactive tooltips with a clean white background and subtle drop shadow.