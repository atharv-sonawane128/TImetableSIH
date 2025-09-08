import { useData } from '../context/DataContext'

// Mock optimization strategies
export const optimizationStrategies = {
  FACULTY_OPTIMIZED: 'Faculty-Optimized',
  CLASSROOM_OPTIMIZED: 'Classroom-Optimized',
  BALANCED: 'Balanced Approach',
  DEPARTMENT_FOCUSED: 'Department-Focused',
  MULTI_SHIFT: 'Multi-Shift Schedule'
}

// Mock timetable optimization engine
export class TimetableOptimizer {
  constructor(data) {
    this.data = data
  }

  // Generate multiple optimized timetable options
  generateOptimizedOptions(divisionId, constraints = {}) {
    const options = []

    // Faculty-Optimized Option
    options.push(this.generateFacultyOptimized(divisionId, constraints))

    // Classroom-Optimized Option
    options.push(this.generateClassroomOptimized(divisionId, constraints))

    // Balanced Approach Option
    options.push(this.generateBalancedApproach(divisionId, constraints))

    // Department-Focused Option
    options.push(this.generateDepartmentFocused(divisionId, constraints))

    // Multi-Shift Option
    options.push(this.generateMultiShift(divisionId, constraints))

    return options
  }

  // Faculty-Optimized: Minimize faculty conflicts and maximize teaching efficiency
  generateFacultyOptimized(divisionId, constraints) {
    const classes = this.generateMockClasses(divisionId, 'faculty-optimized')
    
    return {
      id: 'faculty-optimized',
      name: 'Faculty-Optimized',
      description: 'Minimizes faculty conflicts and maximizes teaching efficiency',
      classes,
      metrics: {
        facultyConflicts: 0,
        classroomUtilization: 85,
        studentSatisfaction: 92,
        efficiency: 95
      },
      advantages: [
        'Zero faculty scheduling conflicts',
        'Optimal teaching load distribution',
        'High faculty satisfaction'
      ],
      disadvantages: [
        'May require more classrooms',
        'Less flexible for last-minute changes'
      ]
    }
  }

  // Classroom-Optimized: Maximize classroom utilization
  generateClassroomOptimized(divisionId, constraints) {
    const classes = this.generateMockClasses(divisionId, 'classroom-optimized')
    
    return {
      id: 'classroom-optimized',
      name: 'Classroom-Optimized',
      description: 'Maximizes classroom utilization and minimizes resource waste',
      classes,
      metrics: {
        facultyConflicts: 2,
        classroomUtilization: 95,
        studentSatisfaction: 88,
        efficiency: 90
      },
      advantages: [
        'Maximum classroom utilization',
        'Reduced resource waste',
        'Cost-effective scheduling'
      ],
      disadvantages: [
        'May have some faculty conflicts',
        'Less flexible timing options'
      ]
    }
  }

  // Balanced Approach: Balance between faculty and classroom optimization
  generateBalancedApproach(divisionId, constraints) {
    const classes = this.generateMockClasses(divisionId, 'balanced')
    
    return {
      id: 'balanced',
      name: 'Balanced Approach',
      description: 'Balances faculty efficiency with classroom utilization',
      classes,
      metrics: {
        facultyConflicts: 1,
        classroomUtilization: 90,
        studentSatisfaction: 90,
        efficiency: 92
      },
      advantages: [
        'Good balance of all factors',
        'Moderate flexibility',
        'Suitable for most scenarios'
      ],
      disadvantages: [
        'Not optimal in any single area',
        'May require some compromises'
      ]
    }
  }

  // Department-Focused: Optimize for department-specific requirements
  generateDepartmentFocused(divisionId, constraints) {
    const classes = this.generateMockClasses(divisionId, 'department-focused')
    
    return {
      id: 'department-focused',
      name: 'Department-Focused',
      description: 'Optimized for department-specific requirements and preferences',
      classes,
      metrics: {
        facultyConflicts: 1,
        classroomUtilization: 88,
        studentSatisfaction: 94,
        efficiency: 93
      },
      advantages: [
        'Tailored to department needs',
        'High student satisfaction',
        'Considers department preferences'
      ],
      disadvantages: [
        'May not be optimal globally',
        'Requires department input'
      ]
    }
  }

  // Multi-Shift: Optimize for multiple shifts and extended hours
  generateMultiShift(divisionId, constraints) {
    const classes = this.generateMockClasses(divisionId, 'multi-shift')
    
    return {
      id: 'multi-shift',
      name: 'Multi-Shift Schedule',
      description: 'Optimized for multiple shifts and extended operating hours',
      classes,
      metrics: {
        facultyConflicts: 0,
        classroomUtilization: 92,
        studentSatisfaction: 89,
        efficiency: 91
      },
      advantages: [
        'Supports multiple shifts',
        'Extended operating hours',
        'High resource utilization'
      ],
      disadvantages: [
        'May require more faculty',
        'Complex scheduling requirements'
      ]
    }
  }

