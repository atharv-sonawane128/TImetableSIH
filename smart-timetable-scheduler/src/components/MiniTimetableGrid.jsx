import { Calendar, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'

const MiniTimetableGrid = ({ classes = [], title = 'Scheduled Classes' }) => {
  const { timeSlots } = useData()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const getClassesForSlot = (day, timeSlot) => {
    return classes.filter(c => c.day === day && (c.time === timeSlot.time || c.timeSlot === timeSlot.time))
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-20 p-2 text-left font-medium text-gray-700 bg-gray-50 border border-gray-200">Time</th>
              {days.map((day) => (
                <th key={day} className="p-2 text-center font-medium text-gray-700 bg-gray-50 border border-gray-200">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot.id}>
                <td className="p-2 text-gray-600 bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeSlot.time}</span>
                  </div>
                </td>
                {days.map((day) => {
                  const slotClasses = getClassesForSlot(day, timeSlot)
                  return (
                    <td key={`${day}-${timeSlot.id}`} className="border border-gray-200">
                      <div className={`min-h-[56px] p-2 rounded-md ${slotClasses.length > 0 ? 'bg-primary-50 border-primary-200' : 'bg-white'}`}>
                        {slotClasses.length > 0 ? (
                          <div className="space-y-1">
                            {slotClasses.map((cls) => (
                              <div key={cls.id} className="px-2 py-1 bg-white border border-primary-200 rounded text-[11px] text-gray-800 truncate">
                                <div className="font-medium truncate">{cls.subjectName}</div>
                                <div className="text-[10px] text-gray-500 truncate">{cls.facultyName} • {cls.classroomName}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
                            <span>—</span>
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md inline-flex items-center text-[11px] text-blue-800">
        <Calendar className="w-3 h-3 mr-1" />
        <span>{title}</span>
      </div>
    </div>
  )
}

export default MiniTimetableGrid



