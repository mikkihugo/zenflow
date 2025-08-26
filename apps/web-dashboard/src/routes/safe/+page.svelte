<script lang="ts">
const _safeRoles = [
	{
		role: "team_member",
		title: "Team Member",
		icon: "👨‍💻",
		description:
			"Individual contributor focused on technical excellence and collaboration",
		features: [
			"Personal skill tracking",
			"Story management",
			"Code quality metrics",
			"Team collaboration tools",
		],
	},
	{
		role: "scrum_master",
		title: "Scrum Master",
		icon: "🎯",
		description:
			"Team facilitator ensuring process excellence and impediment removal",
		features: [
			"Team health monitoring",
			"Impediment tracking",
			"Velocity optimization",
			"Retrospective facilitation",
		],
	},
	{
		role: "po",
		title: "Product Owner",
		icon: "🎨",
		description:
			"Product strategy leader maximizing value delivery to customers",
		features: [
			"Value stream mapping",
			"Backlog optimization",
			"Customer feedback",
			"Feature success tracking",
		],
	},
	{
		role: "rte",
		title: "RTE",
		icon: "🚀",
		description: "Release Train Engineer coordinating ART-level execution",
		features: [
			"ART coordination",
			"PI Planning facilitation",
			"Dependency management",
			"System demo orchestration",
		],
	},
	{
		role: "architect",
		title: "System Architect",
		icon: "🏗️",
		description:
			"Technical leader driving architecture evolution and enablement",
		features: [
			"Architecture governance",
			"Technical debt tracking",
			"Innovation enablement",
			"Architectural runway",
		],
	},
	{
		role: "business_owner",
		title: "Business Owner",
		icon: "💼",
		description:
			"Strategic leader optimizing portfolio investment and business outcomes",
		features: [
			"Portfolio management",
			"ROI optimization",
			"Business outcome tracking",
			"Investment decisions",
		],
	},
];

function _enterProductionDashboard(role: string) {
	window.location.href = `/safe-production?userRole=${role}&immersionLevel=production`;
}

function _enterEnhancedDashboard(role: string) {
	window.location.href = `/safe-production?userRole=${role}&immersionLevel=enhanced`;
}
</script>

<svelte:head>
  <title>SAFe Framework - claude-code-zen</title>
  <meta name="description" content="Complete SAFe 6.0 implementation with production-ready dashboards for all roles" />
</svelte:head>

