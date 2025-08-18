<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import { aiInsightsEngine, type AIInsight, type AIAnalysisResult } from '../ai-insights';
  import { notifyInfo, notifySuccess } from '../notifications';

  export let systemData: any = null;
  export let autoRefresh: boolean = true;
  export let refreshInterval: number = 30000; // 30 seconds

  let analysis: AIAnalysisResult | null = null;
  let insights: AIInsight[] = [];
  let loading = false;
  let error: string | null = null;
  let selectedInsight: AIInsight | null = null;
  let refreshTimer: NodeJS.Timeout | null = null;
  let expandedInsights = new Set<string>();

  onMount(() => {
    if (systemData) {
      analyzeSystem();
    }
    
    if (autoRefresh) {
      startAutoRefresh();
    }
  });

  onDestroy(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });

  function startAutoRefresh(): void {
    if (refreshTimer) clearInterval(refreshTimer);
    
    refreshTimer = setInterval(() => {
      if (systemData && !loading) {
        analyzeSystem(false); // Silent refresh
      }
    }, refreshInterval);
  }

  async function analyzeSystem(showNotification = true): Promise<void> {
    if (!systemData) return;
    
    loading = true;
    error = null;

    try {
      analysis = await aiInsightsEngine.analyzeSystemState(systemData);
      insights = analysis.insights;
      
      if (showNotification && insights.length > 0) {
        const criticalCount = insights.filter(i => i.severity === 'critical').length;
        if (criticalCount > 0) {
          notifyInfo(`AI Analysis: Found ${criticalCount} critical insights requiring attention`);
        } else {
          notifySuccess(`AI Analysis: Generated ${insights.length} insights and recommendations`);
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to analyze system';
      console.error('AI Analysis Error:', err);
    } finally {
      loading = false;
    }
  }

  function getSeverityColor(severity: AIInsight['severity']): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'tertiary';
      default: return 'surface';
    }
  }

  function getSeverityIcon(severity: AIInsight['severity']): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '💡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  }

  function getTypeIcon(type: AIInsight['type']): string {
    switch (type) {
      case 'performance': return '⚡';
      case 'optimization': return '🎯';
      case 'security': return '🔒';
      case 'usage': return '📊';
      case 'prediction': return '🔮';
      case 'anomaly': return '🕵️';
      default: return '🤖';
    }
  }

  function getHealthScoreColor(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'warning';
    return 'error';
  }

  function toggleInsightExpansion(insightId: string): void {
    if (expandedInsights.has(insightId)) {
      expandedInsights.delete(insightId);
    } else {
      expandedInsights.add(insightId);
    }
    expandedInsights = new Set(expandedInsights); // Trigger reactivity
  }

  function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  // React to system data changes
  $: if (systemData) {
    analyzeSystem();
  }

  // Group insights by type for better organization
  $: insightsByType = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  // Filter insights by actionable status
  $: actionableInsights = insights.filter(i => i.actionable);
</script>

