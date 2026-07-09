import type { AiConnection, AlarmRecord, AppSettings, PlannerEvent, UserProfile } from '../types/domain'

type DatabaseStatus = 'idle' | 'ready' | 'error' | 'unsupported'

type DatabaseClient = {
  execute: (query: string, bindings?: unknown[]) => Promise<unknown>
  select: (query: string, bindings?: unknown[]) => Promise<unknown[]>
}

type PersistenceSnapshot = {
  users: UserProfile[]
  events: PlannerEvent[]
  alarms: AlarmRecord[]
  settings: AppSettings[]
  aiConnections: AiConnection[]
}

let databaseStatus: DatabaseStatus = 'idle'
let lastError = ''
let databasePromise: Promise<DatabaseClient | null> | null = null

function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
}

async function openDatabase(): Promise<DatabaseClient | null> {
  if (!isTauriRuntime()) {
    databaseStatus = 'unsupported'
    lastError = 'Tauri runtime not available'
    return null
  }

  if (!databasePromise) {
    databasePromise = (async () => {
      try {
        const { default: Database } = await import('@tauri-apps/plugin-sql')
        const database = await Database.load('sqlite:pollito.db')
        await database.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT,
            password TEXT,
            username TEXT NOT NULL,
            display_name TEXT,
            profile_image TEXT,
            role TEXT
          )
        `)
        await database.execute(`
          CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            description TEXT,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            color TEXT,
            reminder TEXT,
            completed INTEGER DEFAULT 0,
            created_at TEXT
          )
        `)
        await database.execute(`
          CREATE TABLE IF NOT EXISTS alarms (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            name TEXT,
            time TEXT,
            sound TEXT,
            repeat_days TEXT,
            enabled INTEGER DEFAULT 1,
            snooze_minutes INTEGER DEFAULT 10,
            volume INTEGER DEFAULT 70,
            created_at TEXT
          )
        `)
        await database.execute(`
          CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            theme_preset TEXT,
            theme TEXT,
            language TEXT,
            font_size INTEGER,
            layout_density TEXT,
            default_alarm_sound TEXT,
            default_alarm_volume INTEGER,
            default_snooze_minutes INTEGER,
            vibration_preference TEXT
          )
        `)
        await database.execute(`
          CREATE TABLE IF NOT EXISTS ai_connections (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            provider TEXT,
            api_key TEXT,
            status TEXT,
            last_test_at TEXT,
            created_at TEXT
          )
        `)
        databaseStatus = 'ready'
        lastError = ''
        return database as DatabaseClient
      } catch (error) {
        databaseStatus = 'error'
        lastError = error instanceof Error ? error.message : 'Unable to open database'
        return null
      }
    })()
  }

  return databasePromise
}

export async function initializeDatabase() {
  await openDatabase()
}

export async function getDatabaseStatus() {
  await openDatabase()
  return { status: databaseStatus, lastError }
}

function toUserRow(user: UserProfile) {
  return [
    user.id,
    user.email,
    user.password,
    user.username,
    user.displayName,
    user.profilePicture ?? '',
    user.role,
  ]
}

function fromUserRow(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    email: String(row.email ?? ''),
    password: String(row.password ?? ''),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? ''),
    profilePicture: row.profile_image ? String(row.profile_image) : undefined,
    role: (row.role as UserProfile['role']) || 'user',
  }
}

function toEventRow(event: PlannerEvent) {
  return [event.id, event.userId ?? '', event.title, event.description ?? '', event.date, event.startTime, event.endTime, event.color, event.reminder, event.completed ? 1 : 0, event.createdAt]
}

function fromEventRow(row: Record<string, unknown>): PlannerEvent {
  return {
    id: String(row.id ?? ''),
    userId: row.user_id ? String(row.user_id) : undefined,
    title: String(row.title ?? ''),
    description: row.description ? String(row.description) : undefined,
    date: String(row.date ?? ''),
    startTime: String(row.start_time ?? ''),
    endTime: String(row.end_time ?? ''),
    color: (row.color as PlannerEvent['color']) || 'Warm',
    reminder: (row.reminder as PlannerEvent['reminder']) || 'none',
    completed: Boolean(row.completed),
    createdAt: String(row.created_at ?? ''),
  }
}

function toAlarmRow(alarm: AlarmRecord) {
  return [alarm.id, alarm.userId ?? '', alarm.title, alarm.name ?? alarm.title, alarm.time, alarm.sound, JSON.stringify(alarm.repeatDays), alarm.enabled ? 1 : 0, alarm.snoozeMinutes, alarm.volume, alarm.createdAt]
}

function fromAlarmRow(row: Record<string, unknown>): AlarmRecord {
  return {
    id: String(row.id ?? ''),
    userId: row.user_id ? String(row.user_id) : undefined,
    title: String(row.title ?? ''),
    name: row.name ? String(row.name) : undefined,
    time: String(row.time ?? ''),
    enabled: Boolean(row.enabled),
    repeatDays: row.repeat_days ? (JSON.parse(String(row.repeat_days)) as string[]) : [],
    sound: String(row.sound ?? ''),
    snoozeMinutes: Number(row.snooze_minutes ?? 10),
    volume: Number(row.volume ?? 70),
    createdAt: String(row.created_at ?? ''),
  }
}

function toSettingsRow(settings: AppSettings) {
  return [settings.id ?? crypto.randomUUID(), settings.userId ?? '', settings.themePreset, settings.theme ?? settings.themePreset, settings.language, settings.fontSize, settings.layoutDensity, settings.defaultAlarmSound, settings.defaultAlarmVolume, settings.defaultSnoozeMinutes, settings.vibrationPreference]
}

function fromSettingsRow(row: Record<string, unknown>): AppSettings {
  return {
    id: row.id ? String(row.id) : undefined,
    userId: row.user_id ? String(row.user_id) : undefined,
    themePreset: (row.theme_preset as AppSettings['themePreset']) || 'Warm',
    theme: row.theme ? String(row.theme) : undefined,
    language: (row.language as AppSettings['language']) || 'English',
    fontSize: Number(row.font_size ?? 16),
    layoutDensity: (row.layout_density as AppSettings['layoutDensity']) || 'spacious',
    defaultAlarmSound: String(row.default_alarm_sound ?? 'Soft Chime'),
    defaultAlarmVolume: Number(row.default_alarm_volume ?? 70),
    defaultSnoozeMinutes: Number(row.default_snooze_minutes ?? 10),
    vibrationPreference: (row.vibration_preference as AppSettings['vibrationPreference']) || 'On',
  }
}

function toAiConnectionRow(connection: AiConnection) {
  return [connection.id, connection.userId ?? '', connection.provider, connection.apiKey, connection.status, connection.lastTestAt ?? '', connection.createdAt]
}

function fromAiConnectionRow(row: Record<string, unknown>): AiConnection {
  return {
    id: String(row.id ?? ''),
    userId: row.user_id ? String(row.user_id) : undefined,
    provider: (row.provider as AiConnection['provider']) || 'openai',
    apiKey: String(row.api_key ?? ''),
    status: (row.status as AiConnection['status']) || 'idle',
    lastTestAt: row.last_test_at ? String(row.last_test_at) : undefined,
    createdAt: String(row.created_at ?? ''),
  }
}

async function writeTableRows(table: string, values: unknown[][]) {
  const database = await openDatabase()
  if (!database) {
    return false
  }

  await database.execute(`DELETE FROM ${table}`)
  if (values.length === 0) {
    return true
  }

  const placeholders = values.map(() => `(${Array(values[0].length).fill('?').join(', ')})`).join(', ')
  const query = `INSERT INTO ${table} VALUES ${placeholders}`
  await database.execute(query, values.flat())
  return true
}

export async function persistSnapshot(snapshot: PersistenceSnapshot) {
  const database = await openDatabase()
  if (!database) {
    return false
  }

  await writeTableRows('users', snapshot.users.map(toUserRow))
  await writeTableRows('events', snapshot.events.map(toEventRow))
  await writeTableRows('alarms', snapshot.alarms.map(toAlarmRow))
  await writeTableRows('settings', snapshot.settings.map(toSettingsRow))
  await writeTableRows('ai_connections', snapshot.aiConnections.map(toAiConnectionRow))
  return true
}

export async function readSnapshot(): Promise<PersistenceSnapshot | null> {
  const database = await openDatabase()
  if (!database) {
    return null
  }

  const [usersResult, eventsResult, alarmsResult, settingsResult, aiConnectionsResult] = await Promise.all([
    database.select('SELECT * FROM users'),
    database.select('SELECT * FROM events'),
    database.select('SELECT * FROM alarms'),
    database.select('SELECT * FROM settings'),
    database.select('SELECT * FROM ai_connections'),
  ])

  return {
    users: (usersResult as Record<string, unknown>[]).map(fromUserRow),
    events: (eventsResult as Record<string, unknown>[]).map(fromEventRow),
    alarms: (alarmsResult as Record<string, unknown>[]).map(fromAlarmRow),
    settings: (settingsResult as Record<string, unknown>[]).map(fromSettingsRow),
    aiConnections: (aiConnectionsResult as Record<string, unknown>[]).map(fromAiConnectionRow),
  }
}

export function getDatabaseSummary() {
  return {
    status: databaseStatus,
    lastError,
  }
}
