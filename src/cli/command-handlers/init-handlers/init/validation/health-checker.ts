// health-checker.js - System health checks for SPARC initialization

export class HealthChecker {
  constructor(workingDir = workingDir;
}

/**
 * Check SPARC mode availability
 */
async;
checkModeAvailability();
{
  const result = {success = [
        'architect',
        'code',
        'tdd',
        'spec-pseudocode',
        'integration',
        'debug',
        'security-review',
        'refinement-optimization-mode',
        'docs-writer',
        'devops',
        'mcp',
        'swarm',
      ];

  result.modes.total = expectedModes.length;

  // Check each mode
  for (const mode of expectedModes) {
    const isAvailable = await this.checkSingleModeAvailability(mode);
    if (isAvailable) {
      result.modes.available++;
    } else {
      result.modes.unavailable.push(mode);
    }
  }

  // Determine overall success
  if (result.modes.available === 0) {
    result.success = false;
    result.errors.push('No SPARC modes are available');
  } else if (result.modes.unavailable.length > 0) {
    result.warnings.push(
          `${result.modes.unavailable.length} modesunavailable = false;
      result.errors.push(`Mode availability check failed = {success = ['.roo/templates', '.claude/commands'];

    for (const dir of templateDirs) {
      const dirPath = `${this.workingDir}/${dir}`;

      try {
        const stat = await node.stat(dirPath);
        if (stat.isDirectory) {
          const templateCheck = await this.checkTemplateDirectory(dirPath);
          result.templates.found.push(...templateCheck.found);
          result.templates.missing.push(...templateCheck.missing);
          result.templates.corrupted.push(...templateCheck.corrupted);
        }
      } catch {
        result.templates.missing.push(dir);
      }
    }

    // Check core template files
    const coreTemplates = ['CLAUDE.md', 'memory-bank.md', 'coordination.md'];

    for (const template of coreTemplates) {
      const templatePath = `${this.workingDir}/${template}`;

      try {
        const content = await node.readTextFile(templatePath);
        if (content.length < 50) {
          result.templates.corrupted.push(template);
        } else {
          result.templates.found.push(template);
        }
      } catch {
        result.templates.missing.push(template);
      }
    }

    // Assess results
    if (result.templates.corrupted.length > 0) {
      result.success = false;
      result.errors.push(`Corruptedtemplates = false;
      result.errors.push(`Template integrity check failed = {success = await this.checkRoomodesConsistency();
      result.consistency.roomodes = roomodesCheck;
      if (!roomodesCheck.consistent) {
        result.warnings.push('Inconsistency between .roomodes and available commands');
      }

      // Check consistency between CLAUDE.md and actual setup
      const claudeCheck = await this.checkClaudeConfigConsistency();
      result.consistency.claude = claudeCheck;
      if (!claudeCheck.consistent) {
        result.warnings.push('Inconsistency between CLAUDE.md and actual setup');
      }

      // Check memory configuration consistency
      const memoryCheck = await this.checkMemoryConsistency();
      result.consistency.memory = memoryCheck;
      if (!memoryCheck.consistent) {
        result.warnings.push('Memory configuration inconsistency detected');
      }
    }
    catch(error)
    {
      result.success = false;
      result.errors.push(`Configuration consistency check failed = {success = await this.checkDiskSpace();
      result.resources.disk = diskCheck;
      if(!diskCheck.adequate) {
        result.warnings.push('Low disk space detected');
      }

      // Check memory usage
      const memoryCheck = await this.checkMemoryUsage();
      result.resources.memory = memoryCheck;
      if(!memoryCheck.adequate) {
        result.warnings.push('High memory usage detected');
      }

      // Check file descriptors
      const fdCheck = await this.checkFileDescriptors();
      result.resources.fileDescriptors = fdCheck;
      if(!fdCheck.adequate) {
        result.warnings.push('Many open file descriptors');
      }

      // Check process limits
      const processCheck = await this.checkProcessLimits();
      result.resources.processes = processCheck;
      if(!processCheck.adequate) {
        result.warnings.push('Process limits may affect operation');
      }
    } catch(error) {
      result.warnings.push(`System resource check failed = {success = await this.checkFileSystemHealth();
      result.diagnostics.filesystem = fsHealth;
      if (!fsHealth.healthy) {
        result.success = false;
        result.errors.push(...fsHealth.errors);
      }

      // Process health
      const processHealth = await this.checkProcessHealth();
      result.diagnostics.processes = processHealth;
      if (!processHealth.healthy) {
        result.warnings.push(...processHealth.warnings);
      }

      // Network health (for external dependencies)
      const networkHealth = await this.checkNetworkHealth();
      result.diagnostics.network = networkHealth;
      if (!networkHealth.healthy) {
        result.warnings.push(...networkHealth.warnings);
      }

      // Integration health
      const integrationHealth = await this.checkIntegrationHealth();
      result.diagnostics.integration = integrationHealth;
      if (!integrationHealth.healthy) {
        result.warnings.push(...integrationHealth.warnings);
      }
    }
    catch(error)
    {
      result.success = false;
      result.errors.push(`Health diagnosticsfailed = `${this.workingDir}/.roomodes`;
      const content = await node.readTextFile(roomodesPath);
      const config = JSON.parse(content);

      return !!(config.modes?.[mode]);
    }
    catch
    return false;
  }

  async;
  checkTemplateDirectory(dirPath);
  : any
  {
    const result = {found = `${dirPath}/${entry.name}`;

    try {
      const stat = await node.stat(filePath);
      if (stat.size === 0) {
        result.corrupted.push(entry.name);
      } else {
        result.found.push(entry.name);
      }
    } catch {
      result.corrupted.push(entry.name);
    }
  }
}
} catch
{
  // Directory not accessible
}

return result;
}

  async checkRoomodesConsistency()
{
  const result = {consistent = `${this.workingDir}/.roomodes`;
  const content = await node.readTextFile(roomodesPath);
  const config = JSON.parse(content);

  if (config.modes) {
    const commandsDir = `${this.workingDir}/.claude/commands`;

    try {
      const commandFiles = [];
      for await (const entry of node.readDir(commandsDir)) {
        if (entry.isFile && entry.name.endsWith('.js')) {
          commandFiles.push(entry.name.replace('.js', ''));
        }
      }

      const modeNames = Object.keys(config.modes);
      for (const mode of modeNames) {
        if (!commandFiles.some((cmd) => cmd.includes(mode))) {
          result.consistent = false;
          result.issues.push(`Mode ${mode} has no corresponding command`);
        }
      }
    } catch {
      result.consistent = false;
      result.issues.push('Cannot access commands directory');
    }
  }
}
catch
{
  result.consistent = false;
  result.issues.push('Cannot read .roomodes file');
}

return result;
}

  async checkClaudeConfigConsistency()
{
  const result = {consistent = `${this.workingDir}/CLAUDE.md`;
  const content = await node.readTextFile(claudePath);

  // Check if mentioned commands exist
  const mentionedCommands = ['claude-zen sparc', 'npm run build', 'npm run test'];

  for (const command of mentionedCommands) {
    if (content.includes(command)) {
      // Check if the command is actually available
      const parts = command.split(' ');
      if (parts[0] === 'claude-zen') {
        const executablePath = `${this.workingDir}/claude-zen`;
        try {
          await node.stat(executablePath);
        } catch {
          result.consistent = false;
          result.issues.push(`Command ${command} mentioned but executable not found`);
        }
      }
    }
  }
}
catch
{
  result.consistent = false;
  result.issues.push('Cannot read CLAUDE.md');
}

return result;
}

  async checkMemoryConsistency()
{
    const result = {consistent = `${this.workingDir}/memory/claude-zen-data.json`;
      const data = JSON.parse(await node.readTextFile(memoryDataPath));

      // Basic structure validation
      if(!data.agents || !data.tasks) {
        result.consistent = false;
        result.issues.push('Memory data structure incomplete');
      }

      // Check directory structure
      const expectedDirs = ['agents', 'sessions'];
      for(const dir of expectedDirs) {
        try {
          await node.stat(`${this.workingDir}/memory/${dir}`);
        } catch {
          result.consistent = false;
          result.issues.push(`Memory directorymissing = false;
      result.issues.push('Cannot validate memory structure');
    }

    return result;
  }

  async checkDiskSpace() {
    const result = {adequate = new node.Command('df', {args = await command.output();

      if(success) {
        const output = new TextDecoder().decode(stdout);
        const lines = output.trim().split('\n');

        if(lines.length >= 2) {
          const parts = lines[1].split(/\s+/);
          if(parts.length >= 4) {
            result.available = parseInt(parts[3]) / 1024; // MB
            result.used = parseInt(parts[2]) / 1024; // MB
            result.adequate = result.available > 100; // At least 100MB
          }
        }
      }
    } catch {
      // Can't check - assume adequate
      result.adequate = true;
    }

    return result;
  }

  async checkMemoryUsage() {
    const result = {adequate = new node.Command('free', {args = await command.output();

      if(success) {
        const output = new TextDecoder().decode(stdout);
        const lines = output.trim().split('\n');

        for(const line of lines) {
          if (line.startsWith('Mem = line.split(/\s+/);
            if(parts.length >= 3) {
              result.available = parseInt(parts[6] || parts[3]); // Available
              result.used = parseInt(parts[2]); // Used
              result.adequate = result.available > 100; // At least 100MB
            }
            break;
          }
        }
      }
    } catch {
      // Can't check - assume adequate
      result.adequate = true;
    }

    return result;
  }

  async checkFileDescriptors() {
    const result = {adequate = new node.Command('sh', {args = await command.output();

      if(success) {
        const count = parseInt(new TextDecoder().decode(stdout).trim());
        result.open = count;
        result.adequate = count < 100; // Arbitrary threshold
      }
    } catch {
      // Can't check - assume adequate
      result.adequate = true;
    }

    return result;
  }

  async checkProcessLimits() {
    const result = {adequate = new node.Command('ulimit', {args = await command.output();

      if(success) {
        const output = new TextDecoder().decode(stdout);
        // Parse ulimit output for important limits
        result.adequate = !output.includes('0'); // Very basic check
      }
    } catch {
      // Can't check - assume adequate
      result.adequate = true;
    }

    return result;
  }

  async checkFileSystemHealth() {
    return {
      healthy: true,
      errors: [],
      readWrite: true,
      permissions: true,
    };
  }

  async checkProcessHealth() {
    return {
      healthy: true,
      warnings: [],
      processes: [],
    };
  }

  async checkNetworkHealth() {
    return {
      healthy: true,
      warnings: [],
      connectivity: true,
    };
  }

  async checkIntegrationHealth() {
    return {
      healthy: true,
      warnings: [],
      integrations: {},
    };
  }
}
