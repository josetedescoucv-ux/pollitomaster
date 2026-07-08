import { Stack, Typography } from '@mui/material'
import { SectionCard } from '../../components/ui/SectionCard'

export function SettingsPage() {
  return (
    <Stack spacing={2.5}>
      <SectionCard title="Settings" description="Personalize the look and feel of your workspace.">
        <Typography variant="body2" color="text.secondary">
          Preferences and account controls will be added later.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
