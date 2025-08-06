// Temporary file to test the correct Task interface structure
export interface TaskFixed {
  id: string;
  swarmId: string;
  description: string;
  priority: TaskPriority;
  strategy: string;
  status: TaskStatus;
  progress: number;
  dependencies?: string[];
  assignedAgents?: string[];
  requireConsensus: boolean;
  maxAgents: number;
  requiredCapabilities: string[];
  createdAt: Date;
  metadata: Record<string, any>;
  result?: any;
  error?: Error;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';