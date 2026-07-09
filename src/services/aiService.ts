export type AiProvider = 'openai' | 'claude'

export type AiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type AiTestResult = {
  ok: boolean
  message: string
}

function buildPrompt(task: string, provider: AiProvider) {
  return `You are Pollito Master assisting with personal productivity. Provider: ${provider}. User request: ${task}`
}

export async function testAiConnection(provider: AiProvider, apiKey: string): Promise<AiTestResult> {
  if (!apiKey.trim()) {
    return { ok: false, message: 'Missing API key.' }
  }

  const normalized = apiKey.trim()
  if (provider === 'openai' && !normalized.startsWith('sk-')) {
    return { ok: false, message: 'OpenAI keys usually start with sk-.' }
  }

  if (provider === 'claude' && normalized.length < 10) {
    return { ok: false, message: 'Claude key looks too short.' }
  }

  return { ok: true, message: `${provider === 'openai' ? 'OpenAI' : 'Claude'} connection prepared locally.` }
}

export async function sendAiMessage(provider: AiProvider, apiKey: string, prompt: string): Promise<string> {
  const test = await testAiConnection(provider, apiKey)
  if (!test.ok) {
    return `Connection test failed: ${test.message}`
  }

  const request = buildPrompt(prompt, provider)
  return `Assistant (${provider === 'openai' ? 'OpenAI' : 'Claude'}): ${request}`
}
