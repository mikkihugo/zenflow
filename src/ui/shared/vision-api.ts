/**
 * Shared Vision API - Works for both TUI and Web interfaces
 */

interface Vision {
  id: string;
  name: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  phases: Array<{
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
    progress?: number;
  }>;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error';
}

interface SwarmData {
  agents: Agent[];
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

export class VisionAPI {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:4003') {
    this.baseUrl = baseUrl;
  }

  async fetchVisions(): Promise<Vision[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/visions`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Using mock vision data', error);
      return this.getMockVisions();
    }
  }

  async getSwarmStatus(): Promise<SwarmData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/swarm/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Using mock swarm data', error);
      return this.getMockSwarmData();
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/system/metrics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Using mock system metrics', error);
      return this.getMockSystemMetrics();
    }
  }

  async generateRoadmap(visionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/visions/${visionId}/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Failed to generate roadmap', error);
      return { success: false, error: error.message };
    }
  }

  private getMockVisions(): Vision[] {
    return [
      {
        id: 'vision-1',
        name: 'AI-Powered Development',
        description: 'Integrate AI assistants into development workflow',
        status: 'approved',
        priority: 'high',
        phases: [
          { name: 'Research', status: 'completed', progress: 100 },
          { name: 'Prototype', status: 'in_progress', progress: 75 },
          { name: 'Integration', status: 'pending', progress: 0 }
        ]
      },
      {
        id: 'vision-2',
        name: 'Automated Testing',
        description: 'Implement comprehensive automated testing suite',
        status: 'pending',
        priority: 'medium',
        phases: [
          { name: 'Planning', status: 'in_progress', progress: 50 },
          { name: 'Implementation', status: 'pending', progress: 0 }
        ]
      }
    ];
  }

  private getMockSwarmData(): SwarmData {
    return {
      agents: [
        { id: 'agent-1', name: 'architect', type: 'system-design', status: 'active' },
        { id: 'agent-2', name: 'coder', type: 'implementation', status: 'active' },
        { id: 'agent-3', name: 'tester', type: 'quality-assurance', status: 'idle' },
        { id: 'agent-4', name: 'analyst', type: 'data-analysis', status: 'active' }
      ],
      totalTasks: 25,
      activeTasks: 8,
      completedTasks: 17
    };
  }

  private getMockSystemMetrics(): SystemMetrics {
    return {
      uptime: Date.now() - (Math.random() * 86400000), // Random uptime up to 24 hours
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 50) + 1
    };
  }
}

// Export singleton instance
export const visionAPI = new VisionAPI();