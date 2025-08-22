<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: any;
  export let userRole: string;
  export let immersionLevel: 'basic' | 'enhanced' | 'production';

  let container: HTMLDivElement;
  let svg: any;

  onMount(() => {
    initializeVisualization();
  });

  $: if (data && svg) {
    updateVisualization();
  }

  function initializeVisualization() {
    const width = container.clientWidth;
    const height = 300;

    svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('border-radius', '8px')
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    // Create groups for different elements
    svg.append('g').attr('class', 'connections');
    svg.append('g').attr('class', 'objects');
    svg.append('g').attr('class', 'labels');

    updateVisualization();
  }

  function updateVisualization() {
    if (!svg) return;

    const width = container.clientWidth;
    const height = 300;

    // Sample SAFe visualization data based on role
    const visualizationData = getVisualizationData();

    // Clear previous content
    svg.selectAll('.connections > *').remove();
    svg.selectAll('.objects > *').remove();
    svg.selectAll('.labels > *').remove();

    // Draw connections (dependencies)
    if (visualizationData.connections) {
      svg.select('.connections')
        .selectAll('line')
        .data(visualizationData.connections)
        .enter()
        .append('line')
        .attr('x1', d => d.from.x)
        .attr('y1', d => d.from.y)
        .attr('x2', d => d.to.x)
        .attr('y2', d => d.to.y)
        .attr('stroke', d => getConnectionColor(d.status))
        .attr('stroke-width', d => Math.max(1, d.strength * 3))
        .attr('opacity', 0.7)
        .style('stroke-dasharray', d => d.status === 'at_risk' ? '5,5' : 'none');
    }

    // Draw objects (teams, epics, etc.)
    if (visualizationData.objects) {
      const objects = svg.select('.objects')
        .selectAll('circle')
        .data(visualizationData.objects)
        .enter()
        .append('circle')
        .attr('cx', d => d.position.x)
        .attr('cy', d => d.position.y)
        .attr('r', d => d.size)
        .attr('fill', d => getObjectColor(d.type, d.health))
        .attr('opacity', 0.8)
        .style('cursor', 'pointer');

      // Add hover effects
      objects
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d.size * 1.2)
            .attr('opacity', 1);
          
          showTooltip(event, d);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d.size)
            .attr('opacity', 0.8);
          
          hideTooltip();
        });

      // Add labels
      svg.select('.labels')
        .selectAll('text')
        .data(visualizationData.objects)
        .enter()
        .append('text')
        .attr('x', d => d.position.x)
        .attr('y', d => d.position.y + d.size + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e2e8f0')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(d => d.label);
    }

    // Add animation for production level
    if (immersionLevel === 'production') {
      objects?.transition()
        .duration(1000)
        .ease(d3.easeElastic)
        .attr('r', d => d.size);
    }
  }

  function getVisualizationData() {
    const baseData = {
      objects: [],
      connections: []
    };

    // Role-specific visualization data
    switch (userRole) {
      case 'team_member':
        return {
          objects: [
            { 
              id: 'team', 
              type: 'team_planet', 
              position: { x: 150, y: 150 }, 
              size: 25, 
              health: 0.85, 
              label: 'My Team' 
            },
            { 
              id: 'story1', 
              type: 'story_satellite', 
              position: { x: 100, y: 100 }, 
              size: 12, 
              health: 0.7, 
              label: 'Story 1' 
            },
            { 
              id: 'story2', 
              type: 'story_satellite', 
              position: { x: 200, y: 100 }, 
              size: 15, 
              health: 0.9, 
              label: 'Story 2' 
            }
          ],
          connections: [
            { 
              from: { x: 150, y: 150 }, 
              to: { x: 100, y: 100 }, 
              strength: 0.8, 
              status: 'healthy' 
            },
            { 
              from: { x: 150, y: 150 }, 
              to: { x: 200, y: 100 }, 
              strength: 0.6, 
              status: 'at_risk' 
            }
          ]
        };

      case 'scrum_master':
        return {
          objects: [
            { 
              id: 'team', 
              type: 'team_planet', 
              position: { x: 150, y: 150 }, 
              size: 30, 
              health: 0.85, 
              label: 'Team Alpha' 
            },
            { 
              id: 'velocity', 
              type: 'metric_star', 
              position: { x: 80, y: 80 }, 
              size: 18, 
              health: 0.9, 
              label: 'Velocity' 
            },
            { 
              id: 'quality', 
              type: 'metric_star', 
              position: { x: 220, y: 80 }, 
              size: 20, 
              health: 0.75, 
              label: 'Quality' 
            },
            { 
              id: 'impediment', 
              type: 'blocker', 
              position: { x: 150, y: 220 }, 
              size: 15, 
              health: 0.3, 
              label: 'Impediment' 
            }
          ],
          connections: [
            { from: { x: 150, y: 150 }, to: { x: 80, y: 80 }, strength: 0.9, status: 'healthy' },
            { from: { x: 150, y: 150 }, to: { x: 220, y: 80 }, strength: 0.7, status: 'healthy' },
            { from: { x: 150, y: 150 }, to: { x: 150, y: 220 }, strength: 0.4, status: 'blocked' }
          ]
        };

      case 'rte':
        return {
          objects: [
            { 
              id: 'art', 
              type: 'art_constellation', 
              position: { x: 150, y: 150 }, 
              size: 35, 
              health: 0.82, 
              label: 'ART Platform' 
            },
            { 
              id: 'team1', 
              type: 'team_planet', 
              position: { x: 80, y: 100 }, 
              size: 20, 
              health: 0.85, 
              label: 'Team A' 
            },
            { 
              id: 'team2', 
              type: 'team_planet', 
              position: { x: 220, y: 100 }, 
              size: 22, 
              health: 0.78, 
              label: 'Team B' 
            },
            { 
              id: 'team3', 
              type: 'team_planet', 
              position: { x: 80, y: 200 }, 
              size: 18, 
              health: 0.90, 
              label: 'Team C' 
            },
            { 
              id: 'team4', 
              type: 'team_planet', 
              position: { x: 220, y: 200 }, 
              size: 25, 
              health: 0.73, 
              label: 'Team D' 
            }
          ],
          connections: [
            { from: { x: 150, y: 150 }, to: { x: 80, y: 100 }, strength: 0.8, status: 'healthy' },
            { from: { x: 150, y: 150 }, to: { x: 220, y: 100 }, strength: 0.7, status: 'healthy' },
            { from: { x: 150, y: 150 }, to: { x: 80, y: 200 }, strength: 0.9, status: 'optimal' },
            { from: { x: 150, y: 150 }, to: { x: 220, y: 200 }, strength: 0.6, status: 'at_risk' },
            { from: { x: 80, y: 100 }, to: { x: 220, y: 100 }, strength: 0.5, status: 'at_risk' }
          ]
        };

      default:
        return baseData;
    }
  }

  function getObjectColor(type: string, health: number) {
    const healthGradient = d3.interpolateRgb('#ef4444', '#22c55e')(health);
    
    const typeColors = {
      team_planet: '#3b82f6',
      story_satellite: '#8b5cf6',
      epic_satellite: '#f59e0b',
      metric_star: '#10b981',
      art_constellation: '#6366f1',
      blocker: '#ef4444'
    };

    const baseColor = typeColors[type] || '#64748b';
    return d3.interpolateRgb(baseColor, healthGradient)(0.7);
  }

  function getConnectionColor(status: string) {
    const statusColors = {
      healthy: '#22c55e',
      optimal: '#3b82f6',
      at_risk: '#f59e0b',
      blocked: '#ef4444'
    };
    return statusColors[status] || '#64748b';
  }

  function showTooltip(event: any, data: any) {
    // Simple tooltip implementation
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', '#e2e8f0')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('border', '1px solid #475569')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    tooltip.html(`
      <strong>${data.label}</strong><br/>
      Type: ${data.type.replace('_', ' ')}<br/>
      Health: ${(data.health * 100).toFixed(0)}%
    `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px');

    tooltip.transition()
      .duration(200)
      .style('opacity', 1);
  }

  function hideTooltip() {
    d3.selectAll('.tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();
  }
</script>

<div class="w-full h-full">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center space-x-2">
      <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
      <span class="text-sm font-medium text-slate-300">
        {immersionLevel === 'production' ? '3D Production View' : '2D Visualization'}
      </span>
    </div>
    <div class="text-xs text-slate-400">
      Last update: {data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'Loading...'}
    </div>
  </div>

  <div bind:this={container} class="w-full relative">
    <!-- SVG will be inserted here by D3 -->
  </div>

  <!-- Legend -->
  <div class="mt-4 flex flex-wrap gap-2 text-xs">
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 bg-green-400 rounded-full"></div>
      <span class="text-slate-400">Healthy</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
      <span class="text-slate-400">At Risk</span>
    </div>
    <div class="flex items-center space-x-1">
      <div class="w-2 h-2 bg-red-400 rounded-full"></div>
      <span class="text-slate-400">Blocked</span>
    </div>
  </div>
</div>

<style>
  :global(.tooltip) {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
</style>