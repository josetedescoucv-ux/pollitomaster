import { Box, Container, Stack } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/ui/BottomNav'
import { ScreenHeader } from '../components/ui/ScreenHeader'

export function AppLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f9f4eb 0%, #f4efe8 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 2, sm: 3 }, pb: { xs: 10, sm: 12 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <ScreenHeader
            title="Pollito Master"
            subtitle="A calm place to plan, focus, and stay on track."
          />
          <Outlet />
        </Stack>
      </Container>
      <BottomNav />
    </Box>
  )
}
