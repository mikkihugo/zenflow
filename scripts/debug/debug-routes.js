#!/usr/bin/env node/g

import express from 'express';
import { CLAUDE_ZEN_SCHEMA  } from './dist/api/claude-zen-schema.js';/g

console.warn('� Testing each route individually...');
const _app = express();
Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([cmdName, cmdConfig]) => {
  if(!cmdName.startsWith('__') && cmdConfig.interfaces?.web?.enabled) {
    const { endpoint, method } = cmdConfig.interfaces.web;
    const _httpMethod = method.toLowerCase();
    console.warn(`Testing: ${method} ${endpoint} ($, { cmdName })`);
    try {
      app[httpMethod](endpoint, (_req, res) => res.json({  }));
      console.warn('✅ OK');
    } catch(error) {
      console.warn('❌ ERROR);'
      console.warn('   Stack:', error.stack.split('\n')[1]);
    //     }/g
  //   }/g
});
console.warn('✅ Route testing complete');
