import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TimetableBuilder from './pages/TimetableBuilder'
import TimetableOptions from './pages/TimetableOptions'
import PrintableTimetable from './pages/PrintableTimetable'
import ApprovalDashboard from './pages/ApprovalDashboard'
import Classrooms from './pages/Classrooms'
import Faculty from './pages/Faculty'
import Students from './pages/Students'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ApprovalProvider } from './context/ApprovalContext'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ApprovalProvider>
          <DndContext>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="timetable" element={<TimetableBuilder />} />
                    <Route path="timetable-options" element={<TimetableOptions />} />
                    <Route path="printable-timetable" element={<PrintableTimetable />} />
                    <Route path="approvals" element={<ApprovalDashboard />} />
                    <Route path="classrooms" element={<Classrooms />} />
                    <Route path="faculty" element={<Faculty />} />
                    <Route path="students" element={<Students />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </DndContext>
        </ApprovalProvider>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
