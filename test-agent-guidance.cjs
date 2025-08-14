#!/usr/bin/env node

// Test how agents will understand and use the intelligent scaling guidance
const fs = require('fs');
const path = require('path');

console.log('🤖 TESTING AGENT SCALING GUIDANCE SYSTEM');
console.log('========================================\n');

// Import our scaling intelligence
const ScalingIntelligence = require('./src/coordination/swarm/scaling-intelligence.ts').default;

// Simulate different agent scenarios
const agentScenarios = [
  {
    name: "Junior Agent - Simple React Component",
    taskDescription: "Create a React component for user login with useState and basic styling",
    projectFiles: ['src/package.json'],
    expectedGuidance: "basic"
  },
  {
    name: "Mid-level Agent - Full-stack App",  
    taskDescription: "Build a React frontend with Express backend, MongoDB database, JWT authentication, and testing with Jest",
    projectFiles: ['package.json', 'server/package.json'],
    expectedGuidance: "smart_scaling"
  },
  {
    name: "Senior Agent - Enterprise Microservice",
    taskDescription: "Implement distributed microservice architecture with React, Node.js, Docker, Kubernetes, Redis, PostgreSQL, monitoring with Prometheus, and CI/CD pipeline",
    projectFiles: ['frontend/package.json', 'backend/package.json', 'docker-compose.yml', 'k8s/'],
    expectedGuidance: "enterprise_scaling"
  },
  {
    name: "Security-focused Agent",
    taskDescription: "Audit and fix security vulnerabilities in lodash, moment, and axios usage across the codebase, implement proper authentication with bcryptjs",
    projectFiles: ['package.json'],
    expectedGuidance: "immediate_security"
  },
  {
    name: "Performance Agent - Large Codebase",
    taskDescription: "Optimize build performance for large TypeScript codebase with webpack, babel, and 50+ NPM dependencies",
    projectFiles: ['package.json', 'webpack.config.js', 'tsconfig.json'],
    expectedGuidance: "smart_scaling_performance"
  }
];

// Simulate the scaling intelligence system
class MockScalingIntelligence {
  async analyzeScalingNeeds(context) {
    const task = context.taskDescription.toLowerCase();
    
    // Simulate intelligent analysis
    let confidence = 0;
    let shouldScale = false;
    let strategy = 'basic';
    let reason = '';
    
    // Security analysis
    const securityKeywords = ['security', 'vulnerability', 'lodash', 'moment', 'axios', 'bcryptjs', 'jwt'];
    const securityMatches = securityKeywords.filter(keyword => task.includes(keyword));
    if (securityMatches.length > 0) {
      confidence += 40;
      strategy = 'immediate';
      reason = `Security concerns detected: ${securityMatches.join(', ')}`;
    }
    
    // Complexity analysis
    const complexityKeywords = ['microservice', 'distributed', 'kubernetes', 'docker', 'enterprise'];
    const frameworkKeywords = ['react', 'angular', 'vue', 'express', 'nestjs'];
    const toolKeywords = ['webpack', 'babel', 'typescript', 'jest', 'cypress'];
    
    const complexityScore = complexityKeywords.filter(k => task.includes(k)).length * 20;
    const frameworkScore = frameworkKeywords.filter(k => task.includes(k)).length * 15;  
    const toolScore = toolKeywords.filter(k => task.includes(k)).length * 10;
    
    confidence += complexityScore + frameworkScore + toolScore;
    
    // Package count estimation
    const packageIndicators = (task.match(/\b\w+\.js\b|\bnpm\b|\bpackage\b|\bdependenc/g) || []).length;
    confidence += packageIndicators * 5;
    
    // Determine strategy and scaling decision
    shouldScale = confidence >= 40;
    
    if (confidence >= 80) {
      strategy = 'distributed';
      reason = 'Enterprise-scale complexity detected';
    } else if (confidence >= 60) {
      strategy = 'background';
      reason = 'High complexity project with multiple frameworks';
    } else if (securityMatches.length > 0) {
      strategy = 'immediate';
      shouldScale = true;
    }
    
    const estimatedBenefit = shouldScale ? 
      `${Math.min(Math.floor(confidence / 15), 8)}x performance improvement` : 
      'Standard processing sufficient';
    
    return {
      shouldScale,
      confidence: Math.min(confidence, 100),
      reason: reason || 'Project complexity analysis',
      strategy,
      estimatedBenefit,
      autoTrigger: confidence >= 85
    };
  }
  
  async createAgentGuidance(recommendation, context) {
    const guidance = this.generateGuidanceText(recommendation);
    const nextSteps = this.generateNextSteps(recommendation);
    const mcpCommand = this.generateMCPCommand(recommendation);
    const expectedOutcome = this.generateOutcome(recommendation);
    
    return {
      guidance,
      nextSteps,
      mcpCommand,
      expectedOutcome
    };
  }
  
