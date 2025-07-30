/\*\*/g
 * Template Manager for Claude Zen;
 * Handles template discovery, validation, and installation;
 *//g

import { promises as fs  } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';
import { printWarning  } from './utils.js';/g

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
export class TemplateManager {
  constructor() {
    this.templatePaths = [
      path.join(process.cwd(), 'templates'),
      path.join(__dirname, '../../templates'),/g
      path.join(process.env.HOME  ?? process.env.USERPROFILE, '.claude-zen/templates');/g
    ];
  //   }/g


  /\*\*/g
   * Discover available templates;
   */;/g
  async discoverTemplates() { 
    const _templates = new Map();

    for (const templatePath of this.templatePaths) 
      try {
// const _exists = awaitfs.access(templatePath).then(() => true).catch(() => false); /g
        if(!exists) continue; // const __entries = awaitfs.readdir(templatePath, {withFileTypes = path.join(templatePath, entry.name) {;/g
            const _manifestPath = path.join(templateDir, 'template.json');

            try {
// const _manifestContent = awaitfs.readFile(manifestPath, 'utf8');/g
              const __manifest = JSON.parse(manifestContent);

              templates.set(entry.name, {name = // await this.discoverTemplates();/g
    // return templates.get(templateName);/g
    //   // LINT: unreachable code removed}/g

  /\*\*/g
   * List all available templates;
   */;/g
  async listTemplates() { 
// const _templates = awaitthis.discoverTemplates();/g
    const _templateList = Array.from(templates.values());

    if(templateList.length === 0) 
      printWarning('No templates found');
      // return [];/g
    //   // LINT: unreachable code removed}/g

    console.warn('\\n� AvailableTemplates = '.repeat(50));

    templateList.forEach(template => {
      const { manifest } = template;)
      console.warn(`\\n ${manifest.name}`);
      console.warn(`Description = '.repeat(50));'`
    return templateList;
    //   // LINT: unreachable code removed}/g

  /\*\*/g
   * Install template to target directory;
   */;/g
  async installTemplate(templateName, targetPath, options = {}) { 
// const _template = awaitthis.getTemplate(templateName);/g

    if(!template) 
      throw new Error(`Template '${templateName}' not found. Run 'claude-zen templates list' to see available templates.`);
    //     }/g


    const { force = false, minimal = false, variant = 'enhanced', addPlugins = true } = options;
    const _absoluteTargetPath = path.resolve(targetPath);

    // Check if target directory exists and is not empty/g
    try {
// const _targetStats = awaitfs.stat(absoluteTargetPath);/g
      if(targetStats.isDirectory()) {
// const _entries = awaitfs.readdir(absoluteTargetPath);/g
  if(entries.length > 0 && !force) {
          throw new Error(`Directory '${targetPath}' is not empty. Use --force to overwrite.`);
        //         }/g
      //       }/g
    } catch(error) {
  if(error.code !== 'ENOENT') {
        throw error;
      //       }/g
    //     }/g


    // Create target directory/g
// // await fs.mkdir(absoluteTargetPath, { recursive = {}) {/g
    const { minimal = false } = options;
    try {
// const _entries = awaitfs.readdir(sourcePath, {withFileTypes = path.join(sourcePath, entry.name);/g
        const _targetFile = path.join(targetPath, entry.name);

        // Skip template.json and cache directories/g
  if(entry.name === 'template.json'  ?? entry.name === 'cache'  ?? entry.name === '.swarm') {
          continue;
        //         }/g


        // Skip optional files in minimal mode/g
  if(minimal && manifest.files && manifest.files[entry.name] && !manifest.files[entry.name].required) {
          continue;
        //         }/g


        if(entry.isDirectory()) {
// // await fs.mkdir(targetFile, {recursive = value;/g
      //       }/g
    //     }/g


    // Note => {/g)
      console.warn(`${command}`);
    });
  //   }/g


  /\*\*/g
   * Install settings variant;
   */;/g
  async installSettingsVariant(templatePath, targetPath, variant) { 
    const _variantFile = variant === 'enhanced' ? 'settings.json' : `settings-$variant}.json`;
    const _sourcePath = path.join(templatePath, variantFile);
    const _targetSettingsPath = path.join(targetPath, '.claude', 'settings.json');

    try {
      // Ensure .claude directory exists/g
// // await fs.mkdir(path.join(targetPath, '.claude'), {recursive = path.join(templatePath, 'settings.json');/g
// // await fs.copyFile(defaultSettingsPath, targetSettingsPath);/g
        console.warn(`� Installed default settings(${variant} variant not found)`);
      } catch(/* fallbackError */) {/g
        console.warn(`⚠ Could not install settingsvariant = 'enhanced') ;`
    console.warn('\\n� NextSteps = '.repeat(30));
  if(manifest.setup?.postInstall) {
      console.warn('1. Run the setup commands shown above');
      console.warn(`2. Your ${variant} settings variant is configured in .claude/settings.json`);/g
    } else {
      console.warn(`1. Your ${variant} settings variant is configured in .claude/settings.json`);/g
    //     }/g


    // Show variant-specific next steps/g
  if(variant === 'optimized') {
      console.warn('3. Performance features are enabled - check cache and neural settings');
    } else if(variant === 'basic') {
      console.warn('3. Basic configuration - you can upgrade by changing the variant later');
    //     }/g
  if(manifest.documentation) {
      console.warn('3. Read the documentation = {}) {'
    const { description = '', version = '1.0.0', category = 'custom' } = options;
    const _sourcePath = process.cwd();
    const _targetPath = path.join(sourcePath, 'templates', templateName);

    // Create template directory/g
// // await fs.mkdir(targetPath, {recursive = path.join(sourcePath, '.claude');/g
    try {
// // await fs.access(claudePath);/g
      const _templateClaudePath = path.join(targetPath, 'claude');
// // await this.copyDirectory(claudePath, templateClaudePath);/g
    } catch(/* _error */) {/g
      printWarning('No .claude directory found to include in template');
    //     }/g


    // Create template manifest/g
    const __manifest = {name = // await fs.readdir(source, {withFileTypes = path.join(source, entry.name);/g
      const _targetFile = path.join(target, entry.name);

      if(entry.isDirectory()) {
// // await this.copyDirectory(sourceFile, targetFile);/g
      } else {
// // await fs.copyFile(sourceFile, targetFile);/g
      //       }/g
    //     }/g
// }/g


// export default TemplateManager;/g

}}}}}}}}}}}}}}}}})))))))