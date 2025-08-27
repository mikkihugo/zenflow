interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    statusCode: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
}
export declare const config: RateLimitConfig;
export {};
//# sourceMappingURL=rate-limit.d.ts.map