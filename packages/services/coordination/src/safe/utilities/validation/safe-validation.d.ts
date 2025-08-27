/**
 * @fileoverview SAFe Validation - Schema Validation
 *
 * Validation utilities using Zod for SAFe framework operations.
 * Provides runtime type safety for SAFe domain objects.
 *
 * SINGLE RESPONSIBILITY: Type validation for SAFe framework
 * FOCUSES ON: Epic validation, feature validation, PI planning validation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { z } from '@claude-zen/foundation';
/**
 * SAFe priority levels schema
 */
export declare const SafePrioritySchema: z.ZodEnum<["critical", "high", "medium", "low"]>;
/**
 * SAFe epic status schema
 */
export declare const EpicStatusSchema: z.ZodEnum<["draft", "analysis", "portfolio-backlog", "implementing", "done", "cancelled"]>;
/**
 * SAFe feature status schema
 */
export declare const FeatureStatusSchema: z.ZodEnum<["backlog", "analysis", "development", "testing", "deployment", "done"]>;
/**
 * SAFe value stream schema
 */
export declare const ValueStreamSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    businessOwner: z.ZodString;
    technicalOwner: z.ZodString;
    budget: z.ZodNumber;
    kpis: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        target: z.ZodNumber;
        actual: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        target?: number;
        actual?: number;
    }, {
        name?: string;
        target?: number;
        actual?: number;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    businessOwner?: string;
    technicalOwner?: string;
    budget?: number;
    kpis?: {
        name?: string;
        target?: number;
        actual?: number;
    }[];
}, {
    id?: string;
    name?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
    businessOwner?: string;
    technicalOwner?: string;
    budget?: number;
    kpis?: {
        name?: string;
        target?: number;
        actual?: number;
    }[];
}>;
/**
 * SAFe epic schema with comprehensive validation
 */
export declare const SafeEpicSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["draft", "analysis", "portfolio-backlog", "implementing", "done", "cancelled"]>;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    businessValue: z.ZodNumber;
    effort: z.ZodNumber;
    riskScore: z.ZodNumber;
    epicOwner: z.ZodString;
    valueStreamId: z.ZodString;
    dependencies: z.ZodArray<z.ZodString, "many">;
    acceptanceCriteria: z.ZodArray<z.ZodString, "many">;
    businessOutcome: z.ZodString;
    leadingIndicators: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        target: z.ZodNumber;
        current: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        target?: number;
        metric?: string;
        current?: number;
    }, {
        target?: number;
        metric?: string;
        current?: number;
    }>, "many">;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    targetPIStart: z.ZodOptional<z.ZodDate>;
    targetPIEnd: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    status?: "analysis" | "done" | "draft" | "portfolio-backlog" | "implementing" | "cancelled";
    description?: string;
    title?: string;
    dependencies?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    businessValue?: number;
    effort?: number;
    riskScore?: number;
    epicOwner?: string;
    valueStreamId?: string;
    acceptanceCriteria?: string[];
    businessOutcome?: string;
    leadingIndicators?: {
        target?: number;
        metric?: string;
        current?: number;
    }[];
    targetPIStart?: Date;
    targetPIEnd?: Date;
}, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    status?: "analysis" | "done" | "draft" | "portfolio-backlog" | "implementing" | "cancelled";
    description?: string;
    title?: string;
    dependencies?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    businessValue?: number;
    effort?: number;
    riskScore?: number;
    epicOwner?: string;
    valueStreamId?: string;
    acceptanceCriteria?: string[];
    businessOutcome?: string;
    leadingIndicators?: {
        target?: number;
        metric?: string;
        current?: number;
    }[];
    targetPIStart?: Date;
    targetPIEnd?: Date;
}>;
/**
 * SAFe feature schema
 */
export declare const SafeFeatureSchema: z.ZodObject<{
    id: z.ZodString;
    epicId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["backlog", "analysis", "development", "testing", "deployment", "done"]>;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    storyPoints: z.ZodNumber;
    businessValue: z.ZodNumber;
    artId: z.ZodString;
    teamId: z.ZodOptional<z.ZodString>;
    acceptanceCriteria: z.ZodArray<z.ZodString, "many">;
    testStrategy: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodArray<z.ZodString, "many">;
    isCommitted: z.ZodDefault<z.ZodBoolean>;
    piId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    status?: "backlog" | "analysis" | "development" | "testing" | "done" | "deployment";
    description?: string;
    title?: string;
    dependencies?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    businessValue?: number;
    acceptanceCriteria?: string[];
    epicId?: string;
    storyPoints?: number;
    artId?: string;
    teamId?: string;
    testStrategy?: string;
    isCommitted?: boolean;
    piId?: string;
}, {
    id?: string;
    priority?: "critical" | "high" | "medium" | "low";
    status?: "backlog" | "analysis" | "development" | "testing" | "done" | "deployment";
    description?: string;
    title?: string;
    dependencies?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    businessValue?: number;
    acceptanceCriteria?: string[];
    epicId?: string;
    storyPoints?: number;
    artId?: string;
    teamId?: string;
    testStrategy?: string;
    isCommitted?: boolean;
    piId?: string;
}>;
/**
 * SAFe Program Increment (PI) schema
 */
