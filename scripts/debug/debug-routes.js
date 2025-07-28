#!/usr/bin/env node

import { CLAUDE_ZEN_SCHEMA } from './dist/api/claude-zen-schema.js';
import express from 'express';

console.log('🔍 Testing each route individually...');

const app = express();

Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([cmdName, cmdConfig]) => {
  if (!cmdName.startsWith('__') && cmdConfig.interfaces?.web?.enabled) {
    const { endpoint, method } = cmdConfig.interfaces.web;
    const httpMethod = method.toLowerCase();
    
    console.log(`Testing: ${method} ${endpoint} (${cmdName})`);
    
    try {
      app[httpMethod](endpoint, (req, res) => res.json({}));
      console.log('✅ OK');
    } catch (error) {
      console.log('❌ ERROR:', error.message);
      console.log('   Stack:', error.stack.split('\n')[1]);
    }
  }
});

console.log('✅ Route testing complete');