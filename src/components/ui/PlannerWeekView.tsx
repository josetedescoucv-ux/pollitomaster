import { Box, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hours = Array.from({ length: 13 }, (_, index) => 8 + index)

export function PlannerWeekView() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 0.5,
        }}
      >
        <Box component="button" sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0.5, color: 'text.secondary' }}>
          <ChevronLeft size={20} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Week of July 8 – 14
        </Typography>

        <Box component="button" sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0.5, color: 'text.secondary' }}>
          <ChevronRight size={20} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 1 }}>
        <Box sx={{ width: 56, flexShrink: 0, pt: 4.5 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mb: 1.6 }}>
            Time
          </Typography>
          {hours.map((hour) => (
            <Typography key={hour} variant="caption" sx={{ display: 'block', height: 56, color: 'text.secondary', fontWeight: 600, lineHeight: 1.2 }}>
              {`${hour.toString().padStart(2, '0')}:00`}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(180px, 1fr))',
            gap: 1.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          {days.map((day) => (
            <Box
              key={day}
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(63, 45, 26, 0.08)',
                bgcolor: 'rgba(255, 252, 247, 0.95)',
                boxShadow: '0 10px 30px rgba(44, 35, 23, 0.04)',
                minHeight: 760,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2, py: 1.4, borderBottom: '1px solid rgba(63, 45, 26, 0.06)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {day}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, position: 'relative', bgcolor: 'rgba(248, 242, 232, 0.72)' }}>
                {hours.map((hour) => (
                  <Box
                    key={`${day}-${hour}`}
                    sx={{
                      height: 56,
                      borderTop: hour === 8 ? '1px solid rgba(63, 45, 26, 0.08)' : '1px solid rgba(63, 45, 26, 0.06)',
                      borderBottom: hour < 20 ? '1px solid rgba(63, 45, 26, 0.04)' : 'none',
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