  // Generate mock classes for demonstration
  generateMockClasses(divisionId, strategy) {
    const timeSlots = this.data.timeSlots || []
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    // Prefer subjects from provided data; fallback to a default list
    const providedSubjects = Array.isArray(this.data.subjects)
      ? (this.data.subjects.map(s => s?.name).filter(Boolean))
      : []
    const baseSubjects = providedSubjects.length > 0
      ? providedSubjects
      : ['Mathematics', 'Physics', 'Programming', 'English', 'Chemistry']
    // Shuffle subjects to introduce variety per generation
    const subjects = [...baseSubjects].sort(() => Math.random() - 0.5)
    const faculty = this.data.faculty || []
    const classrooms = this.data.classrooms || []

    // Build helper maps
    const subjectTypeByName = new Map(
      (Array.isArray(this.data.subjects) ? this.data.subjects : [])
        .filter(s => s && s.name)
        .map(s => [s.name, s.type || 'theory'])
    )
    const labSubjectNames = (Array.isArray(this.data.subjects) ? this.data.subjects : [])
      .filter(s => (s?.type || '').toLowerCase() === 'lab')
      .map(s => s.name)
    const theorySubjectNames = (Array.isArray(this.data.subjects) ? this.data.subjects : [])
      .filter(s => (s?.type || '').toLowerCase() !== 'lab')
      .map(s => s.name)
    const labRooms = classrooms.filter(c => String(c.type || '').toLowerCase().includes('lab'))
    const isLabSubject = (name) => {
      if (!name) return false
      const byMap = subjectTypeByName.get(name)
      if (byMap) return String(byMap).toLowerCase() === 'lab'
      return String(name).toLowerCase().includes('lab')
    }

    const classes = []
    let classId = 1

    // Track used subject names per slot across the week to avoid repeats at the same time
    const usedSubjectNamesBySlot = new Map()
    timeSlots.forEach(ts => usedSubjectNamesBySlot.set(ts.id, new Set()))

    const pickDistinctForSlot = (candidates, slotId, avoid = new Set()) => {
      const pool = Array.isArray(candidates) ? candidates : []
      for (let k = 0; k < pool.length; k++) {
        const candidate = pool[k]
        if (!candidate) continue
        if (avoid.has(candidate)) continue
        const used = usedSubjectNamesBySlot.get(slotId) || new Set()
        if (!used.has(candidate)) {
          return candidate
        }
      }
      // fallback to first non-avoided even if duplicate
      const fallback = pool.find(n => n && !avoid.has(n)) || pool[0]
      return fallback || 'Elective'
    }

    // Generate classes for each day and time slot (labs occupy 2 consecutive slots)
    const lastTheoryByDay = new Map()
    days.forEach(day => {
      let labScheduledThisDay = false
      let theoryIdx = 0
      // Track subjects used within this day to avoid repeats in the same day
      const usedSubjectsInDay = new Set()
      for (let i = 0; i < timeSlots.length; i++) {
        const timeSlot = timeSlots[i]
        const subj = subjects[i % subjects.length]
        const fac = faculty[i % (faculty.length || 1)]
        const room = classrooms[i % (classrooms.length || 1)]
        if (!subj || !fac || !room) continue

        // Only schedule labs once per day; all other slots must be theory
        if (isLabSubject(subj) && !labScheduledThisDay && i + 1 < timeSlots.length) {
          const slotA = timeSlots[i]
          const slotB = timeSlots[i + 1]

          // Choose two different lab subjects if available
          const labAName = pickDistinctForSlot(labSubjectNames.length ? labSubjectNames : [subj], slotA.id)
          const avoidSet = new Set([labAName])
          const labBName = pickDistinctForSlot(labSubjectNames.length ? labSubjectNames : [subj], slotA.id, avoidSet)

          // Pick two distinct lab rooms if possible
          const roomA = labRooms[0] || room
          const roomB = (labRooms.find(r => r.id !== roomA.id) || labRooms[0] || roomA)

          // Pick two distinct faculty members
          const facA = fac
          const facB = faculty.find(fx => fx.id !== facA.id) || facA

          classes.push({
            id: classId++,
            subject: labAName,
            subjectName: labAName,
            facultyId: facA.id,
            facultyName: facA.name,
            classroomId: roomA.id,
            classroomName: roomA.name,
            day,
            timeSlot: slotA.time,
            slotId: slotA.id,
            divisionId,
            strategy,
            isLabMode: true,
            labSession: 'A',
            classSuggestions: [
              { message: 'Lab scheduled for 2 consecutive slots (start).', priority: 'medium' },
              { message: `Use lab room ${roomA.name}.`, priority: 'low' }
            ]
          })

          classes.push({
            id: classId++,
            subject: labBName,
            subjectName: labBName,
            facultyId: facB.id,
            facultyName: facB.name,
            classroomId: roomB.id,
            classroomName: roomB.name,
            day,
            timeSlot: slotA.time, // same start time for both sessions
            slotId: slotA.id,
            divisionId,
            strategy,
            isLabMode: true,
            labSession: 'B',
            classSuggestions: [
              { message: 'Parallel Lab B with different faculty/room/subject.', priority: 'medium' },
              { message: `Ensure Lab B runs concurrently with Lab A in ${roomB.name}.`, priority: 'low' }
            ]
          })

          // Mark subjects as used for both slots across the week and for the day
          usedSubjectNamesBySlot.get(slotA.id)?.add(labAName)
          usedSubjectNamesBySlot.get(slotA.id)?.add(labBName)
          usedSubjectNamesBySlot.get(slotB.id)?.add(labAName)
          usedSubjectNamesBySlot.get(slotB.id)?.add(labBName)
          usedSubjectsInDay.add(labAName)
          usedSubjectsInDay.add(labBName)

          // Extend both sessions into the next slot to make total 2 hours
          classes.push({
            id: classId++,
            subject: labAName,
            subjectName: labAName,
            facultyId: facA.id,
            facultyName: facA.name,
            classroomId: roomA.id,
            classroomName: roomA.name,
            day,
            timeSlot: slotB.time,
            slotId: slotB.id,
            divisionId,
            strategy,
            isLabMode: true,
            labSession: 'A',
            classSuggestions: [
              { message: 'Second slot of Lab A (continuous 2-hour session).', priority: 'medium' }
            ]
          })

          classes.push({
            id: classId++,
            subject: labBName,
            subjectName: labBName,
            facultyId: facB.id,
            facultyName: facB.name,
            classroomId: roomB.id,
            classroomName: roomB.name,
            day,
            timeSlot: slotB.time,
            slotId: slotB.id,
            divisionId,
            strategy,
            isLabMode: true,
            labSession: 'B',
            classSuggestions: [
              { message: 'Second slot of Lab B (continuous 2-hour session).', priority: 'medium' }
            ]
          })

          i++ // Skip the next slot because it is consumed by the lab
          labScheduledThisDay = true
        } else {
          // Force theory subject for non-lab slots: pick one not used today and not used at this time across the week
          const theoryName = pickDistinctForSlot(
            theorySubjectNames.length > 0 ? theorySubjectNames : baseSubjects.filter(n => !isLabSubject(n)),
            timeSlot.id,
            usedSubjectsInDay
          )
          theoryIdx++
          usedSubjectNamesBySlot.get(timeSlot.id)?.add(theoryName)
          lastTheoryByDay.set(day, theoryName)
          usedSubjectsInDay.add(theoryName)
          classes.push({
            id: classId++,
            subject: theoryName,
            subjectName: theoryName,
            facultyId: fac.id,
            facultyName: fac.name,
            classroomId: room.id,
            classroomName: room.name,
            day,
            timeSlot: timeSlot.time,
            slotId: timeSlot.id,
            divisionId,
            strategy,
            classSuggestions: [
              { message: 'Avoid adjacent classes to reduce fatigue if possible.', priority: 'low' },
              { message: 'Balance faculty load across the week.', priority: 'low' }
            ]
          })
        }
      }
    })

    return classes
  }

