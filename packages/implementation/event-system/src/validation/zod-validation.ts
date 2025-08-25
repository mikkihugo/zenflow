/**
 * @fileoverview Modern Event Validation - Zod Integration
 *
 * Professional event validation using zod schema validation library.
 * Replaces custom validation system with battle-tested industry standard.
 *
 * **BATTLE-TESTED DEPENDENCY:**
 * - zod: TypeScript-first schema validation with compile-time type inference
 *
 * Key Features:
 * - Compile-time type safety with runtime validation
 * - Rich schema composition and transformation
 * - Better error messages and performance than custom validation
 * - Foundation integration with Result patterns
 *
 * @example Basic event validation
 * ```typescript`
 * import { createEventValidator, EventSchemas } from '@claude-zen/event-system/validation';
 *
 * const validator = createEventValidator(EventSchemas.UserAction);
 * const result = validator.validate(eventData);
 *
 * if (result.success) {
 *   console.log('Valid event:', result.data);'
 * } else {
 *   console.error('Validation errors:', result.error.issues);'
 * }
 * ````
 */

import { z } from 'zod';
import { getLogger, Result, ok, err, safeAsync } from '@claude-zen/foundation';

const logger = getLogger('EventValidation');'

// =============================================================================
// ZOD EVENT SCHEMAS - Type-safe runtime validation
// =============================================================================

/**
 * Base event schema that all events must conform to
 */
export const BaseEventSchema = z.object({
  id: z.string().min(1).describe('Unique event identifier'),
  type: z.string().min(1).describe('Event type identifier'),
  domain: z
    .enum([
      'COORDINATION',
      'WORKFLOW',
      'NEURAL',
      'DATABASE',
      'MEMORY',
      'KNOWLEDGE',
      'INTERFACE',
      'CORE',
    ])
    .describe('Event domain for routing and validation'),
  timestamp: z.coerce.date().describe('Event creation timestamp'),
  version: z.string().default('1.0.0').describe('Event schema version'),
  payload: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Event payload data'),
  metadata: z
    .object({
      correlationId: z.string().optional(),
      causationId: z.string().optional(),
      source: z.string().optional(),
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      traceId: z.string().optional(),
      priority: z
        .enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'URGENT'])'
        .optional(),
      tags: z.array(z.string()).optional(),
      customData: z.record(z.string(), z.unknown()).optional(),
    })
    .optional()
    .describe('Event metadata for tracking and debugging'),
});

/**
 * Coordination domain event schemas
 */
export const CoordinationEventSchemas = {
  AgentCreated: BaseEventSchema.extend({
    type: z.literal('agent.created'),
    domain: z.literal('COORDINATION'),
    payload: z.object({
      agent: z.record(z.string(), z.unknown()),
      capabilities: z.array(z.string()),
      initialStatus: z.enum(['idle', 'busy']),
    }),
  }),

  TaskAssigned: BaseEventSchema.extend({
    type: z.literal('task.assigned'),
    domain: z.literal('COORDINATION'),
    payload: z.object({
      task: z.record(z.string(), z.unknown()),
      agentId: z.string(),
      assignmentTime: z.coerce.date(),
    }),
  }),

  TaskCompleted: BaseEventSchema.extend({
    type: z.literal('task.completed'),
    domain: z.literal('COORDINATION'),
    payload: z.object({
      taskId: z.string(),
      agentId: z.string(),
      result: z.unknown(),
      duration: z.number().positive(),
      success: z.boolean(),
    }),
  }),
};

/**
 * Workflow domain event schemas
 */
export const WorkflowEventSchemas = {
  WorkflowStarted: BaseEventSchema.extend({
    type: z.literal('workflow.started'),
    domain: z.literal('WORKFLOW'),
    payload: z.object({
      workflowId: z.string(),
      definition: z.record(z.string(), z.unknown()),
      context: z.record(z.string(), z.unknown()),
      startTime: z.coerce.date(),
    }),
  }),

  WorkflowCompleted: BaseEventSchema.extend({
    type: z.literal('workflow.completed'),
    domain: z.literal('WORKFLOW'),
    payload: z.object({
      workflowId: z.string(),
      result: z.unknown(),
      duration: z.number().positive(),
      stepsExecuted: z.number().int().nonnegative(),
    }),
  }),
};

/**
 * Interface domain event schemas (AGUI integration)
 */
export const InterfaceEventSchemas = {
  HumanValidationRequested: BaseEventSchema.extend({
    type: z.literal('human.validation.requested'),
    domain: z.literal('INTERFACE'),
    payload: z.object({
      requestId: z.string(),
      validationType: z.enum(['approval', 'selection', 'input', 'review']),
      context: z.record(z.string(), z.unknown()),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'URGENT']),
      timeout: z.number().positive().optional(),
    }),
  }),

  HumanValidationCompleted: BaseEventSchema.extend({
    type: z.literal('human.validation.completed'),
    domain: z.literal('INTERFACE'),
    payload: z.object({
      requestId: z.string(),
      approved: z.boolean(),
      input: z.unknown().optional(),
      feedback: z.string().optional(),
      processingTime: z.number().positive(),
    }),
  }),
};

/**
 * Core domain event schemas
 */
export const CoreEventSchemas = {
  SystemStarted: BaseEventSchema.extend({
    type: z.literal('system.started'),
    domain: z.literal('CORE'),
    payload: z.object({
      version: z.string(),
      startTime: z.coerce.date(),
      configuration: z.record(z.string(), z.unknown()),
    }),
  }),

  ErrorOccurred: BaseEventSchema.extend({
    type: z.literal('error.occurred'),
    domain: z.literal('CORE'),
    payload: z.object({
      error: z.instanceof(Error),
      context: z.record(z.string(), z.unknown()),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      recoverable: z.boolean(),
    }),
  }),
};

