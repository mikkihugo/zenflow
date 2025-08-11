/**
 * Version utility functions for terminal interface.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Cache the version to avoid repeated file reads
let cachedVersion: string | null = null;

/**
 * Get the current application version from package.json.
 *
 * @returns The version string (e.g., "1.0.0-alpha.43")
 */
export function getVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    // Try to read from the project root
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    cachedVersion = packageJson.version || '1.0.0-alpha.43';
    return cachedVersion;
  } catch (error) {
    // Fallback version if package.json can't be read
    cachedVersion = '1.0.0-alpha.43';
    return cachedVersion;
  }
}

/**
 * Get a display-friendly version string with prefix.
 *
 * @param prefix - Optional prefix (defaults to "v")
 * @returns Formatted version string (e.g., "v1.0.0-alpha.43")
 */
export function getDisplayVersion(prefix: string = 'v'): string {
  return `${prefix}${getVersion()}`;
}
