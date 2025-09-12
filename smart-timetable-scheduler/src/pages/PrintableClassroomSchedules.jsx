import React from 'react'
import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useData } from '../context/DataContext'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PrintableClassroomSchedules = () => {
  const { timetable, classrooms, shifts } = useData()

  // Defensive check: ensure classrooms is an array
  const classroomsArray = Array.isArray(classrooms) ? classrooms : []

  // Defensive check: ensure timetable.classes is an array
  const classesArray = timetable && Array.isArray(timetable.classes) ? timetable.classes : []

  // Combine all time slots from all shifts to get full day slots from 7:30 AM to 4:30 PM
  const allTimeSlots = shifts.flatMap(shift => shift.timeSlots)
  // Remove duplicates by slot id
  const uniqueTimeSlotsMap = {}
  allTimeSlots.forEach(slot => {
    uniqueTimeSlotsMap[slot.id] = slot
  })
  const uniqueTimeSlots = Object.values(uniqueTimeSlotsMap).sort((a, b) => a.id - b.id)

  // Create a map for quick lookup: classroomId -> day -> slotId -> class
  const scheduleMap = {}
  classroomsArray.forEach(room => {
    scheduleMap[room.id] = {}
    daysOfWeek.forEach(day => {
      scheduleMap[room.id][day] = {}
    })
  })

  classesArray.forEach(c => {
    if (scheduleMap[c.classroomId] && scheduleMap[c.classroomId][c.day]) {
      scheduleMap[c.classroomId][c.day][c.slotId] = c
    }
  })

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = []

    // Add header row: first column is "Classroom", then days with time slots
    const headerRow = ['Classroom']
    daysOfWeek.forEach(day => {
      uniqueTimeSlots.forEach(slot => {
        headerRow.push(`${day} ${slot.time}`)
      })
    })
    excelData.push(headerRow)

    // Add data rows for each classroom
    classroomsArray.forEach(room => {
      const row = [room.name]
      daysOfWeek.forEach(day => {
        uniqueTimeSlots.forEach(slot => {
          const classData = scheduleMap[room.id][day][slot.id]
          if (classData) {
            const cellData = `${classData.subjectName}${classData.isLabMode && classData.labSession ? ` (Lab ${classData.labSession})` : ''}\n${classData.facultyName}\n${classData.divisionName}`
            row.push(cellData)
          } else {
            row.push('Free')
          }
        })
      })
      excelData.push(row)
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(excelData)

    // Set column widths
    const colWidths = [{ wch: 15 }] // Classroom column width
    daysOfWeek.forEach(() => {
      uniqueTimeSlots.forEach(() => {
        colWidths.push({ wch: 20 }) // Time slot columns width
      })
    })
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Classroom Schedule')

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `classroom_schedule_${currentDate}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Classrooms Schedule</h1>
        <button
          onClick={exportToExcel}
          className="btn-secondary flex items-center"
          aria-label="Export classroom schedules to Excel"
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Export to Excel
        </button>
      </div>
      <table className="border-collapse border border-gray-300" style={{ tableLayout: 'fixed', minWidth: '100%' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 sticky left-0 bg-gray-100 z-20" style={{ width: '150px', position: 'sticky', left: 0, top: 0, backgroundColor: '#f3f4f6', zIndex: 20 }}>Classrooms</th>
            {daysOfWeek.flatMap(day =>
              uniqueTimeSlots.map(slot => (
                <th key={`${day}-${slot.id}`} className="border border-gray-300 px-3 py-2 text-center" style={{ minWidth: '150px' }}>
                  {day} <br /> {slot.time}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {classroomsArray.map(room => (
            <tr key={room.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-2 sticky left-0 bg-white z-20 whitespace-nowrap font-medium" style={{ width: '150px', overflow: 'hidden', textOverflow: 'ellipsis', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 20 }}>
                {room.name}
              </td>
              {daysOfWeek.flatMap(day =>
                uniqueTimeSlots.map(slot => {
                  const classData = scheduleMap[room.id][day][slot.id]
                  return (
                    <td key={`${room.id}-${day}-${slot.id}`} className="border border-gray-300 px-3 py-2 align-top min-w-[150px] bg-blue-50">
                      {classData ? (
                        <div>
                          <div className="font-semibold">
                          {classData.subjectName}
                          {classData.isLabMode && classData.labSession ? ` (Lab ${classData.labSession})` : ''}
                        </div>
                        <div className="text-sm text-gray-600">{classData.facultyName}</div>
                        <div className="text-xs text-gray-500">{classData.divisionName}</div>
                      </div>
                    ) : (
                      <div className="text-gray-300 italic">Free</div>
                    )}
                  </td>
                )
              })
            )}
          </tr>
        ))}
      </tbody>
    </table>

    <style jsx>{`
      @media print {
        div {
          overflow: visible !important;
        }
        table {
          border-color: black !important;
          page-break-inside: avoid;
        }
        th, td {
          border-color: black !important;
          padding: 4px !important;
        }
        .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }
        .bg-white {
          background-color: white !important;
        }
        .text-gray-300 {
          color: #d1d5db !important;
        }
        .text-gray-600 {
          color: #4b5563 !important;
        }
        .text-gray-500 {
          color: #6b7280 !important;
        }
        .hover\\:bg-gray-50 {
          background-color: transparent !important;
        }
      }
    `}</style>
  </div>
)
}

export default PrintableClassroomSchedules
