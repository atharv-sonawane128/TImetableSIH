from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class TimeSlot(BaseModel):
    id: int
    label: str
    start: str
    end: str


class ExistingClass(BaseModel):
    id: Optional[int] = None
    subject: str = Field(..., alias="subjectName")
    subjectId: Optional[int] = None
    facultyId: int
    facultyName: Optional[str] = None
    classroomId: int
    classroomName: Optional[str] = None
    slotId: int
    day: str
    divisionId: Optional[int] = None
    divisionName: Optional[str] = None
    type: Optional[str] = None
    labSession: Optional[str] = None


class OptimizeRequest(BaseModel):
    departments: Optional[list] = None
    faculty: Optional[list] = None
    classrooms: Optional[list] = None
    subjects: Optional[list] = None
    selectedDivision: Optional[dict] = None
    selectedShift: Optional[dict] = None
    timeSlots: List[TimeSlot] = []
    existingClasses: List[ExistingClass] = []
    num_options: int = 3


class OptimizedClass(BaseModel):
    subjectName: str
    facultyId: int
    facultyName: Optional[str] = None
    classroomId: int
    classroomName: Optional[str] = None
    slotId: int
    day: str
    divisionId: Optional[int] = None
    divisionName: Optional[str] = None
    type: Optional[str] = None
    labSession: Optional[str] = None


class OptimizeResponse(BaseModel):
    id: str
    name: str
    classes: List[OptimizedClass]
    conflicts: List[str] = []
    suggestions: List[str] = []
    efficiency: float = 0.0


app = FastAPI(title="Smart Timetable Optimizer", version="0.1.0")

# CORS for Vite dev server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "optimizer"}


@app.post("/optimize", response_model=List[OptimizeResponse])
def optimize(req: OptimizeRequest):
    # Placeholder: simply return existing classes bundled as 1..N options
    base_name = req.selectedDivision.get("name") if req.selectedDivision else "Timetable"
    classes = [
        OptimizedClass(
            subjectName=c.subject,
            facultyId=c.facultyId,
            facultyName=c.facultyName,
            classroomId=c.classroomId,
            classroomName=c.classroomName,
            slotId=c.slotId,
            day=c.day,
            divisionId=c.divisionId,
            divisionName=c.divisionName,
            type=c.type,
            labSession=c.labSession,
        )
        for c in req.existingClasses
    ]

    options: List[OptimizeResponse] = []
    for i in range(max(1, req.num_options)):
        options.append(
            OptimizeResponse(
                id=f"opt_{i+1}",
                name=f"{base_name} Option {i+1}",
                classes=classes,
                conflicts=[],
                suggestions=["No conflicts detected in placeholder engine"],
                efficiency=0.9 - i * 0.05,
            )
        )
    return options


# To run: uvicorn main:app --reload --host 127.0.0.1 --port 8000