export declare const ProgramIncrementSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    objectives: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        businessValue: z.ZodNumber;
        uncommitted: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }, {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }>, "many">;
    capacity: z.ZodNumber;
    features: z.ZodArray<z.ZodString, "many">;
    risks: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        impact: z.ZodEnum<["high", "medium", "low"]>;
        mitigation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }, {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }>, "many">;
    status: z.ZodEnum<["planning", "execution", "innovation", "completed"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    status?: "completed" | "planning" | "execution" | "innovation";
    createdAt?: Date;
    updatedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    objectives?: {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }[];
    capacity?: number;
    features?: string[];
    risks?: {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }[];
}, {
    id?: string;
    name?: string;
    status?: "completed" | "planning" | "execution" | "innovation";
    createdAt?: Date;
    updatedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    objectives?: {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }[];
    capacity?: number;
    features?: string[];
    risks?: {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }[];
}>, {
    id?: string;
    name?: string;
    status?: "completed" | "planning" | "execution" | "innovation";
    createdAt?: Date;
    updatedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    objectives?: {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }[];
    capacity?: number;
    features?: string[];
    risks?: {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }[];
}, {
    id?: string;
    name?: string;
    status?: "completed" | "planning" | "execution" | "innovation";
    createdAt?: Date;
    updatedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    objectives?: {
        description?: string;
        businessValue?: number;
        uncommitted?: boolean;
    }[];
    capacity?: number;
    features?: string[];
    risks?: {
        description?: string;
        impact?: "high" | "medium" | "low";
        mitigation?: string;
    }[];
}>;
/**
 * SAFe Agile Release Train (ART) schema
 */
export declare const AgileReleaseTrainSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    valueStreamId: z.ZodString;
    releaseTrainEngineer: z.ZodString;
    productManager: z.ZodString;
    systemArchitect: z.ZodString;
    teams: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        scrumMaster: z.ZodString;
        productOwner: z.ZodString;
        capacity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        capacity?: number;
        scrumMaster?: string;
        productOwner?: string;
    }, {
        id?: string;
        name?: string;
        capacity?: number;
        scrumMaster?: string;
        productOwner?: string;
    }>, "many">;
    capacity: z.ZodNumber;
    velocity: z.ZodOptional<z.ZodNumber>;
    currentPI: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    valueStreamId?: string;
    capacity?: number;
    releaseTrainEngineer?: string;
    productManager?: string;
    systemArchitect?: string;
    teams?: {
        id?: string;
        name?: string;
        capacity?: number;
        scrumMaster?: string;
        productOwner?: string;
    }[];
    velocity?: number;
    currentPI?: string;
}, {
    id?: string;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
    valueStreamId?: string;
    capacity?: number;
    releaseTrainEngineer?: string;
    productManager?: string;
    systemArchitect?: string;
    teams?: {
        id?: string;
        name?: string;
        capacity?: number;
        scrumMaster?: string;
        productOwner?: string;
    }[];
    velocity?: number;
    currentPI?: string;
}>;
/**
 * SAFe validation utilities class
 */
export declare class SafeValidationUtils {
    /**
     * Validate epic creation input
     */
    static validateEpic(input: unknown): z.SafeParseReturnType<{
        id?: string;
        priority?: "critical" | "high" | "medium" | "low";
        status?: "analysis" | "done" | "draft" | "portfolio-backlog" | "implementing" | "cancelled";
        description?: string;
        title?: string;
        dependencies?: string[];
        createdAt?: Date;
        updatedAt?: Date;
        businessValue?: number;
        effort?: number;
        riskScore?: number;
        epicOwner?: string;
        valueStreamId?: string;
        acceptanceCriteria?: string[];
        businessOutcome?: string;
        leadingIndicators?: {
            target?: number;
            metric?: string;
            current?: number;
        }[];
        targetPIStart?: Date;
        targetPIEnd?: Date;
    }, {
        id?: string;
        priority?: "critical" | "high" | "medium" | "low";
        status?: "analysis" | "done" | "draft" | "portfolio-backlog" | "implementing" | "cancelled";
        description?: string;
        title?: string;
        dependencies?: string[];
        createdAt?: Date;
        updatedAt?: Date;
        businessValue?: number;
        effort?: number;
        riskScore?: number;
        epicOwner?: string;
        valueStreamId?: string;
        acceptanceCriteria?: string[];
        businessOutcome?: string;
        leadingIndicators?: {
            target?: number;
            metric?: string;
            current?: number;
        }[];
        targetPIStart?: Date;
        targetPIEnd?: Date;
    }>;
    /**
     * Validate feature creation input
     */
    static validateFeature(input: unknown): z.SafeParseReturnType<{
        id?: string;
        priority?: "critical" | "high" | "medium" | "low";
        status?: "backlog" | "analysis" | "development" | "testing" | "done" | "deployment";
        description?: string;
        title?: string;
        dependencies?: string[];
        createdAt?: Date;
        updatedAt?: Date;
        businessValue?: number;
        acceptanceCriteria?: string[];
        epicId?: string;
        storyPoints?: number;
        artId?: string;
        teamId?: string;
        testStrategy?: string;
        isCommitted?: boolean;
        piId?: string;
    }, {
        id?: string;
        priority?: "critical" | "high" | "medium" | "low";
        status?: "backlog" | "analysis" | "development" | "testing" | "done" | "deployment";
        description?: string;
        title?: string;
        dependencies?: string[];
        createdAt?: Date;
        updatedAt?: Date;
        businessValue?: number;
        acceptanceCriteria?: string[];
        epicId?: string;
        storyPoints?: number;
        artId?: string;
        teamId?: string;
        testStrategy?: string;
        isCommitted?: boolean;
        piId?: string;
    }>;
    /**
     * Validate PI creation input
     */
    static validateProgramIncrement(input: unknown): z.SafeParseReturnType<{
        id?: string;
        name?: string;
        status?: "completed" | "planning" | "execution" | "innovation";
        createdAt?: Date;
        updatedAt?: Date;
        startDate?: Date;
        endDate?: Date;
        objectives?: {
            description?: string;
            businessValue?: number;
            uncommitted?: boolean;
        }[];
        capacity?: number;
        features?: string[];
        risks?: {
            description?: string;
            impact?: "high" | "medium" | "low";
            mitigation?: string;
        }[];
    }, {
        id?: string;
        name?: string;
        status?: "completed" | "planning" | "execution" | "innovation";
        createdAt?: Date;
        updatedAt?: Date;
        startDate?: Date;
        endDate?: Date;
        objectives?: {
            description?: string;
            businessValue?: number;
            uncommitted?: boolean;
        }[];
        capacity?: number;
        features?: string[];
        risks?: {
            description?: string;
            impact?: "high" | "medium" | "low";
            mitigation?: string;
        }[];
    }>;
    /**
     * Validate ART configuration
     */
    static validateART(input: unknown): z.SafeParseReturnType<{
        id?: string;
        name?: string;
        createdAt?: Date;
        updatedAt?: Date;
        valueStreamId?: string;
        capacity?: number;
        releaseTrainEngineer?: string;
        productManager?: string;
        systemArchitect?: string;
        teams?: {
            id?: string;
            name?: string;
            capacity?: number;
            scrumMaster?: string;
            productOwner?: string;
        }[];
        velocity?: number;
        currentPI?: string;
    }, {
        id?: string;
        name?: string;
        createdAt?: Date;
        updatedAt?: Date;
        valueStreamId?: string;
        capacity?: number;
        releaseTrainEngineer?: string;
        productManager?: string;
        systemArchitect?: string;
        teams?: {
            id?: string;
            name?: string;
            capacity?: number;
            scrumMaster?: string;
            productOwner?: string;
        }[];
        velocity?: number;
        currentPI?: string;
    }>;
    /**
     * Validate value stream configuration
     */
    static validateValueStream(input: unknown): z.SafeParseReturnType<{
        id?: string;
        name?: string;
        description?: string;
        createdAt?: Date;
        updatedAt?: Date;
        businessOwner?: string;
        technicalOwner?: string;
        budget?: number;
        kpis?: {
            name?: string;
            target?: number;
            actual?: number;
        }[];
    }, {
        id?: string;
        name?: string;
        description?: string;
        createdAt?: Date;
        updatedAt?: Date;
        businessOwner?: string;
        technicalOwner?: string;
        budget?: number;
        kpis?: {
            name?: string;
            target?: number;
            actual?: number;
        }[];
    }>;
    /**
     * Validate WSJF scoring input
     */
    static validateWSJFScoring(input: unknown): z.SafeParseReturnType<{
        businessValue?: number;
        urgency?: number;
        riskReduction?: number;
        size?: number;
    }, {
        businessValue?: number;
        urgency?: number;
        riskReduction?: number;
        size?: number;
    }>;
    /**
     * Validate epic dependency chain (no circular dependencies)
     */
    static validateEpicDependencies(epics: Array<{
        id: string;
        dependencies: string[];
    }>): {
        isValid: boolean;
        circularDependencies: string[];
        errors: string[];
    };
}
//# sourceMappingURL=safe-validation.d.ts.map