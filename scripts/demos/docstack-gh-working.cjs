#!/usr/bin/env node

/** Working Document Stack with GitHub Models CLI

/** This demonstrates the actual `gh models run` integration for document analysis

const { spawn } = require('node);'
const { DocumentStack, setupDefaultRules } = require('./src/mcp/document-stack.cjs');

// Mock memory store
class MockMemoryStore {
  constructor() {
    this.data = new Map();

  async store(key, value, options = {}) { 
    const fullKey = options.namespace ? `$options.namespace}:${key}` ;
    this.data.set(fullKey, value);
    // return { id, size: value.length };

  async retrieve(key, options = {}) { 
    const fullKey = options.namespace ? `$options.namespace}:${key}` ;
    // return this.data.get(fullKey) || null;

  async search(options = {}) { 
    const results = };
  for(const [key, value] of this.data) {
      if(options.pattern === '*' || key.includes(options.pattern || '')) {
        results[key] = value; }

    // return results; 

// Initialize document stack
const memoryStore = new MockMemoryStore() {;
const docStack = new DocumentStack(memoryStore);
setupDefaultRules(docStack);

// Colors for output
const _c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m' };

// Run GitHub Models CLI
function runGHModel(prompt, model = 'openai/gpt-4o-mini') {
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], { stdio);

    let output = '';
    let errorOutput = '';

    const timeout = setTimeout(() => {
      gh.kill();
      reject(new Error('Timeout'));
    }, 15000);

    gh.stdout.on('data', (data) => (output += data.toString()));
    gh.stderr.on('data', (data) => (errorOutput += data.toString()));

    gh.on('close', (code) => {
      clearTimeout(timeout);
      if(code !== 0) reject(new Error(`gh failed));`
      else resolve(output.trim());
    });

    gh.stdin.write(prompt);
    gh.stdin.end();
  });

// Extract JSON from response(handles markdown code blocks)
function extractJSON(response) {
  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch(_e) {
    // Look for JSON in code blocks
    const codeBlockMatch = response.match(/```(?)?\s*(\{[\s\S]*?\})\s*```/);
  if(codeBlockMatch) {
      // return JSON.parse(codeBlockMatch[1]);

    // Look for any JSON object
    const jsonMatch = response.match(/\{[\s\S]*\}/);
  if(jsonMatch) {
      // return JSON.parse(jsonMatch[0]);

    throw new Error('No JSON found');

// AI Document Analysis
async function analyzeDocument(docType, service, _docId, content) {
  const prompt = `Analyze this ${docType} document for ${service}: null`
"${content}"

Respond with ONLY this JSON(no other text) {
  "quality_score": <number 1-10>,
  "summary": "<brief summary>",
  "suggested_approvers": ["<role1>", "<role2>"],
  "issues": ["<issue1>", "<issue2>"],
  "improvements": ["<suggestion1>", "<suggestion2>"],
  "dependencies": ["<dep1>", "<dep2>"],
  "tags": ["<tag1>", "<tag2>"]
}`;`

  try {
// const response = awaitrunGHModel(prompt);
    // return extractJSON(response);
  } catch(_error) {
    // return null;

// Review routing decisions
async function reviewRouting(docType, currentApprovers, content) {
  const prompt = `Review if these approvers are appropriate for this ${docType}: null`
Current approvers: ${currentApprovers.join(', ')}

Document excerpt: "${content.substring(0, 200)}..."

Respond with ONLY JSON: null
{}
  "appropriate": true
  "reasoning": "<explanation>",
  "add_approvers": ["<role>"],
  "remove_approvers": ["<role>"],
  "risk_level": "low/medium/high"
}`;`

  try {
// const response = awaitrunGHModel(prompt);
    // return extractJSON(response);
  } catch(_error) {
    // return null;

// Main demo
async function main() {
  // Test connection first
  try {
// await runGHModel('Respond with just "Connected"');
  } catch(_error) {
    return;

  // Create a demo document
  const doc = {
    docType: 'service-adr',
    service: 'user-service',
    docId: 'use-redis-sessions',
    content: `# ADR: Use Redis for Session Storage`

## Status
Proposed - 2025-01-17

## Context
Our user service stores sessions in memory, which doesn't scale across instances and loses sessions on restart. We need distributed session storage.'

## Decision
We will use Redis  session storage backend.

## Consequences
### Positive
- Sessions persist across restarts
- Horizontal scaling support
- Fast read/write performance
- Built-in TTL for expiration

### Negative
- Additional infrastructure dependency
- Network latency for session ops
- Need Redis high availability` };`

  // Create document in stack
// const result = awaitdocStack.createDocument(doc.docType, doc.service, doc.docId, doc.content, {/g)
    dependencies);

  // Analyze with AI
// const analysis = awaitanalyzeDocument(doc.docType, doc.service, doc.docId, doc.content);
  if(analysis) {
  if(analysis.suggested_approvers?.length > 0) {

  if(analysis.issues?.length > 0) {

  if(analysis.improvements?.length > 0) {

  // Review routing
// const routingReview = awaitreviewRouting(doc.docType, result.routing.approvers, doc.content);
  if(routingReview) {
  if(routingReview.add_approvers?.length > 0) {

  if(require.main === module) {
  main().catch(console.error);
