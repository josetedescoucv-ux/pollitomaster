export type UserRole = 'user' | 'administrator'

export type UserProfile = {
  id: string
  email: string
  password: string
  displayName: string
  username: string
  profilePicture?: string
  role: UserRole
}

export type PlannerEvent = {
  id: string
  userId?: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  color: 'Warm' | 'Ocean' | 'Forest' | 'Rose' | 'Amber'
  reminder: 'none' | 'alarm'
  completed: boolean
  createdAt: string
}

export type AlarmRecord = {
  id: string
  userId?: string
  title: string
  name?: string
  time: string
  enabled: boolean
  repeatDays: string[]
  sound: string
  snoozeMinutes: number
  volume: number
  createdAt: string
}

export type AppSettings = {
  id?: string
  userId?: string
  themePreset: 'Warm' | 'Dark' | 'Minimal' | 'Ocean' | 'Forest'
  theme?: string
  language: 'English' | 'Español' | 'Français'
  fontSize: number
  layoutDensity: 'compact' | 'spacious'
  defaultAlarmSound: string
  defaultAlarmVolume: number
  defaultSnoozeMinutes: number
  vibrationPreference: 'On' | 'Off'
}

export type AiTask = {
  id: string
  name: string
  prompt: string
  result: string
  createdAt: string
}

export type AiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type AiConnection = {
  id: string
  userId?: string
  provider: 'openai' | 'claude'
  apiKey: string
  status: 'idle' | 'connected' | 'error'
  lastTestAt?: string
  createdAt: string
}
