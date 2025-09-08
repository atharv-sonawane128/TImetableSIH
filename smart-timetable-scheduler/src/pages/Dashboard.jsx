import { 
  Calendar, 
  Users, 
  Building2, 
  GraduationCap, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { classrooms, faculty, students, timetable } = useData()
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
  
  const availableClassrooms = classrooms.filter(c => c.status === 'Available').length
  const occupiedClassrooms = classrooms.filter(c => c.status === 'Occupied').length
  
  const stats = [
    {
      name: 'Total Classes Scheduled',
      value: timetable.classes.length.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Calendar,
    },
    {
      name: 'Active Faculty',
      value: faculty.length.toString(),
      change: '+3',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Available Classrooms',
      value: availableClassrooms.toString(),
      change: `${occupiedClassrooms} occupied`,
      changeType: 'neutral',
      icon: Building2,
    },
    {
      name: 'Total Students',
      value: students.length.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: GraduationCap,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'schedule',
      message: 'New timetable generated for Computer Science Department',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'conflict',
      message: 'Classroom conflict detected in Room A-101',
      time: '4 hours ago',
      status: 'warning',
    },
    {
      id: 3,
      type: 'faculty',
      message: 'Dr. Smith requested leave for tomorrow',
      time: '6 hours ago',
      status: 'info',
    },
    {
      id: 4,
      type: 'update',
      message: 'Timetable updated for Electronics Department',
      time: '1 day ago',
      status: 'success',
    },
  ]

  const upcomingClasses = timetable.classes.slice(0, 3).map(classData => ({
    id: classData.id,
    subject: classData.subjectName,
    faculty: classData.facultyName,
    classroom: classData.classroomName,
    time: classData.time,
    students: classData.capacity,
  }))

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Impact Innovators 2.0 - Smart Classroom & Timetable Scheduler
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div key={classItem.id} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{classItem.subject}</h4>
                  <span className="text-xs text-gray-500">{classItem.students} students</span>
                </div>
                <p className="text-sm text-gray-600">{classItem.faculty}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{classItem.classroom}</p>
                  <p className="text-xs text-gray-500">{classItem.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <Calendar className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Generate Timetable</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <Users className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Add Faculty</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <Building2 className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Manage Classrooms</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
            <GraduationCap className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-600">Add Students</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
