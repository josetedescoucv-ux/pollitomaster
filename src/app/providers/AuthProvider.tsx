import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { localStorageService } from '../../services/localStorageService'
import type { UserProfile, UserRole } from '../../types/domain'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  username: string
  profilePicture?: string
  role: UserRole
}

type AuthContextValue = {
  user: AuthUser | null
  signInWithEmail: (email: string, password: string) => boolean
  signUp: (input: {
    email: string
    password: string
    username: string
    displayName: string
    profilePicture?: string
  }) => boolean
  signInWithGoogle: (email?: string) => boolean
  updateProfile: (input: { username: string; displayName: string; profilePicture?: string }) => boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'pollito-auth-user'
const ADMIN_EMAIL = 'josetedesco.ucv@gmail.com'

function resolveRole(email: string): UserRole {
  return email.toLowerCase() === ADMIN_EMAIL ? 'administrator' : 'user'
}

function mapProfileToAuthUser(profile: UserProfile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    username: profile.username,
    profilePicture: profile.profilePicture,
    role: profile.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        setUser(JSON.parse(storedUser) as AuthUser)
      }
    } catch {
      setUser(null)
    }
  }, [])

  const persistUser = (authUser: AuthUser) => {
    setUser(authUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  }

  const signInWithEmail = (email: string, password: string) => {
    const users = localStorageService.users.list()
    const match = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password)

    if (!match) {
      return false
    }

    persistUser(mapProfileToAuthUser(match))
    return true
  }

  const signUp = (input: {
    email: string
    password: string
    username: string
    displayName: string
    profilePicture?: string
  }) => {
    const users = localStorageService.users.list()
    const exists = users.some((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase())

    if (exists) {
      return false
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      username: input.username,
      profilePicture: input.profilePicture,
      role: resolveRole(input.email),
    }

    const nextUsers = [...users, newUser]
    localStorageService.users.save(nextUsers)
    persistUser(mapProfileToAuthUser(newUser))
    return true
  }

  const signInWithGoogle = (email?: string) => {
    const requestedEmail = email?.trim() || window.prompt('Enter your Google email to continue (demo flow)')?.trim()

    if (!requestedEmail) {
      return false
    }

    const users = localStorageService.users.list()
    const existing = users.find((candidate) => candidate.email.toLowerCase() === requestedEmail.toLowerCase())

    if (existing) {
      persistUser(mapProfileToAuthUser(existing))
      return true
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email: requestedEmail,
      password: 'google-demo',
      displayName: requestedEmail.split('@')[0],
      username: requestedEmail.split('@')[0].toLowerCase(),
      role: resolveRole(requestedEmail),
    }

    const nextUsers = [...users, newUser]
    localStorageService.users.save(nextUsers)
    persistUser(mapProfileToAuthUser(newUser))
    return true
  }

  const updateProfile = (input: { username: string; displayName: string; profilePicture?: string }) => {
    if (!user) {
      return false
    }

    const users = localStorageService.users.list()
    const nextUsers = users.map((candidate) => (candidate.id === user.id ? { ...candidate, username: input.username, displayName: input.displayName, profilePicture: input.profilePicture } : candidate))
    localStorageService.users.save(nextUsers)

    const updatedUser: AuthUser = {
      ...user,
      username: input.username,
      displayName: input.displayName,
      profilePicture: input.profilePicture,
    }

    persistUser(updatedUser)
    return true
  }

  const signOut = () => {
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, signInWithEmail, signUp, signInWithGoogle, updateProfile, signOut }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
