# Well-Being Journal Web App

Well-Being Journal is a full-stack journaling platform built to support reflective writing, mood awareness, gentle self-care guidance, and privacy-first emotional tracking.

This product is a supportive well-being tool only. It is not a medical device, not a therapy platform, and not a replacement for professional mental health treatment.

## Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express
- AI microservice: Python + FastAPI + NLTK VADER
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- Optional AI hook: internal rule-based mood detection with a pluggable Python service endpoint

## Key Features

- Secure registration and login with hashed passwords
- JWT-protected API routes
- Role-based access for `user`, `admin`, and `helper`
- Journal CRUD with search plus date and mood filters
- Manual mood tracking with emoji-based selection
- Dashboard with streaks, badges, reminders, prompts, suggestions, and mood charts
- Journal drafts and final entries
- Guided writing prompts and mood-based self-care suggestions
- Streaks and badges based on completed journaling days
- Distress-language detection with calm resource messaging
- Settings for theme, reminders, and helper-sharing consent
- Admin dashboard with anonymized aggregated analytics and account activation controls
- Helper dashboard for consent-based shared entries and supportive feedback

## Project Structure

```text
.
├── client
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── data
│   │   ├── hooks
│   │   ├── lib
│   │   └── pages
├── ai-service
│   ├── app.py
│   ├── mood_logic.py
│   └── requirements.txt
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── utils
└── package.json
```

## Local Setup

### 1. Install dependencies

From the project root:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` as needed:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `AI_MODE`
- `PYTHON_AI_URL` if using an external Python mood service

### 3. Optional: install the Python AI service

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

To use the AI service, set this in `server/.env`:

```env
AI_MODE=python
PYTHON_AI_URL=http://127.0.0.1:8000/analyze
```

### 4. Start MongoDB

Use a local MongoDB server or MongoDB Atlas.

### 5. Run the apps

In separate terminals:

```bash
cd server && npm run dev
cd client && npm run dev
```

If you want the Python AI service too:

```bash
npm run dev:ai
```

Or from the root:

```bash
npm run dev
```

## Testing

This repo includes test setup for the frontend, backend, and AI service.

### Install test dependencies

Frontend:

```bash
cd client && npm install
```

Backend:

```bash
cd server && npm install
```

AI service:

```bash
python3 -m pip install -r ai-service/requirements-dev.txt
```

### Run tests

All suites from the project root:

```bash
npm test
```

Frontend only:

```bash
cd client && npm run test:run
```

Backend only:

```bash
cd server && npm run test:run
```

AI service only:

```bash
PYTHONPATH=ai-service ./ai-service/.venv/bin/python -m pytest ai-service/tests -q
```

Frontend:

- `http://localhost:5173`

Backend:

- `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

AI service:

- `http://localhost:8000`
- Health check: `http://localhost:8000/health`

## Demo Accounts

If `SEED_DEMO_ACCOUNTS=true`, the backend seeds:

- Admin: `admin@wellbeing.local` / `Admin123!`
- Helper: `helper@wellbeing.local` / `Helper123!`

Regular users sign up through the UI.

## Core Backend Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Journals

- `GET /api/journals`
- `GET /api/journals/:id`
- `POST /api/journals`
- `PUT /api/journals/:id`
- `DELETE /api/journals/:id`
- `POST /api/journals/:id/share`

### Dashboard / Analytics / Settings

- `GET /api/dashboard/summary`
- `GET /api/analytics/moods`
- `GET /api/settings`
- `GET /api/settings/helpers`
- `PUT /api/settings`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`

### Helper

- `GET /api/helper/shared-entries`
- `POST /api/helper/shared-access/:id/feedback`

## Data Models

- `User`
- `JournalEntry`
- `Badge`
- `Prompt`
- `Suggestion`
- `SharedAccess`

## AI and Safety Hooks

The app works fully without AI.

When AI is enabled:

- `AI_MODE=internal` uses a built-in rule-based sentiment and mood guesser
- `AI_MODE=python` sends text to the included FastAPI mood service and falls back to internal analysis if unavailable

Distress support is informational only:

- Detects concerning language in text
- Shows a calm support message and external resources
- Does not notify admins, helpers, or emergency services

## Privacy Notes

- Journal entries are private by default
- Admins only see aggregated statistics
- Helpers only see entries explicitly shared by the user
- Sharing requires user consent to be enabled in settings