/**
 * Combined event schemas for easy access
 */
export const EventSchemas = {
  // Base schema
  BaseEvent: BaseEventSchema,

  // Domain-specific schemas
  ...CoordinationEventSchemas,
  ...WorkflowEventSchemas,
  ...InterfaceEventSchemas,
  ...CoreEventSchemas,
} as const;

// =============================================================================
// EVENT VALIDATOR CLASS - Modern zod-based validation
// =============================================================================

/**
 * Modern event validator using zod for schema validation.
 * Provides type-safe validation with excellent error messages.
 */
export class EventValidator<T = unknown> {
  constructor(
    private readonly schema: z.ZodSchema<T>,
    private readonly name: string = 'Unknown''
  ) {}

  /**
   * Validate event data against schema with Result pattern
   *
   * @param data - Event data to validate
   * @returns Result containing validated data or validation errors
   */
  validate(data: unknown): Result<T, Error> {
    try {
      const result = this.schema.safeParse(data);

      if (result.success) {
        logger.debug(`[EventValidator] Validation succeeded for ${this.name}`, {`
          schema: this.name,
          dataKeys: Object.keys(data as Record<string, unknown>),
        });
        return ok(result.data);
      } else {
        logger.warn(`[EventValidator] Validation failed for ${this.name}`, {`
          schema: this.name,
          errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
        return err(new Error(`Validation failed: ${result.error.message}`));`
      }
    } catch (error) {
      logger.error(
        `[EventValidator] Validation error for ${this.name}:`,`
        error
      );
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Async validation with error handling
   */
  async validateAsync(data: unknown): Promise<Result<T, Error>> {
    return safeAsync(async () => {
      const result = await this.schema.safeParseAsync(data);

      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    });
  }

  /**
   * Parse data directly (throws on validation error)
   */
  parse(data: unknown): T {
    return this.schema.parse(data);
  }

  /**
   * Check if data matches schema without parsing
   */
  isValid(data: unknown): boolean {
    return this.schema.safeParse(data).success;
  }

  /**
   * Get schema description for debugging
   */
  getSchemaDescription(): string {
    return this.schema.description||`Schema for ${this.name}`;`
  }
}

// =============================================================================
// VALIDATION CHAIN - Composable validation pipeline
// =============================================================================

/**
 * Modern validation chain for composing multiple validators.
 * Replaces custom ValidationChain with zod-based implementation.
 */
export class ValidationChain<T = unknown> {
  private validators: Array<EventValidator<any>> = [];

  /**
   * Add validator to the chain
   */
  add<U>(validator: EventValidator<U>): ValidationChain<T> {
    this.validators.push(validator);
    return this;
  }

  /**
   * Add schema directly to the chain
   */
  addSchema<U>(schema: z.ZodSchema<U>, name?: string): ValidationChain<T> {
    this.validators.push(new EventValidator(schema, name));
    return this;
  }

  /**
   * Validate data through entire chain
   * All validators must pass for success
   */
  validate(data: unknown): Result<T, Error[]> {
    const errors: Error[] = [];
    let lastValidData: any = data;

    for (const validator of this.validators) {
      const result = validator.validate(lastValidData);

      if (result.isOk()) {
        lastValidData = result.value;
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return err(errors);
    }

    return ok(lastValidData as T);
  }

  /**
   * Validate with first successful validator (OR logic)
   */
  validateAny(data: unknown): Result<unknown, Error[]> {
    const errors: Error[] = [];

    for (const validator of this.validators) {
      const result = validator.validate(data);

      if (result.isOk()) {
        return ok(result.value);
      } else {
        errors.push(result.error);
      }
    }

    return err(errors);
  }

  /**
   * Get number of validators in chain
   */
  get length(): number {
    return this.validators.length;
  }
}

// =============================================================================
// FACTORY FUNCTIONS - Convenient creation helpers
// =============================================================================

/**
 * Create event validator for specific schema
 */
export function createEventValidator<T>(
  schema: z.ZodSchema<T>,
  name?: string
): EventValidator<T> {
  return new EventValidator(schema, name);
}

/**
 * Create validation chain
 */
export function createValidationChain<T = unknown>(): ValidationChain<T> {
  return new ValidationChain<T>();
}

/**
 * Create validator for specific event type
 */
export function createTypedEventValidator<K extends keyof typeof EventSchemas>(
  eventType: K
): EventValidator<any> {
  return new EventValidator(
    EventSchemas[eventType] as any,
    eventType as string
  );
}

/**
 * Validate any event against base schema
 */
export function validateBaseEvent(
  data: unknown
): Result<z.infer<typeof BaseEventSchema>, Error> {
  const validator = new EventValidator(BaseEventSchema,'BaseEvent');'
  return validator.validate(data);
}

// =============================================================================
// TYPE EXPORTS - TypeScript type inference from schemas
// =============================================================================

export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type CoordinationEvent = z.infer<
  typeof CoordinationEventSchemas.AgentCreated
>;
export type WorkflowEvent = z.infer<
  typeof WorkflowEventSchemas.WorkflowStarted
>;
export type InterfaceEvent = z.infer<
  typeof InterfaceEventSchemas.HumanValidationRequested
>;
export type CoreEvent = z.infer<typeof CoreEventSchemas.SystemStarted>;

// Utility type to extract event types from schemas
export type EventTypeFromSchema<T extends z.ZodSchema> = z.infer<T>;

// Union type of all event schemas
export type AllEventTypes = {
  [K in keyof typeof EventSchemas]: z.infer<(typeof EventSchemas)[K]>;
}[keyof typeof EventSchemas];
