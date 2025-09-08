import { GraduationCap, Plus, Search, Users, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Students = () => {
  const { user, loading } = useAuth()

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


  const students = [
   {
         id: 1,
         name: 'Atish kapoor',
         rollNumber: 'CS2024001',
         department: 'Computer Science',
         year: '3rd Year',
         email: 'atish.kapur@student.college.edu',
         subjects: ['Data Structures', 'Web Development', 'Database Systems']
       },
       {
         id: 2,
         name: 'Prem Chopra',
         rollNumber: 'IT2024002',
         department: 'Information Technology',
         year: '2nd Year',
         email: 'chopra.prem@student.college.edu',
         subjects: ['Programming', 'Networks', 'Software Engineering']
       },
       {
         id: 3,
         name: 'Madhuri Shikshit',
         rollNumber: 'CS2024003',
         department: 'Computer Science',
         year: '4th Year',
         email: 'madhuri.shiksha@student.college.edu',
         subjects: ['Machine Learning', 'AI', 'Project Management']
       },
   {
         id: 4,
         name: 'Ekta Kumari',
         rollNumber: 'CS2024003',
         department: 'Computer Science',
         year: '4th Year',
         email: 'ekta.kumari@student.college.edu',
         subjects: ['Web Development', 'DS']
       },
       {
         id: 5,
         name: 'Muktaben Patel',
         rollNumber: 'CS2024003',
         department: 'Computer Science',
         year: '4th Year',
         email: 'patel.muktaben@student.college.edu',
         subjects: [ 'AI', 'Project Management']
       },
       {
         id: 6,
         name: 'Siddhi Dodhi',
         rollNumber: 'CS2023122',
         department: 'Computer Science',
         year: '4th Year',
         email: 'dhodi.siddhi@student.college.edu',
         subjects: ['Android Development', 'AI', 'Flutter']
       },
       {
         id: 7,
         name: 'Madhuri Non-Shikshit',
         rollNumber: 'CS2023332',
         department: 'Computer Science',
         year: '4th Year',
         email: 'non.madhuri@student.college.edu',
         subjects: ['Native', 'React', 'NodeJS']
       }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">
            Manage student information and class enrollments
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {students.map((student) => (
          <div key={student.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {student.year}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {student.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                {student.email}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Subjects:</p>
                <div className="flex flex-wrap gap-1">
                  {student.subjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <button className="flex-1 btn-primary text-sm">
                View Timetable
              </button>
              <button className="flex-1 btn-secondary text-sm">
                Edit Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Students
