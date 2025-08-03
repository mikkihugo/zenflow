/**
 * Main orchestrator for domain splitting operations
 */

import { DomainAnalysisEngine } from './analyzers/domain-analyzer.js';
import { SafeDomainSplitter } from './splitters/domain-splitter.js';
import { DependencyValidator } from './validators/dependency-validator.js';

import type {
  SubDomainPlan,
  SplittingResult,
  NEURAL_SPLITTING_PLAN
} from './types/domain-types.js';

import type {
  AnalysisConfig,
  DEFAULT_ANALYSIS_CONFIG
} from './types/analysis-types.js';

export class DomainSplittingOrchestrator {
  private analyzer: DomainAnalysisEngine;
  private splitter: SafeDomainSplitter;
  private validator: DependencyValidator;

  constructor(config?: AnalysisConfig) {
    this.analyzer = new DomainAnalysisEngine(config || DEFAULT_ANALYSIS_CONFIG);
    this.splitter = new SafeDomainSplitter();
    this.validator = new DependencyValidator();
  }

  /**
   * Execute complete domain splitting workflow
   */
  async executeDomainSplit(domainPath: string, plan?: SubDomainPlan): Promise<SplittingResult> {
    console.log(`🎯 Starting domain splitting workflow for: ${domainPath}`);
    
    try {
      // Step 1: Analyze domain
      const analysis = await this.analyzer.analyzeDomainComplexity(domainPath);
      console.log(`📊 Analysis complete - complexity score: ${analysis.complexityScore.toFixed(2)}`);
      
      // Step 2: Use provided plan or generate one
      let finalPlan = plan;
      if (!finalPlan) {
        const plans = await this.analyzer.identifySubDomains(analysis);
        finalPlan = plans[0]; // Use best plan
        
        if (!finalPlan) {
          throw new Error('No suitable splitting plan could be generated');
        }
      }
      
      // Step 3: Add file assignments to plan based on analysis
      finalPlan = await this.enrichPlanWithFiles(finalPlan, analysis);
      console.log(`📋 Using plan with ${finalPlan.targetSubDomains.length} sub-domains`);
      
      // Step 4: Validate plan
      const validation = await this.validator.validateNoCyclicDependencies([finalPlan]);
      if (!validation.success) {
        throw new Error(`Plan validation failed: ${validation.issues.map(i => i.description).join(', ')}`);
      }
      
      // Step 5: Execute splitting
      const result = await this.splitter.executeSplitting([finalPlan]);
      
      if (result.success) {
        console.log(`✅ Domain splitting completed successfully!`);
        console.log(`📁 Created ${result.subDomainsCreated} sub-domains`);
        console.log(`🔄 Moved ${result.filesMoved} files`);
        console.log(`🔗 Updated ${result.importsUpdated} import statements`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Domain splitting failed:`, error);
      throw error;
    }
  }

  /**
   * Analyze domain and provide recommendations
   */
  async analyzeDomain(domainPath: string) {
    console.log(`🔍 Analyzing domain: ${domainPath}`);
    
    const analysis = await this.analyzer.analyzeDomainComplexity(domainPath);
    const plans = await this.analyzer.identifySubDomains(analysis);
    
    const metrics = plans.length > 0 
      ? await this.analyzer.calculateSplittingBenefits(plans)
      : null;
    
    return {
      analysis,
      recommendedPlans: plans,
      benefits: metrics
    };
  }

  /**
   * Split neural domain using predefined plan
   */
  async splitNeuralDomain(): Promise<SplittingResult> {
    const neuralPath = 'src/neural';
    
    // Use the predefined neural splitting plan
    const plan = NEURAL_SPLITTING_PLAN;
    
    return this.executeDomainSplit(neuralPath, plan);
  }

  /**
   * Validate an existing domain split
   */
  async validateSplit(plans: SubDomainPlan[]): Promise<any> {
    console.log(`✅ Validating domain split`);
    
    const cyclicValidation = await this.validator.validateNoCyclicDependencies(plans);
    const apiValidation = await this.validator.ensurePublicAPIStability(plans);
    const buildValidation = await this.validator.verifyBuildIntegrity(plans);
    
    return {
      cyclicDependencies: cyclicValidation,
      apiStability: apiValidation,
      buildIntegrity: buildValidation,
      overall: cyclicValidation.success && buildValidation.success
    };
  }

  private async enrichPlanWithFiles(plan: SubDomainPlan, analysis: any): Promise<SubDomainPlan> {
    // Assign files to sub-domains based on categories
    const enrichedSubDomains = plan.targetSubDomains.map(subdomain => {
      const files = this.getFilesForSubDomain(subdomain.name, analysis.categories);
      
      return {
        ...subdomain,
        files,
        estimatedFiles: files.length
      };
    });
    
    return {
      ...plan,
      targetSubDomains: enrichedSubDomains
    };
  }

  private getFilesForSubDomain(subdomainName: string, categories: any): string[] {
    const files = [];
    
    // Map subdomain names to categories
    if (subdomainName.includes('core')) {
      files.push(...(categories['core-algorithms'] || []));
    }
    if (subdomainName.includes('models')) {
      files.push(...(categories['models'] || []));
      files.push(...(categories['network-architectures'] || []));
    }
    if (subdomainName.includes('agents')) {
      files.push(...(categories['agents'] || []));
    }
    if (subdomainName.includes('coordination')) {
      files.push(...(categories['coordination'] || []));
    }
    if (subdomainName.includes('wasm')) {
      files.push(...(categories['wasm'] || []));
    }
    if (subdomainName.includes('bridge')) {
      files.push(...(categories['bridge'] || []));
      files.push(...(categories['integration'] || []));
    }
    
    return files;
  }
}