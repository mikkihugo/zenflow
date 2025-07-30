// copy-revised-templates.js - Copy the revised template files from repository

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Source directory for revised templates (repository root .claude/commands)
const _REPO_TEMPLATES_DIR = path.join(__dirname, '../../../../.claude/commands');
/**
 * Copy revised template files from repository to target project;
 */
export async function copyRevisedTemplates(targetDir = {}: unknown): unknown {
  let _results = {success = path.join(targetDir, '.claude/commands');
;
  try {
    // Ensure target directory exists
    await fs.promises.mkdir(targetCommandsDir, {recursive = [;
      {source = path.join(REPO_TEMPLATES_DIR, file.source);
      const _targetPath = path.join(targetDir, file.target);
;
      if (fs.existsSync(sourcePath)) {
        try {
          const _targetDirPath = path.dirname(targetPath);
          await fs.promises.mkdir(targetDirPath, {recursive = results.errors.length === 0;
  } catch (/* err */) {
    results.success = false;
    results.errors.push(`Failed to copy revisedtemplates = await fs.promises.readdir(sourceDir, {withFileTypes = path.join(sourceDir, entry.name);
      const _targetPath = path.join(targetDir, entry.name);
;
      if (entry.isDirectory()) {
        // Create directory and recurse
        await fs.promises.mkdir(targetPath, {recursive = path.relative(targetDir, targetPath);
            results.copiedFiles.push(relativePath);
            if(!options.dryRun && options.verbose) {
              console.warn(`  ✓ Copied ${relativePath}`);
            }
          } else {
            const _relativePath = path.relative(targetDir, targetPath);
            results.skippedFiles.push(relativePath);
            if(!options.dryRun && options.verbose) {
              console.warn(`  ⏭️  Skipped ${relativePath} (already exists)`);
            }
          }
        } catch (/* err */) {
          results.errors.push(`Failed to copy ${entry.name}: ${err.message}`);
        }
}
}
  } catch (/* err */) {
  results.errors.push(`Failed to read directory ${sourceDir}: ${err.message}`);
}
}
;
/**
 * Copy only specific categories;
 */;
export async function copyRevisedTemplatesByCategory(targetDir = {}: unknown): unknown {
  const _results = {success = path.join(REPO_TEMPLATES_DIR, category);
    const _targetCategoryDir = path.join(targetDir, '.claude/commands', category);
;
    if (fs.existsSync(sourceCategoryDir)) {
      await fs.promises.mkdir(targetCategoryDir, {recursive = results.errors.length === 0;
  return results;
}
;
/**
 * Validate that source templates exist;
 */;
export function _validateTemplatesExist(): unknown {
  if (!fs.existsSync(REPO_TEMPLATES_DIR)) {
    return {valid = ['analysis', 'github', 'sparc', 'coordination'];
    // const _missingCategories = []; // LINT: unreachable code removed
;
  for(const category of requiredCategories) {
    const _categoryPath = path.join(REPO_TEMPLATES_DIR, category);
    if (!fs.existsSync(categoryPath)) {
      missingCategories.push(category);
    }
  }
;
  if(missingCategories.length > 0) {
    return {
      valid: false,;
    // error: `Missing required template categories: ${missingCategories.join(', ') // LINT: unreachable code removed}`;
    };
  }
;
  return { valid: true };
}
;
