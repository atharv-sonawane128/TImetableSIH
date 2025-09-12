import { useDroppable } from '@dnd-kit/core'
import { Calendar, Clock, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import ClassCard from './ClassCard'

const TimetableGrid = ({ classes, onSlotClick, onClassEdit, onClassDelete, selectedDivision }) => {
  const { timeSlots } = useData()
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Helper to find classes occupying a slot
  const getClassesForSlot = (day, slotId) => {
    return classes.filter(c => c.day === day && c.slotId === slotId)
  }

  // Helper to find lab partner for a given lab class
  const findLabPartner = (classData) => {
    if (!classData.isLabMode && !classData.spansTwoSlots) return null

    // For lab sessions, partner is in the next slot for B, or previous for A
    const partnerSlotId = classData.labSession === 'A' ? classData.slotId + 1 : classData.slotId - 1

    return classes.find(c =>
      c.day === classData.day &&
      c.slotId === partnerSlotId &&
      c.isLabMode &&
      c.id !== classData.id &&
      ((c.labSession === 'A' && classData.labSession === 'B') ||
       (c.labSession === 'B' && classData.labSession === 'A'))
    )
  }

  const TimeSlotCell = ({ day, timeSlot }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `slot-${day}-${timeSlot.id}`,
    })

    const classesForSlot = getClassesForSlot(day, timeSlot.id)

    return (
      <td
        ref={setNodeRef}
        className={`
          min-h-[120px] p-3 border border-gray-200 rounded-lg transition-colors duration-200 cursor-pointer
          ${isOver ? 'bg-primary-50 border-primary-300' : 'bg-white hover:bg-gray-50'}
          ${classesForSlot.length > 0 ? 'bg-primary-100 border-primary-400' : ''}
        `}
        onClick={() => onSlotClick({ timeSlot, day })}
      >
        {classesForSlot.length > 0 ? (
          <div className="space-y-2">
            {classesForSlot.map((classData) => {
              const labPartner = findLabPartner(classData)
              return (
                <ClassCard
                  key={classData.id}
                  classData={classData}
                  labPartner={labPartner}
                  onEdit={onClassEdit}
                  onDelete={onClassDelete}
                  compact={true}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 hover:text-primary-500 transition-colors">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-xs">Click to add class</span>
          </div>
        )}
      </td>
    )
  }

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-24 p-3 text-left text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => {
              // Skip rendering row if all cells are merged (for lab spanning)
              // But since rowspan is used, just render normally and skip cells in TimeSlotCell
              return (
                <tr key={timeSlot.id}>
                  <td className="p-3 text-sm text-gray-600 bg-gray-50 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{timeSlot.time}</span>
                    </div>
                  </td>
                  {days.map((day) => (
                    <TimeSlotCell
                      key={`${day}-${timeSlot.id}`}
                      day={day}
                      timeSlot={timeSlot}
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-100 border border-primary-400 rounded"></div>
            <span>Occupied Slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>Available Slot</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-50 border border-primary-300 rounded"></div>
            <span>Drag Over</span>
          </div>
        </div>
      </div>

      {/* Division Info */}
      {selectedDivision && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              Timetable for {selectedDivision.name} ({selectedDivision.strength} students)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimetableGrid