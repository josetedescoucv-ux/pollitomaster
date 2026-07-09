import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

const detailSections = [
  {
    title: 'Upcoming',
    body: 'A calm summary of upcoming work will appear here.',
  },
  {
    title: 'Statistics',
    body: 'Productivity insights and progress snapshots will appear here.',
  },
  {
    title: 'AI Suggestions',
    body: 'Helpful recommendations and planning prompts will appear here.',
  },
]

export function DetailPanel() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Details
      </Typography>

      <Typography variant="body2" color="text.secondary">
        No event selected.
      </Typography>

      <Stack spacing={1.5}>
        {detailSections.map((section) => (
          <Card key={section.title} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(63, 45, 26, 0.08)', bgcolor: 'rgba(255, 252, 247, 0.95)' }}>
            <CardContent sx={{ p: 2.2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.7 }}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.body}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
