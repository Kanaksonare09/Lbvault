# HealthScan — Project Context Anchor

This is the **current, canonical version** of the HealthScan project.

## Key Identifiers (What Makes This Version Unique)
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Express.js with modular routes (`authRoutes`, `reportRoutes`, `analyticsRoutes`, `accessRoutes`, `patientRoutes`)
- **Auth**: JWT-based with role middleware (`authMiddleware(role)`)
- **Voice**: `google-tts-api` (NOT ElevenLabs, NOT Sarvam AI, NOT Gemini native audio)
- **OCR**: Python/Flask microservice at port 5001 using Tesseract + OpenCV
- **Database**: MongoDB with Mongoose ORM
- **Ports**: Backend `5000`, OCR service `5001`, Frontend `3000`

## What This Version Is NOT
- This is NOT the old single-file monolith version
- This is NOT the version using ElevenLabs or Sarvam AI for voice
- This is NOT the version without JWT auth
- This is NOT related to Termify (a separate legal doc summarizer project)

## Architecture
```
Lbvault/
├── backend/          # Express.js API (port 5000)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── uploads/reports/
├── frontend/         # Next.js 16 app (port 3000)
└── ocr_service/      # Flask OCR microservice (port 5001)
```
