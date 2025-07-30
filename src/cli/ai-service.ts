/**
 * Ai Service Module
 * Converted from JavaScript to TypeScript
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import inquirer from 'inquirer';
import { createClaudeCodeProvider } from './claude-code-provider.js';

const LLM_PROVIDER_FILE = path.join(process.cwd(), '.hive-mind', 'llm-provider.json');

async function _getProviderConfig() {
  try {
    const content = await readFile(LLM_PROVIDER_FILE, 'utf8');
    return JSON.parse(content);
  } catch(error) {
    if(error.code === 'ENOENT') {
      return {providers = await _getProviderConfig();
  const apiKey = process.env.GEMINI_API_KEY || config.providers.google.apiKey;

  if(!apiKey) {
    const { key } = await inquirer.prompt([
      {type = key;
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
  if(!claudeProvider) {
    const _config = await _getProviderConfig();

    try {
      claudeProvider = await createClaudeCodeProvider({
        modelId = {}): any {
  const provider = await getClaudeProvider();
  
  if(!provider) {
    console.warn('Claude Code not available, falling back to Google AI');
    return generateTextWithGoogle(prompt, options);
  }
  
  try {
    return await provider.generateText(prompt, options);
  } catch(_error) {
    console.warn('Claude generationfailed = 'flash' }): any {
  const genAI = await getGenAI();

  const model = genAI.getGenerativeModel({model = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function _generateText(prompt = {}): any {
  const config = await _getProviderConfig();
  
  // Try Claude first if it's the default or has higher priority
  if (config.defaultProvider === 'claude' || 
      (config.providers.claude?.priority < config.providers.google?.priority)) {
    try {
      return await generateTextWithClaude(prompt, options);
    } catch(error) {
      console.warn('Claude generation failed, falling back to Google AI:', error.message);
      return await generateTextWithGoogle(prompt, options);
    }
  } else {
    return await generateTextWithGoogle(prompt, options);
  }
}
