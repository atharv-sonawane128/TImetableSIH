import { createContext, useContext, useState } from 'react'

const ApprovalContext = createContext()

export const useApproval = () => {
  const context = useContext(ApprovalContext)
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider')
  }
  return context
}

export const ApprovalProvider = ({ children }) => {
  const [approvalRequests, setApprovalRequests] = useState([
    {
      id: 1,
      timetableId: 'timetable-1',
      title: 'Computer Science - Semester 1 Timetable',
      department: 'Computer Science',
      submittedBy: 'Dr. John Smith',
      submittedAt: new Date('2024-01-15'),
      status: 'pending',
      approvers: ['Dr. Department Head'],
      comments: []
    }
  ])

  const [approvalHistory, setApprovalHistory] = useState([
    {
      id: 1,
      requestId: 1,
      action: 'approved',
      approverName: 'Dr. Department Head',
      timestamp: new Date('2024-01-16'),
      comment: 'Looks good, approved for implementation.'
    }
  ])

  // Get approval requests for a specific department
  const getApprovalRequestsForDepartment = (department) => {
    return approvalRequests.filter(request => 
      request.department === department || request.status === 'pending'
    )
  }

  // Get approvers for a specific department
  const getApproversForDepartment = (department) => {
    const approvers = {
      'Computer Science': ['Dr. Department Head', 'Dr. Admin'],
      'Electronics': ['Dr. Department Head', 'Dr. Admin'],
      'Mechanical': ['Dr. Department Head', 'Dr. Admin'],
      'Civil': ['Dr. Department Head', 'Dr. Admin']
    }
    return approvers[department] || ['Dr. Admin']
  }

  // Create a new approval request
  const createApprovalRequest = (requestData) => {
    const newRequest = {
      id: Date.now(),
      ...requestData,
      submittedAt: new Date(),
      status: 'pending',
      approvers: getApproversForDepartment(requestData.department),
      comments: []
    }
    setApprovalRequests(prev => [...prev, newRequest])
    return newRequest
  }

  // Approve a request
  const approveRequest = (requestId, approverName, comment = '') => {
    setApprovalRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'approved' }
          : request
      )
    )

    const approvalRecord = {
      id: Date.now(),
      requestId,
      action: 'approved',
      approverName,
      timestamp: new Date(),
      comment
    }

    setApprovalHistory(prev => [...prev, approvalRecord])
  }

  // Reject a request
  const rejectRequest = (requestId, approverName, comment = '') => {
    setApprovalRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      )
    )

    const rejectionRecord = {
      id: Date.now(),
      requestId,
      action: 'rejected',
      approverName,
      timestamp: new Date(),
      comment
    }

    setApprovalHistory(prev => [...prev, rejectionRecord])
  }

  // Add comment to a request
  const addComment = (requestId, userId, userName, comment) => {
    setApprovalRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              comments: [...request.comments, {
                id: Date.now(),
                userId,
                userName,
                comment,
                timestamp: new Date()
              }]
            }
          : request
      )
    )
  }

  // Get approval history for a request
  const getApprovalHistory = (requestId) => {
    return approvalHistory.filter(record => record.requestId === requestId)
  }

  // Check if user can perform approval actions
  const canPerformAction = (user, action) => {
    if (!user) return false
    
    const allowedRoles = {
      'approve': ['admin', 'departmentHead'],
      'reject': ['admin', 'departmentHead'],
      'comment': ['admin', 'departmentHead', 'faculty'],
      'submit': ['admin', 'departmentHead', 'faculty']
    }
    
    return allowedRoles[action]?.includes(user.role) || false
  }

  const value = {
    approvalRequests,
    approvalHistory,
    getApprovalRequestsForDepartment,
    getApproversForDepartment,
    createApprovalRequest,
    approveRequest,
    rejectRequest,
    addComment,
    getApprovalHistory,
    canPerformAction
  }

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  )
}
