import React from 'react'
import { useData } from '../context/DataContext'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const ClassroomSchedule = ({ classroomId }) => {
  const { timetable, shifts } = useData()

  // Combine all time slots from all shifts to get full day slots from 7:30 AM to 4:30 PM
  const allTimeSlots = shifts.flatMap(shift => shift.timeSlots)
  // Remove duplicates by slot id
  const uniqueTimeSlotsMap = {}
  allTimeSlots.forEach(slot => {
    uniqueTimeSlotsMap[slot.id] = slot
  })
  const uniqueTimeSlots = Object.values(uniqueTimeSlotsMap).sort((a, b) => a.id - b.id)

  // Filter classes for this classroom
  const classesForRoom = (timetable?.classes || []).filter(c => c.classroomId === classroomId)

  // Create a map for quick lookup: day -> slotId -> class
  const scheduleMap = {}
  daysOfWeek.forEach(day => {
    scheduleMap[day] = {}
  })
  classesForRoom.forEach(c => {
    if (scheduleMap[c.day]) {
      scheduleMap[c.day][c.slotId] = c
    }
  })

  return (
    <div className="overflow-auto max-h-[400px] border rounded-md border-gray-300">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 sticky left-0 bg-gray-100 z-10">Time Slot</th>
            {daysOfWeek.map(day => (
              <th key={day} className="border border-gray-300 px-3 py-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueTimeSlots.map(slot => (
            <tr key={slot.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-2 sticky left-0 bg-white z-10 whitespace-nowrap">{slot.time}</td>
              {daysOfWeek.map(day => {
                const classData = scheduleMap[day][slot.id]
                return (
                  <td key={day} className="border border-gray-300 px-3 py-2 align-top min-w-[150px]">
                    {classData ? (
                      <div>
                        <div className="font-semibold">{classData.subjectName}</div>
                        <div className="text-sm text-gray-600">{classData.facultyName}</div>
                        <div className="text-xs text-gray-500">{classData.divisionName}</div>
                      </div>
                    ) : (
                      <div className="text-gray-300 italic">Free</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClassroomSchedule
