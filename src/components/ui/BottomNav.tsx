import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { BellRing, CalendarDays, House, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/', icon: <House size={20} /> },
  { label: 'Planner', to: '/planner', icon: <CalendarDays size={20} /> },
  { label: 'Alarms', to: '/alarms', icon: <BellRing size={20} /> },
  { label: 'Settings', to: '/settings', icon: <Settings size={20} /> },
]

export function BottomNav() {
  const location = useLocation()
  const currentValue = navigationItems.findIndex((item) => item.to === location.pathname)

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        bottom: 0,
        borderTop: '1px solid rgba(73, 54, 32, 0.1)',
        borderRadius: 0,
        backgroundColor: 'rgba(255, 250, 243, 0.95)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <BottomNavigation
        showLabels
        value={currentValue >= 0 ? currentValue : 0}
        sx={{
          height: 72,
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.to}
            component={Link}
            to={item.to}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
