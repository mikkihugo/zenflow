/**
 * @file Adapter Pattern Implementation for Multi-Protocol Support
 * Provides protocol adaptation and legacy system integration.
 */
import { EventEmitter } from 'node:events';
export interface ProtocolMessage {
    id: string;
    timestamp: Date;
    source: string;
    destination?: string;
    type: string;
    payload: any;
    metadata?: Record<string, any>;
}
export interface ProtocolResponse {
    id: string;
    requestId: string;
    timestamp: Date;
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export interface ConnectionConfig {
    protocol: string;
    host: string;
    port?: number;
    path?: string;
    authentication?: AuthConfig;
    timeout?: number;
    retryAttempts?: number;
    ssl?: boolean;
    headers?: Record<string, string>;
}
export interface AuthConfig {
    type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api-key';
    credentials?: {
        username?: string;
        password?: string;
        token?: string;
        apiKey?: string;
        clientId?: string;
        clientSecret?: string;
    };
}
export interface ProtocolAdapter {
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(message: ProtocolMessage): Promise<ProtocolResponse>;
    subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
    unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
    isConnected(): boolean;
    getProtocolName(): string;
    getCapabilities(): string[];
    healthCheck(): Promise<boolean>;
}
export declare class MCPAdapter implements ProtocolAdapter {
    private connected;
    private protocol;
    private httpClient?;
    private stdioProcess?;
    private eventHandlers;
    constructor(protocol?: 'http' | 'stdio');
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(message: ProtocolMessage): Promise<ProtocolResponse>;
    subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
    unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
    isConnected(): boolean;
    getProtocolName(): string;
    getCapabilities(): string[];
    healthCheck(): Promise<boolean>;
    private connectHTTP;
    private connectStdio;
    private sendHTTP;
    private sendStdio;
    private makeHTTPRequest;
    private mapMessageTypeToEndpoint;
    private handleStdioMessage;
    private emitToHandlers;
}
export declare class WebSocketAdapter implements ProtocolAdapter {
    private connection?;
    private connected;
    private eventHandlers;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(message: ProtocolMessage): Promise<ProtocolResponse>;
    subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
    unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
    isConnected(): boolean;
    getProtocolName(): string;
    getCapabilities(): string[];
    healthCheck(): Promise<boolean>;
    private handleMessage;
    private handleDisconnection;
    private emitToHandlers;
}
export declare class RESTAdapter implements ProtocolAdapter {
    private baseUrl?;
    private connected;
    private authHeaders;
    private eventHandlers;
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(message: ProtocolMessage): Promise<ProtocolResponse>;
    subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
    unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
    isConnected(): boolean;
    getProtocolName(): string;
    getCapabilities(): string[];
    healthCheck(): Promise<boolean>;
    private setupAuthentication;
    private makeRequest;
    private mapMessageTypeToEndpoint;
}
export declare class LegacySystemAdapter implements ProtocolAdapter {
    private connected;
    private connection?;
    private eventHandlers;
    connect(config: ConnectionConfig): Promise<void>;
    disconnect(): Promise<void>;
    send(message: ProtocolMessage): Promise<ProtocolResponse>;
    subscribe(eventType: string, handler: (message: ProtocolMessage) => void): void;
    unsubscribe(eventType: string, handler?: (message: ProtocolMessage) => void): void;
    isConnected(): boolean;
    getProtocolName(): string;
    getCapabilities(): string[];
    healthCheck(): Promise<boolean>;
    private connectSOAP;
    private connectXMLRPC;
    private connectTCP;
    private transformToLegacyFormat;
    private transformFromLegacyFormat;
    private sendLegacyMessage;
}
export declare class AdapterFactory {
    private static adapterRegistry;
    static registerAdapter(protocol: string, adapterFactory: () => ProtocolAdapter): void;
    static createAdapter(protocol: string): ProtocolAdapter;
    static getAvailableProtocols(): string[];
    static hasAdapter(protocol: string): boolean;
}
export declare class ProtocolManager extends EventEmitter {
    private adapters;
    private routingTable;
    addProtocol(name: string, protocol: string, config: ConnectionConfig): Promise<void>;
    removeProtocol(name: string): Promise<void>;
    sendMessage(message: ProtocolMessage, protocolName?: string): Promise<ProtocolResponse>;
    broadcast(message: ProtocolMessage, excludeProtocols?: string[]): Promise<ProtocolResponse[]>;
    setRoute(messageType: string, protocolName: string): void;
    removeRoute(messageType: string): void;
    getProtocolStatus(): Array<{
        name: string;
        protocol: string;
        connected: boolean;
        healthy: boolean;
    }>;
    healthCheckAll(): Promise<void>;
    shutdown(): Promise<void>;
    private routeMessage;
}
//# sourceMappingURL=adapter-system.d.ts.map