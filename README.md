# 🏠 Kiraya Bandhu (किराया बंधु)
> **Aapka Ghar, Aapka Hisaab** — A premium, mobile-first Progressive Web App (PWA) designed for landlords to easily manage rent collections, track tenant details, and calculate electricity bills.

---

## 📌 Problem Statement
Many landlords in India manage residential properties with 10–30 tenants. However, they face several key challenges with existing solutions:
1. **Complexity:** Existing property management software is bloated, requires user accounts, internet connectivity, and complex workflows.
2. **Language Barrier:** Non-tech-savvy landlords prefer interacting in **Hinglish** (a blend of Hindi and English written in the Latin alphabet) rather than pure English or complex Devanagari script.
3. **Data Privacy & Internet Issues:** Landlords prefer having full ownership of their data on their local device without worrying about server downtimes or data leaks.
4. **Billing Inconsistencies:** Tracking monthly rent alongside variable electricity bills (sub-meters) leads to errors and disputes.
5. **Report Sharing:** Generating reports in native Indian languages often results in encoding bugs (garbage characters like `?` or `▢`) when exporting to PDF.

---

## 🛠️ The Approach & Architecture
**Kiraya Bandhu** solves these problems through a carefully crafted architecture:
* **Offline-First & Serverless:** Built entirely on top of browser-native **LocalStorage**. No databases, no APIs, and zero external network requests. This ensures maximum privacy, security, and instantaneous load times.
* **Progressive Web App (PWA):** Installs directly onto any smartphone or tablet from the browser. Operates completely offline, making it behave like a native iOS or Android app.
* **Hinglish-First UI:** Tailored with conversational Hinglish labels (e.g., *Abhi Tak Nahi Diya*, *De diya*, *Pay Karen*) alongside simple Hindi instructions for extreme ease of use.
* **Robust PDF Rendering Pipeline:** Uses a clean, English-only PDF export utility powered by `jsPDF` and `jsPDF-AutoTable`. This bypasses default font character encoding bugs while maintaining legal and financial readability for reports.
* **Saffron Orange Design System:** Built using a custom saffron theme (`#F97316` primary, `#FFF7ED` warm background) following strict accessibility guidelines (48px+ touch targets, 16px+ inputs to prevent iOS auto-zoom).

---

## ✨ Key Features
* **🏠 Ghar (Dashboard):** 
  * High-visibility summary card showing total Collected and Pending amounts.
  * Real-time tenant lists grouped by payment status (*Abhi Tak Nahi Diya* vs. *De Diya*).
  * Quick-access month dropdown spanning from **January 2025 to December 2027** for historical and future logs.
* **👥 Kiraya Wale (Tenant Management):**
  * Add, edit, and soft-delete tenants.
  * Organized by **Floor** (मंजिल) rather than room numbers, mirroring typical multi-story Indian households.
  * Call tenants directly with one tap.
* **💰 Payment Recorder:**
  * Quick-note templates (Cash, PhonePe, GooglePay) and partial payment logs.
  * Auto-selects month-start dates when navigating from historical dashboard lists.
* **⚡ Bijli (Electricity Tracker):**
  * Auto-fills previous sub-meter readings from the prior month.
  * Dynamic unit-to-bill calculator based on customizable rates.
  * Green "Mark as Paid" toggles to clear dues on the spot.
* **📄 Report (Monthly Summary):**
  * Tabular breakdown of Rent and Electricity collections per tenant.
  * English-only PDF exporter to download and share summaries directly on WhatsApp.

---

## 💻 Tech Stack
* **Framework:** React 19 + Vite (built using fast native bundlers)
* **Styling:** Tailwind CSS v4 (fully customized typography and color palette)
* **Icons:** Lucide React
* **PWA Engine:** Vite PWA Plugin (`registerType: 'autoUpdate'`)
* **PDF Exporter:** jsPDF & jsPDF-AutoTable
* **Database:** LocalStorage (Offline-First Schema)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shivaansh0610-LUFFY/Kiraya_Bandhu.git
   cd Kiraya_Bandhu
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🎨 Design Theme Specification
* **Primary Color:** `#F97316` (Saffron Orange)
* **Success Color:** `#22C55E` (Green)
* **Pending Color:** `#EF4444` (Red)
* **Background:** `#FFF7ED` (Warm white)
* **Font Family:** Poppins (Google Fonts)
