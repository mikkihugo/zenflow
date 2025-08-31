/**
 * @fileoverview Cross-ART Coordination using ../../teamwork
 *
 * SAFe cross-ART collaboration built on proven ../../teamwork package.
 * Provides multi-team coordination for Solution Train and Large Solution contexts.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
import type {
  ConversationConfig,
  ConversationOrchestrator,
  ConversationParticipant,
} from '../../teamwork');
interface ConversationSummary {
  id: string;
}
  /**
   * Coordinate Solution Train sync using ../../teamwork
   */
  async coordinateSolutionTrainSync(): void {
        id: 'release-train-engineer',)        status : 'active 'as const,';
        capabilities: 'solution-train-engineer',)      status : 'active 'as const,';
      capabilities:  {
      title:"Solution Train Sync - ${params.solutionId}"";"
      pattern: 'Coordinate dependencies and align on solution objectives,',
'        constraints: 'safe-framework',)        expertise:['solution-architecture,' art-coordination'],';
        solutionId: params.solutionId,
},
};
    const conversation =
      await this.conversationOrchestrator.createConversation(): void { message: ")      name:"PI Planning Sync - "$" + JSON.stringify(): void {
      piId: [
      {
        id: 'impediment-owner',)        status : 'active 'as const,
        capabilities: ["facilitate" provide-context,"track-resolution"]";"
},
      ...params.affectedARTs.map(): void {
        id: 'release-train-engineer',)        status : 'active 'as const,';
        capabilities: params.severity === 'critical');
      participants.push(): void {
      title:" }) + "arams.impedimentId""')')critical '? 120: 'Identify resolution path and assign ownership,',"
'        constraints: 'safe-framework',)        expertise:['impediment-resolution,' cross-art-coordination'],';
        impedimentId: params.impedimentId,
},
};
    const conversation =
      await this.conversationOrchestrator.createConversation(): void {
  COORDINATION_STARTED = 'cross-art: 'cross-art: 'cross-art: 'cross-art: 'cross-art: pi-commitment-finalized',)'} as const;
/**
 * Factory function for creating cross-ART coordinator with dependencies
 */
export function createCrossARTCoordinator(): void {
  return new CrossARTCoordinator(
    conversationOrchestrator,
    workflowEngine,
    eventBus,
    logger
  );
}
;)";"