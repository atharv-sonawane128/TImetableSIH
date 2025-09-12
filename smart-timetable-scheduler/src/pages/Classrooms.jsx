import { useState } from 'react'
import { Building2, Plus, Search, Filter, Edit, Trash2, X, Printer } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import ClassroomForm from '../components/ClassroomForm'
import ClassroomSchedule from '../components/ClassroomSchedule'

const Classrooms = () => {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom } = useData()
  const { user, loading } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewScheduleClassroom, setViewScheduleClassroom] = useState(null)

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
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddClassroom = (classroomData) => {
    addClassroom(classroomData)
    setShowForm(false)
  }

  const handleEditClassroom = (classroomData) => {
    updateClassroom(editingClassroom.id, classroomData)
    setEditingClassroom(null)
  }

  const handleDeleteClassroom = (id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      deleteClassroom(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
          <p className="mt-2 text-gray-600">
            Manage classroom resources and availability
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Classroom
          </button>
          <button
            onClick={() => window.open('/printable-classroom-schedules', '_blank')}
            className="btn-secondary flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            View All Schedules
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClassrooms.map((classroom) => (
          <div key={classroom.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                  <p className="text-sm text-gray-600">{classroom.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  classroom.status === 'Available' ? 'bg-green-100 text-green-800' :
                  classroom.status === 'Occupied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {classroom.status}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingClassroom(classroom)}
                    className="p-1 text-gray-400 hover:text-primary-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClassroom(classroom.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{classroom.capacity} students</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Equipment:</span>
                <span className="font-medium">{classroom.equipment.join(', ')}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button 
                className="w-full btn-primary text-sm"
                onClick={() => setViewScheduleClassroom(classroom)}
              >
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Classroom Schedule Modal */}
      {viewScheduleClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-7xl w-full max-h-full overflow-auto p-6 relative">
            <button
              className="absolute top-4 right-12 text-gray-600 hover:text-gray-900"
              onClick={() => window.print()}
              aria-label="Print schedule"
            >
              <Printer className="w-6 h-6" />
            </button>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setViewScheduleClassroom(null)}
              aria-label="Close schedule"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Schedule for {viewScheduleClassroom.name}</h2>
            <ClassroomSchedule classroomId={viewScheduleClassroom.id} />
          </div>
        </div>
      )}

      {/* Classroom Form Modal */}
      {(showForm || editingClassroom) && (
        <ClassroomForm
          isOpen={showForm || !!editingClassroom}
          onClose={() => {
            setShowForm(false)
            setEditingClassroom(null)
          }}
          onSubmit={editingClassroom ? handleEditClassroom : handleAddClassroom}
          initialData={editingClassroom}
        />
      )}
    </div>
  )
}

export default Classrooms
