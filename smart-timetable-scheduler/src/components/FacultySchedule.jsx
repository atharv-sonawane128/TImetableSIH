import React, { useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const FacultySchedule = ({ facultyId }) => {
  const { timetable, shifts, classrooms } = useData()
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef(null)

  // Combine all time slots from all shifts to get full day slots from 7:30 AM to 4:30 PM
  const allTimeSlots = shifts.flatMap(shift => shift.timeSlots)
  // Remove duplicates by slot id
  const uniqueTimeSlotsMap = {}
  allTimeSlots.forEach(slot => {
    uniqueTimeSlotsMap[slot.id] = slot
  })
  const uniqueTimeSlots = Object.values(uniqueTimeSlotsMap).sort((a, b) => a.id - b.id)

  // Filter classes for this faculty
  const classesForFaculty = (timetable?.classes || []).filter(c => c.facultyId === facultyId)

  // Create a map for quick lookup: day -> slotId -> class
  const scheduleMap = {}
  daysOfWeek.forEach(day => {
    scheduleMap[day] = {}
  })
  classesForFaculty.forEach(c => {
    if (scheduleMap[c.day]) {
      scheduleMap[c.day][c.slotId] = c
    }
  })



  // Helper to get classroom name by id
  const getClassroomName = (id) => {
    const room = classrooms.find(c => c.id === id)
    return room ? room.name : 'Unknown'
  }

  const handlePrint = () => {
    setIsPrinting(true)
    if (printRef.current) {
      html2canvas(printRef.current, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('landscape', 'pt', 'a4')
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`faculty_schedule_${facultyId}_${new Date().toISOString().split('T')[0]}.pdf`)
        setIsPrinting(false)
      })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-2 print:hidden">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="btn-primary"
              aria-label="Print Faculty Schedule"
            >
              Print Faculty Schedule
            </button>
      </div>
      <div ref={printRef} className="overflow-auto min-h-[600px] border rounded-md border-gray-300">
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
                          <div className="font-semibold">
                            {classData.subjectName}
                            {classData.isLabMode && classData.labSession ? ` (Lab ${classData.labSession})` : ''}
                          </div>
                          <div className="text-sm text-gray-600">{classData.divisionName}</div>
                          <div className="text-xs text-gray-500">{getClassroomName(classData.classroomId)}</div>
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
    </div>
  )
}

{/* Print Styles */}
<style jsx>{`
  @media print {
    .overflow-auto {
      overflow: visible !important;
    }
    table {
      border-color: black !important;
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

export default FacultySchedule
