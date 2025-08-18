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
 * ```typescript
 * import { createEventValidator, EventSchemas } from '@claude-zen/event-system/validation';
 *
 * const validator = createEventValidator(EventSchemas.UserAction);
 * const result = validator.validate(eventData);
 *
 * if (result.success) {
 *   console.log('Valid event:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */
import { z } from 'zod';
import { Result } from '@claude-zen/foundation';
/**
 * Base event schema that all events must conform to
 */
export declare const BaseEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    domain: z.ZodEnum<{
        COORDINATION: "COORDINATION";
        WORKFLOW: "WORKFLOW";
        NEURAL: "NEURAL";
        DATABASE: "DATABASE";
        MEMORY: "MEMORY";
        KNOWLEDGE: "KNOWLEDGE";
        INTERFACE: "INTERFACE";
        CORE: "CORE";
    }>;
    timestamp: z.ZodCoercedDate<unknown>;
    version: z.ZodDefault<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodOptional<z.ZodObject<{
        correlationId: z.ZodOptional<z.ZodString>;
        causationId: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
        sessionId: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodEnum<{
            LOW: "LOW";
            NORMAL: "NORMAL";
            HIGH: "HIGH";
            CRITICAL: "CRITICAL";
            URGENT: "URGENT";
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Coordination domain event schemas
 */
export declare const CoordinationEventSchemas: {
    AgentCreated: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"agent.created">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            agent: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            capabilities: z.ZodArray<z.ZodString>;
            initialStatus: z.ZodEnum<{
                idle: "idle";
                busy: "busy";
            }>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    TaskAssigned: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"task.assigned">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            task: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            agentId: z.ZodString;
            assignmentTime: z.ZodCoercedDate<unknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    TaskCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"task.completed">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            taskId: z.ZodString;
            agentId: z.ZodString;
            result: z.ZodUnknown;
            duration: z.ZodNumber;
            success: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
/**
 * Workflow domain event schemas
 */
export declare const WorkflowEventSchemas: {
    WorkflowStarted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"workflow.started">;
        domain: z.ZodLiteral<"WORKFLOW">;
        payload: z.ZodObject<{
            workflowId: z.ZodString;
            definition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            startTime: z.ZodCoercedDate<unknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    WorkflowCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"workflow.completed">;
        domain: z.ZodLiteral<"WORKFLOW">;
        payload: z.ZodObject<{
            workflowId: z.ZodString;
            result: z.ZodUnknown;
            duration: z.ZodNumber;
            stepsExecuted: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
/**
 * Interface domain event schemas (AGUI integration)
 */
export declare const InterfaceEventSchemas: {
    HumanValidationRequested: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"human.validation.requested">;
        domain: z.ZodLiteral<"INTERFACE">;
        payload: z.ZodObject<{
            requestId: z.ZodString;
            validationType: z.ZodEnum<{
                approval: "approval";
                selection: "selection";
                input: "input";
                review: "review";
            }>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            priority: z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>;
            timeout: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    HumanValidationCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"human.validation.completed">;
        domain: z.ZodLiteral<"INTERFACE">;
        payload: z.ZodObject<{
            requestId: z.ZodString;
            approved: z.ZodBoolean;
            input: z.ZodOptional<z.ZodUnknown>;
            feedback: z.ZodOptional<z.ZodString>;
            processingTime: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
/**
 * Core domain event schemas
 */
export declare const CoreEventSchemas: {
    SystemStarted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"system.started">;
        domain: z.ZodLiteral<"CORE">;
        payload: z.ZodObject<{
            version: z.ZodString;
            startTime: z.ZodCoercedDate<unknown>;
            configuration: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    ErrorOccurred: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"error.occurred">;
        domain: z.ZodLiteral<"CORE">;
        payload: z.ZodObject<{
            error: z.ZodCustom<Error, Error>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            severity: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
                critical: "critical";
            }>;
            recoverable: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
/**
 * Combined event schemas for easy access
 */
export declare const EventSchemas: {
    readonly SystemStarted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"system.started">;
        domain: z.ZodLiteral<"CORE">;
        payload: z.ZodObject<{
            version: z.ZodString;
            startTime: z.ZodCoercedDate<unknown>;
            configuration: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly ErrorOccurred: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"error.occurred">;
        domain: z.ZodLiteral<"CORE">;
        payload: z.ZodObject<{
            error: z.ZodCustom<Error, Error>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            severity: z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
                critical: "critical";
            }>;
            recoverable: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly HumanValidationRequested: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"human.validation.requested">;
        domain: z.ZodLiteral<"INTERFACE">;
        payload: z.ZodObject<{
            requestId: z.ZodString;
            validationType: z.ZodEnum<{
                approval: "approval";
                selection: "selection";
                input: "input";
                review: "review";
            }>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            priority: z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>;
            timeout: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly HumanValidationCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"human.validation.completed">;
        domain: z.ZodLiteral<"INTERFACE">;
        payload: z.ZodObject<{
            requestId: z.ZodString;
            approved: z.ZodBoolean;
            input: z.ZodOptional<z.ZodUnknown>;
            feedback: z.ZodOptional<z.ZodString>;
            processingTime: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly WorkflowStarted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"workflow.started">;
        domain: z.ZodLiteral<"WORKFLOW">;
        payload: z.ZodObject<{
            workflowId: z.ZodString;
            definition: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            context: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            startTime: z.ZodCoercedDate<unknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly WorkflowCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"workflow.completed">;
        domain: z.ZodLiteral<"WORKFLOW">;
        payload: z.ZodObject<{
            workflowId: z.ZodString;
            result: z.ZodUnknown;
            duration: z.ZodNumber;
            stepsExecuted: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly AgentCreated: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"agent.created">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            agent: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            capabilities: z.ZodArray<z.ZodString>;
            initialStatus: z.ZodEnum<{
                idle: "idle";
                busy: "busy";
            }>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly TaskAssigned: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"task.assigned">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            task: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            agentId: z.ZodString;
            assignmentTime: z.ZodCoercedDate<unknown>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly TaskCompleted: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"task.completed">;
        domain: z.ZodLiteral<"COORDINATION">;
        payload: z.ZodObject<{
            taskId: z.ZodString;
            agentId: z.ZodString;
            result: z.ZodUnknown;
            duration: z.ZodNumber;
            success: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
    readonly BaseEvent: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        domain: z.ZodEnum<{
            COORDINATION: "COORDINATION";
            WORKFLOW: "WORKFLOW";
            NEURAL: "NEURAL";
            DATABASE: "DATABASE";
            MEMORY: "MEMORY";
            KNOWLEDGE: "KNOWLEDGE";
            INTERFACE: "INTERFACE";
            CORE: "CORE";
        }>;
        timestamp: z.ZodCoercedDate<unknown>;
        version: z.ZodDefault<z.ZodString>;
        payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        metadata: z.ZodOptional<z.ZodObject<{
            correlationId: z.ZodOptional<z.ZodString>;
            causationId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            userId: z.ZodOptional<z.ZodString>;
            sessionId: z.ZodOptional<z.ZodString>;
            traceId: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<{
                LOW: "LOW";
                NORMAL: "NORMAL";
                HIGH: "HIGH";
                CRITICAL: "CRITICAL";
                URGENT: "URGENT";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            customData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
/**
 * Modern event validator using zod for schema validation.
 * Provides type-safe validation with excellent error messages.
 */
export declare class EventValidator<T = unknown> {
    private readonly schema;
    private readonly name;
    constructor(schema: z.ZodSchema<T>, name?: string);
    /**
     * Validate event data against schema with Result pattern
     *
     * @param data - Event data to validate
     * @returns Result containing validated data or validation errors
     */
    validate(data: unknown): Result<T, Error>;
    /**
     * Async validation with error handling
     */
    validateAsync(data: unknown): Promise<Result<T, Error>>;
    /**
     * Parse data directly (throws on validation error)
     */
    parse(data: unknown): T;
    /**
     * Check if data matches schema without parsing
     */
    isValid(data: unknown): boolean;
    /**
     * Get schema description for debugging
     */
    getSchemaDescription(): string;
}
/**
 * Modern validation chain for composing multiple validators.
 * Replaces custom ValidationChain with zod-based implementation.
 */
export declare class ValidationChain<T = unknown> {
    private validators;
    /**
     * Add validator to the chain
     */
    add<U>(validator: EventValidator<U>): ValidationChain<T>;
    /**
     * Add schema directly to the chain
     */
    addSchema<U>(schema: z.ZodSchema<U>, name?: string): ValidationChain<T>;
    /**
     * Validate data through entire chain
     * All validators must pass for success
     */
    validate(data: unknown): Result<T, Error[]>;
    /**
     * Validate with first successful validator (OR logic)
     */
    validateAny(data: unknown): Result<unknown, Error[]>;
    /**
     * Get number of validators in chain
     */
    get length(): number;
}
/**
 * Create event validator for specific schema
 */
export declare function createEventValidator<T>(schema: z.ZodSchema<T>, name?: string): EventValidator<T>;
/**
 * Create validation chain
 */
export declare function createValidationChain<T = unknown>(): ValidationChain<T>;
/**
 * Create validator for specific event type
 */
export declare function createTypedEventValidator<K extends keyof typeof EventSchemas>(eventType: K): EventValidator<any>;
/**
 * Validate any event against base schema
 */
export declare function validateBaseEvent(data: unknown): Result<z.infer<typeof BaseEventSchema>, Error>;
export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type CoordinationEvent = z.infer<typeof CoordinationEventSchemas.AgentCreated>;
export type WorkflowEvent = z.infer<typeof WorkflowEventSchemas.WorkflowStarted>;
export type InterfaceEvent = z.infer<typeof InterfaceEventSchemas.HumanValidationRequested>;
export type CoreEvent = z.infer<typeof CoreEventSchemas.SystemStarted>;
export type EventTypeFromSchema<T extends z.ZodSchema> = z.infer<T>;
export type AllEventTypes = {
    [K in keyof typeof EventSchemas]: z.infer<typeof EventSchemas[K]>;
}[keyof typeof EventSchemas];
//# sourceMappingURL=zod-validation.d.ts.map