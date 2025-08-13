/**
 * @file Domain Card Component for TUI - Shows domain information with selection state
 */

import { Box, Text } from 'ink';
import type React from 'react';
import type { DiscoveredDomain } from '../types.js';

export interface DomainCardProps {
  domain: DiscoveredDomain;
  selected: boolean;
  highlighted: boolean;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  selected,
  highlighted,
}) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'magenta';
      case 'extreme':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getConfidenceIndicator = (confidence: number) => {
    if (confidence >= 0.9) return { icon: '🟢', color: 'green' };
    if (confidence >= 0.8) return { icon: '🟡', color: 'yellow' };
    if (confidence >= 0.7) return { icon: '🟠', color: 'magenta' };
    return { icon: '🔴', color: 'red' };
  };

  const confidenceIndicator = getConfidenceIndicator(domain.confidence);
  const complexityColor = getComplexityColor(domain.estimatedComplexity);

  return (
    <Box
      borderStyle={highlighted ? 'double' : 'single'}
      borderColor={highlighted ? 'cyan' : selected ? 'green' : 'gray'}
      paddingX={1}
      marginBottom={0}
    >
      <Box flexDirection="column" width="100%">
        {/* Header row */}
        <Box>
          <Text color={selected ? 'green' : 'white'}>
            {selected ? '✅' : '⭕'}
          </Text>
          <Text bold color={highlighted ? 'cyan' : 'white'}>
            {' '}
            {domain.name}
          </Text>
          <Text dimColor> ({domain.path})</Text>
          <Box marginLeft={1}>
            <Text>{confidenceIndicator.icon}</Text>
            <Text color={confidenceIndicator.color}>
              {' '}
              {(domain.confidence * 100).toFixed(0)}%
            </Text>
          </Box>
        </Box>

        {/* Details row */}
        <Box marginTop={0}>
          <Text dimColor>📁 {domain.files} files •</Text>
          <Text color={complexityColor}>
            {' '}
            🔧 {domain.estimatedComplexity} •
          </Text>
          <Text dimColor>🤖 {domain.estimatedAgents} agents •</Text>
          <Text dimColor>🕸️ {domain.suggestedTopology}</Text>
        </Box>

        {/* Concepts row */}
        <Box marginTop={0}>
          <Text dimColor>💡 </Text>
          <Text>
            {domain.concepts.slice(0, 3).join(', ')}
            {domain.concepts.length > 3 &&
              ` +${domain.concepts.length - 3} more`}
          </Text>
        </Box>

        {/* Technologies row */}
        <Box marginTop={0}>
          <Text dimColor>🔧 </Text>
          <Text>
            {domain.technologies.slice(0, 3).join(', ')}
            {domain.technologies.length > 3 &&
              ` +${domain.technologies.length - 3} more`}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
