/**
 * @file Coordination system:emergency-protocol-handler
 */
/**
 * Emergency Protocol Handler.
 * Advanced emergency response and load shedding system.
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { EmergencyHandler } from '../interfaces';
export declare class EmergencyProtocolHandler extends EventEmitter implements EmergencyHandler {
    private activeProtocols;
    private emergencyHistory;
    constructor(): void {
        timestamp: Date;
        type: string;
        severity: string;
        action: string;
    }>;
}
//# sourceMappingURL=emergency-protocol-handler.d.ts.map