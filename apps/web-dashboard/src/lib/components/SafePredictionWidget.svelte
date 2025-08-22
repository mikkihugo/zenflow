<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let data: any;
  export let userRole: string;
  export let immersionLevel: 'basic' | 'enhanced' | 'production';

  const predictions = writable([]);
  const trends = writable([]);

  // Role-specific prediction data
  const rolePredictions = {
    team_member: {
      piSuccessProbability: 0.78,
      personalGoals: [
        { metric: 'Skill Growth', current: 7.2, predicted: 8.1, confidence: 0.85, trend: 'improving' },
        { metric: 'Code Quality', current: 8.3, predicted: 8.7, confidence: 0.79, trend: 'stable' },
        { metric: 'Collaboration', current: 7.8, predicted: 8.4, confidence: 0.82, trend: 'improving' }
      ],
      opportunities: [
        { type: 'skill_development', description: 'React advanced patterns course completion predicted to boost productivity 15%', confidence: 0.73 },
        { type: 'mentorship', description: 'Pairing with senior dev could accelerate learning by 23%', confidence: 0.81 }
      ]
    },
    scrum_master: {
      piSuccessProbability: 0.82,
      personalGoals: [
        { metric: 'Team Velocity', current: 23, predicted: 27, confidence: 0.78, trend: 'improving' },
        { metric: 'Team Health', current: 8.1, predicted: 8.6, confidence: 0.85, trend: 'stable' },
        { metric: 'Impediment Resolution', current: 2.3, predicted: 1.8, confidence: 0.71, trend: 'improving' }
      ],
      opportunities: [
        { type: 'process_optimization', description: 'Retrospective action completion rate improvement could boost velocity 12%', confidence: 0.76 },
        { type: 'team_dynamics', description: 'Conflict resolution training predicted to improve team health 18%', confidence: 0.84 }
      ]
    },
    po: {
      piSuccessProbability: 0.79,
      personalGoals: [
        { metric: 'Customer Satisfaction', current: 4.2, predicted: 4.6, confidence: 0.74, trend: 'improving' },
        { metric: 'Feature Success Rate', current: 0.73, predicted: 0.81, confidence: 0.68, trend: 'improving' },
        { metric: 'Stakeholder Alignment', current: 7.9, predicted: 8.3, confidence: 0.82, trend: 'stable' }
      ],
      opportunities: [
        { type: 'user_research', description: 'Additional user interviews predicted to improve feature success rate 22%', confidence: 0.79 },
        { type: 'data_analysis', description: 'Advanced analytics adoption could boost decision accuracy 28%', confidence: 0.71 }
      ]
    },
    rte: {
      piSuccessProbability: 0.85,
      personalGoals: [
        { metric: 'ART Health Score', current: 8.2, predicted: 8.7, confidence: 0.81, trend: 'improving' },
        { metric: 'Dependency Resolution', current: 0.73, predicted: 0.84, confidence: 0.75, trend: 'improving' },
        { metric: 'PI Predictability', current: 0.78, predicted: 0.83, confidence: 0.79, trend: 'stable' }
      ],
      opportunities: [
        { type: 'architectural_alignment', description: 'System architect collaboration predicted to reduce dependencies 19%', confidence: 0.83 },
        { type: 'pi_planning_optimization', description: 'Advanced facilitation techniques could improve predictability 14%', confidence: 0.77 }
      ]
    },
    architect: {
      piSuccessProbability: 0.81,
      personalGoals: [
        { metric: 'Technical Debt Ratio', current: 0.23, predicted: 0.18, confidence: 0.76, trend: 'improving' },
        { metric: 'Architecture Compliance', current: 0.87, predicted: 0.92, confidence: 0.84, trend: 'improving' },
        { metric: 'Innovation Index', current: 7.4, predicted: 8.1, confidence: 0.69, trend: 'improving' }
      ],
      opportunities: [
        { type: 'automation', description: 'Architecture governance automation predicted to improve compliance 16%', confidence: 0.82 },
        { type: 'modernization', description: 'Microservices migration could reduce technical debt 31%', confidence: 0.74 }
      ]
    },
    business_owner: {
      piSuccessProbability: 0.83,
      personalGoals: [
        { metric: 'Portfolio ROI', current: 0.18, predicted: 0.24, confidence: 0.78, trend: 'improving' },
        { metric: 'Time to Market', current: 45, predicted: 38, confidence: 0.73, trend: 'improving' },
        { metric: 'Business Value Delivery', current: 0.76, predicted: 0.84, confidence: 0.81, trend: 'stable' }
      ],
      opportunities: [
        { type: 'portfolio_optimization', description: 'Epic prioritization refinement predicted to improve ROI 21%', confidence: 0.79 },
        { type: 'market_analysis', description: 'Competitive intelligence integration could accelerate time to market 17%', confidence: 0.76 }
      ]
    }
  };

  $: roleData = rolePredictions[userRole] || rolePredictions.team_member;
  $: currentPredictions = data?.predictions || [];

  onMount(() => {
    predictions.set(roleData.personalGoals);
    // Simulate real-time prediction updates
    setInterval(updatePredictions, 45000);
  });

  function updatePredictions() {
    predictions.update(preds => 
      preds.map(pred => ({
        ...pred,
        confidence: Math.max(0.6, Math.min(0.95, pred.confidence + (Math.random() - 0.5) * 0.1)),
        predicted: pred.predicted + (Math.random() - 0.5) * 0.2
      }))
    );
  }

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  }

  function getTrendIcon(trend: string): string {
    const icons = {
      improving: '📈',
      stable: '➡️',
      declining: '📉'
    };
    return icons[trend] || '➡️';
  }

  function getTrendColor(trend: string): string {
    const colors = {
      improving: 'text-green-400',
      stable: 'text-blue-400', 
      declining: 'text-red-400'
    };
    return colors[trend] || 'text-slate-400';
  }

  function formatMetricValue(value: number, metric: string): string {
    if (metric.includes('Ratio') || metric.includes('Rate') || metric.includes('Delivery')) {
      return `${(value * 100).toFixed(0)}%`;
    }
    if (metric.includes('ROI')) {
      return `${(value * 100).toFixed(0)}%`;
    }
    if (metric.includes('Time') && value > 10) {
      return `${value.toFixed(0)} days`;
    }
    return value.toFixed(1);
  }
