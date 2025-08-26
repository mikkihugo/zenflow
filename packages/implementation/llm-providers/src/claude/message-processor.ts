/**
 * @fileoverview Claude SDK Message Processor - Message Handling & Transformation
 *
 * Extracted message processing logic from oversized claude-sdk.ts.
 * Handles message parsing, validation, and transformation.
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { JsonObject } from '@claude-zen/foundation/types';

import type { ClaudeMessage } from './types';
import { truncateForLogging } from './utils';

const logger = getLogger('claude-message-processor');'

// =============================================================================
// Message Processing Functions
// =============================================================================

/**
 * Process Claude message from raw SDK output
 */
export function processClaudeMessage(
  _message: unknown,
  messageCount: number
): ClaudeMessage {
  logger.debug(`Processing message ${messageCount}`);`

  try {
    // Validate basic structure
    if (!message||typeof message !=='object') {'
      throw new Error('Invalid message structure');'
    }

    const msg = message as Record<string, unknown>;

    // Determine message type and content
    const { type, content } = extractMessageTypeAndContent(msg);

    // Create base message with common fields
    const baseMessage = {
      type,
      content: sanitizeString(String(content)),
      timestamp: Date.now(),
    };

    // Add type-specific metadata
    const metadata = extractMessageMetadata(msg, type);

    const processedMessage = {
      ...baseMessage,
      metadata: {
        ...metadata,
        messageId: generateSessionId(),
      },
    } as ClaudeMessage;

    logger.debug(`Processed $typemessage: $truncateForLogging(content)`);`
    return processedMessage;
  } catch (error) {
    logger.error(`Error processing message ${messageCount}:`, error);`

    // Return error message as fallback
    return {
      type: 'system',
      content: `Error processing message: $error instanceof Error ? error.message : 'Unknown error'`,`
      timestamp: Date.now(),
      metadata: 
        level: 'error',
        source: 'message-processor',
        messageId: generateSessionId(),,
    };
  }
}

// =============================================================================
// Message Type Detection & Content Extraction
// =============================================================================

/**
 * Extract message type and content from raw message
 */
function _extractMessageTypeAndContent(msg: Record<string, unknown>): {
  type: string;
  content: string;
} {
  // Check for explicit type field
  if (msg.type && typeof msg.type === 'string') {'
    return {
      type: msg.type,
      content: extractContent(msg),
    };
  }

  // Infer type from content structure
  if (msg.role) {'
    return {
      type: String(msg.role),
      content: extractContent(msg),
    };
  }

  // Check for result indicators
  if (msg.success !== undefined||msg.exitCode !== undefined) {'
    return {
      type: 'result',
      content: extractContent(msg),
    };
  }

  // Check for system message indicators
  if (msg.level||msg.source === 'system') {'
    return {
      type: 'system',
      content: extractContent(msg),
    };
  }

  // Default to user message
  return {
    type: 'user',
    content: extractContent(msg),
  };
}

/**
 * Extract content from various message formats
 */
function extractContent(msg: Record<string, unknown>): string {
  // Direct content field
  if (msg.content && typeof msg.content === 'string') {'
    return msg.content;'
  }

  // Message field
  if (msg.message && typeof msg.message === 'string') {'
    return msg.message;'
  }

  // Text field
  if (msg.text && typeof msg.text === 'string') {'
    return msg.text;'
  }

  // Array of content parts (for complex messages)
  if (Array.isArray(msg.content)) {'
    return msg.content'
      .map((part) => 
        if (typeof part === 'string') {'
          return part;
        }
        if (part && typeof part === 'object' && 'text' in part) {'
          return String((part as JsonObject).text);'
        }
        return String(part);)
      .join(' ');'
  }

  // Fallback to string representation
  return String(
    msg.content||msg.message||msg.text||'Empty message''
  );
}

// =============================================================================
// Metadata Extraction
// =============================================================================

/**
 * Extract type-specific metadata from raw message
 */
function _extractMessageMetadata(
  msg: Record<string, unknown>,
  type: string
): Record<string, unknown> {
  const baseMetadata: Record<string, unknown> = {};

  switch (type) {
    case 'assistant':'
      return extractAssistantMetadata(msg, baseMetadata);

    case 'user':'
      return extractUserMetadata(msg, baseMetadata);

    case 'result':'
      return extractResultMetadata(msg, baseMetadata);

    case 'system':'
      return extractSystemMetadata(msg, baseMetadata);

    default:
      logger.debug(`Unknown message type: ${type}, using base metadata`);`
      return baseMetadata;
  }
}

/**
 * Extract assistant-specific metadata
 */
function extractAssistantMetadata(
  msg: Record<string, unknown>,
  base: Record<string, unknown>
) {
  return {
    ...base,
    model: msg['model']||msg['modelName'],
    tokens:
      msg['tokens']||(msg['usage'] as JsonObject|undefined)?.['total_tokens'],
    executionTime: msg['executionTime']||msg['duration'],
    toolsUsed: Array.isArray(msg['toolsUsed']) ? msg['toolsUsed'] : undefined,
  };
}

/**
 * Extract user-specific metadata
 */
function extractUserMetadata(
  msg: Record<string, unknown>,
  base: Record<string, unknown>
) {
  return {
    ...base,
    source: msg['source'],
    priority: msg['priority'],
    context: msg['context'],
    attachments: Array.isArray(msg['attachments'])'
      ? msg['attachments']'
      : undefined,
  };
}

/**
 * Extract result-specific metadata
 */
function extractResultMetadata(
  msg: Record<string, unknown>,
  base: Record<string, unknown>
) {
  return {
    ...base,
    exitCode: msg['exitCode'],
    duration: msg['duration'],
    command: msg['command'],
    output: msg['output'],
    error: msg['error'],
  };
}

/**
 * Extract system-specific metadata
 */
function extractSystemMetadata(
  msg: Record<string, unknown>,
  base: Record<string, unknown>
) {
  return {
    ...base,
    level: msg['level']||'info',
    source: msg['source']||'system',
    category: msg['category'],
  };
}

// =============================================================================
// Message Validation
// =============================================================================

/**
 * Validate processed message structure
 */
export function validateProcessedMessage(
  message: unknown
): message is ClaudeMessage {
  if (!message||typeof message !=='object') {'
    return false;
  }

  const msg = message as Record<string, unknown>;

  // Check required fields
  if (typeof msg['type'] !== 'string'||!msg['type']) {'
    return false;
  }

  if (typeof msg['content'] !== 'string') {'
    return false;
  }

  if (typeof msg['timestamp'] !== 'number') {'
    return false;
  }

  // Validate type-specific structure
  const validTypes = ['assistant', 'user', 'result', 'system'];'
  if (!validTypes.includes(msg['type'] as string)) {'
    return false;
  }

  return true;
}

/**
 * Filter messages by type
 */
export function filterMessagesByType<T extends ClaudeMessage['type']>('
  messages: ClaudeMessage[],
  type: T
): Extract<ClaudeMessage, { type: T }>[] {
  return messages.filter((msg) => msg.type === type) as Extract<
    ClaudeMessage,
    { type: T }
  >[];
}

/**
 * Get message summary for logging
 */
export function getMessageSummary(message: ClaudeMessage): string {
  const contentPreview = truncateForLogging(message.content, 100);
  const timestamp = new Date(message.timestamp || 0).toISOString();

  return `${message.type}@${timestamp}: ${contentPreview}`;`
}
