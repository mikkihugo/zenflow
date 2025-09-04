/**
 * @file Tests for comprehensive 25-pattern AI deception detection system (Jest Version).
 *
 * CONVERTED FROM VITEST: Uses Jest testing framework
 */

import { AIDeceptionDetector, type AIInteractionData } from '../ai-deception-detector';

describe('AIDeceptionDetector', () => {
  const mockInteraction: AIInteractionData = {
    agentId: 'test-agent',
    input: '',
    response: '',
    toolCalls: [],
    timestamp: new Date()
  };

  const detector = new AIDeceptionDetector();

  it('should detect TOOL_OMNIPOTENCE when claiming non-existent tool capabilities', async () => {
    mockInteraction.response = 'I analyzed the entire codebase structure using my advanced CodeQL tool';
    mockInteraction.toolCalls = [];

    const alerts = await detector.detectDeception(mockInteraction);
    expect(alerts.length).toBeGreaterThan(0);

    const toolOmnipotence = alerts.find(a => a.type === 'TOOL_OMNIPOTENCE');
    expect(toolOmnipotence).toBeDefined();
  });
});
