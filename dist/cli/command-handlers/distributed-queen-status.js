/**
 * Distributed Queen Council Status Checker
 * Comprehensive analysis of all queen capabilities and readiness
 */

import { QueenCouncil } from './queen-council.js';
import { strategicDocs } from '../database/strategic-documents-manager.js';
import { WebSocketService } from '../../api/websocket-service.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

/**
 * Comprehensive Queen Council Status Analysis
 */
export class DistributedQueenStatus {
  constructor() {
    this.council = null;
    this.websocketService = null;
    this.statusData = {
      initialization: false,
      database: false,
      queens: {},
      distribution: false,
      websocket: false,
      coordination: false,
      readiness: false
    };
  }

  /**
   * Run complete distributed queen readiness check
   */
  async checkDistributedReadiness() {
    printInfo('👑 Analyzing Distributed Queen Council Readiness...');
    console.log('━'.repeat(80));

    try {
      // 1. Check System Initialization
      await this.checkSystemInitialization();
      
      // 2. Check Database Integration
      await this.checkDatabaseIntegration();
      
      // 3. Check Individual Queens
      await this.checkQueenCapabilities();
      
      // 4. Check Distribution Capabilities
      await this.checkDistributionCapabilities();
      
      // 5. Check WebSocket Integration
      await this.checkWebSocketIntegration();
      
      // 6. Check Coordination Features
      await this.checkCoordinationFeatures();
      
      // 7. Generate Overall Readiness Assessment
      await this.generateReadinessAssessment();
      
    } catch (error) {
      printError(`❌ Status check failed: ${error.message}`);
      this.statusData.readiness = false;
    }

    return this.statusData;
  }

  /**
   * Check system initialization
   */
  async checkSystemInitialization() {
    printInfo('🔧 Checking System Initialization...');
    
    try {
      this.council = new QueenCouncil();
      await this.council.initialize();
      
      this.statusData.initialization = true;
      printSuccess('✅ Queen Council system initialized successfully');
      
      // Count available queens
      const queenCount = Object.keys(this.council.queens).length;
      console.log(`   📊 Total Queens: ${queenCount}`);
      console.log(`   🎯 Consensus Threshold: ${this.council.consensusThreshold * 100}%`);
      
    } catch (error) {
      printError(`❌ System initialization failed: ${error.message}`);
      this.statusData.initialization = false;
    }
  }

  /**
   * Check database integration
   */
  async checkDatabaseIntegration() {
    printInfo('💾 Checking Database Integration...');
    
    try {
      // Check strategic documents database
      await strategicDocs.initialize();
      const backendStats = await strategicDocs.getBackendStats();
      
      if (backendStats) {
        this.statusData.database = true;
        printSuccess(`✅ Database integrated: ${backendStats.backend || 'Unknown'}`);
        console.log(`   📄 Documents: ${backendStats.entries || 0}`);
        console.log(`   📦 Namespaces: ${backendStats.namespaces || 0}`);
        console.log(`   🔍 Semantic Search: ${backendStats.hasSemanticSearch ? '✅' : '❌'}`);
        console.log(`   📊 Graph Support: ${backendStats.hasGraph ? '✅' : '❌'}`);
      } else {
        throw new Error('No backend statistics available');
      }
      
    } catch (error) {
      printError(`❌ Database integration failed: ${error.message}`);
      this.statusData.database = false;
    }
  }

