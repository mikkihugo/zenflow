/**
 * AI Service Module
 * Converted from JavaScript to TypeScript
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import inquirer from 'inquirer';
import { createClaudeCodeProvider } from './claude-code-provider.js';

interface ProviderConfig {
  defaultProvider: string;
  providers: {
    google: {
      apiKey?: string;
      priority?: number;
    };
    claude: {
      priority?: number;
    };
  };
}

const LLM_PROVIDER_FILE = path.join(process.cwd(), '.hive-mind', 'llm-provider.json');

async function getProviderConfig(): Promise<ProviderConfig> {
  try {
    const content = await readFile(LLM_PROVIDER_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Default configuration if file doesn't exist
      return {
        defaultProvider: 'google',
        providers: {
          google: {},
          claude: {}
        }
      };
    }
    throw error;
  }
}

async function saveProviderConfig(config: ProviderConfig): Promise<void> {
  await writeFile(LLM_PROVIDER_FILE, JSON.stringify(config, null, 2));
}

async function getApiKey(): Promise<string> {
  const config = await getProviderConfig();
  const apiKey = process.env.GEMINI_API_KEY || config.providers.google.apiKey;
  
  if (!apiKey) {
    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Enter your Google AI API key:'
      }
    ]);
    
    config.providers.google.apiKey = key;
    await saveProviderConfig(config);
    return key;
  }

  return apiKey;
}

async function getGenAI(): Promise<GoogleGenerativeAI> {
  const apiKey = await getApiKey();
  return new GoogleGenerativeAI(apiKey);
}

let claudeProvider: any = null;

async function getClaudeProvider() {
  if (!claudeProvider) {
    const config = await getProviderConfig();

    try {
      claudeProvider = await createClaudeCodeProvider({ 
        modelId: config.providers.claude 
      });
    } catch (error) {
      console.warn('Claude Code not available');
      return null;
    }
  }
  return claudeProvider;
}

async function generateTextWithClaude(prompt: string, options: any = {}): Promise<string> {
  const provider = await getClaudeProvider();
  if (!provider) {
    console.warn('Claude Code not available, falling back to Google AI');
    return generateTextWithGoogle(prompt, options);
  }

  try {
    return await provider.generateText(prompt, options);
  } catch (error) {
    console.warn('Claude generation failed, falling back to Google AI');
    return generateTextWithGoogle(prompt, options);
  }
}

async function generateTextWithGoogle(prompt: string, options: any = {}): Promise<string> {
  const model = options.model || 'gemini-1.5-flash';
  const genAI = await getGenAI();

  const modelInstance = genAI.getGenerativeModel({ model });
  const result = await modelInstance.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateText(prompt: string, options: any = {}): Promise<string> {
  const config = await getProviderConfig();

  // Try Claude first if it's the default or has higher priority
  if (config.defaultProvider === 'claude' || 
      (config.providers.claude?.priority && config.providers.google?.priority && 
       config.providers.claude.priority < config.providers.google.priority)) {
    try {
      return await generateTextWithClaude(prompt, options);
    } catch (error) {
      console.warn('Claude generation failed, falling back to Google AI');
      return await generateTextWithGoogle(prompt, options);
    }
  } else {
    return await generateTextWithGoogle(prompt, options);
  }
}