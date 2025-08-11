/**
 * Web Service Implementation.
 *
 * Service implementation for web server operations, HTTP/HTTPS handling,
 * middleware management, and web interface coordination.
 */
/**
 * @file Web service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { ServiceOperationOptions, WebServiceConfig } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Web service implementation.
 *
 * @example
 */
export declare class WebService extends BaseService implements IService {
    private server?;
    private middleware;
    private routes;
    constructor(config: WebServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private getServerInfo;
    private addMiddleware;
    private removeMiddleware;
    private addRoute;
    private removeRoute;
    private getRoutes;
    private getMiddleware;
    private getServerStats;
    private initializeMiddleware;
    private initializeRoutes;
}
export default WebService;
//# sourceMappingURL=web-service.d.ts.map