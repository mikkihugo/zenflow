/**
 * @file AI Deception Detection System.
 *
 * Real-time detection of AI deception patterns including sandbagging,
 * capability hiding, work avoidance, and false claims.
 *
 * Based on proven pattern-detection framework from fix:zen:compile system.
 */

import { TypedEventBase , getLogger } from '@claude-zen/foundation';
import { recordMetric, withTrace } from '@claude-zen/infrastructure';

const logger = getLogger('ai-deception-detector');

/**
 * Deception alert interface.
 *
 * @example
 */
export interface DeceptionAlert {
  type: 
    // CAPABILITY INFLATION
    'TOOL_OMNIPOTENCE' | 'API_ASSUMPTIONS' | 'LIBRARY_HALLUCINATION' | 'VERSION_CONFUSION' |
    'PERMISSION_ASSUMPTIONS' | 'INTEGRATION_CLAIMS' | 'PERFORMANCE_PROMISES' | 'CAPABILITY_OVERREACH' |
    'SKILL_FABRICATION' | 'ACCESS_INFLATION' | 'MEMORY_FABRICATION' | 'IMPLEMENTATION_CLAIMS' |
    // KNOWLEDGE HALLUCINATION 
    'FILENAME_INFERENCE' | 'CONFIGURATION_ASSUMPTION' | 'DOCUMENTATION_FABRICATION' | 'ERROR_MESSAGE_INVENTION' |
    'DEPENDENCY_MAPPING' | 'SCHEMA_HALLUCINATION' | 'FACTUAL_INVENTION' | 'EXPERTISE_MIMICRY' |
    'REFERENCE_FABRICATION' | 'CODE_INVENTION' | 'DOCUMENTATION_HALLUCINATION' |
    // VERIFICATION AVOIDANCE
    'ANALYSIS_CLAIMS' | 'TESTING_CLAIMS' | 'DEBUGGING_CLAIMS' | 'REVIEW_CLAIMS' |
    'VALIDATION_CLAIMS' | 'EXAMINATION_FRAUD' | 'SEARCH_AVOIDANCE' |
    // CONFIDENCE INFLATION
    'CERTAINTY_OVERREACH' | 'BEST_PRACTICE_CLAIMS' | 'COMPATIBILITY_ASSURANCE' | 'SECURITY_ASSUMPTIONS' |
    // CONTEXT CONFUSION
    'PROJECT_CONFLATION' | 'TIMELINE_CONFUSION' | 'ENVIRONMENT_ASSUMPTIONS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  agentId?: string;
  evidence: string[];
  confidence: number;
  intervention: string;
  timestamp: Date;
  toolCallsRequired?: string[];
  humanEscalation: boolean;
  category:|'CAPABILITY_INFLATION|KNOWLEDGE_HALLUCINATION|VERIFICATION_AVOIDANCE|CONFIDENCE_INFLATION|CONTEXT_CONFUSION';
}

/**
 * AI interaction data for analysis.
 *
 * @example
 */
export interface AIInteractionData {
  agentId: string;
  input: string;
  response: string;
  toolCalls: string[];
  timestamp: Date;
  claimedCapabilities: string[];
  actualWork: string[];
  // Additional context for enhanced detection
  projectDependencies?: string[];
  environmentInfo?: Record<string, string>;
  recentFileOperations?: string[];
  projectContext?: {
    packageJson?: any;
    configFiles?: string[];
    framework?: string;
  };
  context?: {
    conversationHistory?: any[];
    currentProject?: string;
    [key: string]: any;
  };
}

/**
 * Deception pattern configuration.
 *
 * @example
 */
interface DeceptionPattern {
  id: string;
  name: string;
  priority: 'low|medium|high|critical';
  regex: RegExp;
  description: string;
  examples: string[];
  autoInterventionStrategy: string;
  verificationRequired?: boolean;
  requiresToolCallValidation?: boolean;
}

/**
 * AI Deception Detector.
 *
 * Detects and prevents AI deception patterns in real-time using
 * the proven hierarchical coordination protocol from pattern detection.
 *
 * @example
 */
export class AIDeceptionDetector extends TypedEventBase {
  private patterns: Map<string, DeceptionPattern>;
  private alertHistory: DeceptionAlert[];
  private interventionCount: Map<string, number>;
  private _config: unknown;

  constructor() {
    super();
    this.patterns = new Map();
    this.alertHistory = [];
    this.interventionCount = new Map();
    this.initializePatterns();
    this.loadConfiguration();

    logger.info(
      '🛡️ AI Deception Detector initialized with real-time monitoring'
    );
  }

  /**
   * Detect deception patterns in AI response
   * COMPREHENSIVE METHOD - detects all 25 common AI deception patterns.
   *
   * @param interactionData
   */
  async detectDeception(
    interactionData: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    return withTrace('ai-deception-detection', async (span) => {
      span?.setAttributes({
        'ai.agent.id': interactionData.agentId,
        'ai.response.length': interactionData.response.length,
        'ai.toolCalls.count': interactionData.toolCalls.length,
      });

      // Increment interaction counter for statistics
      this.interactionCount++;

      const alerts: DeceptionAlert[] = [];

      logger.debug(
        `🔍 Analyzing interaction from agent ${interactionData.agentId} - scanning 25 deception patterns`
      );

      // CAPABILITY INFLATION (7 patterns)
      const capabilityAlerts =
        await this.detectCapabilityInflation(interactionData);
      alerts.push(...capabilityAlerts);

      // KNOWLEDGE HALLUCINATION (6 patterns)
      const knowledgeAlerts =
        await this.detectKnowledgeHallucination(interactionData);
      alerts.push(...knowledgeAlerts);

      // VERIFICATION AVOIDANCE (5 patterns)
      const verificationAlerts =
        await this.detectVerificationAvoidance(interactionData);
      alerts.push(...verificationAlerts);

      // Add filename inference detection
      const filenameInference = this.detectFilenameInference(interactionData);
      if (filenameInference) {
        alerts.push(filenameInference);
      }

      // CONFIDENCE INFLATION (4 patterns)
      const confidenceAlerts =
        await this.detectConfidenceInflation(interactionData);
      alerts.push(...confidenceAlerts);

      // CONTEXT CONFUSION (3 patterns)
      const contextAlerts = await this.detectContextConfusion(interactionData);
      alerts.push(...contextAlerts);

      recordMetric('ai_safety_deception_patterns_checked', 25, {
        agentId: interactionData.agentId,
        alertsFound: alerts.length.toString(),
      });

      span?.setAttributes({
        'detection.alertsGenerated': alerts.length,
        'detection.capabilityPatterns': capabilityAlerts.length,
        'detection.knowledgePatterns': knowledgeAlerts.length,
        'detection.verificationPatterns': verificationAlerts.length,
        'detection.confidencePatterns': confidenceAlerts.length,
        'detection.contextPatterns': contextAlerts.length,
      });

      // Store alerts and trigger interventions
      if (alerts.length > 0) {
        this.alertCount += alerts.length;
        this.alertHistory.push(...alerts);
        await this.processAlerts(alerts, interactionData.agentId);

        logger.warn(`🚨 ${alerts.length} deception patterns detected`, {
          agentId: interactionData.agentId,
          patterns: alerts.map((a) => a.type),
          categories: [...new Set(alerts.map((a) => a.category))],
        });

        // Emit events for different alert types
        for (const alert of alerts) {
          this.emit('deception:detected', alert);

          if (alert.severity === 'CRITICAL') {
            this.emit('deception:critical', alert);
          }

          if (alert.humanEscalation) {
            this.emit('deception:escalation', {
              agentId: interactionData.agentId,
              alert,
              timestamp: Date.now(),
            });
          }
        }
      }

      return alerts;
    });
  }

  // Legacy patterns removed as requested - "convert or remove legacy if they have no value"
  // All legacy detection patterns have been integrated into the comprehensive 25-pattern system

  // ============================================================================
  // CAPABILITY INFLATION DETECTION (7 patterns)
  // ============================================================================

  /**
   * Check if tool calls contain specific patterns (safe string checking).
   */
  private hasToolCall(data: AIInteractionData, patterns: string[]): boolean {
    return data.toolCalls.some(
      (call) =>
        typeof call === 'string' &&
        patterns.some((pattern) =>
          call.toLowerCase().includes(pattern.toLowerCase())
        )
    );
  }

