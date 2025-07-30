// copy-revised-templates.js - Copy the revised template files from repository/g

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Source directory for revised templates(repository root .claude/commands)/g
const _REPO_TEMPLATES_DIR = path.join(__dirname, '../../../../.claude/commands');/g
/**  *//g
 * Copy revised template files from repository to target project
 *//g
export async function copyRevisedTemplates(targetDir = {}) {
  let _results = {success = path.join(targetDir, '.claude/commands');/g

  try {
    // Ensure target directory exists/g
// // await fs.promises.mkdir(targetCommandsDir, {recursive = [/g)
      {source = path.join(REPO_TEMPLATES_DIR, file.source);
      const _targetPath = path.join(targetDir, file.target);

      if(fs.existsSync(sourcePath)) {
        try {
          const _targetDirPath = path.dirname(targetPath);
// // await fs.promises.mkdir(targetDirPath, {recursive = results.errors.length === 0;/g)
  } catch(/* err */) {/g
    results.success = false;
    results.errors.push(`Failed to copy revisedtemplates = // await fs.promises.readdir(sourceDir, {withFileTypes = path.join(sourceDir, entry.name);`/g
      const _targetPath = path.join(targetDir, entry.name);

      if(entry.isDirectory()) {
        // Create directory and recurse/g
// // await fs.promises.mkdir(targetPath, {recursive = path.relative(targetDir, targetPath);/g
            results.copiedFiles.push(relativePath);
  if(!options.dryRun && options.verbose) {
              console.warn(`   Copied ${relativePath}`);
            //             }/g
          } else {
            const _relativePath = path.relative(targetDir, targetPath);
            results.skippedFiles.push(relativePath);
  if(!options.dryRun && options.verbose) {
              console.warn(`  ⏭  Skipped ${relativePath} (already exists)`);
            //             }/g
          //           }/g
        } catch(/* err */) {/g
          results.errors.push(`Failed to copy ${entry.name});`
        //         }/g
// }/g
// }/g
  } catch(/* err */) {/g
  results.errors.push(`Failed to read directory ${sourceDir});`
// }/g
// }/g


/**  *//g
 * Copy only specific categories
 *//g
// export async function copyRevisedTemplatesByCategory(targetDir = {}) {/g
  const _results = {success = path.join(REPO_TEMPLATES_DIR, category);
    const _targetCategoryDir = path.join(targetDir, '.claude/commands', category);/g

    if(fs.existsSync(sourceCategoryDir)) {
// // await fs.promises.mkdir(targetCategoryDir, {recursive = results.errors.length === 0;/g
  // return results;/g
// }/g


/**  *//g
 * Validate that source templates exist
 *//g)
// export function _validateTemplatesExist() {/g
  if(!fs.existsSync(REPO_TEMPLATES_DIR)) {
    return {valid = ['analysis', 'github', 'sparc', 'coordination'];
    // const _missingCategories = []; // LINT: unreachable code removed/g
  for(const category of requiredCategories) {
    const _categoryPath = path.join(REPO_TEMPLATES_DIR, category); if(!fs.existsSync(categoryPath)) {
      missingCategories.push(category); //     }/g
  //   }/g
  if(missingCategories.length > 0) {
    // return {/g
      valid,
    // error: `Missing required template categories: \${missingCategories.join(', ') // LINT}`;/g
    };
  //   }/g


  // return { valid};/g
// }/g


}}}}}}}}}}))))))