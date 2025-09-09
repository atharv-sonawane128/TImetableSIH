import { useState } from 'react'
import { useData } from '../context/DataContext'
import { ChevronRight, Users, GraduationCap, Building2 } from 'lucide-react'

const DivisionSelector = ({ onDivisionSelected }) => {
  const { 
    departments, 
    selectedDepartment, 
    selectedSpecialization, 
    selectedDivision,
    selectedSemester,
    setSelectedDepartment, 
    setSelectedSpecialization, 
    setSelectedDivision,
    setSelectedSemester
  } = useData()

  const [currentStep, setCurrentStep] = useState(1)

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
    setSelectedSpecialization(null)
    setSelectedDivision(null)
    setSelectedSemester(null)
    setCurrentStep(2)
  }

  const handleSpecializationSelect = (specialization) => {
    setSelectedSpecialization(specialization)
    setSelectedDivision(null)
    setSelectedSemester(null)
    setCurrentStep(3)
  }

   const handleSemesterSelect = (semester) => {
      setSelectedSemester(semester)
      setSelectedDivision(null)
      setCurrentStep(4)
    }

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division)
    onDivisionSelected(division)
  }

 const goBack = () => {
      if (currentStep === 4) {
        setCurrentStep(3)
        setSelectedDivision(null)
      } else if (currentStep === 3) {
        setCurrentStep(2)
        setSelectedSemester(null)
      } else if (currentStep === 2) {
        setCurrentStep(1)
        setSelectedSpecialization(null)
      }
    }

  return (
    <div className="max-w-4xl mx-auto p-6">
     
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Division for Timetable</h1>
        <p className="text-gray-600">Choose the department, specialization, and division to create a timetable</p>
      </div>

 
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-medium">Department</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-medium">Specialization</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
           <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
             <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-medium">Semester</span>
            </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              <Users className="w-4 h-4" />
            </div>
            <span className="font-medium">Division</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {currentStep > 1 && (
        <div className="mb-6">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Step 1: Department Selection
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((department) => (
              <div
                key={department.id}
                onClick={() => handleDepartmentSelect(department)}
                className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-600">
                      {department.specializations.length} specializations
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Step 2: Specialization Selection */}
      {/* {currentStep === 2 && selectedDepartment && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Specialization - {selectedDepartment.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDepartment.specializations.map((specialization) => (
              <div
                key={specialization.id}
                onClick={() => handleSpecializationSelect(specialization)}
                className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{specialization.name}</h3>
                    <p className="text-sm text-gray-600">
                      Code: {specialization.code.toUpperCase()} • {specialization.divisions.length} divisions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Step 3: Division Selection */}
      {/* {currentStep === 3 && selectedSpecialization && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Division - {selectedSpecialization.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedSpecialization.divisions.map((division) => (
              <div
                key={division.id}
                onClick={() => handleDivisionSelect(division)}
                className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{division.name}</h3>
                    <p className="text-sm text-gray-600">
                      Semester {division.semester} • {division.strength} students
                    </p>
                    <p className="text-xs text-gray-500">
                      {division.semester}{division.specialization}{division.series}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* // Step 1: Department */}
{currentStep === 1 && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Department</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {departments.map((department) => (
        <div
          key={department.id}
          onClick={() => handleDepartmentSelect(department)}
          className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{department.name}</h3>
              <p className="text-sm text-gray-600">
                {department.specializations.length} specializations
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* // Step 2: Specialization */}
{currentStep === 2 && selectedDepartment && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Select Specialization - {selectedDepartment.name}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedDepartment.specializations.map((specialization) => (
        <div
          key={specialization.id}
          onClick={() => handleSpecializationSelect(specialization)}
          className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{specialization.name}</h3>
              <p className="text-sm text-gray-600">
                Code: {specialization.code.toUpperCase()} • {specialization.semesters.length} semesters
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* // Step 3: Semester */}
{currentStep === 3 && selectedSpecialization && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Select Semester - {selectedSpecialization.name}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedSpecialization.semesters.map((semester) => (
        <div
          key={semester.id}
          onClick={() => handleSemesterSelect(semester)}
          className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{semester.name}</h3>
              <p className="text-sm text-gray-600">{semester.divisions.length} divisions</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* // Step 4: Division */}
{currentStep === 4 && selectedSemester && (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Select Division - {selectedSemester.name}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {selectedSemester.divisions.map((division) => (
        <div
          key={division.id}
          onClick={() => handleDivisionSelect(division)}
          className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{division.name}</h3>
              <p className="text-sm text-gray-600">
                {division.strength} students
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Selected Division Summary */}
      {selectedDivision && (
             <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
               <h3 className="font-semibold text-green-800 mb-2">Selected Division</h3>
               <div className="flex flex-wrap items-center space-x-4 text-green-700">
                 <span><strong>Division:</strong> {selectedDivision.name}</span>
                 <span><strong>Semester:</strong> {selectedSemester.name}</span>
                 <span><strong>Specialization:</strong> {selectedSpecialization.name}</span>
                 <span><strong>Department:</strong> {selectedDepartment.name}</span>
                 <span><strong>Strength:</strong> {selectedDivision.strength} students</span>
               </div>
             </div>
           )}
    </div>
  )
}

export default DivisionSelector






