import { useState, useEffect } from 'react'
import { X, Save, Building2 } from 'lucide-react'

const ClassroomForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    type: '',
    equipment: [],
    status: 'Available'
  })

  const [errors, setErrors] = useState({})
  const [newEquipment, setNewEquipment] = useState('')

  const equipmentOptions = [
    'Projector', 'Whiteboard', 'Smart Board', 'Computers', 
    'Audio System', 'Air Conditioning', 'WiFi', 'Printer'
  ]

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        capacity: initialData.capacity || '',
        type: initialData.type || '',
        equipment: initialData.equipment || [],
        status: initialData.status || 'Available'
      })
    } else {
      setFormData({
        name: '',
        capacity: '',
        type: '',
        equipment: [],
        status: 'Available'
      })
    }
    setErrors({})
    setNewEquipment('')
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleEquipmentAdd = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment]
      }))
      setNewEquipment('')
    }
  }

  const handleEquipmentRemove = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== equipment)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Classroom name is required'
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'
    if (!formData.type) newErrors.type = 'Classroom type is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const classroomData = {
      ...formData,
      capacity: parseInt(formData.capacity)
    }

    onSubmit(classroomData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Classroom' : 'Add New Classroom'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Classroom Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Classroom Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., A-101, B-205"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className={`input-field ${errors.capacity ? 'border-red-500' : ''}`}
              placeholder="Maximum number of students"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classroom Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`input-field ${errors.type ? 'border-red-500' : ''}`}
            >
              <option value="">Select type</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Lab">Lab</option>
              <option value="Seminar Room">Seminar Room</option>
              <option value="Conference Room">Conference Room</option>
              <option value="Workshop">Workshop</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment
            </label>
            <div className="space-y-3">
              {/* Add Equipment */}
              <div className="flex space-x-2">
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="flex-1 input-field"
                >
                  <option value="">Select equipment</option>
                  {equipmentOptions.map(equipment => (
                    <option key={equipment} value={equipment}>
                      {equipment}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleEquipmentAdd}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Equipment List */}
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((equipment, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                  >
                    {equipment}
                    <button
                      type="button"
                      onClick={() => handleEquipmentRemove(equipment)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
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
              {initialData ? 'Update Classroom' : 'Add Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassroomForm


