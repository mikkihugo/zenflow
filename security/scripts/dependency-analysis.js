const fs = require('fs');
const { execSync } = require('child_process');

class DependencyAnalyzer {
  async analyze() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    const report = {
      timestamp: new Date().toISOString(),
      totalDependencies: deps.length + devDeps.length,
      productionDependencies: deps.length,
      developmentDependencies: devDeps.length,
      outdated: this.checkOutdated(),
      audit: this.runAudit()
    };
    
    fs.writeFileSync(
      'security/audits/dependency-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('📊 Dependency analysis complete');
  }
  
  checkOutdated() {
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      return {};
    }
  }
  
  runAudit() {
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      return { vulnerabilities: {} };
    }
  }
}

new DependencyAnalyzer().analyze();
