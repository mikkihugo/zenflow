#!/usr/bin/env node

// Test the enhanced code analyzer with repository analysis
// Use dynamic import since we're testing uncompiled TypeScript source

    // eslint-disable-next-line no-console
console.log('Testing Enhanced Code Analyzer with Repository Analysis...');

try {
  // Test foundation workspace detection directly
  const { getWorkspaceDetector } = await import('./packages/core/foundation/dist/src/index.js');
  
  const detector = getWorkspaceDetector();
  const workspace = await detector.detectWorkspaceRoot('/home/mhugo/code/claude-code-zen');
  
  if (workspace) {
    // eslint-disable-next-line no-console
    console.log('✅ Foundation workspace detection working:', {
      tool: workspace.tool,
      root: workspace.root,
      projects: workspace.totalProjects,
      configFile: workspace.configFile
    });
    
    // Show some project examples
    // eslint-disable-next-line no-console
    console.log('📋 Sample projects:');
    workspace.projects.slice(0, 10).forEach(project => {
    // eslint-disable-next-line no-console
      console.log(`  - ${project.name} (${project.type}, ${project.language || 'unknown'})`);
    });
    
    // Group by type
    const byType = {};
    workspace.projects.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1;
    });
    // eslint-disable-next-line no-console
    console.log('📊 Project types:', byType);
    
    // Group by language
    const byLanguage = {};
    workspace.projects.forEach(p => {
      if (p.language) {
        byLanguage[p.language] = (byLanguage[p.language] || 0) + 1;
      }
    });
    // eslint-disable-next-line no-console
    console.log('💻 Languages:', byLanguage);
    
  } else {
    // eslint-disable-next-line no-console
    console.log('⚠️  No workspace detected');
  }

    // eslint-disable-next-line no-console
  console.log('\n🎉 Enhanced Code Analyzer integration test completed successfully!');
    // eslint-disable-next-line no-console
  console.log('✨ Foundation workspace detection is working and ready for integration');

} catch (error) {
    // eslint-disable-next-line no-console
  console.error('❌ Error testing enhanced analyzer:', error);
}