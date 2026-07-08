import { Stack, Typography } from '@mui/material'
import { SectionCard } from '../../components/ui/SectionCard'

export function PlannerPage() {
  return (
    <Stack spacing={2.5}>
      <SectionCard title="Planner" description="A space for your weekly plan and focus sessions.">
        <Typography variant="body2" color="text.secondary">
          Future planning views and task boards will live here.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
