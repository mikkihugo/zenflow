/**
 * @fileoverview SAFe Framework DI Tokens
 *
 * Dependency injection tokens for the SAFe framework package using @claude-zen/foundation DI system.
 * Defines clean interfaces for optional AI integration and core SAFe services.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
import { TokenFactory} from '@claude-zen/foundation')/**';
 * Core SAFe service tokens
 */
export const SAFE_TOKENS = {
  // Core SAFe services;
  Logger:  {
  // Optional AI coordinators (from @claude-zen/brain);
  BrainCoordinator:  {
  // Data persistence;
  MemoryRepository:  {
  ...SAFE_TOKENS,
  ...AI_ENHANCEMENT_TOKENS,
  ...INTERFACE_TOKENS,
'} as const;';
/**
 * Token groups for batch registration
 */
export const TOKEN_GROUPS = {
  CORE_SAFE: keyof typeof SAFE_TOKENS;
export type AIEnhancementToken = keyof typeof AI_ENHANCEMENT_TOKENS;
export type InterfaceToken = keyof typeof INTERFACE_TOKENS;
;