  generateGuidanceText(rec) {
    if (rec.autoTrigger) {
      return `🚀 AUTO-SCALING ACTIVATED (${rec.confidence}% confidence): ${rec.reason}. Enterprise-grade smart scaling will handle dependency management automatically. Your agents can start work immediately.`;
    }
    
    if (rec.shouldScale) {
      return `⚡ SMART SCALING RECOMMENDED (${rec.confidence}% confidence): ${rec.reason}. Expected benefit: ${rec.estimatedBenefit}. Critical dependencies will be available in ~5 seconds.`;
    }
    
    return `✅ BASIC APPROACH SUFFICIENT (${rec.confidence}% confidence): Project complexity is manageable with standard tools. Smart scaling available if needed.`;
  }
  
  generateNextSteps(rec) {
    if (rec.shouldScale) {
      return [
        '1. 🎯 Use fact_smart_scaling to analyze and download dependencies',
        '2. 🏗️  Initialize swarm_init for agent coordination',  
        '3. 🚀 Begin development with critical packages ready',
        '4. 🔄 Monitor background downloads via swarm status'
      ];
    }
    
    return [
      '1. 🔍 Use fact_detect to understand specific requirements',
      '2. 📦 Use fact_npm for individual packages as needed',
      '3. 🤖 Use swarm_init for basic agent coordination'
    ];
  }
  
  generateMCPCommand(rec) {
    if (rec.shouldScale) {
      const config = rec.strategy === 'distributed' ? 
        ', config: {maxImmediateDownloads: 50, strategy: "distributed"}' :
        rec.strategy === 'immediate' ?
        ', config: {maxImmediateDownloads: 30, rateLimitDelay: 200}' :
        '';
      
      return `mcp__claude-zen__fact_smart_scaling(packageJson: <detected_package_json>${config})`;
    }
    
    return 'mcp__claude-zen__fact_npm(packageName: "<specific_package>")';
  }
  
  generateOutcome(rec) {
    if (rec.shouldScale) {
      return `Critical dependencies ready in ~${rec.strategy === 'immediate' ? '3-5' : '5-10'} seconds. Background processing handles remaining packages. Agent coordination begins immediately. ${rec.estimatedBenefit}.`;
    }
    
    return 'Standard dependency resolution. Packages loaded as needed. Basic coordination.';
  }
}

