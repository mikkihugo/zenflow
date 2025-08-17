/**
 * Version Configuration - Dynamic version reading from package.json
 *
 * Provides a centralized way to get the application version at runtime.
 * Falls back to a hardcoded version if package.json reading fails.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// Fallback version in case package.json reading fails
const FALLBACK_VERSION = '1.0.0-alpha.44';
let cachedVersion = null;
/**
 * Get the application version from package.json
 */
export function getVersion() {
    if (cachedVersion) {
        return cachedVersion;
    }
    try {
        // Try different possible locations for package.json
        const possiblePaths = [
            join(process.cwd(), 'package.json'),
            join(__dirname, '../../package.json'),
            join(__dirname, '../../../package.json'),
        ];
        let packageJson = null;
        for (const path of possiblePaths) {
            try {
                packageJson = JSON.parse(readFileSync(path, 'utf8'));
                break;
            }
            catch {
                continue;
            }
        }
        if (packageJson && packageJson.version) {
            cachedVersion = packageJson.version;
            return cachedVersion;
        }
    }
    catch (error) {
        // Silent fallback to avoid breaking the application
    }
    cachedVersion = FALLBACK_VERSION;
    return cachedVersion;
}
/**
 * Export version as constant for backward compatibility
 */
export const VERSION = getVersion();
/**
 * Export default
 */
export default {
    getVersion,
    VERSION,
    FALLBACK_VERSION,
};
//# sourceMappingURL=version.js.map