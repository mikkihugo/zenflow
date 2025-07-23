import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { ClaudeCodeProvider, createClaudeCodeProvider } from './claude-code-provider.js';

const LLM_PROVIDER_FILE = path.join(process.cwd(), '.hive-mind', 'llm-provider.json');

async function getProviderConfig() {
  try {
    const content = await readFile(LLM_PROVIDER_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        providers: { 
          claude: { enabled: true, priority: 1 },
          google: { apiKey: null, priority: 2 } 
        },
        defaultProvider: 'claude',
      };
    }
    throw error;
  }
}

async function saveProviderConfig(config) {
  await writeFile(LLM_PROVIDER_FILE, JSON.stringify(config, null, 2));
}

async function getApiKey() {
  const config = await getProviderConfig();
  let apiKey = process.env.GEMINI_API_KEY || config.providers.google.apiKey;

  if (!apiKey) {
    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Please enter your Google AI API key:',
      },
    ]);
    apiKey = key;
    config.providers.google.apiKey = apiKey;
    await saveProviderConfig(config);
  }

  return apiKey;
}

async function getGenAI() {
  const apiKey = await getApiKey();
  return new GoogleGenerativeAI(apiKey);
}

let claudeProvider = null;

async function getClaudeProvider() {
  if (!claudeProvider) {
    const config = await getProviderConfig();
    const claudeConfig = config.providers.claude || {};
    
    try {
      claudeProvider = await createClaudeCodeProvider({
        modelId: claudeConfig.modelId || 'sonnet',
        maxTurns: claudeConfig.maxTurns || 5,
        customSystemPrompt: claudeConfig.customSystemPrompt,
        appendSystemPrompt: claudeConfig.appendSystemPrompt,
        permissionMode: claudeConfig.permissionMode || 'default',
        allowedTools: claudeConfig.allowedTools,
        disallowedTools: claudeConfig.disallowedTools,
        commandSpecific: claudeConfig.commandSpecific,
        ...claudeConfig
      });
    } catch (error) {
      console.warn('Failed to initialize Claude provider:', error.message);
      return null;
    }
  }
  return claudeProvider;
}

async function generateTextWithClaude(prompt, options = {}) {
  const provider = await getClaudeProvider();
  
  if (!provider) {
    console.warn('Claude Code not available, falling back to Google AI');
    return generateTextWithGoogle(prompt, options);
  }
  
  try {
    return await provider.generateText(prompt, options);
  } catch (error) {
    console.warn('Claude generation failed:', error.message);
    return generateTextWithGoogle(prompt, options);
  }
}

async function generateTextWithGoogle(prompt, { modelType = 'flash' } = {}) {
  const genAI = await getGenAI();
  const modelName = modelType === 'pro' ? 'gemini-2.5-pro-latest' : 'gemini-2.5-flash-latest';
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateText(prompt, options = {}) {
  const config = await getProviderConfig();
  
  // Try Claude first if it's the default or has higher priority
  if (config.defaultProvider === 'claude' || 
      (config.providers.claude?.priority < config.providers.google?.priority)) {
    try {
      return await generateTextWithClaude(prompt, options);
    } catch (error) {
      console.warn('Claude generation failed, falling back to Google AI:', error.message);
      return await generateTextWithGoogle(prompt, options);
    }
  } else {
    return await generateTextWithGoogle(prompt, options);
  }
}