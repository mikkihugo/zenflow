import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { SimpleGit } from 'simple-git'
import { getLogger } from '@claude-zen/foundation'
import { UNKNOWN_ERROR_MESSAGE } from './types'

const logger = getLogger('git-operations-sandbox')

export interface SandboxEnvironment {
  id: string
  path: string
  projectId: string
  created: Date
  lastAccess: Date
}

export class SimpleGitSandbox {
  private config: { sandboxRoot: string; maxAgeHours: number; restrictedEnvVars: string[] }
  private activeSandboxes = new Map<string, SandboxEnvironment>()

  constructor(config: { sandboxRoot?: string; maxAgeHours?: number; restrictedEnvVars?: string[] } = {}) {
    this.config = {
      sandboxRoot: config.sandboxRoot || path.join(process.cwd(), '.git-sandbox'),
      maxAgeHours: config.maxAgeHours || 24,
      restrictedEnvVars: config.restrictedEnvVars || [],
    }
  }

  async execute(
    command: string,
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ success: boolean; output?: string; stderr?: string; error?: string }> {
    const { exec } = await import('node:child_process')
    const { promisify } = await import('node:util')
    const execAsync = promisify(exec)

    try {
      const result = await execAsync(command, {
        cwd: options.cwd || this.config.sandboxRoot,
        timeout: options.timeout || 30000,
        env: this.getSafeEnvironment(),
      })
      return { success: true, output: result.stdout, stderr: result.stderr }
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) }
    }
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.config.sandboxRoot, { recursive: true })
    logger.info(`Git sandbox initialized`, { sandboxRoot: this.config.sandboxRoot })
  }

  async createSandbox(projectId: string): Promise<SandboxEnvironment> {
    const sandboxId = `${projectId}-${Date.now()}`
    const sandboxPath = path.join(this.config.sandboxRoot, sandboxId)
    await fs.mkdir(sandboxPath, { recursive: true })
    const sandbox: SandboxEnvironment = {
      id: sandboxId,
      path: sandboxPath,
      projectId,
      created: new Date(),
      lastAccess: new Date(),
    }
    this.activeSandboxes.set(sandboxId, sandbox)
    logger.debug(`Created git sandbox`, { sandboxId, sandboxPath, projectId })
    return sandbox
  }

  async executeSafeGitOp(
    sandbox: SandboxEnvironment | string,
    gitOp: (git: SimpleGit) => Promise<void>
  ): Promise<unknown> {
    const sandboxEnv =
      typeof sandbox === 'string' ? this.activeSandboxes.get(sandbox) || (await this.createSandbox(sandbox)) : sandbox
    if (!sandboxEnv) throw new Error('Invalid sandbox environment')
    sandboxEnv.lastAccess = new Date()
    try {
      const { simpleGit } = await import('simple-git')
      const git = simpleGit(sandboxEnv.path)
      await gitOp(git)
      return { success: true, sandboxId: sandboxEnv.id, path: sandboxEnv.path }
    } catch (error) {
      logger.error('Git operation failed in sandbox', {
        sandboxId: sandboxEnv.id,
        error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
      })
      throw error
    }
  }

  async cleanupSandbox(sandboxId?: string): Promise<void> {
    if (sandboxId) {
      const sandbox = this.activeSandboxes.get(sandboxId)
      if (sandbox) {
        await fs.rm(sandbox.path, { recursive: true, force: true })
        this.activeSandboxes.delete(sandboxId)
        logger.debug('Cleaned up sandbox', { sandboxId })
      }
      return
    }
    const staleThreshold = Date.now() - this.config.maxAgeHours * 60 * 60 * 1000
    for (const [id, sandbox] of this.activeSandboxes.entries()) {
      if (sandbox.lastAccess.getTime() < staleThreshold) {
        await fs.rm(sandbox.path, { recursive: true, force: true })
        this.activeSandboxes.delete(id)
        logger.debug('Cleaned up stale sandbox', { sandboxId: id })
      }
    }
  }

  async shutdown(): Promise<void> {
    for (const [id] of this.activeSandboxes.entries()) {
      await this.cleanupSandbox(id)
    }
    logger.info('Git sandbox shutdown complete')
  }

  private getSafeEnvironment(): Record<string, string> {
    const env: Record<string, string> = {}
    const safeVars = ['PATH', 'HOME', 'USER', 'SHELL']
    for (const varName of safeVars) {
      if (process.env[varName] && !this.config.restrictedEnvVars.includes(varName)) {
        env[varName] = process.env[varName]!
      }
    }
    return env
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
  }
}