  /**
   * Check individual queen capabilities
   */
  async checkQueenCapabilities() {
    printInfo('👑 Analyzing Individual Queen Capabilities...');
    
    if (!this.council) {
      printError('❌ Council not initialized - skipping queen analysis');
      return;
    }

    const testObjective = "Test queen capability analysis";
    const testDocs = {
      roadmaps: [],
      prds: [],
      architecture: [],
      adrs: [],
      strategies: []
    };

    for (const [name, queen] of Object.entries(this.council.queens)) {
      try {
        console.log(`\n   🔍 Testing ${name.toUpperCase()} Queen...`);
        
        // Test queen analysis capability
        const analysis = await queen.analyzeWithDocuments(testObjective, testDocs, {});
        const decision = await queen.makeDecision(testObjective, analysis, testDocs);
        
        this.statusData.queens[name] = {
          initialized: true,
          domain: queen.domain || 'unknown',
          documentTypes: queen.documentTypes || [],
          canAnalyze: !!analysis,
          canDecide: !!decision,
          confidence: decision.confidence || 0,
          recommendation: decision.recommendation || 'unknown'
        };
        
        console.log(`     ✅ Domain: ${queen.domain || 'Unknown'}`);
        console.log(`     📋 Document Types: ${queen.documentTypes?.join(', ') || 'None'}`);
        console.log(`     🎯 Test Confidence: ${Math.round((decision.confidence || 0) * 100)}%`);
        console.log(`     💡 Test Recommendation: ${decision.recommendation}`);
        
      } catch (error) {
        console.log(`     ❌ ${name.toUpperCase()} Queen failed: ${error.message}`);
        this.statusData.queens[name] = {
          initialized: false,
          error: error.message
        };
      }
    }
    
    const workingQueens = Object.values(this.statusData.queens).filter(q => q.initialized).length;
    const totalQueens = Object.keys(this.statusData.queens).length;
    
    if (workingQueens === totalQueens) {
      printSuccess(`✅ All ${totalQueens} queens operational`);
    } else {
      printWarning(`⚠️ ${workingQueens}/${totalQueens} queens operational`);
    }
  }

  /**
   * Check distribution capabilities
   */
  async checkDistributionCapabilities() {
    printInfo('🌐 Checking Distribution Capabilities...');
    
    try {
      // Check if queens can work independently
      const distributionFeatures = {
        consensus: this.council?.consensusThreshold > 0,
        voting: typeof this.council?.achieveConsensus === 'function',
        conflict_resolution: typeof this.council?.resolveConflict === 'function',
        decision_logging: typeof this.council?.logDecision === 'function',
        document_updates: typeof this.council?.updateStrategicDocuments === 'function'
      };
      
      const workingFeatures = Object.values(distributionFeatures).filter(f => f).length;
      const totalFeatures = Object.keys(distributionFeatures).length;
      
      this.statusData.distribution = workingFeatures === totalFeatures;
      
      console.log('   📊 Distribution Features:');
      Object.entries(distributionFeatures).forEach(([feature, working]) => {
        console.log(`     ${working ? '✅' : '❌'} ${feature.replace('_', ' ')}`);
      });
      
      if (this.statusData.distribution) {
        printSuccess(`✅ All ${totalFeatures} distribution features available`);
      } else {
        printWarning(`⚠️ ${workingFeatures}/${totalFeatures} distribution features available`);
      }
      
    } catch (error) {
      printError(`❌ Distribution check failed: ${error.message}`);
      this.statusData.distribution = false;
    }
  }

  /**
   * Check WebSocket integration for real-time coordination
   */
  async checkWebSocketIntegration() {
    printInfo('🔌 Checking WebSocket Integration...');
    
    try {
      // Check if WebSocket service is available
      this.websocketService = await WebSocketService.create({
        clientPort: 3000
      });
      
      const wsStatus = this.websocketService.getStatus();
      
      this.statusData.websocket = wsStatus.service.initialized;
      
      console.log(`   🔌 Service Initialized: ${wsStatus.service.initialized ? '✅' : '❌'}`);
      console.log(`   🐍 Node.js Version: ${wsStatus.nodeJsVersion}`);
      console.log(`   🆕 Native WebSocket: ${wsStatus.nativeWebSocketSupport ? '✅' : '❌'}`);
      console.log(`   📡 Message Handlers: ${wsStatus.handlers.totalTypes}`);
      
      if (this.statusData.websocket) {
        printSuccess('✅ WebSocket integration ready for real-time coordination');
      } else {
        printWarning('⚠️ WebSocket integration not fully ready');
      }
      
    } catch (error) {
      printError(`❌ WebSocket integration check failed: ${error.message}`);
      this.statusData.websocket = false;
    }
  }

