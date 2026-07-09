import { Alert, Box, Button, LinearProgress, Stack, Typography } from '@mui/material'
import { Download, RefreshCw } from 'lucide-react'
import { SectionCard } from '../../components/ui/SectionCard'
import { useUpdates } from '../../app/providers/UpdateProvider'

export function UpdatesSection() {
  const {
    status,
    currentVersion,
    availableUpdate,
    errorMessage,
    progressPercent,
    checkForUpdates,
    installUpdate,
    isDesktopApp,
  } = useUpdates()

  const isBusy = status === 'checking' || status === 'downloading' || status === 'installing'
  const showProgress = status === 'downloading' || status === 'installing'

  return (
    <SectionCard
      title="Updates"
      description="Keep Pollito Master up to date with signed desktop releases."
      action={
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshCw size={16} />}
          disabled={!isDesktopApp || isBusy}
          onClick={() => void checkForUpdates(true)}
        >
          Check for updates
        </Button>
      }
    >
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Current version: {currentVersion}
        </Typography>

        {!isDesktopApp ? (
          <Alert severity="info">Automatic updates are available in the Pollito Master desktop app.</Alert>
        ) : null}

        {status === 'checking' ? (
          <Typography variant="body2" color="text.secondary">
            Checking for updates...
          </Typography>
        ) : null}

        {status === 'up-to-date' ? (
          <Alert severity="success">Pollito Master is up to date.</Alert>
        ) : null}

        {status === 'available' && availableUpdate ? (
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" variant="outlined" startIcon={<Download size={16} />} onClick={() => void installUpdate()}>
                Update
              </Button>
            }
          >
            A new version of Pollito Master is available ({availableUpdate.version}).
          </Alert>
        ) : null}

        {availableUpdate?.body ? (
          <Typography variant="body2" color="text.secondary">
            {availableUpdate.body}
          </Typography>
        ) : null}

        {showProgress ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {status === 'installing' ? 'Installing update...' : 'Downloading update...'}
            </Typography>
            <LinearProgress variant={progressPercent === undefined ? 'indeterminate' : 'determinate'} value={progressPercent ?? 0} />
            {progressPercent !== undefined ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                {progressPercent}% complete
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {status === 'error' && errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
      </Stack>
    </SectionCard>
  )
}
