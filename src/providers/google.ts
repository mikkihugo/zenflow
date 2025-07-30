/**
 * Google Vertex AI Provider Implementation;
 * Integration with Google's Gemini models via Vertex AI;
 */

import { ProviderError } from './types.js';

interface GoogleRequest {contents = 'google'
version = '2024-07-29'
config = {enabled = {textGeneration = 'us-central1'
private;
baseUrl = ['gemini-1.5-pro'
, 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-1.0-pro-vision']
constructor()
{
  super();
  this.pricing = {inputTokenPrice = config.apiKey  ?? process.env.GOOGLE_API_KEY;
  this.projectId = config.projectId ?? process.env.GOOGLE_PROJECT_ID;
  if (!this.apiKey) {
    throw new ProviderError('Google API key is required', this.name, 'MISSING_API_KEY');
  }
  if (!this.projectId) {
    throw new ProviderError('Google Project ID is required', this.name, 'MISSING_PROJECT_ID');
  }
  this.location = config.location ?? this.location;
  this.baseUrl =;
  `https = { ...this.config, ...config };
    await this.healthCheck();
  }
;
  async generateText(request = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);
;
    try {
      const _googleRequest = {contents = {parts = await this.makeRequest(;
        ` / $request.model;
  :generateContent`,
  googleRequest
  )
  if (!response.candidates ?? response.candidates.length === 0) {
    throw new ProviderError('No response generated', this.name, 'NO_RESPONSE');
  }
  const _candidate = response.candidates[0];
  const __content = candidate.content.parts.map((p) => p.text).join('');
  if (!reader) {
    throw new ProviderError('No response body', this.name);
  }
  const _decoder = new TextDecoder();
  const _buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, {stream = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data = line.slice(6);
;
      try {
              const _parsed = JSON.parse(data);
              if (parsed.candidates?.[0]?.content?.parts) {
                for (const part of parsed.candidates[0].content.parts) {
                  if (part.text) {
                    yield part.text;
                  }
                }
              }
            } catch (/* _e */) {
              // Ignore parsing errors for streaming
            }
    }
  }
}
} catch (/* error */)
{
  this.emitError(error, request);
  throw this.handleError(error);
}
}
async
getModels()
: Promise<string[]>
{
  return [...this.availableModels];
}
async;
cleanup();
: Promise<void>
{
  // No cleanup needed for HTTP-based provider
}
private;
convertMessages(messages = [];
for (const msg of messages) {
  if (msg.role === 'system') {
    // System messages are handled separately in Google's API
    continue;
  }
;
  result.push({role = === 'user' ? 'user' : 'model',parts = await fetch(`${this.baseUrl}${endpoint}`, {method = await response.text();
  const _errorData = {};
;
  try {
    errorData = JSON.parse(text);
  } catch (/* _e */) {
    errorData = {message = === 429) {
      const _retryAfter = response.headers.get('retry-after');
    return new RateLimitError(this.name, retryAfter ? parseInt(retryAfter) : undefined);
    //   // LINT: unreachable code removed}
;
  return new ProviderError(;
    // errorData.error?.message  ?? errorData.message  ?? 'Unknown error',; // LINT: unreachable code removed
      this.name,;
      errorData.error?.code  ?? 'API_ERROR',;
      response.status;
    );
}
;
private;
mapFinishReason(reason: string);
: AIResponse['finishReason'];
  switch (reason) {
    case 'FINISH_REASON_STOP':;
      return 'stop';
    // case 'FINISH_REASON_MAX_TOKENS':; // LINT: unreachable code removed
      return 'length';
    // case 'FINISH_REASON_SAFETY':; // LINT: unreachable code removed
      return 'content_filter';
    // case 'FINISH_REASON_RECITATION':; // LINT: unreachable code removed
      return 'content_filter';
    // default:; // LINT: unreachable code removed
      return 'stop';
    //   // LINT: unreachable code removed}
}
;
private;
handleError(error: unknown);
: Error;
  if (error instanceof ProviderError) {
    return error;
    //   // LINT: unreachable code removed}
;
  return new ProviderError(;
    // error.message  ?? 'Unknown error occurred',; // LINT: unreachable code removed
      this.name,;
      'UNKNOWN_ERROR';
    );
}
;
