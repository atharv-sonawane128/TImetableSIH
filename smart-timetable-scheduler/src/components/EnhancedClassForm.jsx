import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { X, Lock, Clock, BookOpen, User, MapPin } from 'lucide-react'

const EnhancedClassForm = ({ isOpen, onClose, onSave, selectedSlot, selectedDivision, editingClass }) => {
  const { 
    classrooms, 
    faculty, 
    subjects, 
    timeSlots, 
    getFacultyAvailability, 
    getSubjectsForDivision,
    checkConflicts,
    isLabSubject,
    isEligibleForLabSplitting,
    getLabClassrooms,
    timetable
  } = useData()

  const [formData, setFormData] = useState({
    subject: '',
    facultyId: '',
    classroomId: '',
    slotId: selectedSlot?.timeSlot?.id || '',
    day: selectedSlot?.day || '',
    divisionId: selectedDivision?.id || '',
    divisionName: selectedDivision?.name || ''
  })

  const [availableSubjects, setAvailableSubjects] = useState([])
  const [availableFaculty, setAvailableFaculty] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [isLabMode, setIsLabMode] = useState(false)
  const [labClassrooms, setLabClassrooms] = useState([])
  const [secondLabData, setSecondLabData] = useState({
    subject: '',
    facultyId: '',
    classroomId: ''
  })
  const [labAId, setLabAId] = useState(null)
  const [labBId, setLabBId] = useState(null)

  useEffect(() => {
    if (selectedDivision) {
      const subjects = getSubjectsForDivision(selectedDivision.id)
      setAvailableSubjects(subjects)
      setFormData(prev => ({
        ...prev,
        divisionId: selectedDivision.id,
        divisionName: selectedDivision.name
      }))
      
      // Load lab classrooms
      const labs = getLabClassrooms()
      setLabClassrooms(labs)
    }
  }, [selectedDivision, getSubjectsForDivision, getLabClassrooms])

  useEffect(() => {
    if (selectedSlot) {
      const faculty = getFacultyAvailability(selectedSlot.timeSlot?.id, selectedSlot.day)
      setAvailableFaculty(faculty)
      setFormData(prev => ({
        ...prev,
        slotId: selectedSlot.timeSlot?.id,
        day: selectedSlot.day
      }))
    }
  }, [selectedSlot, getFacultyAvailability])

  // Load existing data when editing
  useEffect(() => {
    if (!editingClass) return

    // Determine if we're editing a lab pair
    if (editingClass.isLabMode) {
      // Find partner class in same slot/day/division
      const partner = (timetable?.classes || []).find(c => 
        c.divisionId === editingClass.divisionId &&
        c.day === editingClass.day &&
        c.slotId == editingClass.slotId &&
        c.isLabMode &&
        c.labSession !== editingClass.labSession
      )

      // Normalize so formData represents Lab A, secondLabData represents Lab B
      const labA = editingClass.labSession === 'A' ? editingClass : partner
      const labB = editingClass.labSession === 'B' ? editingClass : partner

      if (labA) {
        setFormData(prev => ({
          ...prev,
          subject: labA.subjectName || labA.subject || '',
          facultyId: labA.facultyId?.toString() || '',
          classroomId: labA.classroomId?.toString() || '',
          slotId: labA.slotId,
          day: labA.day,
          divisionId: labA.divisionId,
          divisionName: labA.divisionName
        }))
        setLabAId(labA.id || null)
      }
      if (labB) {
        setSecondLabData({
          subject: labB.subjectName || labB.subject || '',
          facultyId: labB.facultyId?.toString() || '',
          classroomId: labB.classroomId?.toString() || ''
        })
        setLabBId(labB.id || null)
      }

      // Ensure lab mode is on
      setIsLabMode(true)
    } else {
      // Non-lab edit
      setFormData(prev => ({
        ...prev,
        subject: editingClass.subjectName || editingClass.subject || '',
        facultyId: editingClass.facultyId?.toString() || '',
        classroomId: editingClass.classroomId?.toString() || '',
        slotId: editingClass.slotId,
        day: editingClass.day,
        divisionId: editingClass.divisionId,
        divisionName: editingClass.divisionName
      }))
    }
  }, [editingClass, timetable])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Check if lab subject is selected and division is eligible for lab splitting
    if (field === 'subject') {
      const isLab = isLabSubject(value)
      const isEligible = isEligibleForLabSplitting(selectedDivision?.id)
      setIsLabMode(isLab && isEligible)
      
      // Reset second lab data when subject changes
      if (!isLab || !isEligible) {
        setSecondLabData({ subject: '', facultyId: '', classroomId: '' })
      }
    }

    // Check conflicts when form data changes
    if (field === 'facultyId' || field === 'classroomId') {
      const newFormData = { ...formData, [field]: value }
      const newConflicts = checkConflicts(newFormData)
      setConflicts(newConflicts)
    }
  }

  const handleSecondLabChange = (field, value) => {
    setSecondLabData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.facultyId || !formData.classroomId) {
      alert('Please fill in all required fields')
      return
    }

    // For lab mode, check if second lab data is provided
    if (isLabMode && (!secondLabData.subject || !secondLabData.facultyId || !secondLabData.classroomId)) {
      alert('Please fill in all required fields for both lab sessions')
      return
    }

    // Check if selected faculty is locked
    const selectedFaculty = availableFaculty.find(f => f.id === formData.facultyId)
    if (selectedFaculty && selectedFaculty.isLocked) {
      alert('Cannot select a locked faculty member. Please choose an available faculty.')
      return
    }

    // Check if second lab faculty is locked (for lab mode)
    if (isLabMode) {
      const secondFaculty = availableFaculty.find(f => f.id === secondLabData.facultyId)
      if (secondFaculty && secondFaculty.isLocked) {
        alert('Cannot select a locked faculty member for the second lab session.')
        return
      }
    }

    const facultyMember = faculty.find(f => f.id === formData.facultyId)
    const selectedClassroom = classrooms.find(c => c.id === formData.classroomId)
    const selectedTimeSlot = timeSlots.find(s => s.id === formData.slotId)

    // For lab mode, create/update different subjects for Lab A and Lab B
    if (isLabMode) {
      const secondFacultyMember = faculty.find(f => f.id === secondLabData.facultyId)
      const secondClassroom = classrooms.find(c => c.id === secondLabData.classroomId)
      
      // Create Lab A class data
      const labAClassData = {
        ...formData,
        subjectName: formData.subject,
        facultyName: facultyMember?.name || '',
        classroomName: selectedClassroom?.name || '',
        timeSlot: selectedTimeSlot?.time || '',
        day: formData.day,
        facultyId: parseInt(formData.facultyId),
        classroomId: parseInt(formData.classroomId),
        slotId: parseInt(formData.slotId),
        isLabMode: isLabMode,
        classStrength: Math.ceil(selectedDivision?.strength / 2),
        labSession: 'A',
        id: labAId || undefined
      }
      
      // Create Lab B class data with selected subject
      const labBClassData = {
        ...formData,
        subject: secondLabData.subject,
        subjectName: secondLabData.subject,
        facultyName: secondFacultyMember?.name || '',
        classroomName: secondClassroom?.name || '',
        timeSlot: selectedTimeSlot?.time || '',
        day: formData.day,
        facultyId: parseInt(secondLabData.facultyId),
        classroomId: parseInt(secondLabData.classroomId),
        slotId: parseInt(formData.slotId),
        isLabMode: isLabMode,
        classStrength: Math.ceil(selectedDivision?.strength / 2),
        labSession: 'B',
        id: labBId || undefined
      }
      
      // Save both lab classes together to prevent duplicates
      onSave([labAClassData, labBClassData])
    } else {
      // Regular class (non-lab mode)
      const classData = {
        ...formData,
        subjectName: formData.subject,
        facultyName: facultyMember?.name || '',
        classroomName: selectedClassroom?.name || '',
        timeSlot: selectedTimeSlot?.time || '',
        day: formData.day,
        facultyId: parseInt(formData.facultyId),
        classroomId: parseInt(formData.classroomId),
        slotId: parseInt(formData.slotId),
        isLabMode: false,
        classStrength: selectedDivision?.strength,
        id: editingClass?.id || undefined
      }
      
      onSave(classData)
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{editingClass ? 'Edit Class' : 'Add Class'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selected Slot Display */}
          {selectedSlot && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Selected Time Slot:</span>
                <span>{selectedSlot.timeSlot?.time} - {selectedSlot.day}</span>
              </div>
            </div>
          )}

          {/* Selected Division Display */}
          {selectedDivision && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <User className="w-5 h-5" />
                <span className="font-medium">Selected Division:</span>
                <span>{selectedDivision.name} ({selectedDivision.strength} students)</span>
              </div>
            </div>
          )}

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Subject *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Lab Mode Info for Lab A */}
          {isLabMode && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <div className="text-sm text-green-700">
                <strong>Lab Session A:</strong> {formData.subject}
              </div>
            </div>
          )}

          {/* Faculty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {isLabMode ? 'Lab Faculty A *' : 'Faculty *'}
            </label>
            <select
              value={formData.facultyId}
              onChange={(e) => handleInputChange('facultyId', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select Faculty</option>
              {availableFaculty
                .filter(f => isLabMode ? f.id !== parseInt(secondLabData.facultyId) : true)
                .map((facultyMember) => {
                  const isDisabled = !facultyMember.isAvailable
                  return (
                    <option 
                      key={facultyMember.id} 
                      value={facultyMember.id}
                      disabled={isDisabled}
                      className={isDisabled ? 'text-gray-400 bg-gray-100' : ''}
                    >
                      {facultyMember.name}{facultyMember.isLocked ? ' 🔒' : ''}
                    </option>
                  )
                })}
            </select>
            
            {/* Faculty Availability Info */}
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>🔒 Reserved (Locked)</span>
                </div>
              </div>
              {availableFaculty.some(f => f.isLocked) && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Faculty with 🔒 are locked:</p>
                      <ul className="space-y-1 text-xs">
                        {availableFaculty
                          .filter(f => f.isLocked)
                          .map(f => (
                            <li key={f.id} className="flex items-center space-x-1">
                              <span className="font-medium">{f.name}:</span>
                              <span>{f.lockedReason}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classroom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              {isLabMode ? 'Lab Classroom A *' : 'Classroom *'}
            </label>
            <select
              value={formData.classroomId}
              onChange={(e) => handleInputChange('classroomId', e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select {isLabMode ? 'Lab Classroom' : 'Classroom'}</option>
              {(isLabMode ? labClassrooms : classrooms).map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.type} (Capacity: {classroom.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Lab Mode - Second Lab Session */}
          {isLabMode && (
            <div className="border-t pt-6 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Lab Session B</h3>
                <p className="text-sm text-blue-600 mb-2">
                  Class will be split into 2 halves. Each half will have {Math.ceil(selectedDivision?.strength / 2)} students.
                </p>
                <p className="text-sm text-blue-700">
                  Select a different lab subject for Lab B (can be same or different from Lab A)
                </p>
              </div>

              {/* Lab B Subject Display */}
              {secondLabData.subject && (
                <div className="bg-blue-100 p-3 rounded-lg mb-4">
                  <div className="text-sm text-blue-700">
                    <strong>Lab Session B:</strong> {secondLabData.subject}
                  </div>
                </div>
              )}

              {/* Lab B Subject Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Lab B Subject *
                </label>
                <select
                  value={secondLabData.subject}
                  onChange={(e) => handleSecondLabChange('subject', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Lab Subject for Lab B</option>
                  {availableSubjects.map((subject, index) => (
                    <option key={index} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Second Lab Faculty */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Lab Faculty B *
                </label>
                <select
                  value={secondLabData.facultyId}
                  onChange={(e) => handleSecondLabChange('facultyId', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Faculty for Lab B</option>
                  {availableFaculty
                    .filter(f => f.id !== parseInt(formData.facultyId))
                    .map((facultyMember) => {
                      const isDisabled = !facultyMember.isAvailable
                      return (
                        <option 
                          key={facultyMember.id} 
                          value={facultyMember.id}
                          disabled={isDisabled}
                          className={isDisabled ? 'text-gray-400 bg-gray-100' : ''}
                        >
                          {facultyMember.name}{facultyMember.isLocked ? ' 🔒' : ''}
                        </option>
                      )
                    })}
                </select>
              </div>

              {/* Second Lab Classroom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Lab Classroom B *
                </label>
                <select
                  value={secondLabData.classroomId}
                  onChange={(e) => handleSecondLabChange('classroomId', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Lab Classroom B</option>
                  {labClassrooms
                    .filter(c => c.id !== parseInt(formData.classroomId))
                    .map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name} - {classroom.type} (Capacity: {classroom.capacity})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Conflicts Detected:</h4>
              <ul className="space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={conflicts.length > 0}
            >
              {editingClass ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EnhancedClassForm

