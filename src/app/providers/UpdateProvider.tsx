import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, Box, Button, Snackbar } from '@mui/material'
import {
  checkForUpdates,
  downloadAndInstallUpdate,
  getCurrentVersion,
  getDownloadProgressPercent,
  isTauriRuntime,
  type UpdateInfo,
  type UpdateProgress,
  type UpdateStatus,
} from '../../services/updateService'

type UpdateContextValue = {
  status: UpdateStatus
  currentVersion: string
  availableUpdate: UpdateInfo | null
  errorMessage: string
  progress: UpdateProgress | null
  progressPercent?: number
  checkForUpdates: (manual?: boolean) => Promise<void>
  installUpdate: () => Promise<void>
  dismissPrompt: () => void
  isDesktopApp: boolean
}

const UpdateContext = createContext<UpdateContextValue | null>(null)

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<UpdateStatus>(() => (isTauriRuntime() ? 'idle' : 'unsupported'))
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState<UpdateProgress | null>(null)
  const [promptOpen, setPromptOpen] = useState(false)

  const currentVersion = getCurrentVersion()
  const progressPercent = progress ? getDownloadProgressPercent(progress) : undefined

  const checkUpdates = useCallback(async (manual = false) => {
    if (!isTauriRuntime()) {
      setStatus('unsupported')
      return
    }

    setStatus('checking')
    setErrorMessage('')

    const result = await checkForUpdates()

    if (result.error) {
      setStatus('error')
      setErrorMessage(result.error)
      setAvailableUpdate(null)
      return
    }

    if (result.update) {
      setAvailableUpdate(result.update)
      setStatus('available')
      if (!manual) {
        setPromptOpen(true)
      }
      return
    }

    setAvailableUpdate(null)
    setStatus('up-to-date')
  }, [])

  const installUpdate = useCallback(async () => {
    if (!availableUpdate) {
      return
    }

    setPromptOpen(false)
    setStatus('downloading')
    setErrorMessage('')
    setProgress({ downloaded: 0 })

    const result = await downloadAndInstallUpdate((nextProgress) => {
      setProgress(nextProgress)
      setStatus('downloading')
    })

    if (result.error) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }

    setStatus('installing')
  }, [availableUpdate])

  useEffect(() => {
    if (isTauriRuntime()) {
      void checkUpdates(false)
    }
  }, [checkUpdates])

  const value = useMemo<UpdateContextValue>(
    () => ({
      status,
      currentVersion,
      availableUpdate,
      errorMessage,
      progress,
      progressPercent,
      checkForUpdates: checkUpdates,
      installUpdate,
      dismissPrompt: () => setPromptOpen(false),
      isDesktopApp: isTauriRuntime(),
    }),
    [status, currentVersion, availableUpdate, errorMessage, progress, progressPercent, checkUpdates, installUpdate],
  )

  return (
    <UpdateContext.Provider value={value}>
      {children}
      <Snackbar
        open={promptOpen && status === 'available' && Boolean(availableUpdate)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={(_, reason) => {
          if (reason === 'clickaway') {
            return
          }
          setPromptOpen(false)
        }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{ width: '100%', alignItems: 'center' }}
          action={
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button color="inherit" size="small" onClick={() => setPromptOpen(false)}>
                Later
              </Button>
              <Button color="inherit" size="small" variant="outlined" onClick={() => void installUpdate()}>
                Update
              </Button>
            </Box>
          }
        >
          A new version of Pollito Master is available ({availableUpdate?.version}).
        </Alert>
      </Snackbar>
    </UpdateContext.Provider>
  )
}

export function useUpdates() {
  const context = useContext(UpdateContext)

  if (!context) {
    throw new Error('useUpdates must be used within UpdateProvider')
  }

  return context
}
