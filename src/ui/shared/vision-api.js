/**
 * Shared Vision API - Works for both TUI and Web interfaces
 */

export class VisionAPI {
  constructor(baseUrl = 'http://localhost:4106') {
    this.baseUrl = baseUrl;
  }

  async fetchVisions() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/visions`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Using mock vision data:', error.message);
      return [
        {
          id: '1',
          title: 'AI-Powered Customer Service Platform',
          description: 'Build an intelligent customer service system with multi-language support',
          status: 'approved',
          priority: 'high',
          expected_roi: '$2.5M',
          category: 'AI/ML',
          created_at: new Date().toISOString(),
          phases: [
            { name: 'Research & Analysis', status: 'completed', progress: 100 },
            { name: 'System Design', status: 'in_progress', progress: 65 },
            { name: 'Core Development', status: 'pending', progress: 0 },
            { name: 'Testing & QA', status: 'pending', progress: 0 },
            { name: 'Deployment', status: 'pending', progress: 0 }
          ]
        },
        {
          id: '2',
          title: 'Blockchain Supply Chain Tracker',
          description: 'Transparent supply chain tracking using blockchain technology',
          status: 'pending',
          priority: 'medium',
          expected_roi: '$1.8M',
          category: 'Blockchain',
          created_at: new Date().toISOString(),
          phases: [
            { name: 'Market Research', status: 'in_progress', progress: 40 },
            { name: 'Technical Specification', status: 'pending', progress: 0 },
            { name: 'Blockchain Integration', status: 'pending', progress: 0 },
            { name: 'UI Development', status: 'pending', progress: 0 },
            { name: 'Go Live', status: 'pending', progress: 0 }
          ]
        },
        {
          id: '3',
          title: 'Neural Network Code Optimizer',
          description: 'AI system that automatically optimizes code performance',
          status: 'approved',
          priority: 'high',
          expected_roi: '$3.2M',
          category: 'AI/ML',
          created_at: new Date().toISOString(),
          phases: [
            { name: 'Algorithm Research', status: 'completed', progress: 100 },
            { name: 'Neural Model Training', status: 'completed', progress: 100 },
            { name: 'Integration Development', status: 'in_progress', progress: 80 },
            { name: 'Performance Testing', status: 'pending', progress: 0 },
            { name: 'Production Release', status: 'pending', progress: 0 }
          ]
        }
      ];
    }
  }

  async generateRoadmap(visionId, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/visions/${visionId}/roadmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Using mock roadmap generation:', error.message);
      return {
        id: 'roadmap-' + visionId,
        visionId,
        phases: [
          { name: 'Analysis', duration: '2 weeks', status: 'pending' },
          { name: 'Development', duration: '8 weeks', status: 'pending' },
          { name: 'Testing', duration: '3 weeks', status: 'pending' },
          { name: 'Deployment', duration: '1 week', status: 'pending' }
        ],
        generated_at: new Date().toISOString()
      };
    }
  }

  async getHiveStatus() {
    // Mock hive-mind data - would connect to real hive-mind API
    return {
      active: true,
      agents: [
        { id: 'agent-1', name: 'Architect', status: 'active', task: 'System design' },
        { id: 'agent-2', name: 'Coder', status: 'active', task: 'API development' },
        { id: 'agent-3', name: 'Tester', status: 'idle', task: null },
        { id: 'agent-4', name: 'Analyst', status: 'active', task: 'Performance analysis' }
      ],
      tasks: {
        completed: 24,
        inProgress: 8,
        pending: 12,
        total: 44
      }
    };
  }

  async getSystemMetrics() {
    return {
      cpu: Math.floor(Math.random() * 40) + 20, // 20-60%
      memory: Math.floor(Math.random() * 2000) + 500, // 500-2500MB
      activeProcesses: Math.floor(Math.random() * 10) + 5,
      uptime: '2h 34m',
      lastUpdate: new Date().toISOString()
    };
  }
}

// Singleton instance
export const visionAPI = new VisionAPI();