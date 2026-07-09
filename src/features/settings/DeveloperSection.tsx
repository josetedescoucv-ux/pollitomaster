import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { Bug, DatabaseZap, HardDrive, TerminalSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDatabaseSummary } from '../../services/databaseService'
import { exportLogs, getLogSummary } from '../../services/logService'
import { getStorageDiagnostics } from '../../services/localStorageService'
import { getCurrentVersion } from '../../services/updateService'

export function DeveloperSection() {
  const [status, setStatus] = useState(getDatabaseSummary())
  const [storage, setStorage] = useState(getStorageDiagnostics())
  const [logs, setLogs] = useState(getLogSummary())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStatus(getDatabaseSummary())
      setStorage(getStorageDiagnostics())
      setLogs(getLogSummary())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <Box sx={{ borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)', p: 2.5 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Developer tools</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip icon={<DatabaseZap size={16} />} label={`DB: ${status.status}`} color={status.status === 'ready' ? 'success' : 'default'} variant="outlined" />
          <Chip icon={<HardDrive size={16} />} label={`Storage: ${storage.mode}`} color="primary" variant="outlined" />
          <Chip icon={<Bug size={16} />} label={`Logs: ${logs.count}`} color="default" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary">Version: {getCurrentVersion()}</Typography>
        <Typography variant="body2" color="text.secondary">Database status: {status.status}</Typography>
        <Typography variant="body2" color="text.secondary">Storage status: {storage.mode}</Typography>
        <Typography variant="body2" color="text.secondary">Latest log: {logs.latest}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<TerminalSquare size={16} />} onClick={() => exportLogs()}>Export logs</Button>
          <Button variant="outlined" onClick={() => window.alert('Test alarm placeholder - desktop notifications will be wired in a later step.')}>Test alarm</Button>
        </Box>
      </Stack>
    </Box>
  )
}
