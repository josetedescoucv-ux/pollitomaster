import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'
import { SectionCard } from '../../components/ui/SectionCard'
import { DeveloperSection } from './DeveloperSection'
import { UpdatesSection } from './UpdatesSection'
import { localStorageService } from '../../services/localStorageService'
import { getText } from '../../shared/i18n'
import type { AppSettings } from '../../types/domain'

const presetOptions: AppSettings['themePreset'][] = ['Warm', 'Dark', 'Minimal', 'Ocean', 'Forest']
const languageOptions: AppSettings['language'][] = ['English', 'Español', 'Français']

export function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth()
  const [settings, setSettings] = useState<AppSettings>(() => localStorageService.settings.get())
  const [accountForm, setAccountForm] = useState({ username: user?.username || '', displayName: user?.displayName || '', profilePicture: user?.profilePicture || '' })
  const [showDeveloper, setShowDeveloper] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        setShowDeveloper((current) => !current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSaveSettings = (changes: Partial<AppSettings>) => {
    const nextSettings = { ...settings, ...changes }
    localStorageService.settings.save(nextSettings)
    setSettings(nextSettings)
    window.dispatchEvent(new Event('pollito-settings-updated'))
  }

  const handleSaveAccount = () => {
    updateProfile({ username: accountForm.username, displayName: accountForm.displayName, profilePicture: accountForm.profilePicture })
  }

  const previewText = useMemo(() => {
    switch (settings.language) {
      case 'Español':
        return 'Configuración personal'
      case 'Français':
        return 'Paramètres personnels'
      default:
        return 'Personal settings'
    }
  }, [settings.language])

  return (
    <Stack spacing={2.5}>
      <SectionCard title={getText('account', settings.language)} description="Keep your local profile aligned with your current identity.">
        <Stack spacing={1.5}>
          <Alert severity="info">The current account is stored locally and can later support shared household profiles.</Alert>
          <TextField label={getText('username', settings.language)} value={accountForm.username} onChange={(event) => setAccountForm((current) => ({ ...current, username: event.target.value }))} size="small" />
          <TextField label={getText('displayName', settings.language)} value={accountForm.displayName} onChange={(event) => setAccountForm((current) => ({ ...current, displayName: event.target.value }))} size="small" />
          <TextField label={getText('uploadImage', settings.language)} value={accountForm.profilePicture} onChange={(event) => setAccountForm((current) => ({ ...current, profilePicture: event.target.value }))} size="small" />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleSaveAccount}>{getText('save', settings.language)}</Button>
            <Button color="inherit" startIcon={<LogOut size={16} />} onClick={signOut}>{getText('logout', settings.language)}</Button>
          </Box>
        </Stack>
      </SectionCard>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title={getText('appearance', settings.language)} description="Adjust the workspace tone to match your style.">
            <Stack spacing={1.5}>
              <FormControl size="small">
                <InputLabel>Theme preset</InputLabel>
                <Select value={settings.themePreset} label="Theme preset" onChange={(event) => handleSaveSettings({ themePreset: event.target.value as AppSettings['themePreset'] })}>
                  {presetOptions.map((preset) => <MenuItem key={preset} value={preset}>{preset}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Font size" type="number" value={settings.fontSize} onChange={(event) => handleSaveSettings({ fontSize: Number(event.target.value) })} size="small" />
              <FormControl size="small">
                <InputLabel>Layout density</InputLabel>
                <Select value={settings.layoutDensity} label="Layout density" onChange={(event) => handleSaveSettings({ layoutDensity: event.target.value as AppSettings['layoutDensity'] })}>
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="spacious">Spacious</MenuItem>
                </Select>
              </FormControl>
              <Chip icon={<Sparkles size={16} />} label={previewText} color="primary" variant="outlined" />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title={getText('language', settings.language)} description="Switch the interface language for your local experience.">
            <FormControl size="small" fullWidth>
              <InputLabel>Language</InputLabel>
              <Select value={settings.language} label="Language" onChange={(event) => handleSaveSettings({ language: event.target.value as AppSettings['language'] })}>
                {languageOptions.map((language) => <MenuItem key={language} value={language}>{language}</MenuItem>)}
              </Select>
            </FormControl>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title={getText('alarms', settings.language)} description="Set your default alarm behavior locally.">
        <Stack spacing={1.5}>
          <TextField label="Default alarm sound" value={settings.defaultAlarmSound} onChange={(event) => handleSaveSettings({ defaultAlarmSound: event.target.value })} size="small" />
          <TextField label="Default volume" type="number" value={settings.defaultAlarmVolume} onChange={(event) => handleSaveSettings({ defaultAlarmVolume: Number(event.target.value) })} size="small" />
          <TextField label="Default snooze duration" type="number" value={settings.defaultSnoozeMinutes} onChange={(event) => handleSaveSettings({ defaultSnoozeMinutes: Number(event.target.value) })} size="small" />
          <FormControl size="small">
            <InputLabel>Vibration preference</InputLabel>
            <Select value={settings.vibrationPreference} label="Vibration preference" onChange={(event) => handleSaveSettings({ vibrationPreference: event.target.value as AppSettings['vibrationPreference'] })}>
              <MenuItem value="On">On</MenuItem>
              <MenuItem value="Off">Off</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </SectionCard>

      <UpdatesSection />

      <SectionCard title={getText('data', settings.language)} description="Export your personal workspace data for backup.">
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => {
            const payload = {
              users: localStorageService.users.list(),
              events: localStorageService.plannerEvents.list(),
              alarms: localStorageService.alarms.list(),
              settings: localStorageService.settings.get(),
              aiConnections: localStorageService.aiConnections.list(),
            }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'pollito-backup.json'
            link.click()
            URL.revokeObjectURL(url)
          }}>{getText('exportData', settings.language)}</Button>
          <Button variant="outlined" onClick={() => {
            const input = window.prompt('Paste a backup JSON payload to restore')
            if (!input) return
            try {
              const payload = JSON.parse(input) as {
                users?: unknown
                events?: unknown
                alarms?: unknown
                settings?: unknown
                aiConnections?: unknown
              }
              if (payload.users) localStorageService.users.save(payload.users as never)
              if (payload.events) localStorageService.plannerEvents.save(payload.events as never)
              if (payload.alarms) localStorageService.alarms.save(payload.alarms as never)
              if (payload.settings) localStorageService.settings.save(payload.settings as never)
              if (payload.aiConnections) localStorageService.aiConnections.save(payload.aiConnections as never)
              window.dispatchEvent(new Event('pollito-settings-updated'))
            } catch {
              window.alert('The backup payload could not be restored.')
            }
          }}>{getText('importData', settings.language)}</Button>
          <Button variant="outlined" onClick={() => handleSaveSettings(settings)}>{getText('saveSettings', settings.language)}</Button>
        </Box>
      </SectionCard>

      {showDeveloper ? <DeveloperSection /> : null}
    </Stack>
  )
}
