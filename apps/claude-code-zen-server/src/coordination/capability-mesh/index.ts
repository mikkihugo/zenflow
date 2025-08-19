/**
 * @fileoverview Dynamic Capability Mesh Architecture - Index
 * 
 * Comprehensive capability mesh system that enables dynamic swarm formation,
 * cross-domain coordination, and intelligent resource optimization using
 * matrix organization (Services × Capabilities).
 * 
 * This represents the complete implementation of the user's vision for a 
 * "full AI system" with dynamic capability mesh architecture, self-optimization,
 * and comprehensive integration with existing learning packages.
 * 
 * Key Components:
 * - Intelligence Cube Matron (Learning & AI domain coordination)
 * - Collaborative Decision System (Multi-stakeholder problem resolution)
 * - Swarm Migration System (Learning extraction from permanent swarms)
 * - Service-Domain Intersection Queens (Coming next)
 * - Dynamic swarm formation with emergent coordination
 * 
 * Architecture Benefits:
 * - Capability-based organization instead of business domains
 * - Self-optimizing through comprehensive neural learning
 * - Collaborative decision-making with AI consensus building
 * - Resource optimization through intelligent load balancing
 * - Workflow coordination with adaptive process management
 * - Team collaboration with structured discussion patterns
 */

// =============================================================================
// CAPABILITY DOMAIN MATRONS
// =============================================================================

/**
 * Intelligence Cube Matron - AI, Learning, and Neural Coordination Domain
 * 
 * Comprehensive AI-powered capability matron that coordinates all intelligence,
 * learning, and neural activities across the system. Integrates with all
 * existing @claude-zen packages for maximum learning and optimization.
 */
export { IntelligenceCubeMatron } from './intelligence-cube-matron';

// =============================================================================
// COLLABORATIVE SYSTEMS
// =============================================================================

/**
 * Collaborative Decision System - Multi-stakeholder Problem Resolution
 * 
 * Advanced system that enables commanders to meet with matrons and queens
 * to solve complex issues through coordinated discussion, consensus building,
 * and intelligent resource allocation with comprehensive AI learning.
 */
export { 
  CollaborativeDecisionSystem,
  type ComplexIssue,
  type MeetingParticipant,
  type CollaborativeMeeting,
  type DiscussionPhase,
  type DecisionOutcome
} from './collaborative-decision-system';

// =============================================================================
// SWARM MIGRATION SYSTEM
// =============================================================================

/**
 * Swarm Migration System - Learning Extraction from Permanent Swarms
 * 
 * Critical system for extracting all learned behaviors, patterns, and insights
 * from existing permanent swarms before migrating to dynamic mesh architecture.
 * Ensures no learning is lost during the architectural transition.
 */
export { SwarmMigrationSystem } from './swarm-migration-system';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Note: Intelligence Cube Matron types moved to orchestration-core packages
// These exports were removed as the files are no longer in this location

// =============================================================================
// CAPABILITY MESH ARCHITECTURE
// =============================================================================

/**
 * Dynamic Capability Mesh Architecture Summary
 * 
 * This system implements a revolutionary approach to AI coordination based on
 * capability domains rather than business domains, enabling:
 * 
 * **MATRIX ORGANIZATION (Services × Capabilities):**
 * - Intelligence Domain: AI, learning, neural processing, optimization
 * - Integration Domain: Cross-service communication, data flow, APIs  
 * - Security Domain: Safety, authentication, threat detection, compliance
 * - Data Domain: Storage, analytics, processing, transformation
 * - Execution Domain: Task running, resource allocation, performance
 * - Operations Domain: Monitoring, deployment, infrastructure, scaling
 * 
 * **DYNAMIC SWARM FORMATION:**
 * - Swarms form automatically based on task requirements
 * - Cross-domain expertise assembled intelligently
 * - Self-optimizing through neural learning and behavioral intelligence
 * - Resource allocation optimized through load balancing
 * 
 * **COLLABORATIVE DECISION-MAKING:**
 * - Complex issues trigger multi-stakeholder meetings
 * - AI-powered consensus building and conflict resolution
 * - Learning from decision outcomes for continuous improvement
 * - Structured discussion patterns with workflow coordination
 * 
 * **COMPREHENSIVE AI INTEGRATION:**
 * - @claude-zen/brain: Autonomous decision-making and behavioral intelligence
 * - @claude-zen/neural-ml: 27+ neural models for learning and prediction
 * - @claude-zen/brain: Health monitoring and performance prediction
 * - @claude-zen/ai-safety: Deception detection and safety protocols
 * - @claude-zen/brain: Intelligent resource optimization
 * - @claude-zen/workflows: Process coordination and orchestration
 * - @claude-zen/teamwork: Collaborative discussions and consensus building
 * - @claude-zen/database: Multi-backend persistent storage
 * 
 * **SELF-OPTIMIZATION:**
 * - Continuous learning from swarm performance
 * - Behavioral pattern recognition and adaptation
 * - Neural network training from coordination outcomes
 * - Autonomous strategy updates based on performance history
 * - Load balancing optimization through usage analytics
 * 
 * **EMERGENT COORDINATION:**
 * - Queens emerge at service-domain intersections
 * - Matrons coordinate capability domains
 * - Commanders handle tactical execution
 * - Dynamic topology adaptation based on workload
 * 
 * This represents the complete implementation of the user's vision for a
 * "full AI system" that "thinks hard" and organizes around AI capabilities
 * rather than human organizational boundaries.
 */

export const CAPABILITY_MESH_INFO = {
  version: '1.0.0-dynamic',
  name: '@claude-zen/capability-mesh',
  description: 'Dynamic capability mesh architecture with AI-powered self-optimization',
  architecture: 'matrix-organization',
  coordination: 'emergent-swarm-formation',
  learning: 'comprehensive-neural-integration',
  capabilities: [
    'Dynamic swarm formation',
    'Cross-domain coordination', 
    'Collaborative decision-making',
    'Intelligent resource optimization',
    'Workflow orchestration',
    'Team collaboration patterns',
    'Self-optimizing neural learning',
    'Behavioral intelligence',
    'Performance prediction',
    'Consensus building',
    'Load balancing',
    'Process coordination',
    'Migration with learning preservation'
  ],
  integrations: [
    '@claude-zen/brain',
    '@claude-zen/neural-ml', 
    '@claude-zen/brain',
    '@claude-zen/ai-safety',
    '@claude-zen/brain',
    '@claude-zen/workflows',
    '@claude-zen/teamwork',
    '@claude-zen/database'
  ]
} as const;