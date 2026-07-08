# Fanar-Hackathon
A prototype built of an Agentic AI government guidance assistant for Qatar built with Next.js, React, and the Fanar API, for the Fanar Hackathon 2026, with the Collaboration of my teammate.

# Bayan QA

Bayan QA is a bilingual (English and Arabic) government-services assistant for Qatar.

Fanar API is used in three places: `pages/api/chat.js` for AI assistant replies, `pages/api/translate.js` for Arabic UI translation, and `pages/api/analytics.js` for AI-generated dashboard insights. All three routes use the Fanar model `Fanar-C-2-27B`.

It combines:

- AI chat guidance for citizen questions
- Service navigation pages for common procedures
- User feedback capture
- Live analytics dashboard for service demand and satisfaction trends

The app is built with Next.js (Pages Router), React, Chart.js, and a Fanar LLM backend integration.

## 1. Platform Summary

### Core capabilities

- AI assistant widget with step-by-step responses
- Arabic translation mode for UI content
- Quick service navigation cards
- Citizen feedback collection (chat and survey)
- Analytics dashboard with service demand and satisfaction charts

### Main routes

- Home page: /
- Main landing page: /homePage
- Feedback page: /feedback
- Citizen analytics page: /citizen-feedback
- Service pages: /services/*

## 2. Tech Stack

- Next.js 16 (Pages Router)
- React 19
- Chart.js + react-chartjs-2
- Lucide icons
- React Markdown (for assistant message rendering)

## 3. Project Initialization and Setup

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+

### Step 1: Install dependencies

Run from the project root:

```bash
npm install
```

### Step 2: Create environment file

Create a file named .env.local in the project root.

Add:

```env
FANAR_API_KEY=your_fanar_api_key_here
```

This key is required by:

- pages/api/chat.js
- pages/api/translate.js
- pages/api/analytics.js

### Step 3: Run locally

```bash
npm run dev
```
Open:
- http://localhost:3000

### Step 4: Production build check

```bash
npm run build
npm run start
```

## 4. Available Scripts

- npm run dev: start local development server
- npm run build: create optimized production build
- npm run start: start production server

## 5. Workflow Overview

### A) Assistant workflow

1. User opens AI widget and sends a message.
2. Frontend posts conversation to /api/chat.
3. API sends prompt + user messages to Fanar model.
4. Reply is rendered in chat (Markdown supported).
5. User can mark response helpful/not helpful.
6. Feedback is saved locally and posted to /api/feedback.

### B) Translation workflow

1. User switches language to Arabic.
2. LanguageContext gathers UI strings from UI_STRINGS.
3. Strings are batched and sent to /api/translate.
4. API requests numbered translations from Fanar model.
5. Translations are cached in memory and UI rerenders in Arabic.

### C) Analytics workflow

1. Feedback events are saved in localStorage (client source of truth).
2. Feedback is also posted to data files through /api/feedback:
	- data/survey-feedback.json
	- data/chat-feedback.json
3. CitizenInsightsDashboard reads feedback and computes:
	- service demand counts
	- average satisfaction ratings
4. CitizenInsightsDashboard sends the aggregated stats to /api/analytics.
5. The analytics route uses Fanar to generate a short AI insight summary.
6. Charts and the AI summary update live when feedback changes.

## 6. Architecture Notes

### Global app shell

pages/_app.js wraps all pages with:

- LanguageProvider
- ChatProvider
- Navbar
- AiAgentWidget
- Footer

### Key modules

- context/LanguageContext.js: i18n state and translation orchestration
- context/ChatContext.jsx: assistant open/close state
- components/AiAgentWidget.jsx: chat UI and feedback actions
- components/CitizenInsightsDashboard.jsx: analytics charts
- utils/feedback.js: feedback normalization, storage, and aggregations

### API routes

- pages/api/chat.js: AI responses
- pages/api/translate.js: UI translation batching
- pages/api/analytics.js: AI-generated dashboard insights
- pages/api/feedback.js: feedback persistence and reset

## 7. Data and Persistence

### Client-side

- Survey feedback key: bayan_feedback_data
- Chat feedback key: bayan_chat_feedback

### Server-side files

- data/survey-feedback.json
- data/chat-feedback.json

If API persistence fails, the app still functions using localStorage.

## 8. Reset Feedback Data

The frontend utility resetFeedbackData triggers:

- localStorage cleanup
- DELETE /api/feedback to reset JSON files

You can also call this endpoint manually during development.

## 9. Folder Guide

- components/: reusable UI blocks
- context/: global state providers
- pages/: routes and API endpoints
- pages/services/: service-specific pages
- styles/: global and component style sheets
- utils/: shared utility logic
- data/: persisted feedback records
- public/: static assets

## 10. Deployment Notes

- Set FANAR_API_KEY in the deployment environment.
- Ensure the runtime has write permissions to the data directory if using file persistence in production.
- For serverless deployments, consider replacing file persistence with a database.

## 11. Troubleshooting

### Missing AI responses

- Verify FANAR_API_KEY in .env.local.
- Check API route errors in server logs.

### Translation not applying to specific text

- Confirm exact text key exists in UI_STRINGS.
- Translation keys are exact-match, including punctuation.

### Chart/data mismatch

- Confirm feedback exists in localStorage.
- Confirm data files are writable if relying on API persistence.

## 12. Team Workflow Suggestion

Use this lightweight flow for contributors:

1. Pull latest changes and install deps.
2. Run npm run dev and validate core pages.
3. Implement feature in small commits.
4. Run npm run build before pushing.
5. Update this README when behavior or setup changes.



