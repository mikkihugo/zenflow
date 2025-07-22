import { readHiveRegistry } from '../command-handlers/hive-mind-command.js';
import { glob } from 'glob';

export async function scanForUnmappedServices(flags) {
  const registry = await readHiveRegistry();
  const registeredServices = Object.keys(registry);

  const serviceDirs = await glob('services/*', { onlyDirectories: true });

  const unmappedServices = serviceDirs.filter(dir => !registeredServices.includes(dir.split('/')[1]));

  return unmappedServices.map(dir => ({
    id: `unmapped-${dir}`,
    description: `Found unmapped service: ${dir}`,
    action: 'create_hive',
    servicePath: dir,
  }));
}
