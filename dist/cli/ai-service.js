import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';

const LLM_PROVIDER_FILE = path.join(process.cwd(), '.hive-mind', 'llm-provider.json');

async function getProviderConfig() {
  try {
    const content = await readFile(LLM_PROVIDER_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        providers: { google: { apiKey: null } },
        defaultProvider: 'google',
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

export async function generateText(prompt, { modelType = 'flash' } = {}) {
  const genAI = await getGenAI();
  const modelName = modelType === 'pro' ? 'gemini-2.5-pro-latest' : 'gemini-2.5-flash-latest';
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}