import { useDraggable } from '@dnd-kit/core'
import { Calendar, Users, Building2, Edit, Trash2 } from 'lucide-react'

const ClassCard = ({ classData, onEdit, onDelete, isDragging = false, compact = false, labPartner = null }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingState } = useDraggable({
    id: classData.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  if (!classData) return null

  // If this is a lab session and we have a partner, display combined format
  if (compact && labPartner) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-900">
            Lab Sessions
          </h4>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(classData)
              }}
              className="p-1 text-gray-400 hover:text-primary-600"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(classData.id)
              }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs">
            <span className="font-medium text-blue-600">Session A:</span> {classData.subjectName} ({classData.classroomName})
          </div>
          <div className="text-xs">
            <span className="font-medium text-green-600">Session B:</span> {labPartner.subjectName} ({labPartner.classroomName})
          </div>
        </div>
        <p className="text-xs text-gray-600">{classData.facultyName} & {labPartner.facultyName}</p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-900">
            {classData.subjectName}
            {classData.labSession && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                {classData.labSession}
              </span>
            )}
          </h4>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(classData)
              }}
              className="p-1 text-gray-400 hover:text-primary-600"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(classData.id)
              }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600">{classData.facultyName}</p>
        <p className="text-xs text-gray-500">{classData.classroomName}</p>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab
        ${isDragging || isDraggingState ? 'opacity-50 scale-105 shadow-lg' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="font-semibold text-gray-900">
            {classData.subjectName}
            {classData.labSession && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Lab {classData.labSession}
              </span>
            )}
          </h3>
        </div>
        <div className="flex space-x-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{classData.facultyName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="w-4 h-4 mr-2" />
          <span>{classData.classroomName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{classData.day} - {classData.time}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Capacity: {classData.capacity}</span>
          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
            {classData.department}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ClassCard
