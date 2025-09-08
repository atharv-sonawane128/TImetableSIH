import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  // Shift data
  const shifts = [
    {
      id: 1,
      name: 'Morning Shift',
      timeRange: '7:30 AM - 2:30 PM',
      timeSlots: [
        { id: 1, time: '7:30 AM - 8:30 AM' },
        { id: 2, time: '8:30 AM - 9:30 AM' },
        { id: 3, time: '9:30 AM - 10:30 AM' },
        { id: 4, time: '10:30 AM - 11:30 AM' },
        { id: 5, time: '11:30 AM - 12:30 PM' },
        { id: 6, time: '12:30 PM - 1:30 PM' },
        { id: 7, time: '1:30 PM - 2:30 PM' }
      ]
    },
    {
      id: 2,
      name: 'Afternoon Shift',
      timeRange: '9:30 AM - 4:30 PM',
      timeSlots: [
        { id: 8, time: '9:30 AM - 10:30 AM' },
        { id: 9, time: '10:30 AM - 11:30 AM' },
        { id: 10, time: '11:30 AM - 12:30 PM' },
        { id: 11, time: '12:30 PM - 1:30 PM' },
        { id: 12, time: '1:30 PM - 2:30 PM' },
        { id: 13, time: '2:30 PM - 3:30 PM' },
        { id: 14, time: '3:30 PM - 4:30 PM' }
      ]
    }
  ]

  // Default time slots (will be overridden by selected shift)
  const timeSlots = shifts[0].timeSlots

  // Department, Specialization, and Division data
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Computer Science',
      specializations: [
        {
          id: 1,
          name: 'Software Engineering',
          code: 'a',
          divisions: [
            { id: 1, name: '1a1', semester: 1, specialization: 'a', series: 1, strength: 45 },
            { id: 2, name: '1a2', semester: 1, specialization: 'a', series: 2, strength: 42 },
            { id: 3, name: '3a1', semester: 3, specialization: 'a', series: 1, strength: 38 },
            { id: 4, name: '3a2', semester: 3, specialization: 'a', series: 2, strength: 40 },
            { id: 5, name: '5a1', semester: 5, specialization: 'a', series: 1, strength: 35 },
            { id: 6, name: '5a2', semester: 5, specialization: 'a', series: 2, strength: 37 }
          ]
        },
        {
          id: 2,
          name: 'Data Science',
          code: 'b',
          divisions: [
            { id: 7, name: '1b1', semester: 1, specialization: 'b', series: 1, strength: 30 },
            { id: 8, name: '1b2', semester: 1, specialization: 'b', series: 2, strength: 28 },
            { id: 9, name: '3b1', semester: 3, specialization: 'b', series: 1, strength: 32 },
            { id: 10, name: '5b1', semester: 5, specialization: 'b', series: 1, strength: 25 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Information Technology',
      specializations: [
        {
          id: 3,
          name: 'Network Engineering',
          code: 'c',
          divisions: [
            { id: 11, name: '1c1', semester: 1, specialization: 'c', series: 1, strength: 40 },
            { id: 12, name: '1c2', semester: 1, specialization: 'c', series: 2, strength: 38 },
            { id: 13, name: '3c1', semester: 3, specialization: 'c', series: 1, strength: 35 }
          ]
        },
        {
          id: 4,
          name: 'Cybersecurity',
          code: 'd',
          divisions: [
            { id: 14, name: '1d1', semester: 1, specialization: 'd', series: 1, strength: 25 },
            { id: 15, name: '3d1', semester: 3, specialization: 'd', series: 1, strength: 22 }
          ]
        }
      ]
    }
  ])

  // Initial mock data
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: 'A-101', capacity: 50, type: 'Lecture Hall', status: 'Available', equipment: ['Projector', 'Whiteboard'] },
    { id: 2, name: 'A-102', capacity: 30, type: 'Lab', status: 'Available', equipment: ['Computers', 'Projector'] },
    { id: 3, name: 'B-201', capacity: 40, type: 'Seminar Room', status: 'Available', equipment: ['Smart Board', 'Audio System'] },
    { id: 4, name: 'B-202', capacity: 60, type: 'Lecture Hall', status: 'Available', equipment: ['Projector', 'Whiteboard'] },
    { id: 5, name: 'C-301', capacity: 35, type: 'Lab', status: 'Available', equipment: ['Computers', 'Smart Board'] },
    { id: 6, name: 'C-312', capacity: 50, type: 'Lab', status: 'Available', equipment: ['Computers', 'Smart Board'] },
    { id: 7, name: 'C-311', capacity: 60, type: 'Lab', status: 'Available', equipment: ['Computers', 'Smart Board'] },
    { id: 8, name: 'B-205', capacity: 45, type: 'Lecture Hall', status: 'Available', equipment: ['Projector', 'WhiteBoard'] },
    { id: 9, name: 'A-212', capacity: 55, type: 'Lecture Hall', status: 'Available', equipment: ['Projector', 'WhiteBoard'] },
  ])

  const [faculty, setFaculty] = useState([
    { 
      id: 1, 
      name: 'Dr. Atharva Sonawane', 
      department: 'Computer Science', 
      email: 'sonawaneatharvak@gmail.com',
      phone: '+91 8169982451',
      subjects: ['Data Structures', 'Algorithms'],
      availability: 'Full-time',
      maxHoursPerWeek: 40
    },
    { 
      id: 2, 
      name: 'Prof. Aditya Gore',
      department: 'Information Technology', 
      email: 'Gore.aditya@gmail.com',
      phone: '+91 9405332960',
      subjects: ['Web Development', 'Database Systems'],
      availability: 'Full-time',
      maxHoursPerWeek: 40
    },
    { 
      id: 3, 
      name: 'Dr. Rishita Kumari', 
      department: 'Computer Science', 
      email: 'rishitakumari0828@gmail.com',
      phone: '+91 7742598336',
      subjects: ['Machine Learning', 'AI'],
      availability: 'Part-time',
      maxHoursPerWeek: 20
    },
    { 
      id: 4, 
      name: 'Prof. Ayush Sharma',
      department: 'Computer Science', 
      email: 'ayushsharma001@gmail.com',
      phone: '+91 9137253356',
      subjects: ['Java', 'Python'],
      availability: 'Full-time',
      maxHoursPerWeek: 40
    },
    { 
      id: 5, 
      name: 'Prof. Sourabh Nankatai',
      department: 'Computer Science', 
      email: 'nan.sourabh119@gmail.com',
      phone: '+91 7999787883',
      subjects: ['TOC', 'DBMS'],
      availability: 'Full-time',
      maxHoursPerWeek: 40
    },
    {
      id: 6,
      name: 'Prof. Parikshit Dhokla',
      department: 'Computer Science',
      email: 'dhokla.parikshit123@gmail.com',
      phone: '+91 7016570205',
      subjects: ['EPJ', 'DAA'],
      availability: 'Full-time',
      maxHoursPerWeek: 40
    }
  ])

  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: 'Atish kapoor',
      rollNumber: 'CS2024001', 
      department: 'Computer Science',
      year: '3rd Year',
      email: 'atish.kapur@student.college.edu',
      subjects: ['Data Structures', 'Web Development', 'Database Systems']
    },
    { 
      id: 2, 
      name: 'Prem Chopra',
      rollNumber: 'IT2024002', 
      department: 'Information Technology',
      year: '2nd Year',
      email: 'chopra.prem@student.college.edu',
      subjects: ['Programming', 'Networks', 'Software Engineering']
    },
    { 
      id: 3, 
      name: 'Madhuri Shikshit',
      rollNumber: 'CS2024003', 
      department: 'Computer Science',
      year: '4th Year',
      email: 'michael.johnson@student.college.edu',
      subjects: ['Machine Learning', 'AI', 'Project Management']
    },
{
      id: 4,
      name: 'Ekta Kumari',
      rollNumber: 'CS2024003',
      department: 'Computer Science',
      year: '4th Year',
      email: 'michael.johnson@student.college.edu',
      subjects: ['Machine Learning', 'AI', 'Project Management']
    },
    {
      id: 5,
      name: 'Muktaben Patel',
      rollNumber: 'CS2024003',
      department: 'Computer Science',
      year: '4th Year',
      email: 'michael.johnson@student.college.edu',
      subjects: ['Machine Learning', 'AI', 'Project Management']
    },
    {
      id: 6,
      name: 'Siddhi Dodhi',
      rollNumber: 'CS2024003',
      department: 'Computer Science',
      year: '4th Year',
      email: 'michael.johnson@student.college.edu',
      subjects: ['Machine Learning', 'AI', 'Project Management']
    },
    {
      id: 7,
      name: 'Madhuri Non-Shikshit',
      rollNumber: 'CS2024003',
      department: 'Computer Science',
      year: '4th Year',
      email: 'michael.johnson@student.college.edu',
      subjects: ['Machine Learning', 'AI', 'Project Management']
    },
  ])

  const [subjects, setSubjects] = useState([
    // Theory subjects
    { id: 1, name: 'Data Structures', code: 'CS301', department: 'Computer Science', credits: 3, hoursPerWeek: 3, type: 'theory' },
    { id: 2, name: 'Web Development', code: 'IT302', department: 'Information Technology', credits: 4, hoursPerWeek: 4, type: 'theory' },
    { id: 3, name: 'Database Systems', code: 'CS303', department: 'Computer Science', credits: 3, hoursPerWeek: 3, type: 'theory' },
    { id: 4, name: 'Machine Learning', code: 'CS401', department: 'Computer Science', credits: 4, hoursPerWeek: 4, type: 'theory' },
    { id: 5, name: 'Software Engineering', code: 'IT401', department: 'Information Technology', credits: 3, hoursPerWeek: 3, type: 'theory' },
    { id: 6, name: 'Algorithms', code: 'CS302', department: 'Computer Science', credits: 3, hoursPerWeek: 3, type: 'theory' },
    
    // Lab subjects
    { id: 7, name: 'Programming Lab', code: 'CS101L', department: 'Computer Science', credits: 2, hoursPerWeek: 2, type: 'lab' },
    { id: 8, name: 'Data Structures Lab', code: 'CS201L', department: 'Computer Science', credits: 2, hoursPerWeek: 2, type: 'lab' },
    { id: 9, name: 'Database Lab', code: 'CS301L', department: 'Computer Science', credits: 2, hoursPerWeek: 2, type: 'lab' },
    { id: 10, name: 'Web Development Lab', code: 'CS302L', department: 'Computer Science', credits: 2, hoursPerWeek: 2, type: 'lab' },
    { id: 11, name: 'Physics Lab', code: 'PH101L', department: 'Computer Science', credits: 1, hoursPerWeek: 1, type: 'lab' },
    { id: 12, name: 'Computer Networks Lab', code: 'CS401L', department: 'Computer Science', credits: 2, hoursPerWeek: 2, type: 'lab' },
  ])

  const [timetable, setTimetable] = useState({
    slots: [
      { id: 1, time: '09:00-10:30', day: 'Monday' },
      { id: 2, time: '11:00-12:30', day: 'Monday' },
      { id: 3, time: '02:00-03:30', day: 'Monday' },
      { id: 4, time: '09:00-10:30', day: 'Tuesday' },
      { id: 5, time: '11:00-12:30', day: 'Tuesday' },
      { id: 6, time: '02:00-03:30', day: 'Tuesday' },
      { id: 7, time: '09:00-10:30', day: 'Wednesday' },
      { id: 8, time: '11:00-12:30', day: 'Wednesday' },
      { id: 9, time: '02:00-03:30', day: 'Wednesday' },
      { id: 10, time: '09:00-10:30', day: 'Thursday' },
      { id: 11, time: '11:00-12:30', day: 'Thursday' },
      { id: 12, time: '02:00-03:30', day: 'Thursday' },
      { id: 13, time: '09:00-10:30', day: 'Friday' },
      { id: 14, time: '11:00-12:30', day: 'Friday' },
      { id: 15, time: '02:00-03:30', day: 'Friday' },
    ],
    classes: []
  })

  //For classrooms
  const addClassroom = (classroom) => {
    const newClassroom = { ...classroom, id: Date.now() }
    setClassrooms([...classrooms, newClassroom])
  }

  const updateClassroom = (id, updates) => {
    setClassrooms(classrooms.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteClassroom = (id) => {
    setClassrooms(classrooms.filter(c => c.id !== id))
  }

  // For faculty
  const addFaculty = (facultyMember) => {
    const newFaculty = { ...facultyMember, id: Date.now() }
    setFaculty([...faculty, newFaculty])
  }

  const updateFaculty = (id, updates) => {
    setFaculty(faculty.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteFaculty = (id) => {
    setFaculty(faculty.filter(f => f.id !== id))
  }

  // For students
  const addStudent = (student) => {
    const newStudent = { ...student, id: Date.now() }
    setStudents([...students, newStudent])
  }

  const updateStudent = (id, updates) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id))
  }

  // Timetable operations
  const addClass = (classData) => {

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`
    const newClass = { ...classData, id: classData.id ?? uniqueId }
    setTimetable(prev => ({
      ...prev,
      classes: [...prev.classes, newClass]
    }))
  }

  const updateClass = (id, updates) => {
    setTimetable(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }

  const deleteClass = (id) => {
    setTimetable(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== id)
    }))
  }


  const [selectedDivision, setSelectedDivision] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedSpecialization, setSelectedSpecialization] = useState(null)
  const [selectedShift, setSelectedShift] = useState(shifts[0]) // Default to first shift


  const [facultyAvailability, setFacultyAvailability] = useState({})


  const getFacultyAvailability = (slotId, day) => {
    const occupiedFaculty = timetable.classes
      .filter(c => c.slotId == slotId && c.day === day)
      .map(c => parseInt(c.facultyId))
    
    return faculty.map(f => {
      const isOccupied = occupiedFaculty.includes(parseInt(f.id))
      const occupiedClass = timetable.classes.find(c => 
        c.slotId == slotId && c.day === day && parseInt(c.facultyId) === parseInt(f.id)
      )
      
      return {
        ...f,
        isAvailable: !isOccupied,
        isLocked: isOccupied,
        lockedReason: isOccupied ? 
          `Already assigned to ${occupiedClass?.subjectName || 'another class'} in ${occupiedClass?.divisionName || 'another division'}` 
          : null
      }
    })
  }


  const getSubjectsForDivision = (divisionId) => {
    const division = departments
      .flatMap(d => d.specializations)
      .flatMap(s => s.divisions)
      .find(d => d.id === divisionId)
    
    if (!division) return []
    

    const semesterSubjects = {
      1: {
        theory: ['Mathematics I', 'Physics', 'Programming Fundamentals', 'English'],
        lab: ['Programming Lab', 'Physics Lab']
      },
      2: {
        theory: ['Data Structures', 'Web Development', 'Database Systems'],
        lab: ['Data Structures Lab', 'Web Development Lab']
      },
      3: {
        theory: ['Machine Learning', 'Software Engineering', 'Algorithms'],
        lab: ['Database Lab', 'Computer Networks Lab']
      },
      4: {
        theory: ['Advanced Programming', 'System Design', 'Project Management'],
        lab: ['Advanced Programming Lab', 'System Design Lab']
      },
      5: {
        theory: ['Machine Learning', 'Web Development', 'Mobile App Development', 'Project Management'],
        lab: []
      }
    }
    
    const divisionSubjects = semesterSubjects[division.semester] || { theory: [], lab: [] }
    return [...divisionSubjects.theory, ...divisionSubjects.lab]
  }

  // Check if a subject is a lab subject
  const isLabSubject = (subjectName) => {
    return subjectName.toLowerCase().includes('lab')
  }

  // Check if division is eligible for lab splitting (1st-4th semester)
  const isEligibleForLabSplitting = (divisionId) => {
    const division = departments
      .flatMap(d => d.specializations)
      .flatMap(s => s.divisions)
      .find(d => d.id === divisionId)
    
    return division && division.semester >= 1 && division.semester <= 4
  }

  // Get lab classrooms (classrooms suitable for lab sessions)
  const getLabClassrooms = () => {
    return classrooms.filter(c => c.type.toLowerCase().includes('lab'))
  }

  // Conflict detection
  const checkConflicts = (classData) => {
    const conflicts = []
    
    // Check classroom availability
    const classroomConflict = timetable.classes.find(c => 
      c.classroomId === classData.classroomId && 
      c.slotId === classData.slotId &&
      c.day === classData.day &&
      c.id !== classData.id
    )
    if (classroomConflict) {
      conflicts.push({
        type: 'classroom',
        message: `Classroom is already occupied by ${classroomConflict.subjectName}`
      })
    }

    // Check faculty availability
    const facultyConflict = timetable.classes.find(c => 
      c.facultyId === classData.facultyId && 
      c.slotId === classData.slotId &&
      c.day === classData.day &&
      c.id !== classData.id
    )
    if (facultyConflict) {
      conflicts.push({
        type: 'faculty',
        message: `Faculty is already teaching ${facultyConflict.subjectName}`
      })
    }

    return conflicts
  }

  // Auto-lock functionality
  const lockClassroom = (classroomId, slotId) => {
    updateClassroom(classroomId, { status: 'Occupied' })
  }

  const unlockClassroom = (classroomId) => {
    updateClassroom(classroomId, { status: 'Available' })
  }

  // Get current time slots based on selected shift
  const getCurrentTimeSlots = () => {
    return selectedShift ? selectedShift.timeSlots : shifts[0].timeSlots
  }

  const value = {
    // Data
    classrooms,
    faculty,
    students,
    subjects,
    timetable,
    departments,
    timeSlots: getCurrentTimeSlots(),
    shifts,
    
    // Selection state
    selectedDivision,
    selectedDepartment,
    selectedSpecialization,
    selectedShift,
    
    // Classroom operations
    addClassroom,
    updateClassroom,
    deleteClassroom,
    
    // Faculty operations
    addFaculty,
    updateFaculty,
    deleteFaculty,
    
    // Student operations
    addStudent,
    updateStudent,
    deleteStudent,
    
    // Timetable operations
    addClass,
    updateClass,
    deleteClass,
    
    // Selection functions
    setSelectedDivision,
    setSelectedDepartment,
    setSelectedSpecialization,
    setSelectedShift,
    getFacultyAvailability,
    getSubjectsForDivision,
    
    // Lab scheduling functions
    isLabSubject,
    isEligibleForLabSplitting,
    getLabClassrooms,
    
    // Utility functions
    checkConflicts,
    lockClassroom,
    unlockClassroom,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
