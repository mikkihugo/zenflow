/**
 * @fileoverview Global Swarm Registry - Persistent swarm storage across CLI sessions
 * 
 * This module provides a file-based registry for ephemeral swarms that persists
 * across CLI command invocations. Swarms are stored in a JSON file in the project
 * root directory to maintain state between commands within the same project.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { getLogger } from '@claude-zen/foundation';
import type { EphemeralSwarm } from './types';

const logger = getLogger('swarm-registry');

/**
 * Find the monorepo root by looking for workspace markers first, then project markers
 */
function findProjectRoot(): string {
  let currentDir = cwd();
  
  // First, look for monorepo markers (higher priority)
  const monorepoMarkers = ['pnpm-workspace.yaml', 'nx.json', 'turbo.json', 'lerna.json'];
  const projectMarkers = ['.git', 'package.json'];
  
  // Start from current directory and walk up
  while (currentDir !== '/') {
    // Check for monorepo markers first
    for (const marker of monorepoMarkers) {
      if (existsSync(join(currentDir, marker))) {
        return currentDir; // Found monorepo root
      }
    }
    
    const parentDir = join(currentDir, '..');
    if (parentDir === currentDir) break; // Reached filesystem root
    currentDir = parentDir;
  }
  
  // If no monorepo markers found, look for project markers
  currentDir = cwd();
  while (currentDir !== '/') {
    for (const marker of projectMarkers) {
      if (existsSync(join(currentDir, marker))) {
        return currentDir; // Found project root
      }
    }
    
    const parentDir = join(currentDir, '..');
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  // Fallback to current working directory
  return cwd();
}

/** Project root directory */
const PROJECT_ROOT = findProjectRoot();

/** Swarm directory path */
const SWARM_DIR = join(PROJECT_ROOT, '.zenswarm');

/** Path to the swarm registry file (per-project) */
const REGISTRY_PATH = join(SWARM_DIR, 'swarms.json');

/**
 * Ensure the .zenswarm directory exists.
 */
function ensureSwarmDir(): void {
  if (!existsSync(SWARM_DIR)) {
    mkdirSync(SWARM_DIR, { recursive: true });
  }
}

/** In-memory cache of the registry */
let registryCache: Map<string, EphemeralSwarm> | null = null;

/**
 * Load the swarm registry from disk.
 */
function loadRegistry(): Map<string, EphemeralSwarm> {
  if (registryCache) {
    return registryCache;
  }

  try {
    if (existsSync(REGISTRY_PATH)) {
      const data = readFileSync(REGISTRY_PATH, 'utf-8');
      const swarms = JSON.parse(data);
      
      // Convert plain objects back to EphemeralSwarm with proper Date objects
      const registry = new Map<string, EphemeralSwarm>();
      for (const [id, swarmData] of Object.entries(swarms)) {
        const swarm = swarmData as any;
        registry.set(id, {
          ...swarm,
          created: new Date(swarm.created),
          expiresAt: new Date(swarm.expiresAt),
          performance: {
            ...swarm.performance,
            lastActivity: new Date(swarm.performance.lastActivity),
          },
        });
      }
      
      registryCache = registry;
      return registry;
    }
  } catch (error) {
    logger.warn('Failed to load swarm registry', { error });
  }

  registryCache = new Map();
  return registryCache;
}

/**
 * Save the swarm registry to disk.
 */
function saveRegistry(registry: Map<string, EphemeralSwarm>): void {
  try {
    ensureSwarmDir();
    const swarms = Object.fromEntries(registry.entries());
    writeFileSync(REGISTRY_PATH, JSON.stringify(swarms, null, 2), 'utf-8');
    registryCache = registry;
  } catch (error) {
    logger.warn('Failed to save swarm registry', { error });
  }
}

/**
 * Add a swarm to the global registry.
 */
export function registerSwarm(swarm: EphemeralSwarm): void {
  logger.debug('Registering swarm', { swarmId: swarm.id, registryPath: REGISTRY_PATH });
  const registry = loadRegistry();
  registry.set(swarm.id, swarm);
  logger.debug('Registry updated', { swarmCount: registry.size });
  saveRegistry(registry);
  logger.debug('Registry saved successfully');
}

/**
 * Get a swarm from the global registry.
 */
export function getSwarm(swarmId: string): EphemeralSwarm | undefined {
  const registry = loadRegistry();
  return registry.get(swarmId);
}

/**
 * Get all active swarms from the global registry.
 */
export function getAllSwarms(): EphemeralSwarm[] {
  logger.debug('Loading swarms from registry', { registryPath: REGISTRY_PATH });
  const registry = loadRegistry();
  logger.debug('Loaded registry', { swarmCount: registry.size });
  const now = Date.now();
  
  // Filter out expired swarms
  const activeSwarms: EphemeralSwarm[] = [];
  let expiredCount = 0;
  
  for (const [id, swarm] of registry.entries()) {
    logger.debug('Checking swarm', { 
      swarmId: id, 
      expiresAt: swarm.expiresAt.toISOString(), 
      status: swarm.status 
    });
    
    if (swarm.expiresAt.getTime() > now && swarm.status !== 'dissolved') {
      activeSwarms.push(swarm);
    } else {
      logger.debug('Removing expired/dissolved swarm', { swarmId: id });
      registry.delete(id);
      expiredCount++;
    }
  }
  
  // Save cleaned registry if any swarms were removed
  if (expiredCount > 0) {
    logger.debug('Saving cleaned registry', { removedCount: expiredCount });
    saveRegistry(registry);
  }
  
  logger.debug('Returning active swarms', { activeCount: activeSwarms.length });
  return activeSwarms;
}

/**
 * Update a swarm in the global registry.
 */
export function updateSwarm(swarm: EphemeralSwarm): void {
  const registry = loadRegistry();
  registry.set(swarm.id, swarm);
  saveRegistry(registry);
}

/**
 * Remove a swarm from the global registry.
 */
export function removeSwarm(swarmId: string): void {
  const registry = loadRegistry();
  registry.delete(swarmId);
  saveRegistry(registry);
}

/**
 * Clear all swarms from the global registry.
 */
export function clearRegistry(): void {
  registryCache = new Map();
  saveRegistry(registryCache);
}

/**
 * Get the count of active swarms.
 */
export function getSwarmCount(): number {
  return getAllSwarms().length;
}