<div style="min-height: 100vh; background: linear-gradient(135deg, #1e293b 0%, #1e3a8a 50%, #1e293b 100%); color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Hero Section -->
  <div style="padding: 5rem 1.5rem;">
    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
      <h1 style="font-size: 3rem; font-weight: bold; background: linear-gradient(to right, #60a5fa, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1.5rem;">
        SAFe 6.0 Production Platform
      </h1>
      <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2rem; max-width: 48rem; margin-left: auto; margin-right: auto;">
        Complete Scaled Agile Framework implementation with AI-powered coaching, 
        real-time collaboration, and production-grade observability
      </p>
      
      <!-- Key Features -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
        <div style="padding: 1rem; background: rgba(51, 65, 85, 0.3); border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧠</div>
          <h3 style="font-weight: 600; color: #60a5fa;">AI Coaching</h3>
          <p style="font-size: 0.875rem; color: #94a3b8;">Personalized guidance for every role</p>
        </div>
        <div style="padding: 1rem; background: rgba(51, 65, 85, 0.3); border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
          <h3 style="font-weight: 600; color: #22c55e;">Real-time Analytics</h3>
          <p style="font-size: 0.875rem; color: #94a3b8;">Live performance metrics & predictions</p>
        </div>
        <div style="padding: 1rem; background: rgba(51, 65, 85, 0.3); border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
          <h3 style="font-weight: 600; color: #a855f7;">Gamification</h3>
          <p style="font-size: 0.875rem; color: #94a3b8;">Achievement system & skill progression</p>
        </div>
        <div style="padding: 1rem; background: rgba(51, 65, 85, 0.3); border-radius: 0.5rem; border: 1px solid rgba(51, 65, 85, 0.5);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔗</div>
          <h3 style="font-weight: 600; color: #eab308;">Tool Integration</h3>
          <p style="font-size: 0.875rem; color: #94a3b8;">Seamless ecosystem connectivity</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Role Selection -->
  <div style="padding: 0 1.5rem 5rem;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 3rem;">Choose Your SAFe Role</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
        {#each safeRoles as roleData}
          <div style="background: rgba(51, 65, 85, 0.3); backdrop-filter: blur(8px); border-radius: 1rem; border: 1px solid rgba(51, 65, 85, 0.5); padding: 1.5rem; transition: all 0.3s ease;" 
               on:mouseenter={e => e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)'}
               on:mouseleave={e => e.target.style.borderColor = 'rgba(51, 65, 85, 0.5)'}>
            <!-- Role Header -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <div style="font-size: 2rem;">{roleData.icon}</div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: bold; color: #e2e8f0;">{roleData.title}</h3>
                <p style="font-size: 0.875rem; color: #94a3b8; text-transform: capitalize;">{roleData.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            <!-- Description -->
            <p style="color: #cbd5e1; margin-bottom: 1rem; line-height: 1.6;">{roleData.description}</p>
            
            <!-- Features -->
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.875rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.5rem;">Key Features:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                {#each roleData.features as feature}
                  <li style="font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <div style="width: 4px; height: 4px; background: #60a5fa; border-radius: 50%;"></div>
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <button 
                style="width: 100%; padding: 0.5rem 1rem; background: linear-gradient(to right, #2563eb, #7c3aed); border: none; border-radius: 0.5rem; color: white; font-weight: 500; cursor: pointer; transition: all 0.2s ease;"
                on:click={() => enterProductionDashboard(roleData.role)}
                on:mouseenter={e => e.target.style.background = 'linear-gradient(to right, #1d4ed8, #6d28d9)'}
                on:mouseleave={e => e.target.style.background = 'linear-gradient(to right, #2563eb, #7c3aed)'}
              >
                🚀 Production Dashboard
              </button>
              <button 
                style="width: 100%; padding: 0.5rem 1rem; background: rgba(51, 65, 85, 0.5); border: 1px solid #475569; border-radius: 0.5rem; color: #cbd5e1; font-weight: 500; cursor: pointer; transition: all 0.2s ease;"
                on:click={() => enterEnhancedDashboard(roleData.role)}
                on:mouseenter={e => e.target.style.background = 'rgba(71, 85, 105, 0.5)'}
                on:mouseleave={e => e.target.style.background = 'rgba(51, 65, 85, 0.5)'}
              >
                ⚡ Enhanced View
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- SAFe Coverage Status -->
  <div style="padding: 0 1.5rem 5rem;">
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="background: rgba(51, 65, 85, 0.3); backdrop-filter: blur(8px); border-radius: 1rem; border: 1px solid rgba(51, 65, 85, 0.5); padding: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 2rem;">Essential SAFe 6.0 Implementation Status</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
          <!-- Completed Features -->
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #22c55e; margin-bottom: 1rem;">✅ Production Ready</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>TaskMaster Universal Approval Gates</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>Vision Management Service</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>PI Planning Coordination</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>ART Sync & System Demo</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>Inspect & Adapt Facilitation</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>Core Competency Frameworks</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>Brain-Powered Intelligence</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
                <span>Production Observability</span>
              </li>
            </ul>
          </div>
          
          <!-- Upcoming Features -->
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #60a5fa; margin-bottom: 1rem;">🚧 Enhanced Features</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #60a5fa; border-radius: 50%;"></div>
                <span>Advanced 3D Visualizations</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #60a5fa; border-radius: 50%;"></div>
                <span>Cross-ART Dependency Management</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #60a5fa; border-radius: 50%;"></div>
                <span>Portfolio Kanban Integration</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #60a5fa; border-radius: 50%;"></div>
                <span>Solution Train Coordination</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #eab308; border-radius: 50%;"></div>
                <span>Large Solution SAFe</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #eab308; border-radius: 50%;"></div>
                <span>Portfolio SAFe</span>
              </li>
              <li style="font-size: 0.875rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="width: 8px; height: 8px; background: #eab308; border-radius: 50%;"></div>
                <span>Full SAFe Enterprise</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div style="margin-top: 2rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-size: 0.875rem; font-weight: 500; color: #cbd5e1;">Essential SAFe 6.0 Coverage</span>
            <span style="font-size: 0.875rem; color: #22c55e; font-weight: 600;">85%</span>
          </div>
          <div style="width: 100%; background: #475569; border-radius: 9999px; height: 8px;">
            <div style="background: linear-gradient(to right, #22c55e, #60a5fa); height: 8px; border-radius: 9999px; width: 85%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>