import { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  MessageSquare,
  Filter,
  Search,
  Calendar,
  User,
  Building2
} from 'lucide-react'
import { useApproval } from '../context/ApprovalContext'
import { useAuth } from '../context/AuthContext'

const ApprovalDashboard = () => {
  const { 
    approvalRequests, 
    approvalHistory, 
    getApprovalRequestsForDepartment,
    approveRequest,
    rejectRequest,
    addComment,
    canPerformAction
  } = useApproval()
  const { user, loading } = useAuth()
  
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [actionModal, setActionModal] = useState({ show: false, type: '', request: null })
  const [commentText, setCommentText] = useState('')


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

  const userRequests = getApprovalRequestsForDepartment(user.department || 'Computer Science')
  const stats = {
    total: approvalRequests.length,
    pending: approvalRequests.filter(r => r.status === 'pending').length,
    approved: approvalRequests.filter(r => r.status === 'approved').length,
    rejected: approvalRequests.filter(r => r.status === 'rejected').length
  }

  const filteredRequests = userRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter
    const title = (request.name || request.title || '').toLowerCase()
    const dept = (request.department || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    const matchesSearch = title.includes(term) || dept.includes(term)
    return matchesFilter && matchesSearch
  })


  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }


  const handleApproval = (requestId) => {
    if (canPerformAction(user, 'approve')) {
      approveRequest(requestId, user.name, commentText)
      setActionModal({ show: false, type: '', request: null })
      setCommentText('')
    }
  }


  const handleRejection = (requestId) => {
    if (canPerformAction(user, 'reject')) {
      rejectRequest(requestId, user.name, commentText)
      setActionModal({ show: false, type: '', request: null })
      setCommentText('')
    }
  }


  const handleAddComment = (requestId) => {
    if (commentText.trim()) {
      addComment(requestId, user.name, user.name, commentText)
      setCommentText('')
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approval Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Review and approve timetable requests from faculty and departments
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>


      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Requests Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No timetable requests to review at the moment'
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.name || request.title || 'Timetable Request'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {request.department}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {request.submittedBy || request.requestedBy || 'Unknown'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(request.submittedAt || request.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {(request.classes?.length || request.timetableData?.classes?.length || 0)} classes
                    </div>
                  </div>
                  
                  {(request.conflicts?.length || request.timetableData?.conflicts?.length || 0) > 0 && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {(request.conflicts?.length || request.timetableData?.conflicts?.length || 0)} conflicts detected
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowDetailsModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {request.status === 'pending' && canPerformAction(user, 'approve') && (
                    <>
                      <button
                        onClick={() => setActionModal({ show: true, type: 'approve', request })}
                        className="p-2 text-gray-400 hover:text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActionModal({ show: true, type: 'reject', request })}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              

              {request.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    {request.comments.slice(-2).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.approverName || comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.comments || comment.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedRequest.timetableData.name}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedRequest.timetableData.score}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedRequest.timetableData.efficiency}%
                    </div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedRequest.timetableData.conflicts.length}
                    </div>
                    <div className="text-sm text-gray-600">Conflicts</div>
                  </div>
                </div>
                

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Scheduled Classes</h4>
                  <div className="space-y-2">
                    {selectedRequest.timetableData.classes.map((classData) => (
                      <div key={classData.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{classData.subjectName}</div>
                          <div className="text-sm text-gray-600">
                            {classData.facultyName} • {classData.classroomName}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {classData.day} {classData.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionModal.type === 'approve' ? 'Approve Timetable' : 'Reject Timetable'}
              </h3>
              <p className="text-gray-600 mb-4">
                {actionModal.type === 'approve' 
                  ? 'This timetable will be approved and published.'
                  : 'This timetable will be rejected and sent back for revision.'
                }
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field h-20 resize-none"
                  placeholder="Add your comments..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setActionModal({ show: false, type: '', request: null })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionModal.type === 'approve') {
                      handleApproval(actionModal.request.id)
                    } else {
                      handleRejection(actionModal.request.id)
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg ${
                    actionModal.type === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalDashboard
