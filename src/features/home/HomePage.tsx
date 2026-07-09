import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Chip, Divider, Grid, Stack, Typography } from '@mui/material'
import { BellRing, BrainCircuit, CalendarDays, PlusCircle, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionCard } from '../../components/ui/SectionCard'
import { useAuth } from '../../app/providers/AuthProvider'
import { localStorageService } from '../../services/localStorageService'
import { getText } from '../../shared/i18n'
import type { PlannerEvent } from '../../types/domain'

const sampleEvents: PlannerEvent[] = [
  { id: '1', title: 'Deep work sprint', description: 'Finish the weekly review', date: new Date().toISOString().slice(0, 10), startTime: '09:00', endTime: '10:30', color: 'Warm', reminder: 'alarm', completed: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Project check-in', date: new Date().toISOString().slice(0, 10), startTime: '14:00', endTime: '14:30', color: 'Ocean', reminder: 'none', completed: false, createdAt: new Date().toISOString() },
  { id: '3', title: 'Evening reset', date: new Date().toISOString().slice(0, 10), startTime: '19:00', endTime: '20:00', color: 'Forest', reminder: 'alarm', completed: false, createdAt: new Date().toISOString() },
]

export function HomePage() {
  const { user } = useAuth()
  const settings = localStorageService.settings.get()
  const language = settings.language
  const [clock, setClock] = useState(new Date())
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const plannerEvents = useMemo(() => {
    const stored = localStorageService.plannerEvents.list()
    return stored.length > 0 ? stored.filter((event) => event.date === new Date().toISOString().slice(0, 10)).slice(0, 3) : sampleEvents
  }, [])
  const alarms = localStorageService.alarms.list().filter((alarm) => alarm.enabled).slice(0, 3)
  const completedCount = plannerEvents.filter((event) => event.completed).length
  const progress = plannerEvents.length > 0 ? Math.round((completedCount / plannerEvents.length) * 100) : 0
  const nextEvent = plannerEvents[0]
  const nextAlarm = alarms[0]

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <Stack spacing={2.5}>
      <SectionCard
        title={`${getText('homeTitle', language)}, ${user?.displayName || 'friend'}`}
        description={getText('homeSubtitle', language)}
        action={<Chip icon={<PlusCircle size={16} />} label={getText('quickActions', language)} color="primary" variant="outlined" />}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: 'rgba(124,90,59,0.08)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{todayLabel}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{getText('liveClock', language)}: {clock.toLocaleTimeString()}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{getText('nextEvent', language)}: {nextEvent?.title || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">{getText('nextAlarm', language)}: {nextAlarm?.title || '—'}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: 'rgba(95,119,101,0.1)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }} color="text.secondary">{getText('quickActions', language)}</Typography>
              <Stack spacing={1} sx={{ mt: 1.2 }}>
                <Button component={Link} to="/planner" startIcon={<CalendarDays size={16} />} variant="contained" size="small">{getText('createEvent', language)}</Button>
                <Button component={Link} to="/alarms" startIcon={<BellRing size={16} />} variant="outlined" size="small">{getText('createAlarm', language)}</Button>
                <Button component={Link} to="/ai-assistant" startIcon={<BrainCircuit size={16} />} variant="outlined" size="small">{getText('openAi', language)}</Button>
                <Button variant="outlined" startIcon={<Smartphone size={16} />} size="small">{getText('connectWithApp', language)}</Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </SectionCard>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard title={getText('todaySchedule', language)} description={getText('homeSubtitle', language)}>
            <Stack spacing={1.25}>
              {plannerEvents.map((event) => (
                <Box key={event.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.25, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{event.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{event.startTime} – {event.endTime} • {event.color}</Typography>
                  </Box>
                  <Chip label={event.completed ? 'Done' : 'Planned'} size="small" color={event.completed ? 'success' : 'default'} variant="outlined" />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Productivity overview" description="A calm summary of what matters now.">
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Tasks completed</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{completedCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Weekly progress</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{progress}%</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary">Upcoming priorities</Typography>
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {plannerEvents.slice(0, 2).map((event) => (
                    <Typography key={event.id} variant="body2" sx={{ fontWeight: 600 }}>• {event.title}</Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={getText('nextAlarm', language)} description={getText('connectWithAppBody', language)}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(37,99,235,0.08)' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <PlusCircle size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                {getText('connectWithAppBody', language)}
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={getText('connectWithApp', language)} description={getText('connectWithAppBody', language)}>
            <Button variant="outlined" startIcon={<Smartphone size={16} />} size="small">{getText('connectWithApp', language)}</Button>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  )
}
