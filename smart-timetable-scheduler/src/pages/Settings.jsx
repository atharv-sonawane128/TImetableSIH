import { Settings as SettingsIcon, Save, Bell, Shield, Database, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
  const { user, loading } = useAuth()

  // Show loading state while user is being authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure system preferences and manage your account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <SettingsIcon className="w-6 h-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Name
              </label>
              <input
                type="text"
                defaultValue="Parul University"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Time Slot Duration
              </label>
              <select className="input-field">
                <option>60 minutes</option>
                <option>90 minutes</option>
                <option>120 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center">
                    <input type="checkbox" defaultChecked={day !== 'Sunday'} className="mr-2" />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Schedule Conflicts</p>
                <p className="text-xs text-gray-500">Alert when conflicts are detected</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Faculty Leave Requests</p>
                <p className="text-xs text-gray-500">Notify about leave applications</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="input-field mb-2"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="input-field"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
          <div className="space-y-4">
            <button className="w-full btn-secondary">
              Export Timetable Data
            </button>
            <button className="w-full btn-secondary">
              Backup System Data
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
