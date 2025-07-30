/**
 * Middleware Collection
 * Reusable middleware functions for Claude Flow servers
 */

import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { type JSONObject, JSONValue } from '../types/core.js';
// Import types
import {
  MiddlewareFunction,
  SessionContext,
  TypedRequest,
  TypedResponse,
  type UserContext,
  ValidationError,
  ValidationResult,
} from '../types/server.js';

/**
 * Enhanced request logging middleware
 */
export function requestLogger(): MiddlewareFunction {
  return (req) => {
    const start = Date.now();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add correlation tracking
    req.correlation = {
      id => {
      const duration = Date.now() - start;
    console.warn(
      `[${new Date().toISOString()}] ${correlationId} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  };

  next();
}
}

/**
 * Request validation middleware
 */
export function validateRequest(schema => {
    const validation = {params = validateObject(req.params, schema.params, 'params');
}

// Validate query
if (schema.query) {
  validation.query = validateObject(req.query, schema.query, 'query');
}

// Validate body
if (schema.body) {
  validation.body = validateObject(req.body, schema.body, 'body');
}

// Validate headers
if (schema.headers) {
  validation.headers = validateObject(req.headers, schema.headers, 'headers');
}

req.validation = validation;

// Check if any validation failed
const hasErrors = Object.values(validation).some((v) => !v.valid);
if (hasErrors) {
  return res.status(400).json({success = > Promise<UserContext | null>;
}
): MiddlewareFunction
{
  return async (req => {
    try {
      const authHeader = req.headers.authorization;
      let user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        if (options.extractUser) {
          user = await options.extractUser(token);
        } else {
          // Default user extraction logic
          user = {id = user;
      next();
    } catch (error) 
      console.error('Authenticationerror = > boolean)): MiddlewareFunction {
  return (req => {
    if (!req.user) {
      return res.status(401).json({success = false;

    if (typeof permissions === 'function') {
      hasPermission = permissions(req.user);
    } else {
      hasPermission = permissions.some(permission => 
        req.user!.permissions.includes(permission) ||
        req.user!.roles.some(role => role === 'admin' || role === 'superuser')
      );
    }

    if (!hasPermission) {
      return res.status(403).json({
        success => {
    console.error(`Error in ${req.method} ${req.path}:`, err);

    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({success = == 'UnauthorizedError') {
      return res.status(401).json({success = == 'ForbiddenError') {
      return res.status(403).json({success = == 'NotFoundError') {
      return res.status(404).json({success = == 'production' ? 'An unexpected error occurred' : err.message,stack = == 'production' ? undefined => {
    // Add success response helper
    res.success = function<T>(data, message?: string) {
      return this.json({success = function(message, code?: number, details?: JSONObject) {
      const statusCode = code || 500;
      return this.status(statusCode).json({success = function<T>(data: T[],pagination = function(data, ttl?: number) {
      if (ttl) {
        this.set('Cache-Control', `public, max-age=${ttl}`);
      }
      return this.json({success = function(data => {
        try {
          for await (const chunk of data) {
            this.write(JSON.stringify(chunk) + '\n');
          }
          this.end();
        } catch (error) {
          this.write(JSON.stringify({error = function<T>(): T {
      return this.params as T;
    };

    req.typedQuery = function<T>(): T {
      return this.query as any as T;
    };

    req.typedBody = function<T>(): T {
      return this.body as T;
    };

    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders(): MiddlewareFunction {
  return helmet({contentSecurityPolicy = == 'production'
  });
}

/**
 * CORS middleware with advanced options
 */
export function corsMiddleware(options?: {
  origins?: string[];
  credentials?: boolean;
  methods?: string[];
  headers?: string[];
}): MiddlewareFunction {
  return cors({origin = == 'production' ? false => {
      res.status(429).json({success = 30000): MiddlewareFunction {
  return (req => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
}

// Helper functions

/**
 * Validate an object against a schema
 */
function validateObject(obj = [];
  const warnings = [];

  // Basic validation - this would be expanded with a proper validator like Joi or Yup
  if (typeof obj !== 'object' || obj === null) {
    errors.push({
      field => {
    if (typeof schemaValue === 'object' && schemaValue !== null) {
      const fieldSchema = schemaValue as any;
      
      if (fieldSchema.required && !(key in obj)) {
        errors.push({field = typeof obj[key];
        if (actualType !== fieldSchema.type) {
          errors.push({field = == 0,
    errors,
    warnings
  };
}

/**
 * Get error name from status code
 */
function getErrorName(statusCode = {
      400: number): string {
  const errorNames: Record<number, string>,  400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };

  return errorNames[statusCode] || 'Unknown Error';
}

// Export all middleware functions
export {
  type securityHeaders as helmet,
  type corsMiddleware as cors,
  compression,
  type rateLimiter as rateLimit,
  type timeout as requestTimeout,
  requestLogger as logging,
  validateRequest as validation,
  type authenticate as auth,
  type authorize as authz,
  type errorHandler as errors,
  type enhanceResponse as enhance
};

// Export default middleware collection
export default {
  requestLogger,
  validateRequest,
  authenticate,
  authorize,
  errorHandler,
  enhanceResponse,
  securityHeaders,
  corsMiddleware,
  rateLimiter,
  timeout
};
