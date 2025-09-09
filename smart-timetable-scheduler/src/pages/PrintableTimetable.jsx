import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'

const PrintableTimetable = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { timetableData, division, shift } = location.state || {}

  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    if (!timetableData || !division) {
      navigate('/timetable')
      return
    }
  }, [timetableData, division, navigate])

  const handlePrint = () => {
    setIsPrinting(true)
    window.print()
    setTimeout(() => setIsPrinting(false), 1000)
  }

  if (!timetableData || !division) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Group classes by day and time slot
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = shift?.timeSlots || []

  const getClassForSlot = (day, slotId) => {
    return timetableData.find(c => c.day === day && c.slotId == slotId)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Header - Hidden in print */}
      <div className="print:hidden bg-gray-50 border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/timetable')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Timetable Builder</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="btn-primary flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Printing...' : 'Print Timetable'}</span>
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-7xl mx-auto p-6 print:p-0">
        {/* Header */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
            Timetable - {division.name}
          </h1>
          <p className="text-lg text-gray-600 print:text-base mt-2">
            Semester {division.semester} • {division.strength} Students
          </p>
          {shift && (
            <p className="text-md text-gray-500 print:text-sm mt-1">
              {shift.name} ({shift.timeRange})
            </p>
          )}
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 print:border-black">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-300 print:border-black px-4 py-3 text-left font-semibold print:px-2 print:py-2">
                  Time
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 print:border-black px-4 py-3 text-center font-semibold print:px-2 print:py-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                  <td className="border border-gray-300 print:border-black px-4 py-3 font-medium bg-gray-50 print:bg-gray-100 print:px-2 print:py-2">
                    {slot.time}
                  </td>
                  {days.map(day => {
                    const classData = getClassForSlot(day, slot.id)
                    return (
                      <td key={`${day}-${slot.id}`} className="border border-gray-300 print:border-black px-4 py-3 print:px-2 print:py-2">
                        {classData ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-sm print:text-xs">
                              {classData.subjectName}
                            </div>
                            <div className="text-xs text-gray-600 print:text-xs">
                              {classData.facultyName}
                            </div>
                            <div className="text-xs text-gray-600 print:text-xs">
                              {classData.classroomName}
                            </div>
                            {classData.isLabMode && (
                              <div className="text-xs text-blue-600 font-medium print:text-xs">
                                Lab {classData.labSession}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm print:text-xs">-</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 print:text-xs print:mt-4">
          <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          .print\\:px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          .print\\:py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .print\\:bg-gray-200 {
            background-color: #e5e7eb !important;
          }
          .print\\:border-black {
            border-color: #000000 !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default PrintableTimetable
