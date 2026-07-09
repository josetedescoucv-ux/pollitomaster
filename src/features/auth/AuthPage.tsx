import { useEffect, useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Chip, Divider, Stack, TextField, Typography } from '@mui/material'
import { LockKeyhole, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'

export function AuthPage() {
  const { user, signInWithEmail, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/planner')
    }
  }, [navigate, user])

  const handleSubmit = () => {
    if (mode === 'login') {
      const success = signInWithEmail(email, password)
      setMessage(success ? 'Signed in successfully.' : 'Unable to sign in with those credentials.')
      if (success) {
        navigate('/planner')
      }
      return
    }

    const success = signUp({ email, password, username, displayName })
    setMessage(success ? 'Account created successfully.' : 'An account with that email already exists.')
    if (success) {
      navigate('/planner')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: 'linear-gradient(135deg, #f7efe5 0%, #efe3d2 100%)',
      }}
    >
      <Card elevation={0} sx={{ width: '100%', maxWidth: 460, borderRadius: 4, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.96)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><LockKeyhole size={20} /></Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Welcome to Pollito Master</Typography>
                  <Typography variant="body2" color="text.secondary">Secure your workspace and stay in sync.</Typography>
                </Box>
              </Box>
              <Chip icon={<Sparkles size={14} />} label="Desktop-first productivity" color="primary" variant="outlined" />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant={mode === 'login' ? 'contained' : 'outlined'} onClick={() => setMode('login')}>Login</Button>
              <Button variant={mode === 'signup' ? 'contained' : 'outlined'} onClick={() => setMode('signup')}>Create account</Button>
            </Stack>

            <Stack spacing={1.5}>
              <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth size="small" />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth size="small" />

              {mode === 'signup' ? (
                <>
                  <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} fullWidth size="small" />
                  <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} fullWidth size="small" />
                </>
              ) : null}
            </Stack>

            <Button variant="contained" fullWidth onClick={handleSubmit}>{mode === 'login' ? 'Continue' : 'Create account'}</Button>

            <Divider>or</Divider>

            <Button variant="outlined" fullWidth onClick={() => signInWithGoogle(email || undefined)}>
              Continue with Google
            </Button>

            {message ? <Typography variant="body2" color="text.secondary">{message}</Typography> : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
