import { EventBus, getLogger } from '@claude-zen/foundation'
import { DEFAULT_GEMINI_MODEL } from '@google/gemini-cli-core'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createClient, contentGenerator, GeminiChat, GeminiClient } from '@google/gemini-cli-core'

const logger = getLogger('@claude-zen/gemini-provider')

export type GeminiRequest = {
  correlationId: string
  prompt: string
  model?: string
  stream?: boolean
}

export type GeminiResponse = {
  correlationId: string
  text?: string
  error?: string
}

export type GeminiStreamChunk = {
  correlationId: string
  text: string
  done: boolean
  error?: string
}

type GeminiAuthConfig = {
  authMode: 'api-key' | 'oauth' | 'vertex'
  apiKey?: string
  projectId?: string
  region?: string | null
}

type GeminiClientOptions = {
  model: string
  auth?: {
    apiKey: string
  }
  vertex?: {
    projectId?: string | null
    region?: string | null
  }
}

function readLocalGeminiConfig(): GeminiAuthConfig | null {
  try {
    const fp = join(homedir(), '.claude-zen', 'gemini.json')
    if (!existsSync(fp)) return null
    const raw = readFileSync(fp, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    logger.warn('Failed to read or parse local Gemini config at ~/.claude-zen/gemini.json', { error })
    return null
  }
}

function buildClientOptions(modelId: string): GeminiClientOptions {
  // 1) Prefer workspace/server envs
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey && apiKey.length > 0) {
    return { auth: { apiKey }, model: modelId }
  }
  // Use Vertex AI only when explicitly requested to avoid accidental billing.
  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true') {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT
    const region = process.env.GOOGLE_CLOUD_REGION
    return { model: modelId, vertex: { projectId, region } }
  }

  // 2) Fall back to local CLI-based config if present
  const cfg = readLocalGeminiConfig()
  if (cfg) {
    if (cfg.authMode === 'api-key' && cfg.apiKey) {
      return { auth: { apiKey: cfg.apiKey }, model: modelId }
    }
    if (cfg.authMode === 'vertex') {
      return { model: modelId, vertex: { projectId: cfg.projectId, region: cfg.region || undefined } }
    }
    // oauth: let cli-core resolve from its own cache/config
    return { model: modelId }
  }

  // 3) Last resort: let cli-core auto-resolve (OAuth cache, ADC, etc.)
  return { model: modelId }
}

export async function registerGeminiHandlers(bus = new EventBus()) {
  const clientCache = new Map<string, Promise<GeminiClient>>()

  async function getClient(modelId: string): Promise<GeminiClient> {
    const options = buildClientOptions(modelId)
    // A key based on a stable serialization of the options is more robust.
    const cacheKey = JSON.stringify(options)

    if (!clientCache.has(cacheKey)) {
      const clientPromise = createClient(options)
      clientCache.set(cacheKey, clientPromise)
    }
    return clientCache.get(cacheKey)!
  }

  // text generation (non-stream)
  bus.on('llm:gemini:generate:request', async (env: GeminiRequest) => {
    if (env.stream) {
      // Handle streaming generation
      try {
        const modelId = env.model ?? DEFAULT_GEMINI_MODEL
        const client = await getClient(modelId)
        const gen = contentGenerator({ client })
        // Assuming `generateStream` exists and returns an async iterable
        const stream = await gen.generateStream({ prompt: env.prompt })
        for await (const chunk of stream) {
          const msg: GeminiStreamChunk = {
            correlationId: env.correlationId,
            text: chunk.text ?? '',
            done: false,
          }
          bus.emit('llm:gemini:generate:stream:chunk', msg)
        }
        const finalMsg: GeminiStreamChunk = { correlationId: env.correlationId, text: '', done: true }
        bus.emit('llm:gemini:generate:stream:chunk', finalMsg)
      } catch (error) {
        logger.error('Gemini generate stream error', { error })
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        const errorMsg: GeminiStreamChunk = {
          correlationId: env.correlationId,
          text: '',
          done: true,
          error: errorMessage,
        }
        bus.emit('llm:gemini:generate:stream:chunk', errorMsg)
      }
    } else {
      // Handle non-streaming generation
      try {
        const modelId = env.model ?? DEFAULT_GEMINI_MODEL
        const client = await getClient(modelId)
        const gen = contentGenerator({ client })
        const res = await gen.generate({ prompt: env.prompt })
        const msg: GeminiResponse = { correlationId: env.correlationId, text: res.text ?? '' }
        bus.emit('llm:gemini:generate:response', msg)
      } catch (error) {
        logger.error('Gemini generate error', { error })
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        const msg: GeminiResponse = { correlationId: env.correlationId, error: errorMessage }
        bus.emit('llm:gemini:generate:response', msg)
      }
    }
  })

  // chat completion style
  bus.on('llm:gemini:chat:request', async (env: GeminiRequest) => {
    if (env.stream) {
      // Handle streaming chat
      try {
        const modelId = env.model ?? DEFAULT_GEMINI_MODEL
        const client = await getClient(modelId)
        const chat = new GeminiChat({ client })
        await chat.addUserMessage(env.prompt)
        // Assuming `sendStream` exists and returns an async iterable
        const stream = await chat.sendStream()
        for await (const chunk of stream) {
          const msg: GeminiStreamChunk = {
            correlationId: env.correlationId,
            text: chunk.text ?? '',
            done: false,
          }
          bus.emit('llm:gemini:chat:stream:chunk', msg)
        }
        const finalMsg: GeminiStreamChunk = { correlationId: env.correlationId, text: '', done: true }
        bus.emit('llm:gemini:chat:stream:chunk', finalMsg)
      } catch (error) {
        logger.error('Gemini chat stream error', { error })
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        const errorMsg: GeminiStreamChunk = {
          correlationId: env.correlationId,
          text: '',
          done: true,
          error: errorMessage,
        }
        bus.emit('llm:gemini:chat:stream:chunk', errorMsg)
      }
    } else {
      // Handle non-streaming chat
      try {
        const modelId = env.model ?? DEFAULT_GEMINI_MODEL
        const client = await getClient(modelId)
        const chat = new GeminiChat({ client })
        await chat.addUserMessage(env.prompt)
        const reply = await chat.send()
        const msg: GeminiResponse = { correlationId: env.correlationId, text: reply.text ?? '' }
        bus.emit('llm:gemini:chat:response', msg)
      } catch (error) {
        logger.error('Gemini chat error', { error })
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        const msg: GeminiResponse = { correlationId: env.correlationId, error: errorMessage }
        bus.emit('llm:gemini:chat:response', msg)
      }
    }
  })

  logger.info('Gemini EventBus handlers registered')
}
