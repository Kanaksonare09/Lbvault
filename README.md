# LabVault — Intelligent Pathology Management System

> *A privacy-first, AI-powered platform that transforms medical reports into patient-friendly insights, voice summaries, and interactive health analytics.*

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [How to Run the Project](#how-to-run-the-project)
  - [Step 1 — Start Ollama (Local AI)](#step-1--start-ollama-local-ai)
  - [Step 2 — Configure Environment Files](#step-2--configure-environment-files)
  - [Step 3 — Start Backend (Node.js)](#step-3--start-backend-nodejs)
  - [Step 4 — Start OCR Service (Python/Flask)](#step-4--start-ocr-service-pythonflask)
  - [Step 5 — Start Frontend (Next.js)](#step-5--start-frontend-nextjs)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Feature Deep Dives](#feature-deep-dives)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Overview

**LabVault** is a comprehensive pathology management platform connecting patients, doctors, and pathology labs. Upload any medical report — blood test, urine analysis, liver function, kidney panel, thyroid, lipid profile, radiology — and get instant AI analysis, visual analytics, multilingual voice summaries, and an interactive AI chat assistant, all powered locally on your machine.

---

## ✨ Features

### 🧠 Universal AI Intelligence Engine
- **Schema-Free Analysis** — Dynamically extracts any biomarker from any report type using Llama 3.2
- **Longitudinal Intelligence** — Detects "Improving" vs. "Deteriorating" health markers by analyzing proximity to normal ranges across time
- **Single-Pass Processing** — Biomarker extraction + clinical summarization in one LLM call
- **Atomic Dashboard Aggregation** — Loads patient metadata, history, trends, and AI analysis in one high-performance API request
- **Anti-Hallucination** — AI grounded strictly in medical data with non-diagnostic safeguards

### 🔬 Hybrid OCR Pipeline (4-Tier)
1. **Gemini 1.5 Flash** — Cloud OCR for scanned and handwritten reports *(requires API key)*
2. **Tesseract OCR** — Local OCR with image preprocessing (grayscale → contrast → sharpen)
3. **pdfplumber** — Native text extraction for digitally-generated PDFs
4. **pdf-parse** — Node.js fallback for simple text PDFs

### ❤️ Patient-Centric Voice Summary
```
AI Summary → Empathy Rewrite (Llama 3.2) → Script Generator → Google TTS → Audio (.mp3)
```
- Warm, doctor-like conversational tone
- Full native-language output for Hindi, Marathi, Telugu
- Medical terms (Hemoglobin, ALT, mg/dL) always kept in English

### 🗣️ Ask AI — Report Chat
- Ask questions about your report in natural language
- AI answers are grounded in your actual biomarker data
- Conversation history maintained within session
- Quick question shortcuts on first open

### 📊 Health Analytics Dashboard
- Real biomarker trend charts (area/line) from actual DB data
- Risk distribution pie chart (Normal / Mild / Moderate / Critical)
- Full biomarker snapshot table with trend arrows (↑↓→), severity, and AI interpretation
- Report upload timeline with abnormal count per report

### 👤 Profile Settings
- Edit name, phone, date of birth, gender, blood group, address
- Emergency contact information
- Preferred language selection (English / Hindi / Marathi / Telugu)
- Change password (with current password verification)

### 👥 Role-Based Command Centers
- **Patient** — Upload reports, view AI summaries, listen to voice, ask AI, view analytics
- **Doctor** — Access high-fidelity intelligence dashboards with longitudinal trends and clinical comparison tables
- **Pathology Lab** — **Command Center** with real-time Recharts analytics (volume trends, diagnostic mix) and private practitioner management
- **SuperAdmin** — Secure lifecycle management for healthcare provider verification (Approve/Reject flow) with real-time session invalidation

### 🛡️ Secure Lab Infrastructure
- **Private Provider Directory** — Labs manage their own "Affiliated Doctors," ensuring data isolation and privacy.
- **Dynamic Analytics (Recharts)** — Real-time MongoDB aggregation pipelines for daily volume and test distribution mapping.
- **Provider Status Control** — Doctors and Labs are restricted to a `PENDING` state until verified by a SuperAdmin.

### 🔒 Security & Privacy
- All AI runs **100% locally** (Ollama + Tesseract + Google TTS)
- JWT authentication on every endpoint
- Role-based access — strict data isolation per user
- Bcrypt password hashing

---

## 🏗️ System Architecture

```
Patient Browser (Next.js :3000)
        │
        ▼
 Backend API (Express :5010)
        │
        ├─── MongoDB (Database)
        │
        ├─── Ollama / Llama 3.2 (:11434)
        │         ├── Biomarker extraction
        │         ├── AI summary generation
        │         ├── Empathy rewrite (voice)
        │         └── Ask AI chat
        │
        ├─── Python OCR Service (:5001)
        │         ├── Gemini 1.5 Flash (optional)
        │         ├── Tesseract OCR (local)
        │         └── pdfplumber (native PDF text)
        │
        └─── google-tts-api (Node.js)
                  └── MP3 audio generation
```

---

## 🛠️ Tech Stack

### Frontend
| | |
|---|---|
| **Framework** | Next.js 15 (React 19) |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Language** | TypeScript |

### Backend
| | |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + Bcrypt |
| **File Uploads** | Multer |
| **TTS** | google-tts-api |
| **Email** | Nodemailer |

### OCR Microservice
| | |
|---|---|
| **Framework** | Flask (Python) |
| **Cloud OCR** | Google Gemini 1.5 Flash *(optional)* |
| **Local OCR** | Pytesseract |
| **Image Processing** | Pillow (PIL) |
| **PDF Parsing** | pdfplumber, pdf2image |

### AI / Inference
| | |
|---|---|
| **Runtime** | Ollama |
| **Model** | Llama 3.2 (3B) |

---

## ⚙️ Prerequisites

Install these before running the project:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **Python** | v3.9+ | [python.org](https://python.org) |
| **MongoDB** | Local or Atlas | [mongodb.com](https://mongodb.com) |
| **Ollama** | Latest | [ollama.com](https://ollama.com) |
| **Poppler** | Any | `brew install poppler` (Mac) · `apt install poppler-utils` (Linux) |
| **Tesseract** | Any | `brew install tesseract` (Mac) · `apt install tesseract-ocr` (Linux) |

---

## 🚀 How to Run the Project

The system requires **4 services running simultaneously**. Open 4 separate terminal windows.

---

### Step 1 — Start Ollama (Local AI)

> Run this **first** — all AI features depend on it.

```bash
# Pull the model (first time only — ~2GB download)
ollama pull llama3.2

# Start the model
ollama run llama3.2
```

Ollama will be accessible at `http://localhost:11434`

---

### Step 2 — Configure Environment Files

#### Backend (`backend/.env`)

Create the file `backend/.env` with the following:

```env
# Server
PORT=5010

# Database
MONGODB_URI=mongodb://localhost:27017/labvault

# Security (use any long random string)
JWT_SECRET=your_strong_jwt_secret_here

# Email (optional — for notification features)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### Frontend (`frontend/.env.local`)

Create the file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5010
```

#### OCR Service (`ocr_service/.env`) — *Optional*

Only needed if you want cloud-powered OCR via Google Gemini (higher accuracy for scanned reports). Without this, Tesseract and pdfplumber are used automatically.

```env
GOOGLE_AI_STUDIO_API_KEY=your_gemini_api_key_here
```

---

### Step 3 — Start Backend (Node.js)

Open **Terminal 2** and run:

```bash
cd Lbvault/backend

# Install dependencies (first time only)
npm install

# Start the dev server
PORT=5010 npm run dev
```

✅ Backend running at: `http://localhost:5010`

---

### Step 4 — Start OCR Service (Python/Flask)

Open **Terminal 3** and run:

```bash
cd Lbvault/ocr_service

# Create virtual environment (first time only)
python3 -m venv venv

# Activate it
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the Flask server
python app.py
```

✅ OCR Service running at: `http://localhost:5001`

> **Note:** If you don't have a Gemini API key, the service automatically falls back to Tesseract OCR + pdfplumber. All features remain fully functional.

---

### Step 5 — Start Frontend (Next.js)

Open **Terminal 4** and run:

```bash
cd Lbvault/frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

### Step 6 — Initialize SuperAdmin (First Time Only)

Since SuperAdmin accounts cannot be registered publicly, you must run the seeding script to create the root administrator.

```bash
cd Lbvault/backend
node scripts/seedAdmin.js
```
- **Login Email**: `admin@labvault.com`
- **Login Password**: `Admin@123`

---

### ✅ All Services Running

| Service | URL | Terminal |
|---|---|---|
| Ollama (Llama 3.2) | `http://localhost:11434` | Terminal 1 |
| Backend API | `http://localhost:5010` | Terminal 2 |
| OCR Microservice | `http://localhost:5001` | Terminal 3 |
| Frontend | `http://localhost:3000` | Terminal 4 |

Open your browser and go to: **http://localhost:3000**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (use `5010`) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `EMAIL_USER` | ❌ | Gmail address for email notifications |
| `EMAIL_PASS` | ❌ | Gmail app password |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL (use `http://localhost:5010`) |

### OCR Service (`ocr_service/.env`)

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_AI_STUDIO_API_KEY` | ❌ | Gemini API key for cloud OCR. If missing, uses Tesseract automatically. |

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register as patient, doctor, or pathology |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user + profile |
| `PUT` | `/api/auth/profile` | ✅ | Update profile (name, DOB, blood group, etc.) |
| `PUT` | `/api/auth/change-password` | ✅ | Change password |

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reports/upload` | ✅ | Upload report → triggers full AI pipeline |
| `GET` | `/api/reports/my-reports` | ✅ | List all patient reports |
| `GET` | `/api/reports/:id` | ✅ | Get report + biomarkers + AI summary |
| `GET` | `/api/patient/reports/:id/summary` | ✅ | Get AI summary (auto-generates if missing) |
| `POST` | `/api/reports/grant-access` | ✅ | Grant doctor access to a report |

### Doctor Intelligence Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/doctor/patients` | ✅ | List all authorized patients |
| `GET` | `/api/doctor/patient/:id/dashboard` | ✅ | Aggregate Dashboard (Reports + Trends + Comparison) |
| `GET` | `/api/doctor/patient/:id/reports` | ✅ | List all shared report metadata |
| `POST` | `/api/doctor/reports/:id/note` | ✅ | Append clinical note to report |

### SuperAdmin (Verification)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | ❌ | Admin-only login portal |
| `GET` | `/api/admin/pending-users` | ✅ | List all Doctors/Labs awaiting approval |
| `POST` | `/api/admin/approve-user` | ✅ | Flip status PENDING → APPROVED |
| `POST` | `/api/admin/reject-user` | ✅ | Flip status PENDING → REJECTED |

### Voice & AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/voice` | ✅ | Generate empathetic voice summary audio |
| `POST` | `/api/ai/ask` | ✅ | Ask AI a question about a report |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/:patientId` | ✅ | Get trend data, risk distribution, biomarker snapshot |

---

## 🔍 Feature Deep Dives

### Voice Pipeline Flow

```
1. Patient selects language (English / Hindi / Marathi / Telugu)
2. POST /api/voice { reportId, language }
3. Backend fetches AI summary from DB
4. rewriteService.js — Llama 3.2 rewrites summary as empathetic doctor message
   Hindi rule: Full Devanagari · keep ALT, Hemoglobin, mg/dL in English
5. scriptService.js — adds greeting/closing, strips markdown, trims to <500 chars
6. ttsService.js — google-tts-api generates MP3 chunks, merges, saves to disk
7. Response: { audioUrl, voiceScript, empatheticSummary }
8. Frontend plays audio, shows "✅ Audio ready — tap ▶" if autoplay blocked
```

### Ask AI Flow

```
1. Patient opens Insights page, clicks "Ask AI"
2. AskAIPanel shows quick questions + chat input
3. Patient types question → POST /api/ai/ask { reportId, question, history }
4. Backend fetches: report name, test type, AI summary, all biomarkers
5. Builds grounded system prompt for Llama 3.2
6. Llama answers based strictly on the patient's actual data
7. Response displayed as chat bubble
```

### Hindi Language Rules (applies to all Indian languages)

**Correct output:**
> आपकी **Hemoglobin** का स्तर 10.5 g/dL है, जो सामान्य से थोड़ा कम है।

**Wrong output (AI is instructed NOT to do this):**
> Your Hemoglobin level is 10.5 g/dL...

Only the following stay in English: test names (ALT, AST, HbA1c), units (mg/dL, g/dL, U/L), and numbers.

---

## 📁 Project Structure

```
Lbvault/
├── backend/
│   ├── app.js                          # Express app entry + route registration
│   ├── controllers/
│   │   ├── adminController.js          # SuperAdmin verification logic
│   │   ├── aiController.js             # Ask AI chat endpoint
│   │   ├── analyticsController.js      # Real biomarker analytics from DB
│   │   ├── authController.js           # Signup, login, profile, password
│   │   ├── patientController.js        # Doctor's view of authorized patients
│   │   └── reportController.js         # Upload, dashboard aggregator, AI analysis
│   ├── models/
│   │   ├── User.js
│   │   ├── PatientProfile.js           # DOB, gender, blood group, emergency contact
│   │   ├── Report.js
│   │   ├── ReportBiomarker.js          # Biomarker values with severity & trend
│   │   └── ReportAiAnalysis.js         # OCR text, summaries, audio URLs
│   ├── services/
│   │   ├── aiService.js                # Universal Llama 3.2 analysis engine
│   │   ├── rewriteService.js           # Empathy rewrite (doctor-like tone)
│   │   ├── scriptService.js            # Voice script structure + greetings
│   │   └── ttsService.js               # google-tts-api MP3 generation
│   ├── routes/
│   │   ├── adminRoutes.js              # SuperAdmin identity management
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── doctorRoutes.js             # High-intelligence dashboard routes
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js           # JWT verification
│   └── .env                            # ← configure this
│   ├── scripts/
│   │   └── seedAdmin.js                # Root SuperAdmin seed logic
│
├── ocr_service/
│   ├── app.py                          # Flask server entry
│   ├── requirements.txt
│   └── services/
│       ├── ocr_service.py              # 4-tier hybrid OCR pipeline
│       └── tts_service.py              # Python gTTS fallback
│
├── frontend/
│   └── src/
│       ├── app/
│       │   └── dashboard/doctor/
│       │       ├── patient/[id]/dashboard/ # Integrated Intelligence Hub
│       │       └── patients/             # Authorized patient management
│       │   └── dashboard/patient/
│       │       ├── analytics/          # Health analytics charts
│       │       ├── insights/           # Report insights + Ask AI
│       │       ├── patientProfilePage.tsx   # Edit profile + change password
│       │       └── patientDashboardPage.tsx
│       ├── components/
│       │   ├── doctor/
│       │   │   └── dashboard/            # Modular Trends, Sugestions, OCR Tables
│       │   ├── patient/
│       │   │   ├── AskAIPanel.tsx      # AI chat panel
│       │   │   └── VoiceSummaryButton.tsx
│       │   └── ui/
│       │       └── AudioPlayer.tsx     # Audio player (play/pause/seek/download)
│       └── services/
│           ├── api.ts                  # Axios instance with JWT interceptor
│           └── reportService.ts
│
└── README.md
```

---

## ⚡ Performance Decisions

| Decision | Reason |
|---|---|
| Llama 3.2 (3B) over 8B | 3x faster inference on standard hardware |
| Single-pass AI (extract + summarize in 1 call) | ~60% latency reduction |
| `google-tts-api` over Parler TTS | Parler needs 3-5 min download; google-tts < 2 sec |
| `upsert` for AI analysis records | Prevents duplicate summaries on re-uploads |
| Severity normalizer layer | Maps any AI string to valid DB enum safely |
| grounded Ask AI prompts | Prevents LLM hallucination on patient questions |

---

## 🗣️ Supported Languages

| Language | Voice | Summary | Ask AI |
|---|---|---|---|
| English | ✅ | ✅ | ✅ |
| Hindi (हिंदी) | ✅ | ✅ | ✅ |
| Marathi (मराठी) | ✅ | ✅ | ✅ |
| Telugu (తెలుగు) | ✅ | ✅ | ✅ |

---

## 🔮 Roadmap

- [ ] IndicTrans2 for higher-quality Indian language translations
- [ ] Doctor mobile push notifications for newly shared reports
- [ ] PDF export of AI health summary
- [ ] Waveform animation during voice playback
- [ ] Auto-language detection from Indian-language scanned reports
- [ ] S3/Cloudinary migration for audio file storage
- [ ] Cron job to auto-cleanup old audio files
