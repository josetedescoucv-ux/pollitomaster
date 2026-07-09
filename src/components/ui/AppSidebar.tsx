import type { ReactNode } from 'react'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

type AppSidebarProps = {
  items: NavItem[]
  currentPath: string
}

export function AppSidebar({ items, currentPath }: AppSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: 220, lg: 240 },
        borderRight: '1px solid rgba(63, 45, 26, 0.08)',
        bgcolor: 'rgba(255, 251, 244, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        px: 2.5,
        py: 3,
        gap: 3,
      }}
    >
      <Stack spacing={0.75}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
          Pollito Master
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Desktop productivity workspace
        </Typography>
      </Stack>

      <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
        {items.map((item) => {
          const selected = currentPath === item.to

          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={selected}
              sx={{
                borderRadius: 2,
                py: 1.1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(138, 90, 43, 0.12)',
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selected ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