<div class="ai-insights-widget">
  <!-- Widget Header -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <h3 class="h4 text-primary-500">🤖 AI Insights</h3>
      {#if loading}
        <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      {/if}
    </div>
    <button 
      class="btn btn-sm variant-ghost-primary"
      on:click={() => analyzeSystem()}
      disabled={loading || !systemData}
      title="Refresh AI analysis"
    >
      <span class="text-sm">🔄</span>
    </button>
  </div>

  {#if loading && !analysis}
    <!-- Loading State -->
    <div class="text-center py-8">
      <div class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sm text-surface-600-300-token">Analyzing system data with AI...</p>
    </div>
  {:else if error}
    <!-- Error State -->
    <div class="text-center py-8">
      <div class="text-4xl mb-4">🚫</div>
      <p class="text-error-500 text-sm mb-4">{error}</p>
      <button class="btn btn-sm variant-ghost-error" on:click={() => analyzeSystem()}>
        Retry Analysis
      </button>
    </div>
  {:else if analysis}
    <!-- AI Analysis Results -->
    <div class="space-y-6">
      
      <!-- Overall Health Score -->
      <div class="card variant-soft-{getHealthScoreColor(analysis.overallScore)} p-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="h5 mb-1">System Health Score</h4>
            <p class="text-xs opacity-75">{analysis.summary}</p>
          </div>
          <div class="text-right">
            <ProgressRadial 
              value={analysis.overallScore} 
              width="w-16" 
              class="text-{getHealthScoreColor(analysis.overallScore)}-500"
            >
              <span class="text-sm font-bold">{analysis.overallScore}</span>
            </ProgressRadial>
          </div>
        </div>
      </div>

      <!-- Trends Overview -->
      {#if analysis.trends}
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 rounded bg-surface-100-800-token">
            <div class="text-xs opacity-75 mb-1">Performance</div>
            <div class="text-sm font-medium capitalize">
              {analysis.trends.performance === 'improving' ? '📈' : analysis.trends.performance === 'declining' ? '📉' : '➖'}
              {analysis.trends.performance}
            </div>
          </div>
          <div class="p-2 rounded bg-surface-100-800-token">
            <div class="text-xs opacity-75 mb-1">Usage</div>
            <div class="text-sm font-medium capitalize">
              {analysis.trends.usage === 'increasing' ? '📈' : analysis.trends.usage === 'decreasing' ? '📉' : '➖'}
              {analysis.trends.usage}
            </div>
          </div>
          <div class="p-2 rounded bg-surface-100-800-token">
            <div class="text-xs opacity-75 mb-1">Efficiency</div>
            <div class="text-sm font-medium capitalize">
              {analysis.trends.efficiency === 'optimized' ? '✅' : analysis.trends.efficiency === 'needs-attention' ? '⚠️' : '➖'}
              {analysis.trends.efficiency}
            </div>
          </div>
        </div>
      {/if}

      <!-- Top Recommendations -->
      {#if analysis.recommendations.length > 0}
        <div class="space-y-2">
          <h4 class="h6 text-secondary-500">🎯 Top Recommendations</h4>
          <div class="space-y-2">
            {#each analysis.recommendations.slice(0, 3) as recommendation, i}
              <div class="flex items-start gap-2 p-2 rounded bg-surface-50-900-token text-sm">
                <span class="text-secondary-500 font-bold">{i + 1}.</span>
                <span class="flex-1">{recommendation}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Critical & High Priority Insights -->
      {#if insights.filter(i => i.severity === 'critical' || i.severity === 'high').length > 0}
        <div class="space-y-3">
          <h4 class="h6 text-error-500">⚠️ Priority Insights</h4>
          {#each insights.filter(i => i.severity === 'critical' || i.severity === 'high') as insight (insight.id)}
            <div class="card variant-soft-{getSeverityColor(insight.severity)} p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-2 flex-1">
                  <span class="text-lg">{getTypeIcon(insight.type)}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h5 class="text-sm font-medium">{insight.title}</h5>
                      <span class="badge variant-soft-{getSeverityColor(insight.severity)} text-xs">
                        {insight.severity}
                      </span>
                    </div>
                    <p class="text-xs opacity-75 mb-2">{insight.description}</p>
                    {#if expandedInsights.has(insight.id)}
                      <div class="p-2 rounded bg-surface-100-800-token text-xs space-y-2">
                        <div><strong>Recommendation:</strong> {insight.recommendation}</div>
                        <div class="flex items-center justify-between">
                          <span><strong>Confidence:</strong> {insight.confidence}%</span>
                          <span class="opacity-50">{formatTimestamp(insight.timestamp)}</span>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
                <button 
                  class="btn btn-sm variant-ghost-surface p-1"
                  on:click={() => toggleInsightExpansion(insight.id)}
                >
                  {expandedInsights.has(insight.id) ? '▼' : '▶'}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- All Insights by Type (Collapsible) -->
      {#if Object.keys(insightsByType).length > 0}
        <div class="space-y-3">
          <h4 class="h6 text-tertiary-500">📊 Detailed Analysis</h4>
          {#each Object.entries(insightsByType) as [type, typeInsights]}
            <details class="group">
              <summary class="cursor-pointer p-2 rounded bg-surface-100-800-token flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span>{getTypeIcon(type)}</span>
                  <span class="text-sm font-medium capitalize">{type}</span>
                  <span class="badge variant-soft-tertiary text-xs">{typeInsights.length}</span>
                </div>
                <span class="group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div class="mt-2 space-y-2">
                {#each typeInsights as insight (insight.id)}
                  <div class="p-2 rounded bg-surface-50-900-token border-l-2 border-{getSeverityColor(insight.severity)}-500">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs">{getSeverityIcon(insight.severity)}</span>
                      <span class="text-sm font-medium">{insight.title}</span>
                      <span class="text-xs opacity-50">{insight.confidence}%</span>
                    </div>
                    <p class="text-xs opacity-75">{insight.description}</p>
                  </div>
                {/each}
              </div>
            </details>
          {/each}
        </div>
      {/if}

      <!-- Stats Footer -->
      <div class="text-center pt-4 border-t border-surface-300-600-token">
        <div class="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div class="font-medium">{insights.length}</div>
            <div class="opacity-50">Total Insights</div>
          </div>
          <div>
            <div class="font-medium">{actionableInsights.length}</div>
            <div class="opacity-50">Actionable</div>
          </div>
          <div>
            <div class="font-medium">{analysis.overallScore}/100</div>
            <div class="opacity-50">Health Score</div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- No Data State -->
    <div class="text-center py-8">
      <div class="text-4xl mb-4">🤖</div>
      <p class="text-surface-600-300-token text-sm">No system data available for AI analysis</p>
      <p class="text-xs opacity-50 mt-2">Connect system monitoring to enable insights</p>
    </div>
  {/if}
</div>

<style>
  details > summary {
    list-style: none;
  }
  
  details > summary::-webkit-details-marker {
    display: none;
  }
</style>