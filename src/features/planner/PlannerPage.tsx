import { useMemo, useState } from 'react'
import { Box, Button, Chip, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Plus } from 'lucide-react'
import { localStorageService } from '../../services/localStorageService'
import { getText } from '../../shared/i18n'
import type { PlannerEvent } from '../../types/domain'

const colors: PlannerEvent['color'][] = ['Warm', 'Ocean', 'Forest', 'Rose', 'Amber']
const initialEvent = {
  id: crypto.randomUUID(),
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '10:00',
  color: 'Warm' as PlannerEvent['color'],
  reminder: 'none' as PlannerEvent['reminder'],
  completed: false,
  createdAt: new Date().toISOString(),
}

function normalizeTime(input: string) {
  const digits = input.replace(/[^0-9]/g, '')
  if (digits.length <= 1) return '0' + digits.padStart(2, '0') + ':00'
  if (digits.length === 2) return digits + ':00'
  if (digits.length === 3) return digits.slice(0, 1) + ':' + digits.slice(1, 3)
  if (digits.length === 4) return digits.slice(0, 2) + ':' + digits.slice(2, 4)
  return digits.slice(0, 2) + ':' + digits.slice(2, 4)
}

export function PlannerPage() {
  const settings = localStorageService.settings.get()
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [events, setEvents] = useState<PlannerEvent[]>(() => localStorageService.plannerEvents.list())
  const [search, setSearch] = useState('')
  const [colorFilter, setColorFilter] = useState<'all' | PlannerEvent['color']>('all')
  const [openForm, setOpenForm] = useState(false)
  const [draft, setDraft] = useState(initialEvent)

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase())
      const matchesColor = colorFilter === 'all' || event.color === colorFilter
      return matchesSearch && matchesColor
    })
  }, [events, search, colorFilter])

  const saveEvent = () => {
    const nextEvents = [...events, { ...draft, id: crypto.randomUUID(), title: draft.title || 'Untitled event' }]
    setEvents(nextEvents)
    localStorageService.plannerEvents.save(nextEvents)
    setDraft(initialEvent)
    setOpenForm(false)
  }

  const language = settings.language

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{getText('plannerTitle', language)}</Typography>
          <Typography variant="body2" color="text.secondary">{getText('plannerSubtitle', language)}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>{getText('addEvent', language)}</Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup color="primary" value={view} exclusive onChange={(_, nextView) => nextView && setView(nextView)}>
          <ToggleButton value="day">{getText('day', language)}</ToggleButton>
          <ToggleButton value="week">{getText('week', language)}</ToggleButton>
          <ToggleButton value="month">{getText('month', language)}</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField label={getText('searchEvents', language)} size="small" value={search} onChange={(event) => setSearch(event.target.value)} />
          <TextField select label={getText('filterColor', language)} size="small" value={colorFilter} onChange={(event) => setColorFilter(event.target.value as 'all' | PlannerEvent['color'])} sx={{ minWidth: 170 }}>
            <MenuItem value="all">All</MenuItem>
            {colors.map((color) => <MenuItem key={color} value={color}>{color}</MenuItem>)}
          </TextField>
        </Box>
      </Box>

      <Box sx={{ borderRadius: 4, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)', p: { xs: 2, lg: 2.5 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{view === 'day' ? 'Today' : view === 'week' ? 'This week' : 'This month'}</Typography>
        <Stack spacing={1.2}>
          {visibleEvents.length > 0 ? visibleEvents.map((event) => (
            <Box key={event.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, px: 1.5, py: 1.25, bgcolor: 'rgba(255,255,255,0.8)' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">{event.date} • {event.startTime} – {event.endTime}</Typography>
              </Box>
              <Chip label={event.color} size="small" color="primary" variant="outlined" />
            </Box>
          )) : <Typography variant="body2" color="text.secondary">{getText('noEvents', language)}</Typography>}
        </Stack>
      </Box>

      {openForm ? (
        <Box sx={{ borderRadius: 4, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)', p: { xs: 2, lg: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{getText('addEvent', language)}</Typography>
          <Stack spacing={1.5}>
            <TextField label={getText('title', language)} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} size="small" />
            <TextField label={getText('date', language)} type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} size="small" />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField label={getText('startTime', language)} value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: normalizeTime(event.target.value) }))} size="small" />
              <TextField label={getText('endTime', language)} value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: normalizeTime(event.target.value) }))} size="small" />
            </Box>
            <TextField select label={getText('color', language)} value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value as PlannerEvent['color'] }))} size="small">
              {colors.map((color) => <MenuItem key={color} value={color}>{color}</MenuItem>)}
            </TextField>
            <TextField select label={getText('reminder', language)} value={draft.reminder} onChange={(event) => setDraft((current) => ({ ...current, reminder: event.target.value as PlannerEvent['reminder'] }))} size="small">
              <MenuItem value="none">{getText('noReminder', language)}</MenuItem>
              <MenuItem value="alarm">{getText('alarmSoundReminder', language)}</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={saveEvent}>{getText('save', language)}</Button>
              <Button variant="outlined" onClick={() => setOpenForm(false)}>{getText('cancel', language)}</Button>
            </Box>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
}