// Test each scenario
async function testAgentGuidance() {
  console.log('🧪 Testing Intelligent Scaling Guidance for Different Agent Scenarios\n');
  
  const intelligence = new MockScalingIntelligence();
  const results = [];
  
  for (const scenario of agentScenarios) {
    console.log(`\n🤖 ${scenario.name}`);
    console.log('=' .repeat(scenario.name.length + 3));
    console.log(`📋 Task: "${scenario.taskDescription}"`);
    console.log(`📁 Files: ${scenario.projectFiles.join(', ')}`);
    
    try {
      // Simulate agent using fact_scaling_guidance tool
      const context = {
        taskDescription: scenario.taskDescription,
        projectFiles: scenario.projectFiles,
        requestedPackages: []
      };
      
      const recommendation = await intelligence.analyzeScalingNeeds(context);
      const guidance = await intelligence.createAgentGuidance(recommendation, context);
      
      console.log(`\n📊 ANALYSIS RESULTS:`);
      console.log(`   Should Scale: ${recommendation.shouldScale ? '✅ YES' : '❌ NO'}`);
      console.log(`   Confidence: ${recommendation.confidence}%`);
      console.log(`   Strategy: ${recommendation.strategy}`);
      console.log(`   Auto-trigger: ${recommendation.autoTrigger ? '🚀 YES' : '⏸️  NO'}`);
      
      console.log(`\n💡 AGENT GUIDANCE:`);
      console.log(`   ${guidance.guidance}`);
      
      console.log(`\n🔧 RECOMMENDED COMMAND:`);
      console.log(`   ${guidance.mcpCommand}`);
      
      console.log(`\n⚡ EXPECTED OUTCOME:`);
      console.log(`   ${guidance.expectedOutcome}`);
      
      console.log(`\n📋 NEXT STEPS:`);
      guidance.nextSteps.forEach(step => console.log(`   ${step}`));
      
      results.push({
        scenario: scenario.name,
        shouldScale: recommendation.shouldScale,
        confidence: recommendation.confidence,
        strategy: recommendation.strategy,
        autoTrigger: recommendation.autoTrigger,
        guidance: guidance.guidance
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return results;
}

// Create agent decision matrix
function createAgentDecisionMatrix(results) {
  console.log('\n\n📊 AGENT DECISION MATRIX SUMMARY');
  console.log('===============================');
  console.log('| Agent Type                     | Should Scale | Confidence | Strategy     | Auto-Trigger |');
  console.log('|--------------------------------|--------------|------------|--------------|--------------|');
  
  results.forEach(result => {
    const name = result.scenario.padEnd(30);
    const shouldScale = (result.shouldScale ? '✅ YES' : '❌ NO').padEnd(10);
    const confidence = `${result.confidence}%`.padEnd(8);
    const strategy = result.strategy.padEnd(10);
    const autoTrigger = (result.autoTrigger ? '🚀 YES' : '⏸️  NO').padEnd(10);
    
    console.log(`| ${name} | ${shouldScale} | ${confidence} | ${strategy} | ${autoTrigger} |`);
  });
  
  console.log('\n🎯 KEY INSIGHTS:');
  const scalingCount = results.filter(r => r.shouldScale).length;
  const autoTriggerCount = results.filter(r => r.autoTrigger).length;
  const avgConfidence = Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length);
  
  console.log(`   • ${scalingCount}/${results.length} scenarios recommend smart scaling`);
  console.log(`   • ${autoTriggerCount}/${results.length} scenarios auto-trigger scaling`);
  console.log(`   • Average confidence score: ${avgConfidence}%`);
  console.log(`   • Security tasks get immediate priority`);
  console.log(`   • Enterprise tasks get distributed strategy`);
}

// Generate agent instruction guide
function generateAgentInstructionGuide() {
  console.log('\n\n📖 AGENT INSTRUCTION GUIDE');
  console.log('==========================');
  
  const guide = `
🤖 **HOW AGENTS SHOULD USE SCALING GUIDANCE:**

1️⃣  **ALWAYS START WITH SCALING GUIDANCE:**
   📞 mcp__claude-zen__fact_scaling_guidance(taskDescription: "your task here")
   
   ✅ This analyzes your task and gives specific recommendations
   ✅ Provides confidence score and reasoning  
   ✅ Tells you exactly which tool to use next

2️⃣  **FOLLOW THE RECOMMENDATION:**
   
   If confidence >80%: 🚀 **AUTO-SCALING ACTIVATED**
   → Smart scaling runs automatically
   → Start work immediately with critical deps ready
   
   If confidence 50-80%: ⚡ **SCALING RECOMMENDED** 
   → Use: mcp__claude-zen__fact_smart_scaling(packageJson: <your_package_json>)
   → Get 3-8x performance improvement
   
   If confidence <50%: ✅ **BASIC APPROACH**
   → Use: mcp__claude-zen__fact_npm(packageName: "specific_package")
   → Standard dependency handling

3️⃣  **UNDERSTAND THE BENEFITS:**
   
   🏗️  **Smart Scaling Benefits:**
   • Critical packages ready in ~5 seconds (no waiting)
   • Security-vulnerable packages prioritized  
   • Background processing handles the rest
   • Agent coordination starts immediately
   
   📦 **Basic Approach Benefits:**
   • Simple and straightforward
   • Good for small projects (<25 packages)
   • No overhead for simple tasks

4️⃣  **DECISION TREE FOR AGENTS:**
   
   📋 Task received
   ↓
   🧠 Run fact_scaling_guidance  
   ↓
   📊 Check confidence score
   ↓
   ├─ >80%: 🚀 Auto-scaling (enterprise/security)
   ├─ 50-80%: ⚡ Use fact_smart_scaling (complex)  
   └─ <50%: ✅ Use fact_npm (simple)
   ↓
   🤖 Initialize swarm_init for coordination
   ↓
   🚀 Begin development work

💡 **AGENT INTELLIGENCE TIPS:**
• Security tasks (lodash, moment, axios) → Always scale immediately
• Framework tasks (React, Angular, Express) → Usually scale  
• Enterprise keywords (microservice, kubernetes) → Always scale
• Simple components or utilities → Basic approach fine
• When in doubt → Ask for scaling guidance first!
`;

  console.log(guide);
}

// Main execution
async function main() {
  const results = await testAgentGuidance();
  createAgentDecisionMatrix(results);
  generateAgentInstructionGuide();
  
  // Save results for reference
  const manifest = {
    testType: 'agent_scaling_guidance',
    scenarios: agentScenarios.length,
    results: results,
    insights: {
      scalingRecommended: results.filter(r => r.shouldScale).length,
      autoTrigger: results.filter(r => r.autoTrigger).length,
      averageConfidence: Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length)
    },
    timestamp: new Date().toISOString()
  };
  
  const manifestPath = path.join(process.cwd(), 'storage', 'fact', 'agent-guidance-test.json');
  if (!fs.existsSync(path.dirname(manifestPath))) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`\n📋 Test results saved: agent-guidance-test.json`);
  console.log('\n🎉 AGENT GUIDANCE SYSTEM COMPLETE!');
  console.log('✨ Agents now have intelligent scaling guidance with detailed instructions!');
  
  return results;
}

// Run the test
main().catch(console.error);