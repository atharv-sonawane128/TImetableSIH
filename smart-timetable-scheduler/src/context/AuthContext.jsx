import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Mock authentication - replace with actual API call
    const users = [
      {
        id: 1,
        email: 'admin@college.edu',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        department: 'Administration'
      },
      {
        id: 2,
        email: 'depthead@college.edu',
        password: 'dept123',
        name: 'Dr. Department Head',
        role: 'departmentHead',
        department: 'Computer Science'
      },
      {
        id: 3,
        email: 'faculty@college.edu',
        password: 'faculty123',
        name: 'Prof. Faculty Member',
        role: 'faculty',
        department: 'Computer Science'
      }
    ]

    const user = users.find(u => u.email === email && u.password === password)
    
    if (user) {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
