import { useState } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Calendar, Plus, Settings, Download, Upload, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import TimetableGrid from '../components/TimetableGrid'
import EnhancedClassForm from '../components/EnhancedClassForm'
import ClassCard from '../components/ClassCard'
import DivisionSelector from '../components/DivisionSelector'

const TimetableBuilder = () => {
  const { 
    timetable, 
    classrooms, 
    faculty, 
    subjects, 
    addClass, 
    updateClass, 
    deleteClass, 
    checkConflicts,
    selectedDivision,
    setSelectedDivision,
    shifts,
    selectedShift,
    setSelectedShift
  } = useData()
  const { user, loading } = useAuth()

  const [showClassForm, setShowClassForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [editingClass, setEditingClass] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showDivisionSelector, setShowDivisionSelector] = useState(!selectedDivision)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Show loading state while user is being authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the timetable builder.</p>
        </div>
      </div>
    )
  }

  // Show division selector if no division is selected
  if (showDivisionSelector) {
    return (
      <DivisionSelector 
        onDivisionSelected={(division) => {
          setSelectedDivision(division)
          setShowDivisionSelector(false)
        }}
      />
    )
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      // Handle drag and drop logic here if needed
    }
    
    setActiveId(null)
  }

  const handleSlotClick = (slotData) => {
    setSelectedSlot(slotData)
    setShowClassForm(true)
  }

  const handleClassSave = (classData) => {
    // Support bulk save for lab A+B with de-duplication/upsert
    if (Array.isArray(classData)) {
      const [labA, labB] = classData
      if (!labA || !labB) return

      const key = {
        divisionId: labA.divisionId,
        day: labA.day,
        slotId: labA.slotId
      }

      // Remove ALL existing entries (lab or normal) for this division/day/slot first
      timetable.classes
        .filter(c => c.divisionId === key.divisionId && c.day === key.day && c.slotId == key.slotId)
        .forEach(c => deleteClass(c.id))

      // Then add exactly two: A and B
      addClass({ ...labA, labSession: 'A', id: undefined })
      addClass({ ...labB, labSession: 'B', id: undefined })

      setEditingClass(null)
      setShowClassForm(false)
      setSelectedSlot(null)
      return
    }

    // For normal class edits/creates, ensure exactly one entry exists in this slot
    const key = {
      divisionId: classData.divisionId,
      day: classData.day,
      slotId: classData.slotId
    }
    // Remove all classes (lab or non-lab) in this slot for the division
    timetable.classes
      .filter(c => c.divisionId === key.divisionId && c.day === key.day && c.slotId == key.slotId)
      .forEach(c => deleteClass(c.id))
    // Add the updated single non-lab class
    addClass({ ...classData, id: undefined, isLabMode: false, labSession: undefined })
    setEditingClass(null)
    setShowClassForm(false)
    setSelectedSlot(null)
  }

  const handleClassEdit = (classData) => {
    setEditingClass(classData)
    // Ensure selectedSlot reflects the class being edited
    setSelectedSlot({
      timeSlot: { id: classData.slotId, time: classData.timeSlot },
      day: classData.day
    })
    setShowClassForm(true)
  }

  const handleClassDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteClass(id)
    }
  }

  const handleBackToDivisionSelection = () => {
    setShowDivisionSelector(true)
    setSelectedDivision(null)
  }

  // Get classes for the selected division
  const divisionClasses = timetable.classes.filter(c => c.divisionId === selectedDivision?.id)

  // Calculate statistics
  const totalClasses = divisionClasses.length
  const totalConflicts = divisionClasses.reduce((acc, c) => acc + (c.conflicts?.length || 0), 0)
  const totalFaculty = new Set(divisionClasses.map(c => c.facultyId)).size
  const totalClassrooms = new Set(divisionClasses.map(c => c.classroomId)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDivisionSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Division Selection</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn-primary">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Division Info */}
      {selectedDivision && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Timetable Builder - {selectedDivision.name}
              </h1>
              <p className="text-gray-600">
                {selectedDivision.strength} students • Semester {selectedDivision.semester}
              </p>
            </div>
          </div>

          {/* Shift Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Select Shift:
              </label>
              <select
                value={selectedShift?.id || ''}
                onChange={(e) => {
                  const shiftId = parseInt(e.target.value)
                  const shift = shifts.find(s => s.id === shiftId)
                  setSelectedShift(shift)
                }}
                className="input-field max-w-xs"
              >
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.timeRange})
                  </option>
                ))}
              </select>
              {selectedShift && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Current Shift:</span> {selectedShift.name} - {selectedShift.timeRange}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Classes</p>
                  <p className="text-2xl font-bold text-blue-800">{totalClasses}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Conflicts</p>
                  <p className="text-2xl font-bold text-red-800">{totalConflicts}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Faculty Used</p>
                  <p className="text-2xl font-bold text-green-800">{totalFaculty}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600">Classrooms Used</p>
                  <p className="text-2xl font-bold text-purple-800">{totalClassrooms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TimetableGrid
            classes={divisionClasses}
            onSlotClick={handleSlotClick}
            onClassEdit={handleClassEdit}
            onClassDelete={handleClassDelete}
            selectedDivision={selectedDivision}
          />
          <DragOverlay>
            {activeId ? (
              <ClassCard
                classData={divisionClasses.find(c => c.id === activeId)}
                onEdit={handleClassEdit}
                onDelete={handleClassDelete}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Enhanced Class Form */}
      <EnhancedClassForm
        isOpen={showClassForm}
        onClose={() => {
          setShowClassForm(false)
          setSelectedSlot(null)
          setEditingClass(null)
        }}
        onSave={handleClassSave}
        selectedSlot={selectedSlot}
        selectedDivision={selectedDivision}
        editingClass={editingClass}
      />
    </div>
  )
}

export default TimetableBuilder
