/**
 * @fileoverview SAFe ID Generation - Secure ID Utilities
 *
 * ID generation utilities using nanoid for SAFe framework operations.
 * Provides consistent, secure, URL-safe identifiers.
 *
 * SINGLE RESPONSIBILITY: ID generation for SAFe framework
 * FOCUSES ON: Epic IDs, Feature IDs, PI IDs, ART IDs
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { nanoid, customAlphabet } from 'nanoid';

/**
 * SAFe ID generation utilities
 */
export class SafeIdUtils {
  /**
   * Generate epic identifier
   */
  static generateEpicId(): string {
    return `epic-${nanoid(12)}`;
  }

  /**
   * Generate feature identifier
   */
  static generateFeatureId(): string {
    return `feature-${nanoid(10)}`;
  }

  /**
   * Generate Program Increment identifier
   */
  static generatePIId(quarter: string, year: number): string {
    return `PI-${year}${quarter}-${nanoid(8)}`;
  }

  /**
   * Generate ART identifier
   */
  static generateARTId(valueStreamPrefix: string): string {
    return `${valueStreamPrefix}-ART-${nanoid(8)}`;
  }

  /**
   * Generate value stream identifier
   */
  static generateValueStreamId(): string {
    return `vs-${nanoid(10)}`;
  }

  /**
   * Generate milestone identifier
   */
  static generateMilestoneId(): string {
    return `milestone-${nanoid(8)}`;
  }

  /**
   * Generate session identifier for PI planning
   */
  static generateSessionId(): string {
    return `session-${nanoid(16)}`;
  }

  /**
   * Generate human-readable PI identifier
   */
  static generateReadablePIId(year: number, increment: number): string {
    const alphabet = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
    return `PI${year}${increment.toString().padStart(2, '0')}-${alphabet()}`;
  }

  /**
   * Generate team identifier within ART
   */
  static generateTeamId(artId: string, teamName: string): string {
    const sanitizedName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${artId}-${sanitizedName}-${nanoid(6)}`;
  }

  /**
   * Generate dependency tracking identifier
   */
  static generateDependencyId(): string {
    return `dep-${nanoid(10)}`;
  }

  /**
   * Generate risk identifier
   */
  static generateRiskId(): string {
    return `risk-${nanoid(8)}`;
  }

  /**
   * Generate objective identifier for PI
   */
  static generateObjectiveId(): string {
    return `obj-${nanoid(8)}`;
  }
}

/**
 * SAFe prefix constants for consistent ID generation
 */
export const SAFE_ID_PREFIXES = {
  EPIC: 'epic',
  FEATURE: 'feature',
  PI: 'PI',
  ART: 'ART',
  VALUE_STREAM: 'vs',
  MILESTONE: 'milestone',
  SESSION: 'session',
  TEAM: 'team',
  DEPENDENCY: 'dep',
  RISK: 'risk',
  OBJECTIVE: 'obj',
} as const;

/**
 * Validate SAFe ID format
 */
export class SafeIdValidator {
  /**
   * Check if ID matches epic format
   */
  static isValidEpicId(id: string): boolean {
    return /^epic-[A-Za-z0-9_-]{12}$/.test(id);
  }

  /**
   * Check if ID matches feature format
   */
  static isValidFeatureId(id: string): boolean {
    return /^feature-[A-Za-z0-9_-]{10}$/.test(id);
  }

  /**
   * Check if ID matches PI format
   */
  static isValidPIId(id: string): boolean {
    return (
      /^PI\d{4}Q[1-4]-[A-Za-z0-9_-]{8}$/.test(id) || /^PI-\d{4}Q[1-4]-[A-Za-z0-9_-]{8}$/.test(id)
    );
  }

  /**
   * Extract year and quarter from PI ID
   */
  static parsePIId(piId: string): { year: number; quarter: string }' | 'null {
    const match = piId.match(/PI-?(\d{4})(Q[1-4])/);
    if (!match) return null;

    return {
      year: parseInt(match[1], 10),
      quarter: match[2],
    };
  }

  /**
   * Check if ID matches ART format
   */
  static isValidARTId(id: string): boolean {
    return /^.+-ART-[A-Za-z0-9_-]{8}$/.test(id);
  }

  /**
   * Extract prefix from any SAFe ID
   */
  static extractIdPrefix(id: string): string {
    const hyphenIndex = id.indexOf('-');
    return hyphenIndex > 0 ? id.substring(0, hyphenIndex) : id;
  }

  /**
   * Validate ID belongs to correct domain
   */
  static validateIdDomain(id: string, expectedPrefix: string): boolean {
    return this.extractIdPrefix(id) === expectedPrefix;
  }
}
