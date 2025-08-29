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
    constructor();
    handleEmergency(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void>;
    shedLoad(percentage: number): Promise<void>;
    activateFailover(): Promise<void>;
    throttleRequests(rate: number): Promise<void>;
    sendAlert(_message: string, recipients: string[]): Promise<void>;
    private initializeProtocols;
    private executeProtocol;
    private executeAction;
    private executeDefaultEmergencyResponse;
    private recordEmergency;
    getEmergencyHistory(): Array<{
        timestamp: Date;
        type: string;
        severity: string;
        action: string;
    }>;
}
//# sourceMappingURL=emergency-protocol-handler.d.ts.map