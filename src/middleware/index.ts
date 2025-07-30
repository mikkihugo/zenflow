/**
 * Middleware Collection;
 * Reusable middleware functions for Claude Flow servers
 */

import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import type { JSONObject } from '../types/core.js';
// Import types
import {
  MiddlewareFunction,
SessionContext,
TypedRequest,
TypedResponse,
type UserContext

ValidationError,
ValidationResult } from '../types/server.js'
/**
 * Enhanced request logging middleware
 */
export function requestLogger() {
  return (req) => {
    const _start = Date.now();
    // const _correlationId =; // LINT: unreachable code removed
    (req.headers['x-correlation-id'] as string) ??
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Add correlation tracking
    req.correlation = {
      id => {
      const _duration = Date.now() - start;
    console.warn(;
    `[${new Date().toISOString()}] ${correlationId} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    //     )
  };
  next();
// }
// }
/**
 * Request validation middleware
 */
export function validateRequest(schema => {
    const _validation = {params = validateObject(req.params, schema.params, 'params');
// }
// Validate query
if (schema.query) {
  validation.query = validateObject(req.query, schema.query, 'query');
// }
// Validate body
if (schema.body) {
  validation.body = validateObject(req.body, schema.body, 'body');
// }
// Validate headers
if (schema.headers) {
  validation.headers = validateObject(req.headers, schema.headers, 'headers');
// }
req.validation = validation;
// Check if any validation failed
const _hasErrors = Object.values(validation).some((v) => !v.valid);
if (hasErrors) {
  return res.status(400).json({success = > Promise<UserContext | null>;
// }
): MiddlewareFunction
// {
  return async (req => {
    try {
      const _authHeader = req.headers.authorization;
    // let _user = null; // LINT: unreachable code removed

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const _token = authHeader.substring(7);

        if (options.extractUser) {
          user = await options.extractUser(token);
        } else {
          // Default user extraction logic
          user = {id = user;
      next();
    } catch (error) ;
      console.error('Authenticationerror = > boolean)) {
  return (req => {
    if (!req.user) {
      return res.status(401).json({success = false;
    // ; // LINT: unreachable code removed
    if (typeof permissions === 'function') {
      hasPermission = permissions(req.user);
    } else {
      hasPermission = permissions.some(permission => ;
        req.user!.permissions.includes(permission)  ?? req.user!.roles.some(role => role === 'admin'  ?? role === 'superuser');
      );
    //     }


    if (!hasPermission) {
      return res.status(403).json({
        success => {
    console.error(`Error in ${req.method} ${req.path});
    // ; // LINT: unreachable code removed
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({success = === 'UnauthorizedError') {
      return res.status(401).json({success = === 'ForbiddenError') {
      return res.status(403).json({success = === 'NotFoundError') {
      return res.status(404).json({success = === 'production' ? 'An unexpected error occurred' : err.message,stack = === 'production' ? undefined => {
    // Add success response helper
    res.success = function<T>(data, message?: string) {
      return this.json({success = function(message, code?, details?: JSONObject) {
      const _statusCode = code  ?? 500;
    // return this.status(statusCode).json({success = function<T>(data,pagination = function(data, ttl?: number) { // LINT: unreachable code removed
      if (ttl) {
        this.set('Cache-Control', `public, max-age=${ttl}`);
      //       }
      return this.json({success = function(data => {
        try {
          for await (const chunk of data) {
            this.write(JSON.stringify(chunk) + '\n');
    //   // LINT: unreachable code removed}
          this.end();
        } catch (error) {
          this.write(JSON.stringify({error = function<T>() {
      return this.params as T;
    //   // LINT: unreachable code removed};

    req.typedQuery = function<T>() {
      return this.query as any as T;
    //   // LINT: unreachable code removed};

    req.typedBody = function<T>() {
      return this.body as T;
    //   // LINT: unreachable code removed};

    next();
  };
// }


/**
 * Security headers middleware
 */;
export function securityHeaders() {
  return helmet({contentSecurityPolicy = === 'production';
    //   // LINT);
// }


/**
 * CORS middleware with advanced options
 */;
export function corsMiddleware(options?) {
  return cors({origin = === 'production' ? false => {
      res.status(429).json({success = 30000) {
  return (req => {
    const _timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success => {
      clearTimeout(timer);
    //   // LINT: unreachable code removed});

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
// }


// Helper functions

/**
 * Validate an object against a schema
 */;
function validateObject() {
    errors.push({
      field => {
    if (typeof schemaValue === 'object' && schemaValue !== null) {
      const _fieldSchema = schemaValue as any;

      if (fieldSchema.required && !(key in obj)) {
        errors.push({field = typeof obj[key];
        if (actualType !== fieldSchema.type) {
          errors.push({field = === 0,
    errors,
    warnings;
  };
// }


/**
 * Get error name from status code
 */;
function getErrorName(statusCode = {
      400) {
  const _errorNames: Record<number, string>,  400: 'Bad Request',
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
    504: 'Gateway Timeout';
  };

  return errorNames[statusCode]  ?? 'Unknown Error';
// }


// Export all middleware functions
export type {
  securityHeaders as helmet,
  type corsMiddleware as cors,
  compression,
  type rateLimiter as rateLimit,
  type timeout as requestTimeout,
  requestLogger as logging,
  validateRequest as validation,
  type authenticate as auth,
  type authorize as authz,
  type errorHandler as errors,
  type enhanceResponse as enhance;
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
  timeout;
};