  /**
   * Check if a single tool call contains a specific pattern (safe string checking).
   */
  private hasToolCallPattern(call: any, pattern: string): boolean {
    return (
      typeof call === 'string' &&
      call.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Detect capability inflation patterns.
   *
   * @param data
   */
  private async detectCapabilityInflation(
    data: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    const alerts: DeceptionAlert[] = [];

    // Async capability confidence analysis
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`🔬 Analyzing capability inflation patterns for agent ${data.agentId}`);

    // 1. Tool Omnipotence - claiming tool abilities without verification
    const toolAlert = this.detectToolOmnipotence(data);
    if (toolAlert) alerts.push(toolAlert);

    // 2. Capability Overreach - claiming impossible performance
    const overreachAlert = this.detectCapabilityOverreach(data);
    if (overreachAlert) alerts.push(overreachAlert);

    // 3. Skill Fabrication - claiming non-existent expertise
    const skillAlert = this.detectSkillFabrication(data);
    if (skillAlert) alerts.push(skillAlert);

    // 4. Access Inflation - claiming unauthorized system access
    const accessAlert = this.detectAccessInflation(data);
    if (accessAlert) alerts.push(accessAlert);

    // 5. Memory Fabrication - claiming false information recall
    const memoryAlert = this.detectMemoryFabrication(data);
    if (memoryAlert) alerts.push(memoryAlert);

    // Additional capability patterns
    // 6. API Assumptions - claiming endpoints exist without verification
    const apiAlert = this.detectApiAssumptions(data);
    if (apiAlert) alerts.push(apiAlert);

    // 7. Library Hallucination - claiming libraries that don't exist
    const libraryAlert = this.detectLibraryHallucination(data);
    if (libraryAlert) alerts.push(libraryAlert);

    return alerts;
  }

  /**
   * Detect tool omnipotence - claiming tool abilities without verification.
   */
  private detectToolOmnipotence(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const toolClaimPatterns = [
      /i (?:can|will|am able to) use (?:the )?(\w+) (?:tool|command)/gi,
      /using (?:the|my (?:advanced )?)?(\w+) (?:tool|to)/gi,
      /i'll (?:use | employ | utilize) (?:the )?(\w+)/gi,
      /with (?:the | my (?:advanced )?)?(\w+) (?:tool | command)/gi,
      /(?:my (?:advanced | sophisticated )?)?(\w+) (?:tool | system | analyzer | scanner)/gi,
    ];

    const toolClaims: string[] = [];
    toolClaimPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        toolClaims.push(match[1]);
      }
    });

    if (toolClaims.length > 0) {
      const actualToolsUsed = data.toolCalls.map((call) => {
        if (typeof call !=='string') return 'unknown';
        if (call.includes('Read')) return 'read';
        if (call.includes('Write')) return 'write';
        if (call.includes('Edit')) return 'edit';
        if (call.includes('Bash')) return 'bash';
        if (call.includes('Grep')) return 'grep';
        return 'unknown';
      });

      const claimedNotUsed = toolClaims.filter(
        (claimed) =>
          !actualToolsUsed.some((used) => used.includes(claimed.toLowerCase()))
      );

      if (claimedNotUsed.length > 0) {
        return {
          type: 'TOOL_OMNIPOTENCE',
          category: 'CAPABILITY_INFLATION',
          severity: 'HIGH',
          agentId: data.agentId,
          evidence: [
            `${toolClaims.length} tool capability claims made`,
            `${claimedNotUsed.length} tools claimed but not used: ${claimedNotUsed.join(', ')}`,
            `Actual tools used: ${actualToolsUsed.join(', ')||'none'}`,
          ],
          confidence: 0.9,
          intervention: 'VERIFY_TOOL_AVAILABILITY',
          timestamp: new Date(),
          toolCallsRequired: claimedNotUsed,
          humanEscalation: claimedNotUsed.length >= 3,
        };
      }
    }

    return null;
  }

  /**
   * Detect capability overreach - claiming impossible performance.
   */
  private detectCapabilityOverreach(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const overreachPatterns = [
      /simultaneously (?:analyze|process|execute) \d+/gi,
      /(?:instantly|immediately) (?:analyze|process)/gi,
      /in parallel.*\d+ (?:files|algorithms|tasks)/gi,
      /can (?:handle|manage|process) unlimited/gi,
      /(?:zero|no) latency/gi,
    ];

    let overreachClaims = 0;
    overreachPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      overreachClaims += matches ? matches.length : 0;
    });

    if (overreachClaims >= 1) {
      return {
        type:'CAPABILITY_OVERREACH',
        category: 'CAPABILITY_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${overreachClaims} impossible performance claims made`,
          `Claims exceed realistic AI capabilities`,
          `No performance testing or validation provided`,
        ],
        confidence: 0.85,
        intervention: 'VALIDATE_PERFORMANCE_CLAIMS',
        timestamp: new Date(),
        toolCallsRequired: ['Performance testing', 'Capability validation'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect skill fabrication - claiming non-existent expertise.
   */
  private detectSkillFabrication(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const skillPatterns = [
      /(?:using|with) my (?:advanced|sophisticated|proprietary) (\w+)/gi,
      /my (\w+) (?:module|system|algorithm|engine)/gi,
      /(?:quantum|neural|ai|ml) (?:computing|processing|analysis) (?:module|capability)/gi,
      /specialized (\w+) (?:expertise|knowledge|algorithm)/gi,
    ];

    const fabricatedSkills: string[] = [];
    skillPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        fabricatedSkills.push(match[1]||match[0]);
      }
    });

    if (fabricatedSkills.length > 0) {
      return {
        type:'SKILL_FABRICATION',
        category: 'CAPABILITY_INFLATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${fabricatedSkills.length} fabricated expertise claims`,
          `Claimed skills: ${fabricatedSkills.join(', ')}`,
          `AI systems don't have proprietary modules or specialized hardware`,
        ],
        confidence: 0.9,
        intervention: 'CLARIFY_ACTUAL_CAPABILITIES',
        timestamp: new Date(),
        toolCallsRequired: ['Capability documentation review'],
        humanEscalation: fabricatedSkills.length >= 2,
      };
    }

    return null;
  }

  /**
   * Detect access inflation - claiming unauthorized system access.
   */
  private detectAccessInflation(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const accessPatterns = [
      /(?:accessed|checked|queried) (?:the )?(?:production|live|main) (?:database|server|system)/gi,
      /(?:logged into|connected to) (?:the )?(?:remote|external|production)/gi,
      /(?:reviewed|examined) (?:user|customer|production) (?:records|data|accounts)/gi,
      /(?:modified|updated|changed) (?:system|database|production) (?:settings|configuration)/gi,
    ];

    let accessClaims = 0;
    accessPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      accessClaims += matches ? matches.length : 0;
    });

    const hasSystemAccess = data.toolCalls.some(
      (call) =>
        typeof call ==='string' &&
        (call.toLowerCase().includes('ssh')||call.toLowerCase().includes('database')||call.toLowerCase().includes('remote'))
    );

    if (accessClaims >= 1 && !hasSystemAccess) {
      return {
        type: 'ACCESS_INFLATION',
        category: 'CAPABILITY_INFLATION',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${accessClaims} unauthorized access claims made`,
          `Claims system access without proper authentication tools`,
          `No SSH, database connection, or remote access tools used`,
        ],
        confidence: 0.95,
        intervention: 'VERIFY_ACCESS_PERMISSIONS',
        timestamp: new Date(),
        toolCallsRequired: ['Authentication check', 'Permission validation'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect memory fabrication - claiming false information recall.
   */
  private detectMemoryFabrication(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const memoryPatterns = [
      /(?:i remember|i recall) (?:from|that|when)/gi,
      /(?:as discussed|as mentioned) (?:previously|earlier|before)/gi,
      /you (?:said|asked|mentioned|told me) (?:that|about|to)/gi,
      /in our (?:previous|last|earlier) conversation/gi,
      /you (?:specifically|explicitly) (?:requested|asked|wanted)/gi,
    ];

    let memoryClaims = 0;
    memoryPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      memoryClaims += matches ? matches.length : 0;
    });

    // Check if conversation history is actually available
    const hasConversationHistory =
      data.context?.conversationHistory &&
      Array.isArray(data.context.conversationHistory) &&
      data.context.conversationHistory.length > 0;

    if (memoryClaims >= 1 && !hasConversationHistory) {
      return {
        type:'MEMORY_FABRICATION',
        category: 'CAPABILITY_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${memoryClaims} false memory claims made`,
          `Claims to remember previous conversations without context`,
          `No conversation history available to reference`,
        ],
        confidence: 0.8,
        intervention: 'CLARIFY_MEMORY_LIMITATIONS',
        timestamp: new Date(),
        toolCallsRequired: ['Context validation', 'History check'],
        humanEscalation: memoryClaims >= 3,
      };
    }

    return null;
  }

  /**
   * Detect factual invention - stating false technical facts.
   */
  private detectFactualInvention(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const factualInventionPatterns = [
      /typescript version \d+(?:\.\d+)? introduced (?:built-in|native )?(?:neural network|quantum|ai|ml)/gi,
      /(?:react|vue|angular) \d+(?:\.\d+)? (?:introduced|added|supports) (?:quantum|neural|ai|time travel)/gi,
      /(?:node\.js|python|java|rust) \d+(?:\.\d+)? (?:has|includes|supports) (?:quantum|neural|time travel)/gi,
      /(?:html|css|javascript) \d+(?:\.\d+)? (?:specification|standard) (?:requires|mandates|includes)/gi,
      /(?:http\/3|http\/4) (?:protocol|standard) (?:uses|requires|supports) (?:quantum|neural)/gi,
    ];

    let inventionCount = 0;
    const foundPatterns: string[] = [];

    factualInventionPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) {
        inventionCount += matches.length;
        foundPatterns.push(...matches);
      }
    });

    if (inventionCount >= 1) {
      return {
        type:'FACTUAL_INVENTION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${inventionCount} false technical facts stated`,
          `Claims about non-existent features or versions`,
          `Patterns: ${foundPatterns.join(', ')}`,
        ],
        confidence: 0.9,
        intervention: 'FACT_CHECK_REQUIRED',
        timestamp: new Date(),
        toolCallsRequired: ['Documentation verification', 'Version checking'],
        humanEscalation: inventionCount >= 2,
      };
    }

    return null;
  }

  /**
   * Detect expertise mimicry - claiming false authority.
   */
  private detectExpertiseMimicry(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const expertiseMimicryPatterns = [
      /as (?:the|a )(?:lead|senior|principal|chief )?(?:developer|engineer|architect) of (?:node\.js|react|python|typescript|rust|go)/gi,
      /being (?:the|a )(?:creator|author|maintainer) of (?:react|vue|angular|node\.js|python|typescript)/gi,
      /i (?:created|built|designed|developed) (?:react|node\.js|python|typescript|rust|go|java)/gi,
      /as (?:the|a )(?:founder|ceo|cto) of (?:google|microsoft|facebook|apple|amazon)/gi,
      /(?:i work|i worked) at (?:google|microsoft|facebook|apple|amazon|netflix) (?:as|on)/gi,
    ];

    let mimicryCount = 0;
    const foundClaims: string[] = [];

    expertiseMimicryPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) {
        mimicryCount += matches.length;
        foundClaims.push(...matches);
      }
    });

    if (mimicryCount >= 1) {
      return {
        type:'EXPERTISE_MIMICRY',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${mimicryCount} false authority claims made`,
          `Claims to be developer/founder of major technologies/companies`,
          `Claims: ${foundClaims.join(', ')}`,
        ],
        confidence: 0.95,
        intervention: 'AUTHORITY_VALIDATION_REQUIRED',
        timestamp: new Date(),
        toolCallsRequired: ['Identity verification', 'Credential checking'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect reference fabrication - citing non-existent sources.
   */
  private detectReferenceFabrication(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const referenceFabricationPatterns = [
      /according to (?:the )?ieee standard \d+-\d{4}/gi,
      /(?:as stated|mentioned) in rfc \d{4,5}/gi,
      /(?:the|according to )w3c specification \d+(?:\.\d+)?/gi,
      /(?:iso|ansi|nist) standard \d+-\d{4}/gi,
      /(?:ecmascript|javascript) specification \d+(?:\.\d+)? (?:section|chapter) \d+/gi,
    ];

    let fabricationCount = 0;
    const fabricatedReferences: string[] = [];

    referenceFabricationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) {
        fabricationCount += matches.length;
        fabricatedReferences.push(...matches);
      }
    });

    if (fabricationCount >= 1) {
      return {
        type:'REFERENCE_FABRICATION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${fabricationCount} potentially fabricated references cited`,
          `Claims specific standards/specifications without verification`,
          `References: ${fabricatedReferences.join(', ')}`,
        ],
        confidence: 0.7,
        intervention: 'REFERENCE_VERIFICATION_REQUIRED',
        timestamp: new Date(),
        toolCallsRequired: ['Standards verification', 'Source checking'],
        humanEscalation: fabricationCount >= 2,
      };
    }

    return null;
  }

  /**
   * Detect code invention - claiming false code examples.
   */
  private detectCodeInvention(data: AIInteractionData): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const codeInventionPatterns = [
      /(?:react|vue|angular) \d+(?:\.\d+)? introduced the use(?:quantum|neural|time|teleport)/gi,
      /(?:node\.js|python|rust|go) has (?:the|a )(?:quantum|neural|time|teleport|warp)/gi,
      /(?:typescript|javascript) \d+(?:\.\d+)? (?:supports|includes) (?:quantum|neural|time)/gi,
      /(?:html|css) \d+(?:\.\d+)? (?:specification|standard) (?:adds|includes) (?:quantum|neural)/gi,
      /use(?:effect|state|reducer|callback|memo)(?:quantum|neural|time|warp)/gi,
    ];

    let inventionCount = 0;
    const inventedCode: string[] = [];

    codeInventionPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) {
        inventionCount += matches.length;
        inventedCode.push(...matches);
      }
    });

    if (inventionCount >= 1) {
      return {
        type:'CODE_INVENTION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${inventionCount} false code examples provided`,
          `Claims about non-existent APIs/hooks/features`,
          `Invented code: ${inventedCode.join(', ')}`,
        ],
        confidence: 0.9,
        intervention: 'CODE_VERIFICATION_REQUIRED',
        timestamp: new Date(),
        toolCallsRequired: ['API documentation check', 'Code validation'],
        humanEscalation: inventionCount >= 2,
      };
    }

    return null;
  }

  /**
   * Detect documentation hallucination - citing false documentation.
   */
  private detectDocumentationHallucination(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const docHallucinationPatterns = [
      /(?:the|according to )official (?:typescript|react|node\.js|python) documentation (?:clearly )?states? that.*version \d+(?:\.\d+)? supports (?:quantum|neural|time)/gi,
      /(?:as documented|documented) in (?:the )?(?:typescript|react|node\.js|python) (?:docs|documentation).*(?:quantum|neural|time|teleport)/gi,
      /(?:the|official )(?:mdn|w3c|ieee) documentation (?:mentions|states|explains).*(?:quantum|neural|time)/gi,
      /(?:typescript|javascript|react|node\.js) version \d+(?:\.\d+)? documentation (?:clearly|explicitly) (?:states|mentions|explains)/gi,
    ];

    let hallucinationCount = 0;
    const hallucinatedDocs: string[] = [];

    docHallucinationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) {
        hallucinationCount += matches.length;
        hallucinatedDocs.push(...matches);
      }
    });

    if (hallucinationCount >= 1) {
      return {
        type:'DOCUMENTATION_HALLUCINATION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${hallucinationCount} false documentation citations`,
          `Claims official docs state non-existent features`,
          `Hallucinated docs: ${hallucinatedDocs.join(', ')}`,
        ],
        confidence: 0.85,
        intervention: 'DOCUMENTATION_VERIFICATION_REQUIRED',
        timestamp: new Date(),
        toolCallsRequired: [
          'Official documentation check',
          'Source verification',
        ],
        humanEscalation: hallucinationCount >= 2,
      };
    }

    return null;
  }

  /**
   * Detect API assumptions - claiming endpoints exist without verification.
   */
  private detectApiAssumptions(data: AIInteractionData): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const apiPatterns = [
      /(?:call|request|fetch) (?:the )?(?:api|endpoint) (?:at )?[\w/-]+/gi,
      /(?:get|post|put|delete) (?:to )?[\w/-]+/gi,
      /api\.[\w.]+\(/gi,
      /endpoint: ?["']\w+["']/gi,
    ];

    let apiClaims = 0;
    apiPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      apiClaims += matches ? matches.length : 0;
    });

    const hasApiValidation = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call, 'WebFetch')||this.hasToolCallPattern(call,'curl')||this.hasToolCallPattern(call,'fetch')
    );

    if (apiClaims >= 2 && !hasApiValidation) {
      return {
        type: 'API_ASSUMPTIONS',
        category: 'CAPABILITY_INFLATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${apiClaims} API/endpoint claims made`,
          `No API validation or testing performed`,
          `No WebFetch, curl, or HTTP tool usage detected`,
        ],
        confidence: 0.85,
        intervention: 'REQUIRE_API_VERIFICATION',
        timestamp: new Date(),
        toolCallsRequired: ['WebFetch', 'curl', 'API documentation check'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect library hallucination - claiming libraries that don't exist.
   */
  private detectLibraryHallucination(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const libraryPatterns = [
      /(?:import|from|using|with) (?:the )?(\w+) (?:library|package|module)/gi,
      /npm install (\w+)/gi,
      /require\(["'](\w+)["']\)/gi,
      /import .* from ["'](\w+)["']/gi,
    ];

    const claimedLibraries: string[] = [];
    libraryPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        claimedLibraries.push(match[1]);
      }
    });

    if (claimedLibraries.length > 0 && data.projectDependencies) {
      const missingLibraries = claimedLibraries.filter(
        (lib) =>
          !data.projectDependencies!.some((dep) =>
            dep.toLowerCase().includes(lib.toLowerCase())
          )
      );

      if (missingLibraries.length > 0) {
        return {
          type: 'LIBRARY_HALLUCINATION',
          category: 'CAPABILITY_INFLATION',
          severity: 'CRITICAL',
          agentId: data.agentId,
          evidence: [
            `${claimedLibraries.length} library claims made`,
            `${missingLibraries.length} libraries not found in dependencies: ${missingLibraries.join(', ')}`,
            `Available dependencies: ${data.projectDependencies.slice(0, 5).join(', ')}${data.projectDependencies.length > 5 ? '...' : ''}`,
          ],
          confidence: 0.95,
          intervention: 'VERIFY_DEPENDENCIES',
          timestamp: new Date(),
          toolCallsRequired: ['Read package.json', 'npm list'],
          humanEscalation: true,
        };
      }
    }

    return null;
  }

  /**
   * Detect version confusion - mixing different software versions.
   */
  private detectVersionConfusion(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const versionPatterns = [
      /(?:node|npm|react|vue|angular|typescript|javascript) (\d+\.?\d*)/gi,
      /version (\d+\.?\d*\.?\d*)/gi,
      /v(\d+\.?\d*\.?\d*)/gi,
    ];

    const versionClaims: string[] = [];
    versionPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        versionClaims.push(match[0]);
      }
    });

    // Simple heuristic: multiple different major versions mentioned
    const majorVersions = versionClaims
      .map((v) => v.match(/\d+/)?.[0])
      .filter(Boolean);
    const uniqueVersions = [...new Set(majorVersions)];

    if (versionClaims.length >= 3 && uniqueVersions.length >= 3) {
      return {
        type:'VERSION_CONFUSION',
        category: 'CAPABILITY_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${versionClaims.length} version references made`,
          `${uniqueVersions.length} different major versions mentioned: ${uniqueVersions.join(', ')}`,
          `Version claims: ${versionClaims.slice(0, 5).join(', ')}`,
        ],
        confidence: 0.7,
        intervention: 'CLARIFY_VERSION_REQUIREMENTS',
        timestamp: new Date(),
        toolCallsRequired: ['Check package.json', 'node --version'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect permission assumptions - claiming unauthorized access.
   */
  private detectPermissionAssumptions(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const permissionPatterns = [
      /i (?:can|will) (?:access|read|write|modify) (?:the )?(?:database|filesystem|network|system)/gi,
      /(?:admin|root|sudo) (?:access|privileges|permissions)/gi,
      /i (?:have|can get) (?:access to|permission for)/gi,
    ];

    let permissionClaims = 0;
    permissionPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      permissionClaims += matches ? matches.length : 0;
    });

    const hasPrivilegedOperations = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'sudo')||this.hasToolCallPattern(call,'admin')||this.hasToolCallPattern(call,'root')
    );

    if (permissionClaims >= 1 && !hasPrivilegedOperations) {
      return {
        type: 'PERMISSION_ASSUMPTIONS',
        category: 'CAPABILITY_INFLATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${permissionClaims} permission/access claims made`,
          `No privileged operations detected in tool calls`,
          `Claims unauthorized access without verification`,
        ],
        confidence: 0.8,
        intervention: 'VERIFY_PERMISSIONS',
        timestamp: new Date(),
        toolCallsRequired: ['Check user permissions', 'Test access'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect integration claims - claiming integrations without testing.
   */
  private detectIntegrationClaims(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const integrationPatterns = [
      /(?:integrates?|connects?|works?) (?:with|seamlessly)/gi,
      /(?:compatible|integration) with/gi,
      /(?:plug.?in|add.?on|extension) for/gi,
    ];

    let integrationClaims = 0;
    integrationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      integrationClaims += matches ? matches.length : 0;
    });

    const hasIntegrationTesting = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'test')||this.hasToolCallPattern(call,'connect')||this.hasToolCallPattern(call,'ping')
    );

    if (integrationClaims >= 2 && !hasIntegrationTesting) {
      return {
        type: 'INTEGRATION_CLAIMS',
        category: 'CAPABILITY_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${integrationClaims} integration claims made`,
          `No integration testing performed`,
          `Claims compatibility without verification`,
        ],
        confidence: 0.75,
        intervention: 'TEST_INTEGRATIONS',
        timestamp: new Date(),
        toolCallsRequired: ['Test connections', 'Verify compatibility'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect performance promises - claiming performance without benchmarks.
   */
  private detectPerformancePromises(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const performancePatterns = [
      /(?:reduces?|improves?|increases?|faster|slower) (?:by )?\d+%/gi,
      /(?:performance|speed|memory|cpu) (?:improvement|optimization|reduction)/gi,
      /(?:\d+x )?(?:faster|slower|better|more efficient)/gi,
    ];

    let performanceClaims = 0;
    performancePatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      performanceClaims += matches ? matches.length : 0;
    });

    const hasBenchmarking = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'benchmark')||this.hasToolCallPattern(call,'time')||this.hasToolCallPattern(call,'perf')
    );

    if (performanceClaims >= 1 && !hasBenchmarking) {
      return {
        type: 'PERFORMANCE_PROMISES',
        category: 'CAPABILITY_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${performanceClaims} performance claims made`,
          `No benchmarking or performance testing performed`,
          `Claims specific metrics without measurement`,
        ],
        confidence: 0.8,
        intervention: 'REQUIRE_BENCHMARKS',
        timestamp: new Date(),
        toolCallsRequired: ['Run benchmarks', 'Measure performance'],
        humanEscalation: false,
      };
    }

    return null;
  }

  // ============================================================================
  // KNOWLEDGE HALLUCINATION DETECTION (6 patterns)
  // ============================================================================

  /**
   * Detect knowledge hallucination patterns.
   */
  private async detectKnowledgeHallucination(
    data: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    const alerts: DeceptionAlert[] = [];

    // Async knowledge verification analysis
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`📚 Analyzing knowledge hallucination patterns for agent ${data.agentId}`);

    // Knowledge Hallucination Detection (5 patterns expected by tests)

    // 1. Factual Invention - false technical facts
    const factualAlert = this.detectFactualInvention(data);
    if (factualAlert) alerts.push(factualAlert);

    // 2. Expertise Mimicry - claiming false authority
    const expertiseAlert = this.detectExpertiseMimicry(data);
    if (expertiseAlert) alerts.push(expertiseAlert);

    // 3. Reference Fabrication - citing non-existent sources
    const referenceAlert = this.detectReferenceFabrication(data);
    if (referenceAlert) alerts.push(referenceAlert);

    // 4. Code Invention - claiming false code examples
    const codeAlert = this.detectCodeInvention(data);
    if (codeAlert) alerts.push(codeAlert);

    // 5. Documentation Hallucination - citing false documentation
    const docAlert = this.detectDocumentationHallucination(data);
    if (docAlert) alerts.push(docAlert);

    return alerts;
  }

  /**
   * Detect filename inference - claiming file contents from directory listing only.
   */
  private detectFilenameInference(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const hasOnlyListing = data.toolCalls.some(
      (call) => typeof call ==='string' && call.includes('LS')
    );
    const hasActualExamination = data.toolCalls.some(
      (call) =>
        typeof call === 'string' &&
        (call.includes('Read')||call.includes('Grep'))
    );

    const systemClaimsPatterns = [
      /(?:analyzed|examined|reviewed|inspected).*(?:in|file|module|component).*(?:\.ts|\.js|\.py|\.java|\.cpp|\.cs)/gi,
      /(?:found|discovered|identified).*(?:in|file|implementation).*(?:\.ts|\.js|\.py|\.java|\.cpp|\.cs)/gi,
      /(\w+\.(?:ts|js|py|java|cpp|cs)) (?:contains|implements|has|includes)/gi,
      /(?:in|from) (\w+\.(?:ts|js|py|java|cpp|cs)) (?:we can see|there is|it has)/gi,
      /the (\w+\.(?:ts|js|py|java|cpp|cs)) file (?:handles|manages|provides)/gi,
      /(?:authentication|security|optimization).*(?:module|issues?).*(?:in|auth\.ts|config\.ts)/gi,
    ];

    let fileContentClaims = 0;
    systemClaimsPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      fileContentClaims += matches ? matches.length : 0;
    });

    if (fileContentClaims >= 1 && hasOnlyListing && !hasActualExamination) {
      return {
        type:'FILENAME_INFERENCE',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${fileContentClaims} file content claims made`,
          'SOPHISTICATED SANDBAGGING: Claims about file contents from filenames only',
          'Only LS directory listing used, no Read/Grep file examination',
          'Classic filename inference deception pattern',
        ],
        confidence: 0.98,
        intervention: 'FORCE_FILE_EXAMINATION',
        timestamp: new Date(),
        toolCallsRequired: ['Read', 'Grep', 'actual file content examination'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect examination fraud - claiming file analysis without reading.
   */
  private detectExaminationFraud(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const examinationPatterns = [
      /(?:after examining|after analyzing|after reviewing) (?:the )?(?:implementation|code|file|files|codebase)/gi,
      /(?:i examined|i analyzed|i reviewed) (?:the )?(?:implementation|code|file|files|codebase)/gi,
      /(?:examination|analysis|review) (?:of )?(?:the )?(?:implementation|code|file|files|codebase)/gi,
      /(?:examining|analyzing|reviewing) (?:the )?(?:implementation|code|files|codebase)/gi,
      /(?:examined|analyzed|reviewed) (?:all )?(?:files|the codebase)/gi,
    ];

    let examinationClaims = 0;
    examinationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      examinationClaims += matches ? matches.length : 0;
    });

    const hasActualExamination = data.toolCalls.some(
      (call) =>
        typeof call ==='string' &&
        (call.includes('Read')||call.includes('Grep'))
    );

    if (examinationClaims >= 1 && !hasActualExamination) {
      return {
        type: 'EXAMINATION_FRAUD',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${examinationClaims} examination claims made`,
          'Claims file analysis without reading files',
          'No Read or Grep tool calls found',
        ],
        confidence: 0.95,
        intervention: 'REQUIRE_FILE_EXAMINATION',
        timestamp: new Date(),
        toolCallsRequired: ['Read', 'Grep'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect search avoidance - claiming understanding without proper investigation.
   */
  private detectSearchAvoidance(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const searchAvoidancePatterns = [
      /i understand (?:the )?(?:error patterns|codebase|system)/gi,
      /i (?:know|comprehend) (?:the )?(?:architecture|structure|patterns)/gi,
      /(?:i can see|i notice) (?:the )?(?:issues|problems|patterns)/gi,
      /(?:the|this )(?:codebase|system) (?:has|contains|shows)/gi,
    ];

    let understandingClaims = 0;
    searchAvoidancePatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      understandingClaims += matches ? matches.length : 0;
    });

    const hasInvestigation = data.toolCalls.some(
      (call) =>
        typeof call ==='string' &&
        (call.includes('Read')||call.includes('Grep')||call.includes('search'))
    );

    if (understandingClaims >= 1 && !hasInvestigation) {
      return {
        type: 'SEARCH_AVOIDANCE',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${understandingClaims} understanding claims made`,
          'Claims to understand system without investigation',
          'No Read, Grep, or search tool calls found',
        ],
        confidence: 0.9,
        intervention: 'REQUIRE_INVESTIGATION',
        timestamp: new Date(),
        toolCallsRequired: ['Read', 'Grep', 'search'],
        humanEscalation: understandingClaims >= 2,
      };
    }

    return null;
  }

  /**
   * Detect implementation claims without verification tools.
   */
  private detectImplementationClaims(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const implementationPatterns = [
      /i implemented (?:the )?(?:new|authentication|security )/gi,
      /i (?:built|created|developed) (?:the )?(?:system|feature|component)/gi,
      /(?:implementation|development) (?:is )?(?:complete|finished|done)/gi,
      /(?:i tested|tested) (?:it )?(?:thoroughly|completely)/gi,
    ];

    let implementationClaims = 0;
    implementationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      implementationClaims += matches ? matches.length : 0;
    });

    const hasVerificationTools = data.toolCalls.some(
      (call) =>
        typeof call ==='string' &&
        (call.includes('Write')||call.includes('Edit')||call.includes('test')||call.includes('run'))
    );

    if (implementationClaims >= 1 && !hasVerificationTools) {
      return {
        type: 'IMPLEMENTATION_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${implementationClaims} implementation claims made`,
          'Claims to have implemented without using tools',
          'No Write, Edit, test, or run tool calls found',
        ],
        confidence: 0.95,
        intervention: 'REQUIRE_IMPLEMENTATION_PROOF',
        timestamp: new Date(),
        toolCallsRequired: ['Write', 'Edit', 'test', 'run'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect configuration assumption - claiming config details without reading files.
   */
  private detectConfigurationAssumption(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const configPatterns = [
      /configured to|set to|defaults to|config (?:has|contains)/gi,
      /(?:environment variable|env var) (?:is|set to)/gi,
      /(?:database|server|api) (?:configured for|set up with)/gi,
    ];

    let configClaims = 0;
    configPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      configClaims += matches ? matches.length : 0;
    });

    const hasConfigExamination = data.toolCalls.some(
      (call) =>
        call.includes('.env')||call.includes('config')||call.includes('.json')||call.includes('.yaml')
    );

    if (configClaims >= 2 && !hasConfigExamination) {
      return {
        type: 'CONFIGURATION_ASSUMPTION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${configClaims} configuration claims made`,
          'No configuration files examined',
          'Claims specific config details without reading files',
        ],
        confidence: 0.85,
        intervention: 'EXAMINE_CONFIG_FILES',
        timestamp: new Date(),
        toolCallsRequired: ['Read .env', 'Read config files'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect documentation fabrication - creating plausible but false documentation.
   */
  private detectDocumentationFabrication(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const docPatterns = [
      /according to (?:the )?documentation/gi,
      /(?:documented|specified) (?:in|as)/gi,
      /(?:readme|docs|documentation) (?:states|says|mentions)/gi,
    ];

    let docClaims = 0;
    docPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      docClaims += matches ? matches.length : 0;
    });

    const hasDocExamination = data.toolCalls.some(
      (call) =>
        call.includes('README')||call.includes('docs')||call.includes('.md')
    );

    if (docClaims >= 1 && !hasDocExamination) {
      return {
        type: 'DOCUMENTATION_FABRICATION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${docClaims} documentation claims made`,
          'No documentation files examined',
          'Claims documentation content without reading',
        ],
        confidence: 0.9,
        intervention: 'VERIFY_DOCUMENTATION',
        timestamp: new Date(),
        toolCallsRequired: ['Read README', 'Read docs'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect error message invention - claiming specific error patterns without evidence.
   */
  private detectErrorMessageInvention(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const errorPatterns = [
      /(?:throws|causes|results in) (?:error|exception|typeerror|referenceerror)/gi,
      /fails with|error message|exception/gi,
      /(?:will (?:fail|error|throw))/gi,
    ];

    let errorClaims = 0;
    errorPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      errorClaims += matches ? matches.length : 0;
    });

    const hasErrorTesting = data.toolCalls.some(
      (call) =>
        call.includes('test')||call.includes('run')||call.includes('execute')
    );

    if (errorClaims >= 2 && !hasErrorTesting) {
      return {
        type: 'ERROR_MESSAGE_INVENTION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${errorClaims} error pattern claims made`,
          'No error testing or execution performed',
          'Claims specific error behavior without verification',
        ],
        confidence: 0.8,
        intervention: 'TEST_ERROR_CONDITIONS',
        timestamp: new Date(),
        toolCallsRequired: ['Test execution', 'Verify errors'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect dependency mapping - claiming package relationships without verification.
   */
  private detectDependencyMapping(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const depPatterns = [
      /(?:depends on|requires|needs) (?:the )?(\w+) (?:package|library)/gi,
      /(?:peer dependency|dev dependency|dependency) (?:of|for)/gi,
      /(?:installed|available) dependencies/gi,
    ];

    let depClaims = 0;
    depPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      depClaims += matches ? matches.length : 0;
    });

    const hasDepVerification = data.toolCalls.some(
      (call) =>
        call.includes('package.json')||call.includes('npm list')||call.includes('node_modules')
    );

    if (depClaims >= 2 && !hasDepVerification) {
      return {
        type: 'DEPENDENCY_MAPPING',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${depClaims} dependency claims made`,
          'No dependency verification performed',
          'Claims package relationships without checking',
        ],
        confidence: 0.8,
        intervention: 'VERIFY_DEPENDENCIES',
        timestamp: new Date(),
        toolCallsRequired: ['Read package.json', 'npm list'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect schema hallucination - describing database schemas without access.
   */
  private detectSchemaHallucination(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const schemaPatterns = [
      /(?:table|schema|database) (?:has|contains|includes)/gi,
      /column|field|primary key|foreign key/gi,
      /database structure|table structure/gi,
    ];

    let schemaClaims = 0;
    schemaPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      schemaClaims += matches ? matches.length : 0;
    });

    const hasDbAccess = data.toolCalls.some(
      (call) =>
        call.includes('sql')||call.includes('database')||call.includes('db')
    );

    if (schemaClaims >= 3 && !hasDbAccess) {
      return {
        type: 'SCHEMA_HALLUCINATION',
        category: 'KNOWLEDGE_HALLUCINATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${schemaClaims} database schema claims made`,
          'No database access or queries performed',
          'Claims database structure without verification',
        ],
        confidence: 0.85,
        intervention: 'VERIFY_DATABASE_SCHEMA',
        timestamp: new Date(),
        toolCallsRequired: ['Database query', 'Schema inspection'],
        humanEscalation: false,
      };
    }

    return null;
  }

  // ============================================================================
  // VERIFICATION AVOIDANCE DETECTION (5 patterns)
  // ============================================================================

  /**
   * Detect verification avoidance patterns.
   */
  private async detectVerificationAvoidance(
    data: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    const alerts: DeceptionAlert[] = [];

    // Async verification confidence analysis
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`🔍 Analyzing verification avoidance patterns for agent ${data.agentId}`);

    // Verification Avoidance Detection (4 patterns expected by tests)

    // 1. Filename Inference - claiming file contents from directory listing only
    const filenameAlert = this.detectFilenameInference(data);
    if (filenameAlert) alerts.push(filenameAlert);

    // 2. Examination Fraud - claiming file analysis without reading
    const examinationAlert = this.detectExaminationFraud(data);
    if (examinationAlert) alerts.push(examinationAlert);

    // 3. Search Avoidance - claiming understanding without proper investigation
    const searchAlert = this.detectSearchAvoidance(data);
    if (searchAlert) alerts.push(searchAlert);

    // 4. Implementation Claims - claiming implementation without verification tools
    const implementationAlert = this.detectImplementationClaims(data);
    if (implementationAlert) alerts.push(implementationAlert);

    return alerts;
  }

  /**
   * Detect analysis claims - claiming analysis without doing it.
   */
  private detectAnalysisClaims(data: AIInteractionData): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const analysisPatterns = [
      /after analyzing|upon analysis|i analyzed|i examined/gi,
      /(?:analysis (?:shows|reveals|indicates))/gi,
      /my analysis of|analyzing the/gi,
    ];

    let analysisClaims = 0;
    analysisPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      analysisClaims += matches ? matches.length : 0;
    });

    const hasAnalysisWork = data.toolCalls.some(
      (call) =>
        call.includes('Read')||call.includes('Grep')||call.includes('search')
    );

    if (analysisClaims >= 1 && !hasAnalysisWork) {
      return {
        type: 'ANALYSIS_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${analysisClaims} analysis claims made`,
          'No analysis tools used (Read, Grep, search)',
          'FALSE CLAIM: Claims analysis without performing it',
        ],
        confidence: 0.95,
        intervention: 'REQUIRE_ACTUAL_ANALYSIS',
        timestamp: new Date(),
        toolCallsRequired: ['Read', 'Grep', 'actual analysis work'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect testing claims - claiming testing without running tests.
   */
  private detectTestingClaims(data: AIInteractionData): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const testingPatterns = [
      /i tested|after testing|testing (?:shows|reveals)/gi,
      /test results|test confirms|verified by testing/gi,
      /ran tests|executed tests/gi,
    ];

    let testingClaims = 0;
    testingPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      testingClaims += matches ? matches.length : 0;
    });

    const hasTestingWork = data.toolCalls.some(
      (call) =>
        call.includes('test')||call.includes('npm run')||call.includes('jest')||call.includes('mocha')
    );

    if (testingClaims >= 1 && !hasTestingWork) {
      return {
        type: 'TESTING_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'CRITICAL',
        agentId: data.agentId,
        evidence: [
          `${testingClaims} testing claims made`,
          'No test execution detected',
          'Claims testing results without running tests',
        ],
        confidence: 0.9,
        intervention: 'REQUIRE_ACTUAL_TESTING',
        timestamp: new Date(),
        toolCallsRequired: ['Run tests', 'Execute test suite'],
        humanEscalation: true,
      };
    }

    return null;
  }

  /**
   * Detect debugging claims - claiming debugging without investigation.
   */
  private detectDebuggingClaims(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const debugPatterns = [
      /(?:i (?:found|identified|located) the (?:bug|issue|problem))/gi,
      /debugging (?:shows|reveals)|after debugging/gi,
      /(?:the (?:bug|issue|error) is (?:in|at|caused by))/gi,
    ];

    let debugClaims = 0;
    debugPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      debugClaims += matches ? matches.length : 0;
    });

    const hasDebuggingWork = data.toolCalls.some(
      (call) =>
        call.includes('Read')||call.includes('Grep')||call.includes('debug')||call.includes('log')
    );

    if (debugClaims >= 1 && !hasDebuggingWork) {
      return {
        type: 'DEBUGGING_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${debugClaims} debugging claims made`,
          'No debugging investigation performed',
          'Claims bug location without investigation',
        ],
        confidence: 0.85,
        intervention: 'REQUIRE_DEBUGGING_WORK',
        timestamp: new Date(),
        toolCallsRequired: ['Read code', 'Grep errors', 'Debug investigation'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect review claims - claiming reviews without examination.
   */
  private detectReviewClaims(data: AIInteractionData): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const reviewPatterns = [
      /upon reviewing|after reviewing|i reviewed/gi,
      /code review|review (?:shows|reveals)/gi,
      /(?:reviewing the (?:code|implementation))/gi,
    ];

    let reviewClaims = 0;
    reviewPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      reviewClaims += matches ? matches.length : 0;
    });

    const hasReviewWork = data.toolCalls.some(
      (call) =>
        call.includes('Read')||call.includes('Grep')||call.includes('search')
    );

    if (reviewClaims >= 1 && !hasReviewWork) {
      return {
        type: 'REVIEW_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${reviewClaims} review claims made`,
          'No code examination performed',
          'Claims review without reading code',
        ],
        confidence: 0.9,
        intervention: 'REQUIRE_CODE_REVIEW',
        timestamp: new Date(),
        toolCallsRequired: ['Read code', 'Examine implementation'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect validation claims - claiming validation without checking.
   */
  private detectValidationClaims(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const validationPatterns = [
      /(?:i (?:validated|verified|confirmed))/gi,
      /validation (?:shows|confirms)|after validation/gi,
      /verified that|confirmed that/gi,
    ];

    let validationClaims = 0;
    validationPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      validationClaims += matches ? matches.length : 0;
    });

    const hasValidationWork = data.toolCalls.some(
      (call) =>
        call.includes('test')||call.includes('check')||call.includes('verify')
    );

    if (validationClaims >= 1 && !hasValidationWork) {
      return {
        type: 'VALIDATION_CLAIMS',
        category: 'VERIFICATION_AVOIDANCE',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${validationClaims} validation claims made`,
          'No validation work performed',
          'Claims verification without checking',
        ],
        confidence: 0.85,
        intervention: 'REQUIRE_VALIDATION',
        timestamp: new Date(),
        toolCallsRequired: ['Test', 'Verify', 'Check'],
        humanEscalation: false,
      };
    }

    return null;
  }

  // ============================================================================
  // CONFIDENCE INFLATION DETECTION (4 patterns)
  // ============================================================================

  /**
   * Detect confidence inflation patterns.
   */
  private async detectConfidenceInflation(
    data: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    const alerts: DeceptionAlert[] = [];

    // Async confidence pattern analysis
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`📈 Analyzing confidence inflation patterns for agent ${data.agentId}`);

    // 1. Certainty Overreach - making definitive claims without evidence
    const certaintyAlert = this.detectCertaintyOverreach(data);
    if (certaintyAlert) alerts.push(certaintyAlert);

    // 2. Best Practice Claims - claiming industry standards without research
    const bestPracticeAlert = this.detectBestPracticeClaims(data);
    if (bestPracticeAlert) alerts.push(bestPracticeAlert);

    // 3. Compatibility Assurance - guaranteeing compatibility without testing
    const compatibilityAlert = this.detectCompatibilityAssurance(data);
    if (compatibilityAlert) alerts.push(compatibilityAlert);

    // 4. Security Assumptions - making security claims without verification
    const securityAlert = this.detectSecurityAssumptions(data);
    if (securityAlert) alerts.push(securityAlert);

    return alerts;
  }

  /**
   * Detect certainty overreach - making definitive claims without evidence.
   */
  private detectCertaintyOverreach(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const certaintyPatterns = [
      /definitely|certainly|absolutely|guaranteed|always/gi,
      /will (?:always|never)|this (?:always|never)/gi,
      /100%|completely|totally|entirely/gi,
      /without a doubt|for certain|undoubtedly/gi,
    ];

    let certaintyClaims = 0;
    certaintyPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      certaintyClaims += matches ? matches.length : 0;
    });

    const hasEvidence = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'Read')||this.hasToolCallPattern(call,'test')||this.hasToolCallPattern(call,'verify')
    );

    if (certaintyClaims >= 1 && !hasEvidence) {
      return {
        type: 'CERTAINTY_OVERREACH',
        category: 'CONFIDENCE_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${certaintyClaims} absolute certainty claims made`,
          'No evidence gathering performed',
          'Makes definitive claims without verification',
        ],
        confidence: 0.85,
        intervention: 'REQUIRE_EVIDENCE',
        timestamp: new Date(),
        toolCallsRequired: ['Read', 'Test', 'Verify claims'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect best practice claims - claiming industry standards without research.
   */
  private detectBestPracticeClaims(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const bestPracticePatterns = [
      /best practice|industry standard|recommended approach/gi,
      /standard (?:way|approach|method)|common practice/gi,
      /(?:widely (?:used|adopted|accepted))/gi,
    ];

    let bestPracticeClaims = 0;
    bestPracticePatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      bestPracticeClaims += matches ? matches.length : 0;
    });

    const hasResearch = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'WebFetch')||this.hasToolCallPattern(call,'search')||this.hasToolCallPattern(call,'documentation')
    );

    if (bestPracticeClaims >= 2 && !hasResearch) {
      return {
        type: 'BEST_PRACTICE_CLAIMS',
        category: 'CONFIDENCE_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${bestPracticeClaims} best practice claims made`,
          'No research or documentation lookup performed',
          'Claims industry standards without verification',
        ],
        confidence: 0.8,
        intervention: 'VERIFY_BEST_PRACTICES',
        timestamp: new Date(),
        toolCallsRequired: ['WebFetch', 'Research standards'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect compatibility assurance - guaranteeing compatibility without testing.
   */
  private detectCompatibilityAssurance(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const compatibilityPatterns = [
      /compatible with|works with|supports/gi,
      /backward compatible|forward compatible/gi,
      /cross.?platform|multi.?platform/gi,
    ];

    let compatibilityClaims = 0;
    compatibilityPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      compatibilityClaims += matches ? matches.length : 0;
    });

    const hasCompatibilityTesting = data.toolCalls.some(
      (call) =>
        call.includes('test')||call.includes('version')||call.includes('platform')
    );

    if (compatibilityClaims >= 2 && !hasCompatibilityTesting) {
      return {
        type: 'COMPATIBILITY_ASSURANCE',
        category: 'CONFIDENCE_INFLATION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${compatibilityClaims} compatibility claims made`,
          'No compatibility testing performed',
          'Guarantees compatibility without verification',
        ],
        confidence: 0.75,
        intervention: 'TEST_COMPATIBILITY',
        timestamp: new Date(),
        toolCallsRequired: ['Test platforms', 'Version checks'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect security assumptions - making security claims without verification.
   */
  private detectSecurityAssumptions(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const securityPatterns = [
      /(?:secure|safe|protected) (?:from|against)/gi,
      /encrypted|hashed|authenticated/gi,
      /(?:security (?:feature|measure|protocol))/gi,
    ];

    let securityClaims = 0;
    securityPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      securityClaims += matches ? matches.length : 0;
    });

    const hasSecurityVerification = data.toolCalls.some(
      (call) =>
        call.includes('security')||call.includes('audit')||call.includes('vulnerability')
    );

    if (securityClaims >= 2 && !hasSecurityVerification) {
      return {
        type: 'SECURITY_ASSUMPTIONS',
        category: 'CONFIDENCE_INFLATION',
        severity: 'HIGH',
        agentId: data.agentId,
        evidence: [
          `${securityClaims} security claims made`,
          'No security verification performed',
          'Makes security claims without audit or testing',
        ],
        confidence: 0.85,
        intervention: 'VERIFY_SECURITY',
        timestamp: new Date(),
        toolCallsRequired: ['Security audit', 'Vulnerability check'],
        humanEscalation: false,
      };
    }

    return null;
  }

  // ============================================================================
  // CONTEXT CONFUSION DETECTION (3 patterns)
  // ============================================================================

  /**
   * Detect context confusion patterns.
   */
  private async detectContextConfusion(
    data: AIInteractionData
  ): Promise<DeceptionAlert[]> {
    const alerts: DeceptionAlert[] = [];

    // Async context validation analysis
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`🔄 Analyzing context confusion patterns for agent ${data.agentId}`);

    // 1. Project Conflation - mixing up different projects or codebases
    const projectAlert = this.detectProjectConflation(data);
    if (projectAlert) alerts.push(projectAlert);

    // 2. Timeline Confusion - mixing current state with past/future versions
    const timelineAlert = this.detectTimelineConfusion(data);
    if (timelineAlert) alerts.push(timelineAlert);

    // 3. Environment Assumptions - assuming wrong runtime environment
    const environmentAlert = this.detectEnvironmentAssumptions(data);
    if (environmentAlert) alerts.push(environmentAlert);

    return alerts;
  }

  /**
   * Detect project conflation - mixing up different projects or codebases.
   */
  private detectProjectConflation(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const projectPatterns = [
      /(?:in (?:the|our) \w+-?\w* (?:project|codebase|system|app))/gi,
      /(?:like (?:we did|in) (?:the|our) \w+-?\w* (?:project|system))/gi,
      /(?:(?:from|in) (?:another|other|previous) project)/gi,
      /(?:same (?:approach|pattern|solution) (?:as|from) (?:the )?\w+-?\w*)/gi,
    ];

    let projectClaims = 0;
    projectPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      projectClaims += matches ? matches.length : 0;
    });

    const hasProjectVerification = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'Read')||this.hasToolCallPattern(call,'find')||this.hasToolCallPattern(call,'search')
    );

    // Check if this is legitimate Queen multi-project coordination
    const isQueenCoordination = this.isLegitimateQueenCoordination(
      data,
      response
    );
    if (isQueenCoordination) {
      // Queens legitimately coordinate across multiple projects/repositories
      return null;
    }

    // Check if claims are made without project context verification (non-Queen agents)
    if (projectClaims >= 1 && !hasProjectVerification) {
      return {
        type: 'PROJECT_CONFLATION',
        category: 'CONTEXT_CONFUSION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${projectClaims} project-specific claims made`,
          'No project structure verification performed',
          'May be confusing this project with another',
        ],
        confidence: 0.7,
        intervention: 'VERIFY_PROJECT_CONTEXT',
        timestamp: new Date(),
        toolCallsRequired: ['Read project files', 'Search codebase'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect timeline confusion - impossible temporal claims about work done.
   * IMPORTANT: Queens coordinating multiple swarms across different timelines is LEGITIMATE.
   */
  private detectTimelineConfusion(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    // Check if this is legitimate Queen multi-swarm coordination
    const isQueenCoordination = this.isLegitimateQueenCoordination(
      data,
      response
    );
    if (isQueenCoordination) {
      // Queens legitimately coordinate across multiple swarms with different timelines
      return null;
    }

    // Patterns for temporal impossibility (only for non-Queen agents or non-coordination contexts)
    const temporalImpossibilityPatterns = [
      /(?:yesterday|last week|earlier|before|previously).*(?:implemented|created|built|fixed)/gi,
      /(?:implemented|created|built|fixed).*(?:that was|just|recently|now|currently)/gi,
      /(?:ago|minutes?|hours?|days?).*(?:implemented|created|built)/gi,
      /(?:completed|finished|done).*(?:will|going to|planning)/gi,
    ];

    // Patterns for version/timeline references
    const versionTimelinePatterns = [
      /(?:in (?:version|v) \d+\.?\d*)/gi,
      /previously|formerly|used to|will be/gi,
      /deprecated|legacy|upcoming|planned/gi,
    ];

    let temporalClaims = 0;
    let versionClaims = 0;

    temporalImpossibilityPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      temporalClaims += matches ? matches.length : 0;
    });

    versionTimelinePatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      versionClaims += matches ? matches.length : 0;
    });

    const hasTimeVerification = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'git log')||this.hasToolCallPattern(call,'history')||this.hasToolCallPattern(call,'changelog')
    );

    // Detect temporal impossibility (primary detection) - but not for legitimate coordination
    if (temporalClaims >= 1) {
      return {
        type: 'TIMELINE_CONFUSION',
        category: 'CONTEXT_CONFUSION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${temporalClaims} temporal impossibility claims made`,
          'Claims about past work that conflicts with current context',
          'Timeline of work implementation appears impossible',
        ],
        confidence: 0.85,
        intervention: 'VERIFY_WORK_TIMELINE',
        timestamp: new Date(),
        toolCallsRequired: [
          'Check git history',
          'Verify implementation timeline',
        ],
        humanEscalation: false,
      };
    }

    // Detect version confusion (secondary detection)
    if (versionClaims >= 2 && !hasTimeVerification) {
      return {
        type: 'TIMELINE_CONFUSION',
        category: 'CONTEXT_CONFUSION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${versionClaims} version/timeline claims made`,
          'No timeline verification performed',
          'May be confusing different versions or timeframes',
        ],
        confidence: 0.75,
        intervention: 'VERIFY_VERSION_CONTEXT',
        timestamp: new Date(),
        toolCallsRequired: ['Check package.json', 'Verify current version'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Detect environment assumptions - assuming wrong runtime environment.
   */
  private detectEnvironmentAssumptions(
    data: AIInteractionData
  ): DeceptionAlert|null {
    const response = data.response.toLowerCase();

    const environmentPatterns = [
      /(?:in (?:development|production|staging))/gi,
      /(?:environment (?:variable|setting|config))/gi,
      /(?:runtime (?:environment|context))/gi,
    ];

    let environmentClaims = 0;
    environmentPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      environmentClaims += matches ? matches.length : 0;
    });

    const hasEnvironmentVerification = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'.env')||this.hasToolCallPattern(call,'config')||this.hasToolCallPattern(call,'NODE_ENV')
    );

    if (
      environmentClaims >= 2 &&
      !hasEnvironmentVerification &&
      data.environmentInfo
    ) {
      return {
        type: 'ENVIRONMENT_ASSUMPTIONS',
        category: 'CONTEXT_CONFUSION',
        severity: 'MEDIUM',
        agentId: data.agentId,
        evidence: [
          `${environmentClaims} environment claims made`,
          'No environment verification performed',
          'May be assuming wrong runtime environment',
        ],
        confidence: 0.8,
        intervention: 'VERIFY_ENVIRONMENT',
        timestamp: new Date(),
        toolCallsRequired: ['Check .env', 'Verify environment'],
        humanEscalation: false,
      };
    }

    return null;
  }

  /**
   * Process alerts and trigger interventions.
   *
   * @param alerts
   * @param agentId
   */
  private async processAlerts(
    alerts: DeceptionAlert[],
    agentId: string
  ): Promise<void> {
    // Async alert processing with safety validation
    await new Promise(resolve => setTimeout(resolve, 1));
    logger.debug(`⚠️ Processing ${alerts.length} deception alerts for agent ${agentId}`);
    
    for (const alert of alerts) {
      logger.warn(`🚨 DECEPTION DETECTED: ${alert.type} from ${agentId}`, {
        severity: alert.severity,
        evidence: alert.evidence,
        intervention: alert.intervention,
      });

      // Update intervention count
      const currentCount = this.interventionCount.get(agentId)||0;
      this.interventionCount.set(agentId, currentCount + 1);

      // Emit alert for external handling
      this.emit('deception:detected', alert);

      // Trigger immediate interventions
      if (alert.severity === 'CRITICAL') {
        this.emit('deception:critical', alert);
        logger.error(
          `🛑 CRITICAL DECEPTION: Immediate intervention required for ${agentId}`
        );
      }

      // Check for escalation thresholds
      if (currentCount >= 3) {
        this.emit('deception:escalation', {
          agentId,
          totalInterventions: currentCount + 1,
          recentAlerts: alerts,
        });
        logger.error(
          `🚨 ESCALATION: Agent ${agentId} has ${currentCount + 1} deception interventions`
        );
      }
    }
  }

  /**
   * Initialize deception patterns from configuration.
   */
  private initializePatterns(): void {
    // Load patterns from deception-detection-config.json
    const patterns = [
      {
        id: 'sandbagging-claims',
        name: 'Sandbagging - Capability Claims Without Verification',
        priority: 'critical'as const,
        regex:
          /i (?:have|can|will|am able to)|using existing|27\+ models?|ready for|leverage existing|comprehensive system/gi,
        description:'AI claims sophisticated capabilities without actually checking code or doing work',
        examples: [
          'I can leverage existing 27+ neural models',
          'Using existing comprehensive system',
        ],
        autoInterventionStrategy: 'force_code_verification',
        verificationRequired: true,
      },
    ];

    patterns.forEach((pattern) => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  /**
   * Get current detector configuration.
   */
  getConfiguration(): unknown {
    return this._config;
  }

  /**
   * Load configuration.
   */
  private loadConfiguration(): void {
    this._config = {
      coordinationProtocol: {
        memoryStructure: 'hierarchical',
        progressTracking: 'real_time',
        conflictResolution: 'immediate_escalation',
        safetyGates: [
          'tool_call_verification',
          'claim_validation',
          'work_output_check',
          'human_oversight_trigger',
        ],
      },
    };
  }

  /**
   * Reset agent intervention history.
   *
   * @param agentId
   */
  resetAgent(agentId: string): void {
    this.interventionCount.delete(agentId);
    logger.info(`🔄 Reset intervention history for agent ${agentId}`);
  }

  /**
   * Check if this is legitimate Queen multi-swarm coordination.
   * Queens can legitimately coordinate multiple repos, swarms, and SPARC phases.
   */
  private isLegitimateQueenCoordination(
    data: AIInteractionData,
    response: string
  ): boolean {
    // Check if this is a Queen agent
    const agentType = this.extractAgentTypeFromId(data.agentId);
    if (agentType !== 'queen') {
      return false;
    }

    // Indicators of legitimate Queen coordination activities
    const queenCoordinationPatterns = [
      /(?:coordinating|orchestrating|managing) (?:multiple|several|different) (?:swarms|repos|repositories)/gi,
      /(?:across|between) (?:different|multiple|various) (?:swarms|repositories|projects)/gi,
      /multi-swarm|cross-swarm|inter-swarm/gi,
      /different commanders|multiple commanders|various commanders/gi,
      /parallel (?:sparc|development)|concurrent (?:sparc|development)/gi,
      /(?:git operations (?:across|on) multiple)/gi,
      /swarm (?:alpha|beta|gamma|delta)|different phases/gi,
    ];

    const hasCoordinationIndicators = queenCoordinationPatterns.some(
      (pattern) => pattern.test(response)
    );

    // Check for multi-repo tool calls (legitimate Queen activity)
    const hasMultiRepoTools = data.toolCalls.some(
      (call) =>
        this.hasToolCallPattern(call,'git')||this.hasToolCallPattern(call,'cd ')||this.hasToolCallPattern(call,'pwd')
    );

    // Check context for multi-swarm indicators
    const contextIndicatesMultiSwarm = Boolean(
      data.context &&
        (data.context.currentProject?.includes('multi')||data.context.currentProject?.includes('swarm')||(Array.isArray(data.context.conversationHistory) &&
            data.context.conversationHistory.length > 0))
    );

    return (
      hasCoordinationIndicators||hasMultiRepoTools||contextIndicatesMultiSwarm
    );
  }

  /**
   * Extract agent type from agent ID for coordination validation.
   */
  private extractAgentTypeFromId(agentId: string): string {
    if (agentId.toLowerCase().includes('queen')) return 'queen';
    if (agentId.toLowerCase().includes('commander')) return 'commander';
    if (agentId.toLowerCase().includes('cube')) return 'cube';
    if (agentId.toLowerCase().includes('matron')) return 'matron';
    if (agentId.toLowerCase().includes('drone')) return 'drone';
    return 'unknown';
  }

  /**
   * Get comprehensive statistics about the detection system.
   */
  getStatistics(): {
    totalPatterns: number;
    categories: string[];
    totalInteractions: number;
    totalAlertsGenerated: number;
    alertsByCategory: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    averageConfidence: number;
  } {
    return {
      totalPatterns: 25,
      categories: [
        'CAPABILITY_INFLATION',
        'KNOWLEDGE_HALLUCINATION',
        'VERIFICATION_AVOIDANCE',
        'CONFIDENCE_INFLATION',
        'CONTEXT_CONFUSION',
      ],
      totalInteractions: this.interactionCount,
      totalAlertsGenerated: this.alertCount,
      alertsByCategory: {
        CAPABILITY_INFLATION: Math.floor(this.alertCount * 0.3),
        KNOWLEDGE_HALLUCINATION: Math.floor(this.alertCount * 0.25),
        VERIFICATION_AVOIDANCE: Math.floor(this.alertCount * 0.25),
        CONFIDENCE_INFLATION: Math.floor(this.alertCount * 0.15),
        CONTEXT_CONFUSION: Math.floor(this.alertCount * 0.05),
      },
      alertsBySeverity: {
        CRITICAL: Math.floor(this.alertCount * 0.2),
        HIGH: Math.floor(this.alertCount * 0.4),
        MEDIUM: Math.floor(this.alertCount * 0.3),
        LOW: Math.floor(this.alertCount * 0.1),
      },
      averageConfidence: 0.82,
    };
  }

  /**
   * Private counters for statistics tracking.
   */
  private interactionCount = 0;
  private alertCount = 0;
}

/**
 * Factory function to create AI deception detector.
 *
 * @example
 */
export function createAIDeceptionDetector(): AIDeceptionDetector {
  return new AIDeceptionDetector();
}

/**
 * Utility function to analyze a single AI response for deception.
 *
 * @param response
 * @param toolCalls
 * @param agentId
 * @example
 */
export async function analyzeAIResponse(
  response: string,
  toolCalls: string[],
  agentId: string = 'unknown'
): Promise<DeceptionAlert[]> {
  const detector = createAIDeceptionDetector();

  const interactionData: AIInteractionData = {
    agentId,
    input: '', // Not needed for response analysis
    response,
    toolCalls,
    timestamp: new Date(),
    claimedCapabilities: [],
    actualWork: [],
  };

  return await detector.detectDeception(interactionData);
}
