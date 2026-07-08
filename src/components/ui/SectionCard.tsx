import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

type SectionCardProps = {
  title: string
  description?: string
  children?: ReactNode
  action?: ReactNode
}

export function SectionCard({ title, description, children, action }: SectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid rgba(73, 54, 32, 0.08)',
        backgroundColor: 'rgba(255, 252, 247, 0.92)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Stack spacing={1.2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
              </Typography>
              {description ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Box>
            {action ? <Box>{action}</Box> : null}
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
