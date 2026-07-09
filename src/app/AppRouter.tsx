import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { AuthProvider } from './providers/AuthProvider'
import { HomePage } from '../features/home/HomePage'
import { PlannerPage } from '../features/planner/PlannerPage'
import { AlarmCenterPage } from '../features/alarms/AlarmCenterPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { AuthPage } from '../features/auth/AuthPage'
import { ConnectionsPage } from '../features/connections/ConnectionsPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/alarms" element={<AlarmCenterPage />} />
            <Route path="/ai-assistant" element={<ConnectionsPage />} />
            <Route path="/connections" element={<Navigate to="/ai-assistant" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AuthProvider>
  )
}
