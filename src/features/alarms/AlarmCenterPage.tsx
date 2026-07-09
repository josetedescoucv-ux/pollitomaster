import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { Plus, Trash2, Volume2 } from 'lucide-react'
import { localStorageService } from '../../services/localStorageService'
import { getText } from '../../shared/i18n'
import type { AlarmRecord, AppSettings } from '../../types/domain'

type RepeatDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

type AlarmDraft = {
  id: string
  title: string
  time: string
  enabled: boolean
  repeatDays: RepeatDay[]
  sound: string
  snoozeMinutes: number
  volume: number
}

const initialAlarms: AlarmRecord[] = [
  { id: '1', title: 'Morning Focus', time: '07:30', enabled: true, repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], sound: 'Soft Chime', snoozeMinutes: 5, volume: 70, createdAt: new Date().toISOString() },
  { id: '2', title: 'Wrap Up', time: '18:00', enabled: false, repeatDays: ['Mon', 'Wed', 'Fri'], sound: 'Gentle Tone', snoozeMinutes: 10, volume: 65, createdAt: new Date().toISOString() },
]

const sounds = ['Soft Chime', 'Gentle Tone', 'Bright Pulse', 'Classic Bell', 'Ocean Wave', 'Forest Bell', 'Crisp Spark', 'Midnight Glow', 'Morning Beam', 'Solar Tone']
const snoozeOptions = [5, 10, 15, 20]
const repeatChoices: RepeatDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildDraft(): AlarmDraft {
  return {
    id: crypto.randomUUID(),
    title: '',
    time: '08:00',
    enabled: true,
    repeatDays: ['Mon', 'Wed', 'Fri'],
    sound: 'Soft Chime',
    snoozeMinutes: 10,
    volume: 70,
  }
}

function previewSound(soundName: string, volume: number) {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextCtor) {
    return
  }

  const context = new AudioContextCtor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const frequencies: Record<string, number> = {
    'Soft Chime': 880,
    'Gentle Tone': 698,
    'Bright Pulse': 1046,
    'Classic Bell': 523,
    'Ocean Wave': 659,
    'Forest Bell': 784,
    'Crisp Spark': 987,
    'Midnight Glow': 587,
    'Morning Beam': 783,
    'Solar Tone': 932,
  }

  oscillator.type = 'sine'
  oscillator.frequency.value = frequencies[soundName] || 880
  gain.gain.value = Math.max(0.05, volume / 100)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.25)
  setTimeout(() => context.close(), 300)
}

