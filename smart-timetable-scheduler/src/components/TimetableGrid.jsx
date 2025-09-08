import { useDroppable } from '@dnd-kit/core'
import { Calendar, Clock, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import ClassCard from './ClassCard'

const TimetableGrid = ({ classes, onSlotClick, onClassEdit, onClassDelete, selectedDivision }) => {
  const { timeSlots } = useData()
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const getClassesForSlot = (day, timeSlot) => {
    return classes.filter(c => c.day === day && c.timeSlot === timeSlot.time)
  }

  const TimeSlotCell = ({ day, timeSlot, classesForSlot }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `slot-${day}-${timeSlot.id}`,
    })

    return (
      <div
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
            {classesForSlot.map((classData) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                onEdit={onClassEdit}
                onDelete={onClassDelete}
                compact={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 hover:text-primary-500 transition-colors">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-xs">Click to add class</span>
          </div>
        )}
      </div>
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
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot.id}>
                <td className="p-3 text-sm text-gray-600 bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{timeSlot.time}</span>
                  </div>
                </td>
                {days.map((day) => (
                  <td key={`${day}-${timeSlot.id}`} className="border border-gray-200">
                    <TimeSlotCell
                      day={day}
                      timeSlot={timeSlot}
                      classesForSlot={getClassesForSlot(day, timeSlot)}
                    />
                  </td>
                ))}
              </tr>
            ))}
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