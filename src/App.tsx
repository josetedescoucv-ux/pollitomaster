import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouter } from './app/AppRouter'
import './App.css'
import { localStorageService } from './services/localStorageService'
import type { AppSettings } from './types/domain'

type ThemePreset = AppSettings['themePreset']

function createAppTheme(preset: ThemePreset, fontSize: number, density: AppSettings['layoutDensity']) {
  const palettes: Record<ThemePreset, { primary: string; secondary: string; background: string; paper: string; text: string; muted: string }> = {
    Warm: { primary: '#7c5a3b', secondary: '#5f7765', background: '#f7efe5', paper: '#fffdf8', text: '#3e3022', muted: '#715b49' },
    Dark: { primary: '#8e6d4d', secondary: '#7fb08f', background: '#171412', paper: '#221c18', text: '#f8efe4', muted: '#cebda9' },
    Minimal: { primary: '#4b5563', secondary: '#7c8a96', background: '#f5f5f4', paper: '#ffffff', text: '#1f2937', muted: '#6b7280' },
    Ocean: { primary: '#2563eb', secondary: '#0f766e', background: '#eef7fb', paper: '#ffffff', text: '#0f172a', muted: '#475569' },
    Forest: { primary: '#2f5d44', secondary: '#4b7b52', background: '#f0f5ed', paper: '#ffffff', text: '#1f2a1f', muted: '#50604f' },
  }

  const palette = palettes[preset]

  return createTheme({
    palette: {
      mode: preset === 'Dark' ? 'dark' : 'light',
      primary: {
        main: palette.primary,
        light: `${palette.primary}CC`,
        dark: `${palette.primary}DD`,
      },
      secondary: {
        main: palette.secondary,
      },
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      text: {
        primary: palette.text,
        secondary: palette.muted,
      },
    },
    typography: {
      fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
      fontSize,
    },
    shape: {
      borderRadius: 16,
    },
    spacing: density === 'compact' ? 6 : 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 999,
          },
        },
      },
    },
  })
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => localStorageService.settings.get())

  useEffect(() => {
    const sync = () => setSettings(localStorageService.settings.get())
    window.addEventListener('pollito-settings-updated', sync)
    return () => window.removeEventListener('pollito-settings-updated', sync)
  }, [])

  const theme = useMemo(() => createAppTheme(settings.themePreset, settings.fontSize, settings.layoutDensity), [settings])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
