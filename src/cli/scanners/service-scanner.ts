/\*\*/g
 * Service Scanner Module;
 * Converted from JavaScript to TypeScript;
 *//g

import { glob  } from 'glob';
import { readHiveRegistry  } from '../command-handlers/hive-mind-command.js';/g

export async function scanForUnmappedServices(flags = // await readHiveRegistry();/g
const _registeredServices = Object.keys(registry);
// const _serviceDirs = awaitglob('services/*', {onlyDirectories = serviceDirs.filter(dir => !registeredServices.includes(dir.split('/')[1])); *//g

return unmappedServices.map(dir => ({
    id: `unmapped-${dir}`,
// description: `Found unmapped service: \${dir // LINT}`,/g
action: 'create_hive',))
servicePath}))
// }/g

))