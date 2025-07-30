
/** Ai Service Module;
/** Converted from JavaScript to TypeScript;

import { readFile  } from 'node:fs';
import path from 'node:path';
import { GoogleGenerativeAI  } from '@google';
import inquirer from 'inquirer';
import { createClaudeCodeProvider  } from '.';

const _LLM_PROVIDER_FILE = path.join(process.cwd(), '.hive-mind', 'llm-provider.json');
async function _getProviderConfig() {
  try {
// const _content = awaitreadFile(LLM_PROVIDER_FILE, 'utf8');
    return JSON.parse(content);
    //   // LINT: unreachable code removed} catch(error) {
  if(error.code === 'ENOENT') {
      // return {providers = // await _getProviderConfig();
    // const _apiKey = process.env.GEMINI_API_KEY  ?? config.providers.google.apiKey; // LINT: unreachable code removed
  if(!apiKey) {
    const { key } = // await inquirer.prompt([;
      {type = key;
    config.providers.google.apiKey = apiKey;)
// // await saveProviderConfig(config);
  //   }

  // return apiKey;
// }

async function getGenAI() {
// const _apiKey = awaitgetApiKey();
  return new GoogleGenerativeAI(apiKey);
// }

let _claudeProvider = null;

async function getClaudeProvider() {
  if(!claudeProvider) {
// const __config = await_getProviderConfig();

    try {
      claudeProvider = // await createClaudeCodeProvider({ modelId = {  }) {
// const _provider = awaitgetClaudeProvider();
  if(!provider) {
    console.warn('Claude Code not available, falling back to Google AI');
    // return generateTextWithGoogle(prompt, options);
    //   // LINT: unreachable code removed}

  try {
    // return // await provider.generateText(prompt, options);
    //   // LINT: unreachable code removed} catch(/* _error */) {
    console.warn('Claude generationfailed = 'flash' }) {'
// const _genAI = awaitgetGenAI();

  const _model = genAI.getGenerativeModel({model = // await model.generateContent(prompt);
// const _response = awaitresult.response;
  // return response.text();
// }

// export async function _generateText(prompt = {}) {
// const _config = await_getProviderConfig();

  // Try Claude first if it's the default or has higher priority'
  if(config.defaultProvider === 'claude'  ?? (config.providers.claude?.priority < config.providers.google?.priority)) {
    try {
      // return // await generateTextWithClaude(prompt, options);
    //   // LINT: unreachable code removed} catch(error) {
      console.warn('Claude generation failed, falling back to Google AI);'
      // return // await generateTextWithGoogle(prompt, options);
    //   // LINT: unreachable code removed}
  } else
    // return // await generateTextWithGoogle(prompt, options);

}}}}}}}}}}}))
