import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { HomePage } from '../features/home/HomePage'
import { PlannerPage } from '../features/planner/PlannerPage'
import { AlarmsPage } from '../features/alarms/AlarmsPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/alarms" element={<AlarmsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
