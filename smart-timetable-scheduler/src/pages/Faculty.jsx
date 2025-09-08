import { Users, Plus, Search, Mail, Phone, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useState } from 'react'

const Faculty = () => {
  const { user, loading } = useAuth()
  const { faculty, setFaculty } = useData()
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleEdit = (facultyMember) => {
    setEditingId(facultyMember.id)
    setEditForm({
      name: facultyMember.name,
      department: facultyMember.department,
      email: facultyMember.email,
      phone: facultyMember.phone,
      subjects: facultyMember.subjects.join(', '),
      availability: facultyMember.availability
    })
  }

  const handleSave = () => {
    setFaculty(prev => prev.map(f => 
      f.id === editingId 
        ? { 
            ...f, 
            ...editForm, 
            subjects: editForm.subjects.split(',').map(s => s.trim()).filter(s => s)
          }
        : f
    ))
    setEditingId(null)
    setEditForm({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty</h1>
          <p className="mt-2 text-gray-600">
            Manage faculty members and their schedules
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </button>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search faculty..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Faculty List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredFaculty.map((member) => (
          <div key={member.id} className="card">
            {editingId === member.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Faculty</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={editForm.department || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                    <input
                      type="text"
                      value={editForm.subjects || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subjects: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., Data Structures, Algorithms, Web Development"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={editForm.availability || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                      className="input-field"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.department}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.availability === 'Full-time' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.availability}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.subjects.map((subject, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <button className="flex-1 btn-primary text-sm">
                    View Schedule
                  </button>
                  <button 
                    onClick={() => handleEdit(member)}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Faculty
