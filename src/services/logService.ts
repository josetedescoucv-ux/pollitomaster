const LOG_KEY = 'pollito-app-logs'

export function appendLog(message: string) {
  try {
    const logs = getLogs()
    logs.push(`${new Date().toISOString()} ${message}`)
    const nextLogs = logs.slice(-100)
    window.localStorage.setItem(LOG_KEY, JSON.stringify(nextLogs))
  } catch {
    // ignore storage write failures
  }
}

export function getLogs() {
  try {
    const raw = window.localStorage.getItem(LOG_KEY)
    if (!raw) return [] as string[]
    return JSON.parse(raw) as string[]
  } catch {
    return [] as string[]
  }
}

export function exportLogs() {
  const logs = getLogs()
  const blob = new Blob([logs.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pollito-logs.txt'
  link.click()
  URL.revokeObjectURL(url)
}

export function getLogSummary() {
  const logs = getLogs()
  return {
    count: logs.length,
    latest: logs[logs.length - 1] ?? 'No logs recorded',
  }
}
