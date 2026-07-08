import { Box, Chip, Stack, Typography } from '@mui/material'
import { Sparkles } from 'lucide-react'
import { SectionCard } from '../../components/ui/SectionCard'

export function HomePage() {
  return (
    <Stack spacing={2.5}>
      <SectionCard
        title="Welcome back"
        description="Your calm command center for the day ahead."
        action={<Chip icon={<Sparkles size={16} />} label="Ready" color="primary" variant="outlined" />}
      >
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.50' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
            Focus on what matters most with a simple, warm experience.
          </Typography>
        </Box>
      </SectionCard>

      <SectionCard title="Today at a glance" description="This section will host your upcoming priorities and habits.">
        <Typography variant="body2" color="text.secondary">
          Space for a future overview, task summary, or streak insight.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
