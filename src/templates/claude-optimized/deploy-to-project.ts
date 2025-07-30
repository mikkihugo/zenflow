#
!/usr/bin / env
node;

/**
 * Deploy Claude optimized template to a target project
 *Usage = process.argv.slice(2);
if(args.length === 0) {
  console.error('Usage = args[0];
const SOURCE_DIR = path.join(__dirname, '.claude');
const TARGET_DIR = path.join(TARGET_PROJECT, '.claude');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

console.warn('Claude Optimized Template Deployment');
console.warn('====================================');
console.warn(`Source = ['package.json', 'tsconfig.json', 'node.json', 'go.mod', 'Cargo.toml', 'setup.py'];
const hasProjectFile = projectFiles.some(file => fs.existsSync(path.join(TARGET_PROJECT, file)));

if(!hasProjectFile) {
  console.warn('Warning = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Create target .claude directory
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, {recursive = path.join(TARGET_DIR, dirInfo.path);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, {recursive = path.join(targetPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, `# ${dirName}\n\nThis directory will be populated during usage.\n`);
    }
  }
}

// Copy files
console.warn('\nDeploying template files...');
const successCount = 0;
const errorCount = 0;

for(const file of manifest.files) {
  const sourcePath = path.join(SOURCE_DIR, file.destination);
  const targetPath = path.join(TARGET_DIR, file.destination);
  
  try {
    if (fs.existsSync(sourcePath)) {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive = {deployed = '.repeat(50));
console.warn('DeploymentSummary = == 0) {
  console.warn('\n🎉 Template deployed successfully!');
  console.warn('\nNext steps:');
  console.warn('1. Open Claude Code in your project');
  console.warn('2. Type / to see available commands');
  console.warn('3. Use /sparc for SPARC methodology');
  console.warn('4. Use /claude-zen-* for Claude Flow features');
  console.warn('\nFor help, see the documentation files in .claude/');
} else {
  console.warn('\n⚠️  Template deployed with errors. Please check the messages above.');
}
