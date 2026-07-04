# InsightPilot AI

InsightPilot AI is a full-stack analytics portfolio project for uploading datasets, profiling data quality, exploring rows, asking AI questions, generating charts, producing business insights, forecasting simple time-series trends, and exporting executive PDF reports.

The product is designed as a professional light analytics workspace inspired by business intelligence tools, with a FastAPI backend and React + TypeScript frontend.

## Feature List

- CSV, XLSX, and XLS upload
- One-click sample datasets for HR, sales, and marketing analytics
- Dataset profiling with rows, columns, missing values, duplicates, types, and numeric statistics
- Column explorer with search and sorting
- Paginated data explorer with global search and column sorting
- AI chat with compact dataset context
- AI visualization agent with Recharts rendering
- Business insights engine for executive summaries, findings, risks, opportunities, and actions
- Baseline monthly forecasting for suitable time-series datasets
- Executive PDF report generation and download
- Workspace persistence with localStorage and Clear Workspace action

## Tech Stack

- Backend: Python, FastAPI, Uvicorn
- Data: pandas, numpy, openpyxl, xlrd
- AI: OpenAI Python SDK
- Reports: ReportLab
- Frontend: React, Vite, TypeScript
- Styling: Tailwind CSS
- Charts: Recharts

## Local Setup

Backend:

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
APP_NAME=InsightPilot AI API
APP_ENV=local
API_PREFIX=/api
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
OPENAI_API_KEY=
CHAT_MODEL=gpt-5.5
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_AI_FEATURES_ENABLED=false
```

Set `VITE_AI_FEATURES_ENABLED=true` only when the backend has a valid `OPENAI_API_KEY`.

## Run Backend

From `backend/`:

```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

If port 8000 is busy:

```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

## Run Frontend

From `frontend/`:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Test Sample Datasets

Use the `Try a sample dataset` section in the upload card:

- HR Analytics Dataset: good for attrition, department, income, and satisfaction analysis
- Sales Analytics Dataset: good for charts, insights, and forecasting
- Marketing Campaign Dataset: good for channel, spend, conversions, and revenue analysis

The app uploads the selected sample file from `backend/sample_data/`, profiles it, and loads the explorer automatically.

## Known Limitations

- AI features require `OPENAI_API_KEY`.
- Forecasting is a simple baseline trend model, not advanced ML.
- Forecasting requires date-like and numeric columns.
- PDF reports include saved profile and insight content, while persisted chart and forecast artifacts are still limited.
- Recharts increases the frontend bundle size and Vite may warn about large chunks.
- No authentication, database, deployment, or multi-user storage yet.

## Future Improvements

- Persist uploaded datasets and generated artifacts in a database
- Add authenticated workspaces
- Save generated charts and forecasts into reports
- Add advanced filtering and chart editing
- Add deployment configuration
- Add richer evaluation tests and CI

## Portfolio Pitch

InsightPilot AI demonstrates end-to-end product engineering across backend APIs, data processing, AI integration, business intelligence UX, visualization, forecasting, and report generation. It is built to show practical full-stack judgment: clean service boundaries, professional UI, realistic analytics workflows, and recruiter-friendly business value.
