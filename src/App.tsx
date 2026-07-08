import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouter } from './app/AppRouter'
import './App.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8a5a2b',
      light: '#b8824d',
      dark: '#6a401f',
    },
    secondary: {
      main: '#5d7c5f',
    },
    background: {
      default: '#f7efe5',
      paper: '#fffdf8',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  },
  shape: {
    borderRadius: 16,
  },
})

function App() {
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
