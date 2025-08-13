/**
 * ADR Manager Screen - Architecture Decision Record Management.
 *
 * Interactive interface for viewing, commenting, and managing ADRs.
 * Supports status transitions, commenting, and approval workflows.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';
import { getVersion } from '../utils/version-utils.js';

// ADR Types based on existing system
export type ADRStatus =
  | 'draft'
  | 'proposed'
  | 'discussion'
  | 'accepted'
  | 'rejected'
  | 'superseded';

export interface ADRRecord {
  id: string;
  number: number;
  title: string;
  status: ADRStatus;
  context: string;
  decision: string;
  consequences: string;
  author: string;
  created_date: Date;
  updated_date: Date;
  stakeholders: string[];
  comments: ADRComment[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ADRComment {
  id: string;
  author: string;
  content: string;
  action?: 'approve' | 'reject' | 'request_changes' | 'comment';
  timestamp: Date;
}

interface ADRManagerProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

type ViewMode = 'list' | 'detail' | 'comment' | 'action';

export default function ADRManager({
  swarmStatus,
  onBack,
  onExit,
}: ADRManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedADR, setSelectedADR] = useState<ADRRecord | null>(null);
  const [adrs, setAdrs] = useState<ADRRecord[]>([]);
  const [filteredAdrs, setFilteredAdrs] = useState<ADRRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<ADRStatus | 'all'>('all');
  const [commentText, setCommentText] = useState('');
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'request_changes' | 'comment'
  >('comment');
  const [loading, setLoading] = useState(true);

  // Mock ADR data for demonstration
  useEffect(() => {
    const mockADRs: ADRRecord[] = [
      {
        id: 'adr-001',
        number: 1,
        title: 'Use TypeScript for all new components',
        status: 'accepted',
        context:
          'We need better type safety and developer experience in our React components.',
        decision:
          'All new React components must be written in TypeScript with strict typing.',
        consequences:
          'Better type safety, improved IDE support, but slightly longer development time initially.',
        author: 'Tech Lead',
        created_date: new Date('2024-01-15'),
        updated_date: new Date('2024-01-20'),
        stakeholders: ['Frontend Team', 'Tech Lead', 'Product Manager'],
        urgency: 'medium',
        comments: [
          {
            id: 'c1',
            author: 'Frontend Dev',
            content: 'Great decision! This will help catch bugs early.',
            action: 'approve',
            timestamp: new Date('2024-01-18'),
          },
          {
            id: 'c2',
            author: 'Senior Dev',
            content:
              'Agreed, but we need to ensure proper training for the team.',
            action: 'approve',
            timestamp: new Date('2024-01-19'),
          },
        ],
      },
      {
        id: 'adr-002',
        number: 2,
        title: 'Implement React Query for data fetching',
        status: 'proposed',
        context:
          'Current data fetching is inconsistent across the application with manual state management.',
        decision:
          'Adopt React Query (TanStack Query) for all server state management.',
        consequences:
          'Improved caching, better UX with loading states, but additional learning curve.',
        author: 'Frontend Architect',
        created_date: new Date('2024-02-01'),
        updated_date: new Date('2024-02-03'),
        stakeholders: ['Frontend Team', 'Backend Team', 'QA Team'],
        urgency: 'high',
        comments: [
          {
            id: 'c3',
            author: 'Backend Dev',
            content:
              'This looks good, but we need to ensure our APIs are properly optimized for caching.',
            action: 'request_changes',
            timestamp: new Date('2024-02-02'),
          },
        ],
      },
      {
        id: 'adr-003',
        number: 3,
        title: 'Database migration to PostgreSQL',
        status: 'discussion',
        context:
          'Current SQLite database is reaching performance limits with increased user base.',
        decision:
          'Migrate primary database from SQLite to PostgreSQL for better scalability.',
        consequences:
          'Better performance and scalability, but requires migration planning and potential downtime.',
        author: 'Database Admin',
        created_date: new Date('2024-02-10'),
        updated_date: new Date('2024-02-12'),
        stakeholders: [
          'Backend Team',
          'DevOps',
          'Database Admin',
          'Product Manager',
        ],
        urgency: 'critical',
        comments: [
          {
            id: 'c4',
            author: 'DevOps Engineer',
            content:
              'We need to plan for zero-downtime migration. Consider using read replicas.',
            action: 'comment',
            timestamp: new Date('2024-02-11'),
          },
          {
            id: 'c5',
            author: 'Senior Backend Dev',
            content:
              'PostgreSQL is a good choice. We should also consider connection pooling.',
            action: 'approve',
            timestamp: new Date('2024-02-12'),
          },
        ],
      },
      {
        id: 'adr-004',
        number: 4,
        title: 'Adopt Tailwind CSS for styling',
        status: 'rejected',
        context: 'Current CSS architecture is becoming difficult to maintain.',
        decision:
          'Replace custom CSS with Tailwind CSS utility-first approach.',
        consequences:
          'Faster development, consistent design system, but larger bundle size.',
        author: 'UI/UX Designer',
        created_date: new Date('2024-01-25'),
        updated_date: new Date('2024-01-30'),
        stakeholders: ['Frontend Team', 'UI/UX Team', 'Performance Team'],
        urgency: 'low',
        comments: [
          {
            id: 'c6',
            author: 'Performance Engineer',
            content:
              'Bundle size impact is significant. We should stick with CSS modules.',
            action: 'reject',
            timestamp: new Date('2024-01-28'),
          },
          {
            id: 'c7',
            author: 'Frontend Lead',
            content:
              'Agreed with performance concerns. CSS modules are working well.',
            action: 'reject',
            timestamp: new Date('2024-01-29'),
          },
        ],
      },
      {
        id: 'adr-005',
        number: 5,
        title: 'Implement microservices architecture',
        status: 'draft',
        context:
          'Monolithic architecture is becoming harder to scale and deploy independently.',
        decision: 'Break down monolith into domain-specific microservices.',
        consequences:
          'Better scalability and team autonomy, but increased operational complexity.',
        author: 'Solutions Architect',
        created_date: new Date('2024-02-15'),
        updated_date: new Date('2024-02-15'),
        stakeholders: [
          'Architecture Team',
          'Backend Team',
          'DevOps',
          'Product Manager',
        ],
        urgency: 'high',
        comments: [],
      },
    ];

    setAdrs(mockADRs);
    setFilteredAdrs(mockADRs);
    setLoading(false);
  }, []);

  // Filter ADRs by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredAdrs(adrs);
    } else {
      setFilteredAdrs(adrs.filter((adr) => adr.status === statusFilter));
    }
  }, [adrs, statusFilter]);

  const handleBack = useCallback(() => {
    if (
      viewMode === 'detail' ||
      viewMode === 'comment' ||
      viewMode === 'action'
    ) {
      setViewMode('list');
      setSelectedADR(null);
      setCommentText('');
    } else {
      onBack();
    }
  }, [viewMode, onBack]);

  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      if (viewMode === 'list') {
        onExit();
      } else {
        handleBack();
      }
    }

    if (viewMode === 'list') {
      if (input === 'f' || input === 'F') {
        // Cycle through status filters
        const filters: (ADRStatus | 'all')[] = [
          'all',
          'draft',
          'proposed',
          'discussion',
          'accepted',
          'rejected',
        ];
        const currentIndex = filters.indexOf(statusFilter);
        const nextIndex = (currentIndex + 1) % filters.length;
        setStatusFilter(filters[nextIndex]);
      }
    }

    if (viewMode === 'detail') {
      if (input === 'c' || input === 'C') {
        setViewMode('comment');
        setActionType('comment');
      }
      if (input === 'a' || input === 'A') {
        setViewMode('action');
      }
    }
  });

  const getStatusColor = (status: ADRStatus): string => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'proposed':
        return 'yellow';
      case 'discussion':
        return 'blue';
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'superseded':
        return 'magenta';
      default:
        return 'white';
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical':
        return 'red';
      case 'high':
        return 'yellow';
      case 'medium':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'white';
    }
  };

  const handleADRSelect = (adr: ADRRecord) => {
    setSelectedADR(adr);
    setViewMode('detail');
  };

  const handleCommentSubmit = () => {
    if (!selectedADR || !commentText.trim()) return;

    const newComment: ADRComment = {
      id: `c${Date.now()}`,
      author: 'Current User', // In real app, get from auth
      content: commentText.trim(),
      action: actionType,
      timestamp: new Date(),
    };

    const updatedADR = {
      ...selectedADR,
      comments: [...selectedADR.comments, newComment],
    };

    // Update ADR status based on action
    if (actionType === 'approve' && selectedADR.status === 'proposed') {
      updatedADR.status = 'accepted';
    } else if (actionType === 'reject') {
      updatedADR.status = 'rejected';
    }

    setAdrs((prev) =>
      prev.map((adr) => (adr.id === selectedADR.id ? updatedADR : adr))
    );
    setSelectedADR(updatedADR);
    setCommentText('');
    setViewMode('detail');
  };

  if (loading) {
    return (
      <Box flexDirection="column" height="100%">
        <Header
          title="ADR Manager - Loading..."
          version={getVersion()}
          swarmStatus={swarmStatus}
          showBorder={true}
        />
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <Text>Loading ADRs...</Text>
        </Box>
      </Box>
    );
  }

  // List view
  if (viewMode === 'list') {
    const listItems = filteredAdrs.map((adr) => ({
      label: `ADR-${adr.number.toString().padStart(3, '0')}: ${adr.title}`,
      value: adr.id,
      adr,
    }));

    return (
      <Box flexDirection="column" height="100%">
        <Header
          title={`ADR Manager (${filteredAdrs.length} ADRs)`}
          version={getVersion()}
          swarmStatus={swarmStatus}
          showBorder={true}
        />

        <Box paddingX={2} paddingY={1}>
          <Text bold color="cyan">
            Filter:{' '}
          </Text>
          <Text color="white">
            {statusFilter === 'all' ? 'All ADRs' : statusFilter.toUpperCase()}
          </Text>
          <Text color="gray"> (Press F to cycle filters)</Text>
        </Box>

        <Box flexGrow={1} paddingX={2}>
          {listItems.length === 0 ? (
            <Box
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="yellow">
                No ADRs found for filter: {statusFilter}
              </Text>
              <Text color="gray">Press F to change filter</Text>
            </Box>
          ) : (
            <SelectInput
              items={listItems}
              onSelect={(item) => handleADRSelect(item.adr)}
              itemComponent={({ isSelected, label, value }) => {
                const adr = listItems.find((i) => i.value === value)?.adr;
                if (!adr) return null;

                return (
                  <Box flexDirection="column">
                    <Box>
                      <Text
                        color={isSelected ? 'cyan' : 'white'}
                        bold={isSelected}
                      >
                        {isSelected ? '▶ ' : '  '}
                        {label}
                      </Text>
                    </Box>
                    <Box marginLeft={isSelected ? 2 : 4}>
                      <StatusBadge
                        status={adr.status as any}
                        text={adr.status.toUpperCase()}
                        variant="minimal"
                      />
                      <Text color={getUrgencyColor(adr.urgency)}>
                        {' '}
                        [{adr.urgency.toUpperCase()}]
                      </Text>
                      <Text color="gray"> by {adr.author}</Text>
                      <Text color="gray">
                        {' '}
                        • {adr.comments.length} comments
                      </Text>
                    </Box>
                  </Box>
                );
              }}
            />
          )}
        </Box>

        <InteractiveFooter
          shortcuts={[
            { key: 'Enter', description: 'View ADR Details' },
            { key: 'F', description: 'Filter by Status' },
            { key: 'ESC/Q', description: 'Back' },
          ]}
        />
      </Box>
    );
  }

  // Detail view
  if (viewMode === 'detail' && selectedADR) {
    return (
      <Box flexDirection="column" height="100%">
        <Header
          title={`ADR-${selectedADR.number.toString().padStart(3, '0')}: ${selectedADR.title}`}
          version={getVersion()}
          swarmStatus={swarmStatus}
          showBorder={true}
        />

        <Box flexGrow={1} paddingX={2} flexDirection="column">
          <Box paddingY={1}>
            <StatusBadge
              status={selectedADR.status as any}
              text={selectedADR.status.toUpperCase()}
            />
            <Text color={getUrgencyColor(selectedADR.urgency)}>
              {' '}
              [{selectedADR.urgency.toUpperCase()}]
            </Text>
            <Text color="gray"> by {selectedADR.author}</Text>
            <Text color="gray">
              {' '}
              • Created: {selectedADR.created_date.toDateString()}
            </Text>
          </Box>

          <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
              Context:
            </Text>
            <Text>{selectedADR.context}</Text>
          </Box>

          <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
              Decision:
            </Text>
            <Text>{selectedADR.decision}</Text>
          </Box>

          <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
              Consequences:
            </Text>
            <Text>{selectedADR.consequences}</Text>
          </Box>

          <Box flexDirection="column" marginY={1}>
            <Text bold color="cyan">
              Stakeholders:
            </Text>
            <Text>{selectedADR.stakeholders.join(', ')}</Text>
          </Box>

          {selectedADR.comments.length > 0 && (
            <Box flexDirection="column" marginY={1}>
              <Text bold color="cyan">
                Comments ({selectedADR.comments.length}):
              </Text>
              {selectedADR.comments.map((comment) => (
                <Box
                  key={comment.id}
                  marginY={1}
                  paddingLeft={2}
                  flexDirection="column"
                >
                  <Box>
                    <Text bold color="white">
                      {comment.author}
                    </Text>
                    {comment.action && (
                      <Text
                        color={
                          comment.action === 'approve'
                            ? 'green'
                            : comment.action === 'reject'
                              ? 'red'
                              : 'yellow'
                        }
                      >
                        {' '}
                        [{comment.action.replace('_', ' ').toUpperCase()}]
                      </Text>
                    )}
                    <Text color="gray">
                      {' '}
                      • {comment.timestamp.toLocaleString()}
                    </Text>
                  </Box>
                  <Text>{comment.content}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <InteractiveFooter
          shortcuts={[
            { key: 'C', description: 'Add Comment' },
            { key: 'A', description: 'Take Action' },
            { key: 'ESC', description: 'Back to List' },
          ]}
        />
      </Box>
    );
  }

  // Comment input view
  if (viewMode === 'comment' && selectedADR) {
    return (
      <Box flexDirection="column" height="100%">
        <Header
          title={`Add Comment to ADR-${selectedADR.number.toString().padStart(3, '0')}`}
          version={getVersion()}
          swarmStatus={swarmStatus}
          showBorder={true}
        />

        <Box flexGrow={1} paddingX={2} paddingY={2} flexDirection="column">
          <Text bold color="cyan">
            Comment on: {selectedADR.title}
          </Text>
          <Box marginY={1} />

          <Text>Enter your comment:</Text>
          <Box
            borderStyle="single"
            borderColor="gray"
            paddingX={1}
            paddingY={1}
            marginY={1}
          >
            <TextInput
              value={commentText}
              onChange={setCommentText}
              placeholder="Type your comment here..."
              onSubmit={handleCommentSubmit}
            />
          </Box>

          <Text color="gray">Press Enter to submit, ESC to cancel</Text>
        </Box>
      </Box>
    );
  }

  // Action selection view
  if (viewMode === 'action' && selectedADR) {
    const actionItems = [
      { label: '💬 Add Comment', value: 'comment' },
      { label: '✅ Approve', value: 'approve' },
      { label: '❌ Reject', value: 'reject' },
      { label: '🔄 Request Changes', value: 'request_changes' },
    ];

    return (
      <Box flexDirection="column" height="100%">
        <Header
          title={`Take Action on ADR-${selectedADR.number.toString().padStart(3, '0')}`}
          version={getVersion()}
          swarmStatus={swarmStatus}
          showBorder={true}
        />

        <Box flexGrow={1} paddingX={2} paddingY={2}>
          <Text bold color="cyan">
            Choose an action for: {selectedADR.title}
          </Text>
          <Box marginY={1} />

          <SelectInput
            items={actionItems}
            onSelect={(item) => {
              setActionType(item.value as any);
              setViewMode('comment');
            }}
            itemComponent={({ isSelected, label }) => (
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {isSelected ? '▶ ' : '  '}
                {label}
              </Text>
            )}
          />
        </Box>

        <InteractiveFooter
          shortcuts={[
            { key: 'Enter', description: 'Select Action' },
            { key: 'ESC', description: 'Back' },
          ]}
        />
      </Box>
    );
  }

  return null;
}
