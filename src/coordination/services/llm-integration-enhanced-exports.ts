// Enhanced exports for Claude Code SDK integration
export { LLMIntegrationService } from './llm-integration.service.js';
export type {
  LLMIntegrationConfig,
  AnalysisRequest,
  AnalysisResult,
} from './llm-integration.service.js';
export {
  selectOptimalModel,
  getComponentModel,
  getModelConfig,
  Models,
} from '../../integrations/claude-code/model-strategy.js';

// Re-export default
export { default } from './llm-integration.service.js';
