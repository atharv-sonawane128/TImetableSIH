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
    getSubjectAvailability,
    getSubjectsForDivision,
    checkConflicts,
    isLabSubject,
    isEligibleForLabSplitting,
    getLabClassrooms,
    timetable,
    departments
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
      const subjectAvailability = getSubjectAvailability(selectedDivision.id)
      setAvailableSubjects(subjectAvailability)
      setFormData(prev => ({
        ...prev,
        divisionId: selectedDivision.id,
        divisionName: selectedDivision.name
      }))

      // Load lab classrooms
      const labs = getLabClassrooms()
      setLabClassrooms(labs)

      // Lab mode is disabled for 5th semester since lab classrooms are not available
      // if (selectedDivision.semester === 5) {
      //   setIsLabMode(true)
      // }
    }
  }, [selectedDivision, getSubjectAvailability, getLabClassrooms, timetable.classes])

  useEffect(() => {
    if (selectedSlot) {
      const faculty = getFacultyAvailability(selectedSlot.timeSlot?.id, selectedSlot.day)
      setAvailableFaculty(faculty)
      setFormData(prev => ({
        ...prev,
        slotId: selectedSlot.timeSlot?.id,
        day: selectedSlot.day
      }))

      // Check for conflicts when slot changes
      if (formData.classroomId && formData.facultyId) {
        const newConflicts = checkConflicts({
          ...formData,
          slotId: selectedSlot.timeSlot?.id,
          day: selectedSlot.day
        })
        setConflicts(newConflicts)
      }
    }
  }, [selectedSlot, getFacultyAvailability, checkConflicts])

  // Load existing data when editing
  useEffect(() => {
    if (!editingClass) {
      // Reset form data for new class (empty fields except slotId, day, division)
      setFormData({
        subject: '',
        facultyId: '',
        classroomId: '',
        slotId: selectedSlot?.timeSlot?.id || '',
        day: selectedSlot?.day || '',
        divisionId: selectedDivision?.id || '',
        divisionName: selectedDivision?.name || ''
      })
      setSecondLabData({
        subject: '',
        facultyId: '',
        classroomId: ''
      })
      setIsLabMode(false)
      setLabAId(null)
      setLabBId(null)
      return
    }

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

      // Ensure lab mode is on only if not 5th semester
      if (selectedDivision?.semester !== 5) {
        setIsLabMode(true)
      }
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
  }, [editingClass, timetable, selectedSlot, selectedDivision])

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

      // Filter faculty based on selected subject
      if (value && value !== 'Library') {
        const currentAvailableFaculty = getFacultyAvailability(selectedSlot?.timeSlot?.id, selectedSlot?.day) || []
        const filteredFaculty = currentAvailableFaculty.filter(facultyMember =>
          facultyMember.subjects && facultyMember.subjects.includes(value)
        )
        if (filteredFaculty.length === 0) {
          // Show a dummy entry to indicate no faculty available
          setAvailableFaculty([{ id: 'none', name: 'No faculty available', isAvailable: false }])
        } else {
          setAvailableFaculty(filteredFaculty)
        }

        // Reset faculty selection if current faculty doesn't teach the new subject
        if (formData.facultyId && !filteredFaculty.some(f => f.id === formData.facultyId)) {
          setFormData(prev => ({ ...prev, facultyId: '' }))
        }
      } else {
        // If no subject selected or Library, show all available faculty
        const allAvailableFaculty = getFacultyAvailability(selectedSlot?.timeSlot?.id, selectedSlot?.day) || []
        setAvailableFaculty(allAvailableFaculty)
      }
    }

    // Check conflicts when form data changes (skip for Library)
    if (['facultyId', 'classroomId', 'slotId', 'day'].includes(field) && formData.subject !== 'Library') {
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

    // If subject is Library, assign without faculty and classroom
    if (formData.subject.toLowerCase() === 'library') {
      const selectedTimeSlot = timeSlots.find(s => s.id === formData.slotId)
      const classData = {
        ...formData,
        subjectName: formData.subject,
        facultyName: '',
        classroomName: '',
        timeSlot: selectedTimeSlot?.time || '',
        day: formData.day,
        facultyId: null,
        classroomId: null,
        slotId: parseInt(formData.slotId),
        isLabMode: false,
        classStrength: selectedDivision?.strength,
        id: editingClass?.id || undefined
      }
      onSave(classData)
      onClose()
      return
    }

    // Prevent labs from being assigned to the last slot
    const maxSlotId = Math.max(...timeSlots.map(s => s.id))
    if (isLabMode && formData.slotId === maxSlotId) {
      alert('Labs cannot be assigned to the last slot as labs require 2-hour slots.')
      return
    }

    // Skip faculty and classroom validation for Library subjects
    if (!formData.subject) {
      alert('Please select a subject')
      return
    }

    // For non-Library subjects, require faculty and classroom
    if (formData.subject !== 'Library' && (!formData.facultyId || !formData.classroomId)) {
      alert('Please fill in all required fields')
      return
    }

    // Check if selected subject is locked
    const selectedSubject = availableSubjects.find(s => s.name === formData.subject)
    if (selectedSubject && selectedSubject.isLocked) {
      alert('Cannot select a locked subject. Please choose an available subject.')
      return
    }

    // For lab mode, check if second lab data is provided
    if (isLabMode && (!secondLabData.subject || !secondLabData.facultyId || !secondLabData.classroomId)) {
      alert('Please fill in all required fields for both lab sessions')
      return
    }

    // Check if second lab subject is locked (for lab mode)
    if (isLabMode) {
      const secondSubject = availableSubjects.find(s => s.name === secondLabData.subject)
      if (secondSubject && secondSubject.isLocked) {
        alert('Cannot select a locked subject for the second lab session.')
        return
      }
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
      if (selectedDivision?.semester === 5) {
        // For 5th semester, save a single lab class spanning two slots
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
          isLabMode: true,
          classStrength: selectedDivision?.strength,
          spansTwoSlots: true,
          id: editingClass?.id || undefined
        }
        onSave(classData)
      } else {
        // For other semesters, save two separate lab classes for session A and B
        const classDataA = {
          ...formData,
          subjectName: formData.subject,
          facultyName: facultyMember?.name || '',
          classroomName: selectedClassroom?.name || '',
          timeSlot: selectedTimeSlot?.time || '',
          day: formData.day,
          facultyId: parseInt(formData.facultyId),
          classroomId: parseInt(formData.classroomId),
          slotId: parseInt(formData.slotId),
          isLabMode: true,
          classStrength: selectedDivision?.strength,
          labSession: 'A',
          spansTwoSlots: true,
          id: editingClass?.id || undefined
        }
        const classDataB = {
          ...formData,
          subjectName: secondLabData.subject,
          facultyName: faculty.find(f => f.id === secondLabData.facultyId)?.name || '',
          classroomName: classrooms.find(c => c.id === parseInt(secondLabData.classroomId))?.name || '',
          timeSlot: selectedTimeSlot?.time || '',
          day: formData.day,
          facultyId: parseInt(secondLabData.facultyId),
          classroomId: parseInt(secondLabData.classroomId),
          slotId: parseInt(formData.slotId),
          isLabMode: true,
          classStrength: selectedDivision?.strength,
          labSession: 'B',
          spansTwoSlots: true,
          id: null
        }
        // Pass as array to handle bulk save properly
        onSave([classDataA, classDataB])
      }
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
              {availableSubjects.map((subject, index) => {
                const isDisabled = !subject.isAvailable
                return (
                  <option
                    key={index}
                    value={subject.name}
                    disabled={isDisabled}
                    className={isDisabled ? 'text-gray-400 bg-gray-100' : ''}
                  >
                    {subject.name}{subject.isLocked ? ' 🔒' : ''} ({subject.allocatedHours || 0}/{subject.maxHours || 0} hours)
                  </option>
                )
              })}
            </select>

            {/* Subject Availability Info */}
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>🔒 Hours Exceeded</span>
              </div>
              {availableSubjects.some(s => s.isLocked) && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Subjects with 🔒 are locked:</p>
                      <ul className="space-y-1 text-xs">
                        {availableSubjects
                          .filter(s => s.isLocked)
                          .map(s => (
                            <li key={s.name} className="flex items-center space-x-1">
                              <span className="font-medium">{s.name}:</span>
                              <span>{s.lockedReason}</span>
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

          {/* Lab Mode Info for Lab A */}
          {isLabMode && (
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <div className="text-sm text-green-700">
                <strong>Lab Session A:</strong> {formData.subject}
              </div>
            </div>
          )}

          {/* Faculty Selection - Hide for Library */}
          {formData.subject !== 'Library' && (
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
                {availableFaculty.length === 1 && availableFaculty[0].id === 'none' ? (
                  <option value="" disabled className="text-gray-400 bg-gray-100">
                    No faculty available
                  </option>
                ) : (
                  availableFaculty
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
                          {facultyMember.name}{facultyMember.isLocked ? ' 🔒' : ''} ({facultyMember.allocatedHours || 0}/{facultyMember.maxHours || 0} hours)
                        </option>
                      )
                    })
                )}
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
          )}

          {/* Classroom Selection - Hide for Library */}
          {formData.subject !== 'Library' && (
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
                {(selectedDivision?.semester === 5
                  ? classrooms.filter(c => !c.type.toLowerCase().includes('lab'))
                  : (isLabMode ? labClassrooms : classrooms.filter(c => !c.type.toLowerCase().includes('lab')))
                ).map((classroom) => {
                  // Check if classroom is occupied in this slot/day
                  const isOccupied = timetable.classes.some(c =>
                    c.classroomId === classroom.id &&
                    c.slotId == formData.slotId &&
                    c.day === formData.day &&
                    c.id !== (editingClass?.id || null)
                  )
                  return (
                    <option
                      key={classroom.id}
                      value={classroom.id}
                      disabled={isOccupied}
                      className={isOccupied ? 'text-gray-400 bg-gray-100' : ''}
                    >
                      {classroom.name} - {classroom.type} (Capacity: {classroom.capacity}){isOccupied ? ' 🔒 Occupied' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

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
                  {availableSubjects
                    .filter(sub => sub.name.toLowerCase().includes('lab'))
                    .map((subject, index) => {
                      const isDisabled = !subject.isAvailable
                      return (
                        <option
                          key={index}
                          value={subject.name}
                          disabled={isDisabled}
                          className={isDisabled ? 'text-gray-400 bg-gray-100' : ''}
                        >
                          {subject.name}{subject.isLocked ? ' 🔒' : ''} ({subject.allocatedHours || 0}/{subject.maxHours || 0} hours)
                        </option>
                      )
                    })}
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
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Conflicts Detected:</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{conflict.message}</span>
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
