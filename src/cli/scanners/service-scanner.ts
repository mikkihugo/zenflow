/**
 * Service Scanner Module
 * Converted from JavaScript to TypeScript
 */

import { glob } from 'glob';
import { readHiveRegistry } from '../command-handlers/hive-mind-command.js';

export async function scanForUnmappedServices(flags = await readHiveRegistry();
const registeredServices = Object.keys(registry);

const serviceDirs = await glob('services/*', {onlyDirectories = serviceDirs.filter(dir => !registeredServices.includes(dir.split('/')[1]));

return unmappedServices.map(dir => ({
    id: `unmapped-${dir}`,
    description: `Found unmapped service: ${dir}`,
    action: 'create_hive',
    servicePath: dir,
  }));
}
