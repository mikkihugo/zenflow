import { readFileSync } from 'node:fs';
import { join } from 'node:path';
let cachedVersion = null;
export function getVersion() {
    if (cachedVersion) {
        return cachedVersion;
    }
    try {
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        cachedVersion = packageJson.version || '1.0.0-alpha.43';
        return cachedVersion;
    }
    catch (error) {
        cachedVersion = '1.0.0-alpha.43';
        return cachedVersion;
    }
}
export function getDisplayVersion(prefix = 'v') {
    return `${prefix}${getVersion()}`;
}
//# sourceMappingURL=version-utils.js.map