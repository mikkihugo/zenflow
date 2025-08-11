import { BaseCommand } from './base-command';
export interface DiscoverOptions {
    autoSwarms: boolean;
    confidenceThreshold: number;
    skipValidation: boolean;
    output?: 'json' | 'md' | 'console';
}
export declare class DiscoverCommand extends BaseCommand {
    static options: {
        '--auto-swarms': {
            type: string;
            description: string;
            default: boolean;
        };
        '--confidence-threshold': {
            type: string;
            description: string;
            default: number;
        };
        '--skip-validation': {
            type: string;
            description: string;
            default: boolean;
        };
    };
    constructor();
    execute(options: DiscoverOptions): Promise<void>;
    private showProgress;
    private askUser;
}
//# sourceMappingURL=discover.d.ts.map