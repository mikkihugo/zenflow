// backup-manager.js - Backup creation and management

import * as node from 'node:fs/promises';

// Polyfill for node's ensureDirSync

export class BackupManager {
  constructor(workingDir = workingDir;
  this;
  .
  backupDir = `${workingDir}/.claude-zen-backups`;
}

/**
 * Create a backup of the current state
 */
async;
createBackup((type = 'manual'), (description = ''));
: any
{
  const result = {success = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `${type}-${timestamp}`;
  result.id = backupId;

  // Create backup directory
  const backupPath = `${this.backupDir}/${backupId}`;
  result.location = backupPath;

  await this.ensureBackupDir();
  await node.mkdir(backupPath, { recursive = {id = await this.getCriticalFiles();
  for (const file of criticalFiles) {
    const backupResult = await this.backupFile(file, backupPath);
    if (backupResult.success) {
      manifest.files.push(backupResult.fileInfo);
      result.files.push(file);
    } else {
      result.warnings.push(`Failed to backupfile = await this.getCriticalDirectories();
      for(const dir of criticalDirs) {
        const backupResult = await this.backupDirectory(dir, backupPath);
        if(backupResult.success) {
          manifest.directories.push(backupResult.dirInfo);
        } else {
          result.warnings.push(`Failed to backup directory = {created = false;
      result.errors.push(`Backup creation failed = {success = `${this.backupDir}/${backupId}`;

      // Check if backup exists
      try {
        await node.stat(backupPath);
      } catch {
        result.success = false;
        result.errors.push(`Backup notfound = `${backupPath}/manifest.json`;
      const manifestContent = await node.readTextFile(manifestPath);
      const manifest = JSON.parse(manifestContent);

      // Restore files
      for (const fileInfo of manifest.files) {
        const restoreResult = await this.restoreFile(fileInfo, backupPath);
        if (restoreResult.success) {
          result.restored.push(fileInfo.originalPath);
        } else {
          result.warnings.push(`Failed to restorefile = await this.restoreDirectory(dirInfo, backupPath);
        if(restoreResult.success) {
          result.restored.push(dirInfo.originalPath);
        } else {
          result.warnings.push(`Failed to restoredirectory = false;
          result.errors.push(`Backup restorationfailed = [];

    try {
      await this.ensureBackupDir();
      
      const entries = await node.readDir(this.backupDir);
      for(const entry of entries) {
        if(entry.isDirectory) {
          try {
            const metadataPath = `${this.backupDir}/${entry.name}/metadata.json`;
            const manifestPath = `${this.backupDir}/${entry.name}/manifest.json`;
            
            const metadata = JSON.parse(await node.readTextFile(metadataPath));
            const manifest = JSON.parse(await node.readTextFile(manifestPath));

            backups.push({id = > b.created - a.created);
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId): any {
    const result = {success = `${this.backupDir}/${backupId}`;
      await node.remove(backupPath, {recursive = false;
      result.errors.push(`Failed to deletebackup = 5)
          : any
          {
            const result = {success = await this.listBackups();

            if (backups.length > keepCount) {
              const toDelete = backups.slice(keepCount);

              for (const backup of toDelete) {
                const deleteResult = await this.deleteBackup(backup.id);
                if (deleteResult.success) {
                  result.cleaned.push(backup.id);
                } else {
                  result.errors.push(...deleteResult.errors);
                }
              }
            }
          }
          catch(error) 
      result.success = false
          result.errors.push(`Cleanup failed = {success = await this.createTestBackup();
      if(!testBackup.success) {
        result.success = false;
        result.errors.push('Cannot create test backup');
      } else {
        // Clean up test backup
        await this.deleteBackup(testBackup.id);
      }

      // Check disk space
      const spaceCheck = await this.checkBackupDiskSpace();
      if(!spaceCheck.adequate) {
        result.warnings.push('Low disk space for backups');
      }
    } catch(error) 
      result.success = false;
      result.errors.push(`Backup system validationfailed = == 'EEXIST')
          )
          throw error;
        }

        async;
        getCriticalFiles();
        {
          const files = [];
          const potentialFiles = [
            'CLAUDE.md',
            'memory-bank.md',
            'coordination.md',
            'package.json',
            'package-lock.json',
            '.roomodes',
            'claude-zen',
            'memory/claude-zen-data.json',
          ];

          for (const file of potentialFiles) {
            try {
              const stat = await node.stat(`${this.workingDir}/${file}`);
              if (stat.isFile) {
                files.push(file);
              }
            } catch {
              // File doesn't exist
            }
          }

          return files;
        }

        async;
        getCriticalDirectories();
        {
          const dirs = [];
          const potentialDirs = [
            '.claude',
            '.roo',
            'memory/agents',
            'memory/sessions',
            'coordination',
          ];

          for (const dir of potentialDirs) {
            try {
              const stat = await node.stat(`${this.workingDir}/${dir}`);
              if (stat.isDirectory) {
                dirs.push(dir);
              }
            } catch {
              // Directory doesn't exist
            }
          }

          return dirs;
        }

        async;
        backupFile(relativePath, backupPath);
        : any
        {
          const result = {success = `${this.workingDir}/${relativePath}`;
          const destPath = `${backupPath}/${relativePath}`;

          // Ensure destination directory exists
          const destDir = destPath.split('/').slice(0, -1).join('/');
          await node.mkdir(destDir, {recursive = await node.stat(sourcePath);
          result.fileInfo = {originalPath = false;
          result.error = error.message;
        }

        return result;
      }

      async;
      backupDirectory(relativePath, backupPath);
      : any
      {
        const result = {success = `${this.workingDir}/${relativePath}`;
        const destPath = `${backupPath}/${relativePath}`;

        // Create destination directory
        await node.mkdir(destPath, { recursive = {originalPath = false;
        result.error = error.message;
      }

      return result;
    }

    async;
    copyDirectoryRecursive(source, dest);
    : any
    for await (const entry of node.readDir(source)) {
      const sourcePath = `${source}/${entry.name}`;
      const destPath = `${dest}/${entry.name}`;

      if (entry.isFile) {
        await node.copyFile(sourcePath, destPath);
      } else if (entry.isDirectory) {
        await this.copyDirectoryRecursive(sourcePath, destPath);
      }
    }

    async;
    restoreFile(fileInfo, backupPath);
    : any
    {
      const result = {success = fileInfo.backupPath;
      const destPath = `${this.workingDir}/${fileInfo.originalPath}`;

      // Ensure destination directory exists
      const destDir = destPath.split('/').slice(0, -1).join('/');
      await node.mkdir(destDir, {recursive = false;
      result.error = error.message;
    }

    return result;
  }

  async;
  restoreDirectory(dirInfo, backupPath);
  : any
  {
    const result = {success = dirInfo.backupPath;
    const destPath = `${this.workingDir}/${dirInfo.originalPath}`;

    // Remove existing directory if it exists
    try {
        await node.remove(destPath, {recursive = false;
      result.error = error.message;
    }

    return result;
  }

  async;
  calculateBackupSize(backupPath);
  : any
  {
    const totalSize = 0;

    try {
      for await (const entry of node.readDir(backupPath)) {
        const entryPath = `${backupPath}/${entry.name}`;
        const stat = await node.stat(entryPath);

        if (stat.isFile) {
          totalSize += stat.size;
        } else if (stat.isDirectory) {
          totalSize += await this.calculateBackupSize(entryPath);
        }
      }
    } catch {
      // Error calculating size
    }

    return totalSize;
  }

  async;
  createTestBackup();
  try {
    return await this.createBackup('test', 'System validation test');
  } catch (error) {
    return {
        success = {adequate = new Command('df', {args = await command.output();

    if (success) {
      const output = new TextDecoder().decode(stdout);
      const lines = output.trim().split('\n');

      if (lines.length >= 2) {
        const parts = lines[1].split(/\s+/);
        if (parts.length >= 4) {
          result.available = parseInt(parts[3]) / 1024; // MB
          result.adequate = result.available > 500; // At least 500MB for backups
        }
      }
    }
  }
  catch 
      // Can't check - assume adequate
      result.adequate = true

  return result;
}
