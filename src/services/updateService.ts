import { appendLog } from './logService'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'up-to-date'
  | 'downloading'
  | 'installing'
  | 'error'
  | 'unsupported'

export type UpdateInfo = {
  version: string
  currentVersion: string
  body?: string
  date?: string
}

export type UpdateProgress = {
  downloaded: number
  contentLength?: number
}

type UpdateRuntime = {
  version: string
  body?: string
  date?: string
  downloadAndInstall: (
    onEvent?: (event: { event: string; data?: { chunkLength?: number; contentLength?: number } }) => void,
  ) => Promise<void>
}

export function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
}

export function getCurrentVersion() {
  return import.meta.env.VITE_APP_VERSION
}

function formatUpdateError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to check for updates right now.'
}

async function loadUpdater() {
  const { check } = await import('@tauri-apps/plugin-updater')
  return check
}

export async function checkForUpdates(): Promise<{ update: UpdateInfo | null; error?: string }> {
  if (!isTauriRuntime()) {
    return { update: null, error: 'Updates are only available in the desktop app.' }
  }

  try {
    const check = await loadUpdater()
    const result = (await check()) as UpdateRuntime | null

    if (!result) {
      return { update: null }
    }

    return {
      update: {
        version: result.version,
        currentVersion: getCurrentVersion(),
        body: result.body,
        date: result.date,
      },
    }
  } catch (error) {
    const message = formatUpdateError(error)
    appendLog(`update-check-failed: ${message}`)
    return { update: null, error: message }
  }
}

export async function downloadAndInstallUpdate(
  onProgress?: (progress: UpdateProgress) => void,
): Promise<{ error?: string }> {
  if (!isTauriRuntime()) {
    return { error: 'Updates are only available in the desktop app.' }
  }

  try {
    const check = await loadUpdater()
    const update = (await check()) as UpdateRuntime | null

    if (!update) {
      return { error: 'No update is available to install.' }
    }

    let downloaded = 0

    await update.downloadAndInstall((event) => {
      if (event.event === 'Started') {
        downloaded = 0
        onProgress?.({ downloaded, contentLength: event.data?.contentLength })
        return
      }

      if (event.event === 'Progress') {
        downloaded += event.data?.chunkLength ?? 0
        onProgress?.({ downloaded, contentLength: event.data?.contentLength })
        return
      }

      if (event.event === 'Finished') {
        onProgress?.({ downloaded, contentLength: downloaded })
      }
    })

    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
    return {}
  } catch (error) {
    const message = formatUpdateError(error)
    appendLog(`update-install-failed: ${message}`)
    return { error: message }
  }
}

export function getDownloadProgressPercent(progress: UpdateProgress) {
  if (!progress.contentLength || progress.contentLength <= 0) {
    return undefined
  }

  return Math.min(100, Math.round((progress.downloaded / progress.contentLength) * 100))
}