  // Analyze timetable quality
  analyzeTimetable(timetable) {
    const analysis = {
      totalClasses: timetable.classes.length,
      facultyConflicts: this.countFacultyConflicts(timetable.classes),
      classroomConflicts: this.countClassroomConflicts(timetable.classes),
      utilization: this.calculateUtilization(timetable.classes),
      distribution: this.analyzeDistribution(timetable.classes)
    }

    return analysis
  }

  // Count faculty conflicts
  countFacultyConflicts(classes) {
    const conflicts = new Set()
    const facultySlots = new Map()

    classes.forEach(cls => {
      const key = `${cls.facultyId}-${cls.day}-${cls.slotId}`
      if (facultySlots.has(key)) {
        conflicts.add(key)
      } else {
        facultySlots.set(key, cls)
      }
    })

    return conflicts.size
  }

  // Count classroom conflicts
  countClassroomConflicts(classes) {
    const conflicts = new Set()
    const classroomSlots = new Map()

    classes.forEach(cls => {
      const key = `${cls.classroomId}-${cls.day}-${cls.slotId}`
      if (classroomSlots.has(key)) {
        conflicts.add(key)
      } else {
        classroomSlots.set(key, cls)
      }
    })

    return conflicts.size
  }

  // Calculate utilization percentage
  calculateUtilization(classes) {
    const totalSlots = 5 * 8 // 5 days * 8 time slots
    const usedSlots = classes.length
    return Math.round((usedSlots / totalSlots) * 100)
  }

  // Analyze distribution
  analyzeDistribution(classes) {
    const distribution = {
      byDay: {},
      byTime: {},
      byFaculty: {},
      byClassroom: {}
    }

    classes.forEach(cls => {
      // By day
      distribution.byDay[cls.day] = (distribution.byDay[cls.day] || 0) + 1
      
      // By time
      distribution.byTime[cls.timeSlot] = (distribution.byTime[cls.timeSlot] || 0) + 1
      
      // By faculty
      distribution.byFaculty[cls.facultyName] = (distribution.byFaculty[cls.facultyName] || 0) + 1
      
      // By classroom
      distribution.byClassroom[cls.classroomName] = (distribution.byClassroom[cls.classroomName] || 0) + 1
    })

    return distribution
  }
}

// Export a default instance
export const timetableOptimizer = new TimetableOptimizer()




