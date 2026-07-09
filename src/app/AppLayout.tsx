import { Box, Typography } from '@mui/material'
import { House, Sparkles, CalendarDays, BellRing, Settings as SettingsIcon } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '../components/ui/AppSidebar'
import { useAuth } from './providers/AuthProvider'

const navItems = [
  { label: 'Home', to: '/home', icon: <House size={18} /> },
  { label: 'Planner', to: '/planner', icon: <CalendarDays size={18} /> },
  { label: 'Alarms', to: '/alarms', icon: <BellRing size={18} /> },
  { label: 'AI Assistant', to: '/ai-assistant', icon: <Sparkles size={18} /> },
  { label: 'Settings', to: '/settings', icon: <SettingsIcon size={18} /> },
]

export function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(180deg, rgba(247,239,229,0.96) 0%, rgba(243,234,220,0.98) 100%)',
        color: 'text.primary',
      }}
    >
      <AppSidebar items={navItems} currentPath={location.pathname} />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.78)', px: { xs: 2.5, lg: 3 }, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {location.pathname === '/home' ? 'Home dashboard' : location.pathname === '/planner' ? 'Planner workspace' : location.pathname === '/alarms' ? 'Alarm center' : location.pathname === '/ai-assistant' ? 'AI assistant' : 'Settings'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.displayName ? `Signed in as ${user.displayName}` : 'Open your workspace'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, p: { xs: 2.25, lg: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
