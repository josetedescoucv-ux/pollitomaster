import { appendLog } from './logService'
import { getDatabaseStatus, initializeDatabase, persistSnapshot, readSnapshot } from './databaseService'
import type { AiConnection, AlarmRecord, AppSettings, PlannerEvent, UserProfile } from '../types/domain'

const STORAGE_KEYS = {
  users: 'pollito-users',
  plannerEvents: 'pollito-planner-events',
  alarms: 'pollito-alarms',
  settings: 'pollito-settings',
  aiConnections: 'pollito-ai-connections',
} as const

type PersistenceStore = {
  users: UserProfile[]
  plannerEvents: PlannerEvent[]
  alarms: AlarmRecord[]
  settings: AppSettings
  aiConnections: AiConnection[]
}

const defaultSettings: AppSettings = {
  themePreset: 'Warm',
  language: 'English',
  fontSize: 16,
  layoutDensity: 'spacious',
  defaultAlarmSound: 'Soft Chime',
  defaultAlarmVolume: 70,
  defaultSnoozeMinutes: 10,
  vibrationPreference: 'On',
}

const store: PersistenceStore = {
  users: [],
  plannerEvents: [],
  alarms: [],
  settings: defaultSettings,
  aiConnections: [],
}

let storageMode: 'database' | 'localStorage' = 'localStorage'
let initializationPromise: Promise<void> | null = null

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function hydrateFromLocalStorage() {
  store.users = readJson<UserProfile[]>(STORAGE_KEYS.users, [])
  store.plannerEvents = readJson<PlannerEvent[]>(STORAGE_KEYS.plannerEvents, [])
  store.alarms = readJson<AlarmRecord[]>(STORAGE_KEYS.alarms, [])
  store.settings = readJson<AppSettings>(STORAGE_KEYS.settings, defaultSettings)
  store.aiConnections = readJson<AiConnection[]>(STORAGE_KEYS.aiConnections, [])
}

function commitToLocalStorage() {
  writeJson(STORAGE_KEYS.users, store.users)
  writeJson(STORAGE_KEYS.plannerEvents, store.plannerEvents)
  writeJson(STORAGE_KEYS.alarms, store.alarms)
  writeJson(STORAGE_KEYS.settings, store.settings)
  writeJson(STORAGE_KEYS.aiConnections, store.aiConnections)
}

async function initializePersistence() {
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    hydrateFromLocalStorage()
    appendLog('Persistence initialized in local storage mode')

    try {
      await initializeDatabase()
      const databaseStatus = await getDatabaseStatus()
      if (databaseStatus.status === 'ready') {
        storageMode = 'database'
        appendLog('Database ready; syncing persistence to SQLite')
        const snapshot = await readSnapshot()
        if (snapshot) {
          store.users = snapshot.users.length > 0 ? snapshot.users : store.users
          store.plannerEvents = snapshot.events.length > 0 ? snapshot.events : store.plannerEvents
          store.alarms = snapshot.alarms.length > 0 ? snapshot.alarms : store.alarms
          store.settings = snapshot.settings[0] || store.settings
          store.aiConnections = snapshot.aiConnections.length > 0 ? snapshot.aiConnections : store.aiConnections
          commitToLocalStorage()
        }
      } else {
        storageMode = 'localStorage'
        appendLog(`Database unavailable: ${databaseStatus.lastError || 'local fallback used'}`)
      }
    } catch (error) {
      storageMode = 'localStorage'
      appendLog(error instanceof Error ? error.message : 'Persistence init failed')
    }
  })()

  return initializationPromise
}

void initializePersistence()

async function syncDatabase() {
  if (storageMode !== 'database') {
    return
  }

  try {
    await persistSnapshot({
      users: store.users,
      events: store.plannerEvents,
      alarms: store.alarms,
      settings: [store.settings],
      aiConnections: store.aiConnections,
    })
    appendLog('Persistence snapshot synced to SQLite')
  } catch (error) {
    appendLog(error instanceof Error ? error.message : 'Database sync failed')
  }
}

function updateStoreValue<K extends keyof PersistenceStore>(key: K, value: PersistenceStore[K]) {
  store[key] = value
  commitToLocalStorage()
  void syncDatabase()
}

export function getStorageDiagnostics() {
  return {
    mode: storageMode,
    users: store.users.length,
    events: store.plannerEvents.length,
    alarms: store.alarms.length,
    settingsSaved: Boolean(store.settings),
  }
}

export const localStorageService = {
  users: {
    list(): UserProfile[] {
      void initializePersistence()
      return store.users
    },
    save(users: UserProfile[]) {
      updateStoreValue('users', users)
    },
  },
  plannerEvents: {
    list(): PlannerEvent[] {
      void initializePersistence()
      return store.plannerEvents
    },
    save(events: PlannerEvent[]) {
      updateStoreValue('plannerEvents', events)
    },
  },
  alarms: {
    list(): AlarmRecord[] {
      void initializePersistence()
      return store.alarms
    },
    save(alarms: AlarmRecord[]) {
      updateStoreValue('alarms', alarms)
    },
  },
  settings: {
    get(): AppSettings {
      void initializePersistence()
      return store.settings
    },
    save(settings: AppSettings) {
      updateStoreValue('settings', settings)
    },
  },
  aiConnections: {
    list(): AiConnection[] {
      void initializePersistence()
      return store.aiConnections
    },
    save(connections: AiConnection[]) {
      updateStoreValue('aiConnections', connections)
    },
  },
}