</script>

<div class="flex flex-col h-full space-y-4">
  <!-- PI Success Probability -->
  <div class="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
    <div class="flex items-center justify-between mb-2">
      <div class="text-sm font-semibold text-purple-400">🎯 PI Success Probability</div>
      <div class="text-lg font-bold text-white">{(roleData.piSuccessProbability * 100).toFixed(0)}%</div>
    </div>
    
    <!-- Success Probability Bar -->
    <div class="w-full bg-slate-700 rounded-full h-2 mb-1">
      <div 
        class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
        style="width: {roleData.piSuccessProbability * 100}%"
      ></div>
    </div>
    <div class="text-xs text-slate-400">Based on current team performance and historical data</div>
  </div>

  <!-- Personal/Role Predictions -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-slate-200">🔮 Smart Predictions</h4>
      <div class="text-xs text-slate-400">Next 30 days</div>
    </div>
    
    <div class="space-y-2 max-h-40 overflow-y-auto">
      {#each $predictions as prediction}
        <div class="p-3 bg-slate-700/20 rounded-lg border border-slate-600/50">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-slate-200">{prediction.metric}</div>
            <div class="flex items-center space-x-2">
              <span class="{getTrendColor(prediction.trend)}">{getTrendIcon(prediction.trend)}</span>
              <span class="{getConfidenceColor(prediction.confidence)} text-xs">
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="text-xs text-slate-400">
              Current: <span class="text-slate-200">{formatMetricValue(prediction.current, prediction.metric)}</span>
            </div>
            <div class="text-xs text-slate-400">
              Predicted: <span class="text-blue-400">{formatMetricValue(prediction.predicted, prediction.metric)}</span>
            </div>
          </div>
          
          <!-- Prediction Progress -->
          <div class="w-full bg-slate-600 rounded-full h-1 mt-2">
            <div 
              class="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full transition-all duration-1000"
              style="width: {Math.min(100, (prediction.predicted / (prediction.current * 1.5)) * 100)}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Opportunities -->
  <div>
    <div class="text-sm font-semibold text-slate-200 mb-3">💡 AI Opportunities</div>
    <div class="space-y-2">
      {#each roleData.opportunities as opportunity}
        <div class="p-2 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-lg border-l-2 border-green-400">
          <div class="flex items-start justify-between mb-1">
            <div class="text-xs font-medium text-green-400 capitalize">{opportunity.type.replace('_', ' ')}</div>
            <div class="text-xs {getConfidenceColor(opportunity.confidence)}">
              {(opportunity.confidence * 100).toFixed(0)}%
            </div>
          </div>
          <div class="text-xs text-slate-300 leading-relaxed">{opportunity.description}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Recent Predictions (from real-time data) -->
  {#if currentPredictions.length > 0}
    <div>
      <div class="text-sm font-semibold text-slate-200 mb-3">⚡ Live Predictions</div>
      <div class="space-y-1">
        {#each currentPredictions.slice(0, 2) as prediction}
          <div class="p-2 bg-blue-600/10 rounded border border-blue-500/30">
            <div class="flex items-center justify-between">
              <div class="text-xs text-blue-400">{prediction.type}</div>
              <div class="text-xs text-slate-400">{new Date(prediction.timestamp).toLocaleTimeString()}</div>
            </div>
            <div class="text-xs text-slate-300 mt-1">{prediction.insight}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Prediction Model Info -->
  <div class="pt-2 border-t border-slate-700">
    <div class="flex items-center justify-between text-xs text-slate-400">
      <span>🤖 Brain-powered predictions</span>
      <span>Updated {data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'now'}</span>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar styling for predictions */
  .space-y-2::-webkit-scrollbar {
    width: 3px;
  }
  
  .space-y-2::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.6);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.8);
  }
</style>