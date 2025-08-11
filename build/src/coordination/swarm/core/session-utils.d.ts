/**
 * @file Coordination system: session-utils.
 */
import type { SessionCheckpoint, SessionState } from './session-manager.ts';
import type { SwarmOptions, SwarmState } from './types.ts';
/**
 * Session validation utilities.
 *
 * @example
 */
export declare class SessionValidator {
    /**
     * Validate session state integrity.
     *
     * @param state
     */
    static validateSessionState(state: SessionState): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Validate swarm state structure.
     *
     * @param state
     */
    static validateSwarmState(state: SwarmState): string[];
    /**
     * Validate swarm options.
     *
     * @param options
     */
    static validateSwarmOptions(options: SwarmOptions): string[];
    /**
     * Validate checkpoint integrity.
     *
     * @param checkpoint
     */
    static validateCheckpoint(checkpoint: SessionCheckpoint): {
        valid: boolean;
        errors: string[];
    };
}
/**
 * Session serialization utilities.
 *
 * @example
 */
export declare class SessionSerializer {
    /**
     * Serialize a SwarmState to a portable format.
     *
     * @param state
     */
    static serializeSwarmState(state: SwarmState): string;
    /**
     * Deserialize a SwarmState from portable format.
     *
     * @param serialized
     */
    static deserializeSwarmState(serialized: string): SwarmState;
    /**
     * Export session to a portable format.
     *
     * @param session
     */
    static exportSession(session: SessionState): string;
    /**
     * Import session from portable format.
     *
     * @param exported
     */
    static importSession(exported: string): SessionState;
}
/**
 * Session migration utilities.
 *
 * @example
 */
export declare class SessionMigrator {
    /**
     * Migrate session from older version.
     *
     * @param session
     * @param fromVersion
     * @param toVersion
     */
    static migrateSession(session: any, fromVersion: string, toVersion: string): SessionState;
    /**
     * Get migration path between versions.
     *
     * @param fromVersion
     * @param toVersion
     */
    private static getMigrationPath;
    /**
     * Example migration from 0.9.0 to 1.0.0.
     *
     * @param session
     */
    private static migrate_0_9_0_to_1_0_0;
    /**
     * Check if migration is needed.
     *
     * @param session
     * @param targetVersion
     */
    static needsMigration(session: any, targetVersion: string): boolean;
}
/**
 * Session recovery utilities.
 *
 * @example
 */
export declare class SessionRecovery {
    /**
     * Attempt to recover a corrupted session.
     *
     * @param corruptedSession
     * @param checkpoints
     */
    static recoverSession(corruptedSession: any, checkpoints: SessionCheckpoint[]): Promise<SessionState | null>;
    /**
     * Validate checkpoint integrity.
     *
     * @param checkpoint
     */
    private static validateCheckpointIntegrity;
    /**
     * Get default swarm options for recovery.
     */
    private static getDefaultSwarmOptions;
    /**
     * Repair session state inconsistencies.
     *
     * @param session
     */
    static repairSessionState(session: SessionState): SessionState;
}
/**
 * Session statistics utilities.
 *
 * @example
 */
export declare class SessionStats {
    /**
     * Calculate session health score.
     *
     * @param session
     */
    static calculateHealthScore(session: SessionState): number;
    /**
     * Generate session summary.
     *
     * @param session
     */
    static generateSummary(session: SessionState): Record<string, any>;
}
/**
 * Export all utilities.
 */
//# sourceMappingURL=session-utils.d.ts.map