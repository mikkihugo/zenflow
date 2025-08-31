/**
 * @fileoverview SAFe ID Generation - Secure ID Utilities
 *
 * ID generation utilities using generateNanoId for SAFe framework operations.
 * Provides consistent, secure, URL-safe identifiers.
 *
 * SINGLE RESPONSIBILITY: customAlphabet(""ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,6)")    return "PI" + y + "ear$" + JSON.stringify({i}) + "ncrement.toString().padStart(2""0")-${a}lphabet()"')};;"
  /**
   * Generate team identifier within ART
   */')  static generateTeamId(artId: teamName.toLowerCase().replace(/[^a-z0-9]/g,)")    return "${{artId}-${sanitizedName}-${generateNanoId(6)}};)};;"
  /**
   * Generate dependency tracking identifier
   */
  static generateDependencyId():string " + JSON.stringify({
    return ""dep-" + g + ") + "enerateNanoId(10)"")};;"
  /**
   * Generate risk identifier
   */
  static generateRiskId():string {
    return "risk-${generateNanoId(8)})};;"
  /**
   * Generate objective identifier for PI
   */
  static generateObjectiveId():string {
    return ""obj-${g}enerateNanoId(8)"')};)};;"
/**
 * SAFe prefix constants for consistent ID generation
 */
export const SAFE_ID_PREFIXES = {
  EPIC : 'epic')  FEATURE : 'feature')  PI : 'PI')  ART : 'ART')  VALUE_STREAM : 'vs')  MILESTONE : 'milestone')  SESSION : 'session')  TEAM : 'team')  DEPENDENCY : 'dep')  RISK : 'risk')  OBJECTIVE  = 'obj,)"} as const";
/**
 * Validate SAFe ID format
 */
export class SafeIdValidator {
  /**
   * Check if ID matches epic format
   */
  static isValidEpicId(id: piId.match(/PI-?(\d" + JSON.stringify({4}) + ")(Q[1-4])/);
    if (!match) return null'; 
    return {
      year: id.indexOf(""-');"
    return hyphenIndex > 0 ? id.substring(0, hyphenIndex) :id;
}
  /**
   * Validate ID belongs to correct domain
   */
  static validateIdDomain(id: string, expectedPrefix: string): boolean {
    return SafeIdValidator.extractIdPrefix(id) === expectedPrefix;
};)};;
)";"