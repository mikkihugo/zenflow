/**
 * @fileoverview Adapter Utilities
 * 
 * Common utilities for data formatting adapters.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import type { FieldInfo } from '../interfaces/types';

/**
 * Parse value according to field type
 */
export function parseValue(value: any, type: string): any {
  if (value === null || value === undefined) {
    return value;
  }

  switch (type.toLowerCase()) {
    case 'string':
      return String(value);
    case 'number':
    case 'int':
    case 'integer':
    case 'float':
      return Number(value);
    case 'boolean':
    case 'bool':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    case 'array':
    case 'list':
      return Array.isArray(value) ? value : [value];
    case 'object':
    case 'dict':
      return typeof value === 'object' ? value : { value };
    default:
      return value;
  }
}

/**
 * Format field value for display
 */
export function formatFieldValue(fieldInfo: FieldInfo, value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(item => String(item)).join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Get annotation name from type
 */
export function getAnnotationName(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'array',
    'object': 'object',
    'list': 'list',
    'dict': 'dictionary',
    'int': 'integer',
    'float': 'float'
  };

  return typeMap[type.toLowerCase()] || type;
}

/**
 * Translate field type for display
 */
export function translateFieldType(name: string, fieldInfo: FieldInfo): string {
  const placeholder = `<${name}>`;
  
  switch (fieldInfo.type.toLowerCase()) {
    case 'string':
      return placeholder;
    case 'number':
    case 'int':
    case 'integer':
      return '42';
    case 'float':
      return '3.14';
    case 'boolean':
      return 'true';
    case 'array':
    case 'list':
      return '[item1, item2]';
    case 'object':
    case 'dict':
      return '{"key": "value"}';
    default:
      return placeholder;
  }
}