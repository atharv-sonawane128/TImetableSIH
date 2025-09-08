import { useState, useEffect } from 'react'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Star, 
  Download, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Users,
  Building2,
  RefreshCw
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApproval } from '../context/ApprovalContext'
import { useAuth } from '../context/AuthContext'
import { TimetableOptimizer } from '../utils/optimizationEngine'
import ClassCard from '../components/ClassCard'
import MiniTimetableGrid from '../components/MiniTimetableGrid'

const TimetableOptions = () => {
  const { classrooms, faculty, subjects, timetable, selectedDivision, selectedShift, timeSlots, departments } = useData()
  const { createApprovalRequest, canPerformAction } = useApproval()
  const { user, loading } = useAuth()
  const [optimizedOptions, setOptimizedOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  // Removed per-class dropdown; we only filter by division now
  const [selectedDivisionIdForSuggestions, setSelectedDivisionIdForSuggestions] = useState(selectedDivision?.id ? String(selectedDivision.id) : '')

  const allDivisions = (departments || [])
    .flatMap(d => d.specializations || [])
    .flatMap(s => s.divisions || [])
    .map(div => ({ id: String(div.id), name: div.name }))
  const [isGenerating, setIsGenerating] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')

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

  // Generate optimized timetable options (with optional force refresh)
  const generateOptions = async (forceRefresh = false) => {
    setIsGenerating(true)
    
    try {
      const constraints = {
        maxClassesPerDay: 3,
        minBreakBetweenClasses: 1,
        shiftPreferences: {
          'Computer Science': 'morning',
          'Information Technology': 'afternoon'
        }
      }

      // Prefer calling backend optimizer if available
      const apiBase = import.meta?.env?.VITE_OPTIMIZER_API
      let options = []
      if (apiBase) {
        try {
          const payload = {
            classrooms,
            faculty,
            subjects,
            selectedDivision: selectedDivision || null,
            selectedShift: selectedShift || null,
            // Normalize timeSlots shape for backend (label/start/end optional in backend)
            timeSlots: Array.isArray(timeSlots) ? timeSlots.map(s => ({ id: s.id, label: s.time || `${s.id}`, start: '', end: '' })) : [],
            existingClasses: Array.isArray(timetable?.classes) ? timetable.classes : [],
            num_options: 3,
            requestId: Date.now(),
          }
          const url = `${apiBase}/optimize${forceRefresh ? `?t=${Date.now()}` : ''}`
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error(`API error ${res.status}`)
          const data = await res.json()
          // Adapt backend response shape to UI expectations (normalize classes too)
          const mapped = (Array.isArray(data) ? data : []).map((opt, idx) => {
            const normalizedClasses = (opt.classes || []).map(c => ({
              ...c,
              subjectName: c.subjectName || c.subject || '',
              time: c.time || c.timeSlot,
            }))
            return {
              id: opt.id || `option_${idx+1}`,
              name: opt.name || `Option ${idx+1}`,
              // Do not filter here to avoid losing classes when divisionId is missing from backend
              classes: normalizedClasses,
              conflicts: (opt.conflicts || []).map(c => typeof c === 'string' ? ({ type: 'conflict', class1: 'N/A', class2: 'N/A', resource: c }) : c),
              suggestions: (opt.suggestions || []).map(s => typeof s === 'string' ? ({ message: s, priority: 'low' }) : s),
              efficiency: typeof opt.efficiency === 'number' ? opt.efficiency : 0,
              score: Math.max(0, Math.min(100, Math.round((opt.efficiency || 0) * 100))),
            }
          })
          // If backend returned options but with no classes, trigger local fallback instead
          const allEmpty = mapped.length === 0 || mapped.every(o => (o.classes || []).length === 0)
          options = allEmpty ? [] : mapped
        } catch (e) {
          console.warn('Optimizer API unavailable, falling back to local mock:', e)
        }
      }

      // Fallback to local mock optimizer if needed
      if (!options || options.length === 0) {
        const optimizer = new TimetableOptimizer({ classrooms, faculty, subjects, timetable, timeSlots })
        const divisionKey = selectedDivisionIdForSuggestions || selectedDivision?.id || 'division-1'
        const rawOptions = optimizer.generateOptimizedOptions(divisionKey, constraints)
        // Map local mock results to UI shape
        options = (rawOptions || []).map((opt, idx) => {
          const normalizedClasses = (opt.classes || []).map(c => ({
            ...c,
            subjectName: c.subjectName || c.subject || '',
            time: c.time || c.timeSlot,
          }))
          const eff = typeof opt.metrics?.efficiency === 'number' ? opt.metrics.efficiency : (typeof opt.efficiency === 'number' ? opt.efficiency : 0)
          const score = Math.max(0, Math.min(100, Math.round(eff)))
          return {
            id: opt.id || `option_${idx+1}`,
            name: opt.name || `Option ${idx+1}`,
            // Keep all classes; filter later at render time
            classes: normalizedClasses,
            conflicts: Array.isArray(opt.conflicts) ? opt.conflicts : [],
            suggestions: Array.isArray(opt.advantages) ? opt.advantages.map(m => ({ message: m, priority: 'low' })) : [],
            efficiency: eff,
            score,
          }
        })
      }

      setOptimizedOptions(options)
      if (options.length > 0) {
        setSelectedOption(options[0])
      }
    } catch (error) {
      console.error('Error generating options:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Submit for approval
  const submitForApproval = () => {
    if (!selectedOption) return

    const approvalData = {
      timetableId: selectedOption.id,
      name: selectedOption.name,
      classes: selectedOption.classes,
      score: selectedOption.score,
      conflicts: selectedOption.conflicts,
      efficiency: selectedOption.efficiency,
      suggestions: selectedOption.suggestions,
      department: user.department || 'Computer Science',
      submittedBy: user.name
    }

    createApprovalRequest(approvalData)

    setShowApprovalModal(false)
    setApprovalComments('')
    
    // Show success message
    alert('Timetable submitted for approval successfully!')
  }

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optimized Timetable Options</h1>
          <p className="mt-2 text-gray-600">
            AI-generated timetable options with different optimization strategies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => generateOptions()}
            disabled={isGenerating}
            className="btn-primary disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Options
              </>
            )}
          </button>
          <button
            onClick={() => generateOptions(true)}
            disabled={isGenerating}
            className="btn-secondary disabled:opacity-50"
            title="Refresh from backend"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh Options
          </button>
        </div>
      </div>

      {optimizedOptions.length === 0 && !isGenerating && (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Timetable Options Generated
          </h3>
          <p className="text-gray-500 mb-4">
            Click "Generate Options" to create optimized timetable variations
          </p>
        </div>
      )}

      {optimizedOptions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Options List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Options</h3>
            {optimizedOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedOption?.id === option.id
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{option.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(option.score)}`}>
                    {option.score}%
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Classes:</span>
                    <span className="font-medium">{option.classes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Conflicts:</span>
                    <span className={`font-medium ${(option.conflicts?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {option.conflicts?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium">{Number(option.efficiency ?? 0).toFixed(1)}%</span>
                  </div>
                </div>

                {(option.suggestions?.length || 0) > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {option.suggestions?.length || 0} suggestions
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Option Details */}
          <div className="lg:col-span-2">
            {selectedOption && (
              <div className="space-y-6">
                {/* Option Header */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedOption.name}</h3>
                      <p className="text-gray-600">Optimized timetable with {selectedOption.classes?.length || 0} classes</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </button>
                      <button className="btn-secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Division selector (moved here) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Division</label>
                    <select
                      value={selectedDivisionIdForSuggestions}
                      onChange={(e) => setSelectedDivisionIdForSuggestions(e.target.value)}
                      className="input-field max-w-md"
                    >
                      <option value="">All divisions</option>
                      {allDivisions.map(div => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedOption.score)}`}>
                        {selectedOption.score}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Number(selectedOption.efficiency ?? 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${(selectedOption.conflicts?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedOption.conflicts?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Conflicts</div>
                    </div>
                  </div>
                </div>

                {/* Conflicts */}
                {(selectedOption.conflicts?.length || 0) > 0 && (
                  <div className="card">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      Conflicts Detected
                    </h4>
                    <div className="space-y-2">
                      {(selectedOption.conflicts || []).map((conflict, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm text-red-800">
                            <strong>{conflict.type}:</strong> {conflict.class1} and {conflict.class2} 
                            both scheduled for {conflict.resource}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {(() => {
                  const overall = (selectedOption.classes || [])
                    .filter(c => !selectedDivisionIdForSuggestions || String(c.divisionName || c.divisionId || '') === String(selectedDivisionIdForSuggestions) || String(c.divisionId || '') === String(selectedDivisionIdForSuggestions))
                    .flatMap(c => c.classSuggestions || [])
                  const toShow = overall
                  return (toShow.length > 0) && (
                    <div className="card">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                        Optimization Suggestions
                      </h4>
                      <div className="space-y-3">
                        {toShow.map((suggestion, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm text-blue-800">{suggestion.message}</div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Classes Grid Mini */}
                <div className="card">
                  <h4 className="font-semibold text-gray-900 mb-2">Scheduled Classes</h4>
                  <MiniTimetableGrid classes={selectedOption.classes || []} />
                </div>

                {/* Action Buttons */}
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="btn-secondary">
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      <button className="btn-secondary">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Changes
                      </button>
                    </div>
                    {canPerformAction(user.role, 'canApprove') && (
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="btn-primary"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Submit for Approval
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit for Approval
              </h3>
              <p className="text-gray-600 mb-4">
                This timetable will be sent to department heads and administrators for review.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="input-field h-20 resize-none"
                  placeholder="Add any additional notes for reviewers..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={submitForApproval}
                  className="btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimetableOptions
