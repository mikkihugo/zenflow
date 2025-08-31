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
import { z} from '@claude-zen/foundation')// ============================================================================ = ''; 
// CORE SAFE DOMAIN SCHEMAS
// =============================================================================
/**
 * SAFe priority levels schema
 */
export const SafePrioritySchema = z.enum(['critical,' high,'medium,' low]);
/**
 * SAFe epic status schema
 */')export const EpicStatusSchema = z.enum([') 'draft,';
 'analysis,') 'portfolio-backlog,';
 'implementing,') 'done,';
 'cancelled,';
]);
/**
 * SAFe feature status schema
 */
export const FeatureStatusSchema = z.enum([';];;
 'backlog,') 'analysis,';
 'development,') 'testing,';
 'deployment,') 'done,';
]);
/**
 * SAFe value stream schema
 */
export const ValueStreamSchema = z.object({
  id: z.object({
  id: z.object({
  id: z;
  .object({
    id: z.string(),
    name: z.string().min(1),
    startDate: z.date(),
    endDate: z.date(),
    objectives: z.array(
      z.object({
        description: z.string(),
        businessValue: z.number().min(1).max(10),
        uncommitted: z.boolean().default(false),
};
    ),
    capacity: z.number().positive(),
    features: z.array(z.string()),
    risks: z.array(
      z.object({
        description: z.string(),
        impact: z.enum(['high,' medium,'low']),';
        mitigation: z.string(),
};
    ),')    status: z.enum(['planning,' execution,'innovation,' completed']),';
    createdAt: z.date(),
    updatedAt: z.date(),
};
  .refine((data) => data.endDate > data.startDate, {
    ')    message,});
/**
 * SAFe Agile Release Train (ART) schema
 */
export const AgileReleaseTrainSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  valueStreamId: z.string(),
  releaseTrainEngineer: z.string(),
  productManager: z.string(),
  systemArchitect: z.string(),
  teams: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      scrumMaster: z.string(),
      productOwner: z.string(),
      capacity: z.number().positive(),
};
  ),
  capacity: z.number().positive(),
  velocity: z.number().positive().optional(),
  currentPI: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),')'});
// =============================================================================
// VALIDATION UTILITY FUNCTIONS
// =============================================================================
/**
 * SAFe validation utilities class
 */
export class SafeValidationUtils {
  /**
   * Validate epic creation input
   */
  static validateEpic(input: z.object({
      businessValue: [];
    const _circularDependencies: [];
    // Create adjacency list
    const __graph = new Map<string, string[]>();
    const epicIds = new Set(epics.map((e) => e.id);
    epics.forEach((epic) => {
      // Check if dependencies exist
      epic.dependencies.forEach((depId) => {
        if (!epicIds.has(depId)) {
          errors.push("Epic "${epic.id} depends on non-existent epic ${depId})")};;"
});
      graph.set(epic.id, epic.dependencies);
});
    // Check for circular dependencies using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const hasCycle = (epicId: string): boolean => {
      if (recursionStack.has(epicId)) {
        circularDependencies.push(epicId);
        return true;
}
      if (visited.has(epicId)) {
        return false;
}
      visited.add(epicId);
      recursionStack.add(epicId);
      const dependencies = graph.get(epicId)|| [];
      for (const depId of dependencies) {
        if (hasCycle(depId)) {
          return true;
}
}
      recursionStack.delete(epicId);
      return false;
};
    epics.forEach((epic) => {
      if (!visited.has(epic.id)) {
        hasCycle(epic.id);
}
});
    return {
      isValid: errors.length === 0 && circularDependencies.length === 0,
      circularDependencies,
      errors,
};
}
  /**
   * Validate PI capacity vs committed features
   */
  static validatePICapacity(
    piCapacity: committedFeatures.reduce(
      (sum, feature) => sum + feature.storyPoints,
      0;
    );
    const utilization = piCapacity > 0 ? totalCommitted / piCapacity: Math.max(0, totalCommitted - piCapacity);
    const recommendedCapacity = Math.ceil(totalCommitted * 1.2); // 20% buffer
    return {
      isValid: utilization <= 1.0,
      utilization,
      overcommitment,
      recommendedCapacity,
};
}
}
// =============================================================================
// CONVENIENCE VALIDATION FUNCTIONS
// =============================================================================
/**
 * Validate epic with comprehensive error reporting
 */
export function validateSafeEpic(input: unknown) {
  return SafeEpicSchema.safeParse(input);
}
/**
 * Validate feature with comprehensive error reporting
 */
export function validateSafeFeature(input: unknown) {
  return SafeFeatureSchema.safeParse(input);
}
/**
 * Validate PI with comprehensive error reporting
 */
export function validateProgramIncrement(input: unknown) {
  return ProgramIncrementSchema.safeParse(input);
};""