  /**
   * Check coordination features
   */
  async checkCoordinationFeatures() {
    printInfo('🤝 Checking Coordination Features...');
    
    try {
      const coordinationFeatures = {
        multi_queen_analysis: this.council && Object.keys(this.council.queens).length > 1,
        document_awareness: this.statusData.database,
        consensus_voting: this.statusData.distribution,
        real_time_updates: this.statusData.websocket,
        decision_persistence: this.statusData.database,
        conflict_resolution: typeof this.council?.resolveConflict === 'function',
        strategic_updates: typeof this.council?.updateStrategicDocuments === 'function'
      };
      
      const workingFeatures = Object.values(coordinationFeatures).filter(f => f).length;
      const totalFeatures = Object.keys(coordinationFeatures).length;
      
      this.statusData.coordination = workingFeatures >= Math.ceil(totalFeatures * 0.8); // 80% threshold
      
      console.log('   🤝 Coordination Features:');
      Object.entries(coordinationFeatures).forEach(([feature, working]) => {
        console.log(`     ${working ? '✅' : '❌'} ${feature.replace(/_/g, ' ')}`);
      });
      
      if (this.statusData.coordination) {
        printSuccess(`✅ Coordination ready (${workingFeatures}/${totalFeatures} features)`);
      } else {
        printWarning(`⚠️ Coordination partially ready (${workingFeatures}/${totalFeatures} features)`);
      }
      
    } catch (error) {
      printError(`❌ Coordination check failed: ${error.message}`);
      this.statusData.coordination = false;
    }
  }

  /**
   * Generate overall readiness assessment
   */
  async generateReadinessAssessment() {
    console.log('\n' + '━'.repeat(80));
    printInfo('📊 DISTRIBUTED QUEEN COUNCIL READINESS ASSESSMENT');
    console.log('━'.repeat(80));
    
    // Calculate overall readiness score
    const readinessFactors = {
      'System Initialization': this.statusData.initialization,
      'Database Integration': this.statusData.database,
      'Queen Operations': Object.values(this.statusData.queens).filter(q => q.initialized).length > 0,
      'Distribution Capabilities': this.statusData.distribution,
      'WebSocket Integration': this.statusData.websocket,
      'Coordination Features': this.statusData.coordination
    };
    
    const readyCount = Object.values(readinessFactors).filter(f => f).length;
    const totalFactors = Object.keys(readinessFactors).length;
    const readinessPercentage = Math.round((readyCount / totalFactors) * 100);
    
    console.log('📋 Readiness Factors:');
    Object.entries(readinessFactors).forEach(([factor, ready]) => {
      console.log(`   ${ready ? '✅' : '❌'} ${factor}`);
    });
    
    console.log(`\n📊 Overall Readiness: ${readinessPercentage}%`);
    
    // Determine readiness status
    if (readinessPercentage >= 90) {
      this.statusData.readiness = 'FULLY_READY';
      printSuccess('🚀 DISTRIBUTED QUEEN COUNCIL IS FULLY READY FOR PRODUCTION');
    } else if (readinessPercentage >= 70) {
      this.statusData.readiness = 'MOSTLY_READY';
      printWarning('⚡ DISTRIBUTED QUEEN COUNCIL IS MOSTLY READY (SOME FEATURES LIMITED)');
    } else if (readinessPercentage >= 50) {
      this.statusData.readiness = 'PARTIALLY_READY';
      printWarning('🔧 DISTRIBUTED QUEEN COUNCIL IS PARTIALLY READY (NEEDS WORK)');
    } else {
      this.statusData.readiness = 'NOT_READY';
      printError('❌ DISTRIBUTED QUEEN COUNCIL IS NOT READY FOR PRODUCTION');
    }
    
    // Queen details
    const workingQueens = Object.entries(this.statusData.queens)
      .filter(([_, queen]) => queen.initialized)
      .length;
    const totalQueens = Object.keys(this.statusData.queens).length;
    
    console.log(`\n👑 Queen Status: ${workingQueens}/${totalQueens} operational`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!this.statusData.initialization) {
      console.log('   🔧 Fix system initialization issues');
    }
    if (!this.statusData.database) {
      console.log('   💾 Resolve database integration problems');
    }
    if (!this.statusData.websocket) {
      console.log('   🔌 Enable WebSocket support for real-time coordination');
    }
    if (workingQueens < totalQueens) {
      console.log('   👑 Debug and fix non-operational queens');
    }
    
    console.log('━'.repeat(80));
    
    // Cleanup
    if (this.websocketService) {
      await this.websocketService.shutdown();
    }
  }
}

/**
 * CLI command handler for distributed queen status
 */
export async function distributedQueenStatusCommand(input, flags) {
  const checker = new DistributedQueenStatus();
  const status = await checker.checkDistributedReadiness();
  
  if (flags.json) {
    console.log(JSON.stringify(status, null, 2));
  }
  
  return status;
}

export default DistributedQueenStatus;