export function AlarmCenterPage() {
  const [settings, setSettings] = useState<AppSettings>(() => localStorageService.settings.get())
  const [alarms, setAlarms] = useState<AlarmRecord[]>(() => localStorageService.alarms.list().length > 0 ? localStorageService.alarms.list() : initialAlarms)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<AlarmDraft>(buildDraft())

  useEffect(() => {
    localStorageService.alarms.save(alarms)
  }, [alarms])

  useEffect(() => {
    const currentSettings = localStorageService.settings.get()
    setSettings(currentSettings)
    setDraft((current) => ({ ...current, sound: current.sound || currentSettings.defaultAlarmSound, volume: current.volume || currentSettings.defaultAlarmVolume, snoozeMinutes: current.snoozeMinutes || currentSettings.defaultSnoozeMinutes }))
  }, [])

  const persistSettings = (changes: Partial<AppSettings>) => {
    const nextSettings = { ...settings, ...changes }
    localStorageService.settings.save(nextSettings)
    setSettings(nextSettings)
    window.dispatchEvent(new Event('pollito-settings-updated'))
  }

  const addAlarm = () => {
    const nextAlarm: AlarmRecord = {
      id: draft.id,
      title: draft.title || 'Untitled alarm',
      time: draft.time,
      enabled: draft.enabled,
      repeatDays: draft.repeatDays,
      sound: draft.sound,
      snoozeMinutes: draft.snoozeMinutes,
      volume: draft.volume,
      createdAt: new Date().toISOString(),
    }
    setAlarms((current) => [nextAlarm, ...current])
    setDraft(buildDraft())
    setEditingId(null)
  }

  const updateAlarm = () => {
    if (!editingId) return
    setAlarms((current) => current.map((alarm) => (alarm.id === editingId ? { ...alarm, title: draft.title || 'Untitled alarm', time: draft.time, enabled: draft.enabled, repeatDays: draft.repeatDays, sound: draft.sound, snoozeMinutes: draft.snoozeMinutes, volume: draft.volume } : alarm)))
    setEditingId(null)
    setDraft(buildDraft())
  }

  const removeAlarm = (id: string) => {
    setAlarms((current) => current.filter((alarm) => alarm.id !== id))
    if (editingId === id) {
      setEditingId(null)
    }
  }

  const toggleAlarm = (id: string) => {
    setAlarms((current) => current.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)))
  }

  const startEdit = (alarm: AlarmRecord) => {
    setEditingId(alarm.id)
    setDraft({
      id: alarm.id,
      title: alarm.title,
      time: alarm.time,
      enabled: alarm.enabled,
      repeatDays: alarm.repeatDays as RepeatDay[],
      sound: alarm.sound,
      snoozeMinutes: alarm.snoozeMinutes,
      volume: alarm.volume,
    })
  }

  const toggleRepeatDay = (day: RepeatDay) => {
    setDraft((current) => ({
      ...current,
      repeatDays: current.repeatDays.includes(day) ? current.repeatDays.filter((value) => value !== day) : [...current.repeatDays, day],
    }))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{getText('alarmsTitle', settings.language)}</Typography>
          <Typography variant="body2" color="text.secondary">{getText('alarmsSubtitle', settings.language)}</Typography>
        </Box>
        <Button startIcon={<Plus size={16} />} variant="contained" onClick={() => { setEditingId(null); setDraft(buildDraft()) }}>{getText('addAlarm', settings.language)}</Button>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{getText('existingAlarms', settings.language)}</Typography>
          <TextField label={getText('name', settings.language)} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} size="small" />
          <TextField label={getText('time', settings.language)} type="time" value={draft.time} onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))} size="small" />
          <TextField select label={getText('sound', settings.language)} value={draft.sound} onChange={(event) => setDraft((current) => ({ ...current, sound: event.target.value }))} size="small">
            {sounds.map((sound) => <MenuItem key={sound} value={sound}>{sound}</MenuItem>)}
          </TextField>
          <TextField label="Volume" type="number" value={draft.volume} onChange={(event) => setDraft((current) => ({ ...current, volume: Number(event.target.value) }))} size="small" />
          <TextField select label="Snooze" value={draft.snoozeMinutes} onChange={(event) => setDraft((current) => ({ ...current, snoozeMinutes: Number(event.target.value) }))} size="small">
            {snoozeOptions.map((option) => <MenuItem key={option} value={option}>{option} min</MenuItem>)}
          </TextField>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{getText('repeatDays', settings.language)}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {repeatChoices.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  clickable
                  color={draft.repeatDays.includes(day) ? 'primary' : 'default'}
                  variant={draft.repeatDays.includes(day) ? 'filled' : 'outlined'}
                  onClick={() => toggleRepeatDay(day)}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={editingId ? updateAlarm : addAlarm}>{getText('save', settings.language)}</Button>
            <Button variant="outlined" onClick={() => { setEditingId(null); setDraft(buildDraft()) }}>{getText('cancel', settings.language)}</Button>
            <Button variant="text" startIcon={<Volume2 size={16} />} onClick={() => previewSound(draft.sound, draft.volume)}>
              {getText('previewSound', settings.language)}
            </Button>
          </Box>

          <Divider />

          <Stack spacing={1.2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Defaults</Typography>
            <TextField label="Default alarm sound" value={settings.defaultAlarmSound} onChange={(event) => persistSettings({ defaultAlarmSound: event.target.value })} size="small" />
            <TextField label="Default volume" type="number" value={settings.defaultAlarmVolume} onChange={(event) => persistSettings({ defaultAlarmVolume: Number(event.target.value) })} size="small" />
            <TextField label="Default snooze duration" type="number" value={settings.defaultSnoozeMinutes} onChange={(event) => persistSettings({ defaultSnoozeMinutes: Number(event.target.value) })} size="small" />
          </Stack>
        </CardContent>
      </Card>

      <Divider />

      <Stack spacing={1.5}>
        {alarms.map((alarm) => (
          <Card key={alarm.id} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', py: 2.25 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{alarm.title || 'Untitled alarm'}</Typography>
                <Typography variant="body2" color="text.secondary">{alarm.time} • {alarm.sound} • Volume {alarm.volume}%</Typography>
                <Typography variant="body2" color="text.secondary">Repeats {alarm.repeatDays.join(', ')} • Snooze {alarm.snoozeMinutes} min</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControlLabel control={<Switch checked={alarm.enabled} onChange={() => toggleAlarm(alarm.id)} />} label={alarm.enabled ? getText('enabled', settings.language) : getText('disabled', settings.language)} />
                <Button variant="outlined" size="small" onClick={() => startEdit(alarm)}>Edit</Button>
                <Button variant="text" color="error" size="small" onClick={() => removeAlarm(alarm.id)} startIcon={<Trash2 size={16} />}>
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
