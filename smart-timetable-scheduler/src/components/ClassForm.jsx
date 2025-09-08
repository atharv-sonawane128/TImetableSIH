import { useState, useEffect } from 'react'
import { X, Save, Calendar, Users, Building2, BookOpen } from 'lucide-react'

const ClassForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  classrooms, 
  faculty, 
  subjects, 
  availableSlots 
}) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    facultyId: '',
    classroomId: '',
    slotId: '',
    capacity: '',
    department: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        subjectId: initialData.subjectId || '',
        facultyId: initialData.facultyId || '',
        classroomId: initialData.classroomId || '',
        slotId: initialData.slotId || '',
        capacity: initialData.capacity || '',
        department: initialData.department || ''
      })
    } else {
      setFormData({
        subjectId: '',
        facultyId: '',
        classroomId: '',
        slotId: '',
        capacity: '',
        department: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required'
    if (!formData.facultyId) newErrors.facultyId = 'Faculty is required'
    if (!formData.classroomId) newErrors.classroomId = 'Classroom is required'
    if (!formData.slotId) newErrors.slotId = 'Time slot is required'
    if (!formData.capacity) newErrors.capacity = 'Capacity is required'
    if (!formData.department) newErrors.department = 'Department is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const selectedSubject = subjects.find(s => s.id === parseInt(formData.subjectId))
    const selectedFaculty = faculty.find(f => f.id === parseInt(formData.facultyId))
    const selectedClassroom = classrooms.find(c => c.id === parseInt(formData.classroomId))
    const selectedSlot = availableSlots.find(s => s.id === parseInt(formData.slotId))

    const classData = {
      subjectId: parseInt(formData.subjectId),
      subjectName: selectedSubject?.name || '',
      facultyId: parseInt(formData.facultyId),
      facultyName: selectedFaculty?.name || '',
      classroomId: parseInt(formData.classroomId),
      classroomName: selectedClassroom?.name || '',
      slotId: parseInt(formData.slotId),
      day: selectedSlot?.day || '',
      time: selectedSlot?.time || '',
      capacity: parseInt(formData.capacity),
      department: formData.department
    }

    onSubmit(classData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Subject
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className={`input-field ${errors.subjectId ? 'border-red-500' : ''}`}
            >
              <option value="">Select a subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code}) - {subject.department}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>
            )}
          </div>

          {/* Faculty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Faculty
            </label>
            <select
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              className={`input-field ${errors.facultyId ? 'border-red-500' : ''}`}
            >
              <option value="">Select faculty member</option>
              {faculty.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.department}
                </option>
              ))}
            </select>
            {errors.facultyId && (
              <p className="text-red-500 text-sm mt-1">{errors.facultyId}</p>
            )}
          </div>

          {/* Classroom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Classroom
            </label>
            <select
              name="classroomId"
              value={formData.classroomId}
              onChange={handleChange}
              className={`input-field ${errors.classroomId ? 'border-red-500' : ''}`}
            >
              <option value="">Select classroom</option>
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.type} (Capacity: {classroom.capacity})
                </option>
              ))}
            </select>
            {errors.classroomId && (
              <p className="text-red-500 text-sm mt-1">{errors.classroomId}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Time Slot
            </label>
            <select
              name="slotId"
              value={formData.slotId}
              onChange={handleChange}
              className={`input-field ${errors.slotId ? 'border-red-500' : ''}`}
            >
              <option value="">Select time slot</option>
              {availableSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.day} - {slot.time}
                </option>
              ))}
            </select>
            {errors.slotId && (
              <p className="text-red-500 text-sm mt-1">{errors.slotId}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className={`input-field ${errors.capacity ? 'border-red-500' : ''}`}
              placeholder="Enter expected number of students"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`input-field ${errors.department ? 'border-red-500' : ''}`}
              placeholder="Enter department name"
            />
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Class' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassForm


