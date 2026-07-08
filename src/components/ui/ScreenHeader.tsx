import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

type ScreenHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 1, sm: 0 },
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {action ? <Box>{action}</Box> : null}
    </Box>
  )
}
