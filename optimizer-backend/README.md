# Optimizer Backend (FastAPI + OR-Tools)

## Quickstart (Windows PowerShell)

```powershell
cd optimizer-backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Then set the frontend env:

```bash
# smart-timetable-scheduler/.env.local
VITE_OPTIMIZER_API=http://127.0.0.1:8000
```

## Endpoint
- POST `/optimize`: accepts timetable data and returns a list of options.

