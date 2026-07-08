import { Stack, Typography } from '@mui/material'
import { SectionCard } from '../../components/ui/SectionCard'

export function AlarmsPage() {
  return (
    <Stack spacing={2.5}>
      <SectionCard title="Alarms" description="Manage your routines and reminders in one calm place.">
        <Typography variant="body2" color="text.secondary">
          Alarm and notification preferences will appear here soon.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
