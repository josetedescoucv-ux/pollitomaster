import { useMemo, useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { BrainCircuit, Sparkles, Trash2, CheckCircle2 } from 'lucide-react'
import { localStorageService } from '../../services/localStorageService'
import { sendAiMessage, testAiConnection } from '../../services/aiService'
import { getText } from '../../shared/i18n'
import type { AiConnection, AiMessage, AiTask } from '../../types/domain'

const providerOptions = [
  { value: 'openai', label: 'OpenAI', icon: <BrainCircuit size={18} /> },
  { value: 'claude', label: 'Anthropic Claude', icon: <Sparkles size={18} /> },
] as const

const starterMessages: AiMessage[] = [
  { id: 'welcome', role: 'assistant', content: 'I can help with productivity suggestions, schedule summaries, priority planning, and weekly organization.' },
]

export function ConnectionsPage() {
  const settings = localStorageService.settings.get()
  const [provider, setProvider] = useState<'openai' | 'claude'>('openai')
  const [apiKey, setApiKey] = useState('')
  const [connections, setConnections] = useState<AiConnection[]>(() => localStorageService.aiConnections.list())
  const [messages, setMessages] = useState<AiMessage[]>(starterMessages)
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('')
  const [tasks, setTasks] = useState<AiTask[]>([])
  const [taskName, setTaskName] = useState('')
  const [taskPrompt, setTaskPrompt] = useState('')

  const saveConnection = async () => {
    const connectionResult = await testAiConnection(provider, apiKey)
    if (!connectionResult.ok) {
      setStatus(connectionResult.message)
      return
    }

    const nextConnections = [
      ...connections.filter((item) => item.provider !== provider),
      { id: `${provider}-${Date.now()}`, provider, apiKey, status: 'connected' as const, lastTestAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    ]
    setConnections(nextConnections)
    localStorageService.aiConnections.save(nextConnections)
    setStatus(`${provider === 'openai' ? 'OpenAI' : 'Claude'} connection saved locally.`)
  }

  const removeConnection = (providerName: 'openai' | 'claude') => {
    const nextConnections = connections.filter((item) => item.provider !== providerName)
    setConnections(nextConnections)
    localStorageService.aiConnections.save(nextConnections)
    setStatus(`${providerName === 'openai' ? 'OpenAI' : 'Claude'} connection removed.`)
  }

  const saveTask = () => {
    if (!taskName.trim() || !taskPrompt.trim()) return
    const nextTask: AiTask = { id: crypto.randomUUID(), name: taskName, prompt: taskPrompt, result: 'Ready to run.', createdAt: new Date().toISOString() }
    const nextTasks = [nextTask, ...tasks]
    setTasks(nextTasks)
    setTaskName('')
    setTaskPrompt('')
  }

  const runTask = async (task: AiTask) => {
    const active = connections.find((item) => item.provider === provider)
    if (!active) {
      setStatus('Save a provider key first to execute AI tasks.')
      return
    }

    const reply = await sendAiMessage(provider, active.apiKey, task.prompt)
    const nextTasks = tasks.map((item) => (item.id === task.id ? { ...item, result: reply } : item))
    setTasks(nextTasks)
    setStatus(`Executed ${task.name}`)
  }

  const sendMessage = async () => {
    const active = connections.find((item) => item.provider === provider)
    if (!active || !draft.trim()) {
      setStatus('Save a provider key first to chat with the assistant.')
      return
    }

    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: draft }
    setMessages((current) => [...current, userMessage])
    const reply = await sendAiMessage(provider, active.apiKey, draft)
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: reply }])
    setDraft('')
  }

  const connectedProvider = useMemo(() => connections.find((item) => item.provider === provider), [connections, provider])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{getText('aiTitle', settings.language)}</Typography>
      <Typography variant="body2" color="text.secondary">{getText('aiSubtitle', settings.language)}</Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Connection setup</Typography>
              <TextField select label="Provider" value={provider} onChange={(event) => setProvider(event.target.value as 'openai' | 'claude')} size="small">
                {providerOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
              </TextField>
              <TextField label="API key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} size="small" />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={saveConnection}>Save & test</Button>
                {connectedProvider ? <Chip icon={<CheckCircle2 size={16} />} label="Connected" color="success" variant="outlined" /> : <Chip label="Not connected" color="default" variant="outlined" />}
              </Box>
              {status ? <Typography variant="body2" color="text.secondary">{status}</Typography> : null}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ mt: 2, borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{getText('aiChat', settings.language)}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {messages.map((message) => (
                    <Box key={message.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: message.role === 'assistant' ? 'rgba(124,90,59,0.08)' : 'rgba(95,119,101,0.12)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{message.role === 'assistant' ? 'Assistant' : 'You'}</Typography>
                      <Typography variant="body2" color="text.secondary">{message.content}</Typography>
                    </Box>
                  ))}
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                  <TextField fullWidth label="Ask for productivity help" value={draft} onChange={(event) => setDraft(event.target.value)} size="small" />
                  <Button variant="contained" onClick={sendMessage}>{getText('send', settings.language)}</Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" onClick={() => setDraft('Suggest priorities for my week')}>Suggest priorities</Button>
                  <Button size="small" variant="outlined" onClick={() => setDraft('Summarize my schedule')}>Summarize schedule</Button>
                  <Button size="small" variant="outlined" onClick={() => setDraft('Help me organize my week')}>Organize week</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(63,45,26,0.08)', bgcolor: 'rgba(255,252,247,0.95)' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{getText('aiTasks', settings.language)}</Typography>
              <TextField label={getText('taskName', settings.language)} value={taskName} onChange={(event) => setTaskName(event.target.value)} size="small" />
              <TextField label={getText('prompt', settings.language)} value={taskPrompt} onChange={(event) => setTaskPrompt(event.target.value)} size="small" />
              <Button variant="outlined" onClick={saveTask}>{getText('saveTask', settings.language)}</Button>
              {tasks.map((task) => (
                <Box key={task.id} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{task.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{task.result}</Typography>
                  <Button size="small" sx={{ mt: 1 }} onClick={() => runTask(task)}>{getText('runTask', settings.language)}</Button>
                </Box>
              ))}
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Saved connections</Typography>
              {connections.length === 0 ? <Typography variant="body2" color="text.secondary">No connections yet. Save an API key to activate the assistant.</Typography> : null}
              {connections.map((connection) => (
                <Box key={connection.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{connection.provider === 'openai' ? 'OpenAI' : 'Claude'}</Typography>
                    <Typography variant="body2" color="text.secondary">{connection.status === 'connected' ? 'Ready' : 'Needs attention'}</Typography>
                  </Box>
                  <Button size="small" color="error" startIcon={<Trash2 size={16} />} onClick={() => removeConnection(connection.provider)}>Remove</Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
