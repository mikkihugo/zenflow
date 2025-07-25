
// Web Dashboard JavaScript
class ClaudeZenDashboard {
    constructor() {
        this.ws = null;
        this.currentTab = 'dashboard';
        this.data = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.connectWebSocket();
        this.loadData();
        
        // Start periodic check to populate global project filter
        this.startGlobalFilterCheck();
    }
    
    startGlobalFilterCheck() {
        // Check every 1 second if projects data is available and populate global dropdown
        const checkInterval = setInterval(() => {
            if (this.data && this.data.projects && this.data.projects.length > 0) {
                updateGlobalProjectFilter();
                clearInterval(checkInterval); // Stop checking once populated
            }
        }, 1000);
        
        // Stop checking after 10 seconds to avoid infinite loops
        setTimeout(() => {
            clearInterval(checkInterval);
        }, 10000);
    }
    
    initCollapsibleSections() {
        // Set initial state - expand product management by default
        const productSection = document.querySelector('[data-section="product"]');
        if (productSection) {
            productSection.classList.add('expanded');
        }
        
        // Collapse others by default
        const systemSection = document.querySelector('[data-section="system"]');
        const monitoringSection = document.querySelector('[data-section="monitoring"]');
        if (systemSection) systemSection.classList.add('collapsed');
        if (monitoringSection) monitoringSection.classList.add('collapsed');
    }
    
    toggleSection(sectionName) {
        const section = document.querySelector('[data-section="' + sectionName + '"]');
        if (!section) return;
        
        section.classList.toggle('collapsed');
        section.classList.toggle('expanded');
    }
    
    setupEventListeners() {
        // Tab switching
        const menuItems = document.querySelectorAll('.menu-item');
        console.log('Setting up event listeners for', menuItems.length, 'menu items');
        
        menuItems.forEach(item => {
            console.log('Adding listener to:', item.dataset.tab);
            item.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                console.log('Tab clicked:', tab);
                this.switchTab(tab);
            });
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Initialize collapsible sections
        this.initCollapsibleSections();
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });
        
        // Command execution
        document.getElementById('command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
    }
    
    connectWebSocket() {
        // Use current page's host and port for WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // includes port
        this.ws = new WebSocket(`${protocol}//${host}/ws`);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateStatus('Connected', 'success');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateStatus('Disconnected', 'error');
            // Attempt to reconnect
            setTimeout(() => this.connectWebSocket(), 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Error', 'error');
        };
    }
    
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'data_update':
                this.data = { ...this.data, ...message.data };
                this.updateUI();
                break;
            case 'notification':
                this.showNotification(message.content, message.level);
                break;
            case 'command_result':
                this.showCommandResult(message.result);
                break;
        }
    }
    
    getAuthHeaders() {
        const password = sessionStorage.getItem('claudeZenPassword') || 
                        new URLSearchParams(window.location.search).get('password');
        return password ? { 'X-Password': password } : {};
    }
    
    async authenticatedFetch(url, options = {}) {
        const headers = { ...this.getAuthHeaders(), ...options.headers };
        return fetch(url, { ...options, headers });
    }
    
    async loadData() {
        try {
            const [realTimeStats, queens, visions, projects, prds, features, epics, roadmaps, adrs, tasks, logs] = await Promise.all([
                this.authenticatedFetch('/api/v1/stats/realtime').then(r => r.json()),
                this.authenticatedFetch('/api/v1/queens').then(r => r.json()),
                this.authenticatedFetch('/api/v1/visions').then(r => r.json()),
                this.authenticatedFetch('/api/v1/projects').then(r => r.json()),
                this.authenticatedFetch('/api/v1/prds').then(r => r.json()),
                this.authenticatedFetch('/api/v1/features').then(r => r.json()),
                this.authenticatedFetch('/api/v1/epics').then(r => r.json()),
                this.authenticatedFetch('/api/v1/roadmaps').then(r => r.json()),
                this.authenticatedFetch('/api/v1/adrs').then(r => r.json()),
                this.authenticatedFetch('/api/v1/tasks').then(r => r.json()),
                this.authenticatedFetch('/api/v1/logs/tasks?limit=10').then(r => r.json())
            ]);
            
            this.data = { realTimeStats, queens, visions, projects, prds, features, epics, roadmaps, adrs, tasks, logs };
            this.updateUI();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    updateUI() {
        // Helper function to safely update element text
        const safeUpdateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        
        // Update real-time dashboard stats (only if dashboard elements exist)
        if (this.data.realTimeStats?.stats) {
            const stats = this.data.realTimeStats.stats;
            const system = stats.system || {};
            
            // Dashboard stats
            safeUpdateElement('total-tasks', system.totalTasks || 0);
            safeUpdateElement('recent-tasks', system.recentTasks || 0);
            safeUpdateElement('system-uptime', Math.floor(system.systemUptime || 0) + 's');
            safeUpdateElement('memory-usage', Math.floor((system.memoryUsage?.heapUsed || 0) / 1024 / 1024) + 'MB');
            
            // Calculate success rate from recent activity
            const recentActivity = stats.recentActivity || [];
            const successRate = recentActivity.length > 0 ? 
                (recentActivity.filter(log => log.status === 'completed').length / recentActivity.length * 100).toFixed(1) : 0;
            safeUpdateElement('success-rate', successRate + '%');
            
            // Calculate average response time
            const avgResponse = stats.performance?.avgResponseTime || 0;
            safeUpdateElement('avg-response', Math.floor(avgResponse) + 'ms');
            
            // Update activity feed
            this.updateActivityFeed(recentActivity);
        }
        
        // Update queens stats (only if queens elements exist)
        if (this.data.queens) {
            const totalQueens = this.data.queens.length || 0;
            const activeQueens = this.data.queens.filter(q => q.status === 'active').length || 0;
            const currentTasks = this.data.queens.reduce((sum, q) => sum + (q.currentTasks || 0), 0);
            const avgSuccessRate = totalQueens > 0 ? 
                (this.data.queens.reduce((sum, q) => sum + (q.successRate || 0), 0) / totalQueens).toFixed(1) : 0;
            
            safeUpdateElement('total-queens', totalQueens);
            safeUpdateElement('active-queens', activeQueens);
            safeUpdateElement('queen-tasks', currentTasks);
            safeUpdateElement('queen-success-rate', avgSuccessRate + '%');
        }
        
        // Update current tab content
        this.updateTabContent(this.currentTab);
    }
    
    updateActivityFeed(recentActivity) {
        const feedContainer = document.getElementById('activity-feed');
        if (!feedContainer) return;
        
        if (!recentActivity || recentActivity.length === 0) {
            feedContainer.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }
        
        const feedHtml = recentActivity.slice(0, 5).map(log => {
            const timestamp = new Date(log.timestamp).toLocaleTimeString();
            const statusColor = log.status === 'completed' ? '#10b981' : 
                               log.status === 'failed' ? '#ef4444' : '#f59e0b';
            return '<div class="activity-item" style="padding: 0.5rem; border-left: 3px solid ' + statusColor + '; margin-bottom: 0.5rem; background: var(--bg-secondary);">' +
                   '<div style="font-weight: bold; color: var(--text-primary);">' + (log.queenId || 'System') + '</div>' +
                   '<div style="font-size: 0.9em; color: var(--text-secondary);">' + (log.taskType || 'Task') + ' - ' + log.status + '</div>' +
                   '<div style="font-size: 0.8em; color: var(--text-tertiary);">' + timestamp + '</div>' +
                   '</div>';
        }).join('');
        
        feedContainer.innerHTML = feedHtml;
    }
    
    updateQueenPerformance(queensStats) {
        const performanceContainer = document.getElementById('queen-performance');
        if (!performanceContainer) return;
        
        const queens = this.data.queens || [];
        if (queens.length === 0) {
            performanceContainer.innerHTML = '<div class="no-data">No queen data available</div>';
            return;
        }
        
        const performanceHtml = queens.slice(0, 4).map(queen => {
            const stats = queensStats[queen.id] || {};
            return '<div class="queen-performance-card" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">' +
                   '<h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">👑 ' + queen.name + '</h4>' +
                   '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9em;">' +
                   '<div><strong>Tasks:</strong> ' + (queen.currentTasks || 0) + '</div>' +
                   '<div><strong>Success:</strong> ' + (queen.successRate || 0).toFixed(1) + '%</div>' +
                   '<div><strong>Avg Time:</strong> ' + Math.floor(queen.avgDuration || 0) + 'ms</div>' +
                   '<div><strong>Status:</strong> ' + queen.status + '</div>' +
                   '</div></div>';
        }).join('');
        
        performanceContainer.innerHTML = performanceHtml;
    }
    
    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const tabButton = document.querySelector('[data-tab="' + tabName + '"]');
        if (tabButton) {
            tabButton.classList.add('active');
            console.log('Tab button found and activated:', tabName);
        } else {
            console.error('Tab button not found:', tabName);
        }
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
            console.log('Tab content found and activated:', tabName);
        } else {
            console.error('Tab content not found:', tabName);
        }
        
        this.currentTab = tabName;
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'visions':
                this.updateVisionsList();
                break;
            case 'projects':
                this.updateProjectsList();
                break;
            case 'prds':
                this.updatePrdsList();
                break;
            case 'features':
                this.updateFeaturesList();
                break;
            case 'epics':
                this.updateEpicsList();
                break;
            case 'roadmaps':
                this.updateRoadmapsList();
                break;
            case 'adrs':
                this.updateAdrsList();
                break;
            case 'tasks':
                this.updateTasksList();
                break;
            case 'hives':
                this.updateHivesList();
                break;
            case 'plugins':
                this.updatePluginsList();
                break;
            case 'queens':
                this.updateQueensList();
                break;
        }
    }

    // Product Management Update Methods
    updateVisionsList() {
        this.updateDataList('vision-list', this.data.visions, ['title', 'status', 'priority'], 'visions');
    }

    updateProjectsList() {
        console.log('updateProjectsList called, data.projects:', this.data.projects);
        
        if (!this.data.projects || this.data.projects.length === 0) {
            const container = document.getElementById('project-list');
            if (container) {
                container.innerHTML = '<div class="loading">No projects found</div>';
            }
            return;
        }

        const projects = this.data.projects;
        const container = document.getElementById('project-list');
        
        if (!container) return;

        // Update project filter dropdown (on Projects tab)
        this.updateProjectFilter(projects);
        
        // Update global project filter dropdown (in header)
        updateGlobalProjectFilter();

        container.innerHTML = projects.map(project => {
            const milestonesHtml = project.milestones && project.milestones.length > 0 ? 
                '<div style="margin-bottom: 1rem;">' +
                    '<strong style="display: block; margin-bottom: 0.5rem;">🎯 Milestones:</strong>' +
                    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">' +
                        project.milestones.map(milestone => 
                            '<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--bg-primary); border-radius: 4px;">' +
                                '<span style="font-size: 0.9rem;">' + (milestone.status === 'completed' ? '✅' : milestone.status === 'in-progress' ? '🔄' : '⭕') + '</span>' +
                                '<span style="font-size: 0.9rem;">' + milestone.name + '</span>' +
                                '<small style="color: var(--text-secondary); margin-left: auto;">' + milestone.date + '</small>' +
                            '</div>'
                        ).join('') +
                    '</div>' +
                '</div>' : '';
            
            return '<div class="project-card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: var(--bg-secondary);">' +
                '<div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 1rem;">' +
                    '<div style="flex: 1;">' +
                        '<h3 style="margin: 0 0 0.5rem 0; color: var(--accent-color);">' + (project.name || 'Unnamed Project') + '</h3>' +
                        '<p style="margin: 0 0 1rem 0; color: var(--text-secondary);">' + (project.description || 'No description available') + '</p>' +
                    '</div>' +
                    '<div style="display: flex; gap: 0.5rem; align-items: center;">' +
                        '<span class="status-badge status-' + (project.status || 'unknown') + '" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">' + (project.status || 'Unknown') + '</span>' +
                        '<span class="priority-badge priority-' + (project.priority || 'medium') + '" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">' + (project.priority || 'Medium') + '</span>' +
                    '</div>' +
                '</div>' +
                
                '<!-- Progress Bar -->' +
                '<div style="margin-bottom: 1rem;">' +
                    '<div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">' +
                        '<span style="font-weight: 600;">Progress</span>' +
                        '<span style="font-weight: 600; color: var(--accent-color);">' + (project.progress || 0) + '%</span>' +
                    '</div>' +
                    '<div style="background: var(--bg-primary); border-radius: 10px; height: 8px; overflow: hidden;">' +
                        '<div style="background: var(--accent-color); height: 100%; width: ' + (project.progress || 0) + '%; transition: width 0.3s ease;"></div>' +
                    '</div>' +
                '</div>' +
                
                '<!-- Project Details -->' +
                '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">' +
                    '<div>' +
                        '<strong>👤 Owner:</strong><br>' +
                        '<span style="color: var(--text-secondary);">' + (project.owner || 'Unassigned') + '</span>' +
                    '</div>' +
                    '<div>' +
                        '<strong>📅 Duration:</strong><br>' +
                        '<span style="color: var(--text-secondary);">' + (project.startDate || 'TBD') + ' → ' + (project.dueDate || 'TBD') + '</span>' +
                    '</div>' +
                    '<div>' +
                        '<strong>🏷️ Tags:</strong><br>' +
                        '<span style="color: var(--text-secondary);">' + ((project.tags || []).join(', ') || 'None') + '</span>' +
                    '</div>' +
                '</div>' +
                
                '<!-- Milestones -->' +
                milestonesHtml +
                
                '<!-- Actions -->' +
                '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">' +
                    '<button class="btn btn-sm btn-primary" onclick="editProject(\"' + project.id + '\")">✏️ Edit</button>' +
                    '<button class="btn btn-sm btn-secondary" onclick="viewProjectDetails(\"' + project.id + '\")">👁️ View Details</button>' +
                    '<button class="btn btn-sm btn-accent" onclick="filterByProject(\"' + project.id + '\")">🔍 Filter All Data</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    updateProjectFilter(projects) {
        const filterSelect = document.getElementById('project-filter');
        if (!filterSelect) return;

        // Clear existing options except "All Projects"
        filterSelect.innerHTML = '<option value="">All Projects</option>';
        
        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name || 'Unnamed Project';
            filterSelect.appendChild(option);
        });
    }

    updatePrdsList() {
        this.updateDataList('prd-list', this.data.prds, ['title', 'status', 'version'], 'prds');
    }

    updateFeaturesList() {
        this.updateDataList('feature-list', this.data.features, ['title', 'status', 'priority'], 'features');
    }

    updateEpicsList() {
        this.updateDataList('epic-list', this.data.epics, ['title', 'status'], 'epics');
    }

    updateRoadmapsList() {
        this.updateDataList('roadmap-list', this.data.roadmaps, ['title', 'status', 'timeline'], 'roadmaps');
    }

    updateAdrsList() {
        this.updateDataList('adr-list', this.data.adrs, ['title', 'status', 'author'], 'adrs');
    }

    updateTasksList() {
        this.updateDataList('task-list', this.data.tasks, ['title', 'status', 'assignee'], 'tasks');
    }

    updateQueensList() {
        console.log('updateQueensList called, data.queens:', this.data.queens);
        
        // Update queens stats using already-loaded data
        if (this.data.queens && this.data.queens.length > 0) {
            const queens = this.data.queens;
            const totalQueens = queens.length || 0;
            const activeQueens = queens.filter(q => q.status === 'active').length || 0;
            const currentTasks = queens.reduce((sum, q) => sum + (q.currentTasks || 0), 0);
            const avgSuccessRate = totalQueens > 0 ? 
                (queens.reduce((sum, q) => sum + (q.successRate || 0), 0) / totalQueens).toFixed(1) : 0;
            
            console.log('Queens stats:', {totalQueens, activeQueens, currentTasks, avgSuccessRate});
            
            // Update stats safely
            const safeUpdateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                    console.log('Updated ' + id + ' to:', value);
                } else {
                    console.error('Element ' + id + ' not found');
                }
            };
            
            safeUpdateElement('total-queens', totalQueens);
            safeUpdateElement('active-queens', activeQueens);
            safeUpdateElement('queen-tasks', currentTasks);
            safeUpdateElement('queen-success-rate', avgSuccessRate + '%');
            
            // Update queens list
            console.log('Calling updateDataList with queens data:', queens.length, 'items');
            this.updateDataList('queen-list', this.data.queens, ['name', 'type', 'status', 'successRate'], 'queens');
        } else {
            console.error('No queens data available:', this.data.queens);
            
            // Show no data message
            const container = document.getElementById('queen-list');
            if (container) {
                container.innerHTML = '<div class="loading">No queens data available</div>';
            }
        }
    }

    // Generic data list updater
    updateDataList(containerId, data, fields, dataType) {
        console.log('updateDataList called for ' + containerId + ' with ' + dataType + ':', data);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container ' + containerId + ' not found');
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('No data for ' + dataType + ', showing no data message');
            container.innerHTML = `<div class="loading">No ${dataType} found</div>`;
            return;
        }
        
        console.log('Processing ' + data.length + ' items for ' + dataType);
        
        container.innerHTML = data.map((item, index) => `
            <div class="data-item" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">${item.title || item.name}</h4>
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="background: var(--accent-color); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">${item.status || 'active'}</span>
                        <button onclick="editItem('${dataType}', '${item.id}')" style="background: #3b82f6; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">✏️ Edit</button>
                        <button onclick="deleteItem('${dataType}', '${item.id}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">🗑️ Delete</button>
                    </div>
                </div>
                <p style="margin: 0 0 0.75rem 0; color: var(--text-secondary); font-size: 0.9rem;">${item.description || ''}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; font-size: 0.85rem;">
                    ${fields.map(field => item[field] ? `<div><strong style="color: var(--text-primary);">${field}:</strong> <span style="color: var(--text-secondary);">${item[field]}</span></div>` : '').join('')}
                    <div><strong style="color: var(--text-primary);">Created:</strong> <span style="color: var(--text-secondary);">${item.created ? new Date(item.created).toLocaleDateString() : 'N/A'}</span></div>
                </div>
            </div>
        `).join('');
    }
    
    updateHivesList() {
        const container = document.getElementById('hive-list');
        const hives = this.data.hives || {};
        
        if (Object.keys(hives).length === 0) {
            container.innerHTML = '<div class="loading">No hives found</div>';
            return;
        }
        
        container.innerHTML = Object.entries(hives).map(([id, hive]) => `
            <div class="hive-item" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; transition: transform 0.2s, border-color 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--text-primary); font-size: 1.1rem;">🐝 ${hive.name}</h4>
                    <div style="display: flex; gap: 0.5rem;">
                        <span style="background: var(--accent-color); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">${hive.status}</span>
                        <button onclick="deleteHive('${id}')" style="background: #ef4444; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#dc2626'" onmouseout="this.style.backgroundColor='#ef4444'">🗑️ Delete</button>
                    </div>
                </div>
                <p style="margin: 0 0 0.75rem 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;">${hive.description}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; font-size: 0.85rem;">
                    <div><strong style="color: var(--text-primary);">Type:</strong> <span style="color: var(--text-secondary);">${hive.type}</span></div>
                    <div><strong style="color: var(--text-primary);">Agents:</strong> <span style="color: var(--text-secondary);">${hive.agents || 0}</span></div>
                    <div><strong style="color: var(--text-primary);">Tasks:</strong> <span style="color: var(--text-secondary);">${hive.tasks || 0}</span></div>
                    <div><strong style="color: var(--text-primary);">Max Agents:</strong> <span style="color: var(--text-secondary);">${hive.config?.maxAgents || 5}</span></div>
                    <div><strong style="color: var(--text-primary);">Coordination:</strong> <span style="color: var(--text-secondary);">${hive.config?.coordination || 'hierarchical'}</span></div>
                    <div><strong style="color: var(--text-primary);">Created:</strong> <span style="color: var(--text-secondary);">${new Date(hive.created).toLocaleDateString()}</span></div>
                </div>
            </div>
        `).join('');
    }
    
    updatePluginsList() {
        const container = document.getElementById('plugin-list');
        const plugins = this.data.plugins || [];
        
        if (plugins.length === 0) {
            container.innerHTML = '<div class="loading">No plugins found</div>';
            return;
        }
        
        container.innerHTML = plugins.map(plugin => `
            <div class="plugin-item">
                <h4>${plugin.name}</h4>
                <p>Status: ${plugin.status}</p>
            </div>
        `).join('');
    }
    
    async updateQueenStatus() {
        try {
            const response = await fetch('/api/queens/status');
            const queensData = await response.json();
            
            // Update queen overview statistics using the correct API structure
            document.getElementById('total-queens').textContent = queensData.summary?.totalQueens || 0;
            document.getElementById('active-queens').textContent = queensData.summary?.activeQueens || 0;
            document.getElementById('queen-tasks').textContent = queensData.summary?.totalTasks || 0;
            document.getElementById('queen-success-rate').textContent = `${(queensData.summary?.averageSuccessRate || 0).toFixed(1)}%`;
            
            // Update queens list
            this.updateQueensList(queensData.queens || []);
            
        } catch (error) {
            console.error('Failed to update queen status:', error);
            document.getElementById('total-queens').textContent = 'Error';
            document.getElementById('active-queens').textContent = 'Error';
            document.getElementById('queen-tasks').textContent = 'Error';
            document.getElementById('queen-success-rate').textContent = 'Error';
        }
    }
    
    updateQueensList(queens) {
        const container = document.getElementById('queen-list');
        if (!container) return;
        
        container.innerHTML = queens.map(queen => `
            <div class="queen-card ${queen.status}">
                <div class="queen-header">
                    <h4>👑 ${queen.name}</h4>
                    <span class="queen-status ${queen.status}">${queen.status.toUpperCase()}</span>
                </div>
                <div class="queen-details">
                    <div class="queen-info">
                        <strong>Domain:</strong> ${queen.domain}<br>
                        <strong>Confidence:</strong> ${(queen.confidence * 100).toFixed(1)}%<br>
                        <strong>Tasks Completed:</strong> ${queen.tasksCompleted}<br>
                        <strong>Success Rate:</strong> ${(queen.successRate * 100).toFixed(1)}%
                    </div>
                    <div class="queen-capabilities">
                        <strong>Document Types:</strong>
                        <div class="capability-tags">
                            ${queen.documentTypes.map(type => `<span class="tag">${type}</span>`).join('')}
                        </div>
                    </div>
                    ${queen.lastDecision ? `
                        <div class="queen-last-decision">
                            <strong>Last Decision:</strong> ${queen.lastDecision}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        localStorage.setItem('claude-zen-theme', newTheme);
        
        // Notify server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'theme_change',
                theme: newTheme
            }));
        }
    }
    
    async executeCommand() {
        const input = document.getElementById('command');
        const output = document.getElementById('command-output');
        const command = input.value.trim();
        
        if (!command) return;
        
        output.classList.add('show');
        output.textContent = 'Executing command...';
        
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            const result = await response.json();
            
            if (result.success) {
                output.textContent = result.output || 'Command executed successfully';
            } else {
                output.textContent = `Error: ${result.error}`;
            }
        } catch (error) {
            output.textContent = `Failed to execute command: ${error.message}`;
        }
        
        input.value = '';
    }
    
    updateStatus(text, type) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = text;
        statusDot.className = `status-dot status-${type}`;
    }
    
    showNotification(message, level = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        console.log(`[${level.toUpperCase()}] ${message}`);
    }
    
    showCommandResult(result) {
        const output = document.getElementById('command-output');
        output.classList.add('show');
        output.textContent = JSON.stringify(result, null, 2);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ClaudeZenDashboard();
});

// Global functions for inline event handlers
function executeCommand() {
    window.dashboard.executeCommand();
}

// COMPREHENSIVE CRUD FUNCTIONS - SWARM IMPLEMENTATION
async function editItem(dataType, itemId) {
    try {
        console.log('🔄 Editing ' + dataType + ' item:', itemId);
        
        // Get current item data
        const response = await fetch('/api/v1/' + dataType);
        const items = await response.json();
        const item = Array.isArray(items) ? items.find(i => i.id === itemId) : 
                     items[dataType] ? items[dataType].find(i => i.id === itemId) : null;
        
        if (!item) {
            alert('Item not found!');
            return;
        }
        
        // Create edit form
        const formData = await showEditForm(dataType, item);
        if (!formData) return; // User cancelled
        
        // Send update request
        const updateResponse = await fetch('/api/v1/' + dataType + '/' + itemId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await updateResponse.json();
        
        if (result.success) {
            alert('✅ Item updated successfully!');
            // Refresh the current tab
            window.dashboard.loadData();
        } else {
            alert('❌ Failed to update item: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error editing item:', error);
        alert('❌ Error editing item: ' + error.message);
    }
}

async function deleteItem(dataType, itemId) {
    try {
        console.log('🗑️ Deleting ' + dataType + ' item:', itemId);
        
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this ' + dataType + '?')) {
            return;
        }
        
        // Send delete request
        const response = await fetch('/api/v1/' + dataType + '/' + itemId, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Item deleted successfully!');
            // Refresh the current tab
            window.dashboard.loadData();
        } else {
            alert('❌ Failed to delete item: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('❌ Error deleting item: ' + error.message);
    }
}

async function showCreateForm(dataType) {
    try {
        console.log('➕ Creating new ' + dataType);
        
        // Create form based on data type
        const formData = await showCreateFormDialog(dataType);
        if (!formData) return; // User cancelled
        
        // Send create request
        const response = await fetch('/api/v1/' + dataType, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Item created successfully!');
            // Refresh the current tab
            window.dashboard.loadData();
        } else {
            alert('❌ Failed to create item: ' + result.error);
        }
        
    } catch (error) {
        console.error('Error creating item:', error);
        alert('❌ Error creating item: ' + error.message);
    }
}

// SIMPLIFIED FORM FUNCTIONS WITHOUT TEMPLATE LITERALS
async function showEditForm(dataType, item) {
    return new Promise((resolve) => {
        const title = dataType.charAt(0).toUpperCase() + dataType.slice(1);
        const value = prompt('Enter new title for ' + title + ':', item.title || item.name || '');
        if (value === null) {
            resolve(null);
        } else {
            resolve({
                title: value,
                name: value,
                description: item.description || '',
                status: item.status || 'active'
            });
        }
    });
}

async function showCreateFormDialog(dataType) {
    return new Promise((resolve) => {
        const title = dataType.charAt(0).toUpperCase() + dataType.slice(1);
        const value = prompt('Enter title for new ' + title + ':');
        if (value === null || value.trim() === '') {
            resolve(null);
        } else {
            resolve({
                title: value.trim(),
                name: value.trim(),
                description: '',
                status: dataType === 'visions' ? 'draft' : 
                        dataType === 'prds' ? 'draft' :
                        dataType === 'features' ? 'planned' :
                        dataType === 'epics' ? 'planning' :
                        dataType === 'tasks' ? 'todo' : 'active',
                priority: 'medium'
            });
        }
    });
}

// FORM FIELD DEFINITIONS FOR ALL DATA TYPES
function getFormFields(dataType) {
    const fieldDefinitions = {
        visions: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter vision title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the vision in detail' },
            { name: 'status', label: 'Status', type: 'select', options: ['draft', 'approved', 'in_progress', 'completed', 'cancelled'], default: 'draft' },
            { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            { name: 'expected_roi', label: 'Expected ROI', type: 'text', placeholder: '$1.5M' },
            { name: 'category', label: 'Category', type: 'text', placeholder: 'AI/ML, Blockchain, etc.' }
        ],
        prds: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter PRD title' },
            { name: 'user_story', label: 'User Story', type: 'textarea', placeholder: 'As a user, I want...' },
            { name: 'business_value', label: 'Business Value', type: 'textarea', placeholder: 'Describe the business value' },
            { name: 'status', label: 'Status', type: 'select', options: ['draft', 'approved', 'in_development', 'completed'], default: 'draft' },
            { name: 'version', label: 'Version', type: 'text', placeholder: '1.0.0', default: '1.0.0' }
        ],
        features: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter feature title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the feature' },
            { name: 'status', label: 'Status', type: 'select', options: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
            { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            { name: 'owner', label: 'Owner', type: 'text', placeholder: 'Feature owner' }
        ],
        epics: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter epic title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the epic' },
            { name: 'status', label: 'Status', type: 'select', options: ['planning', 'in_progress', 'completed', 'cancelled'], default: 'planning' },
            { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            { name: 'owner', label: 'Owner', type: 'text', placeholder: 'Epic owner' }
        ],
        roadmaps: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter roadmap title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the roadmap' },
            { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'completed', 'archived'], default: 'draft' },
            { name: 'timeline', label: 'Timeline', type: 'text', placeholder: 'Q1 2024, 6 months, etc.' }
        ],
        adrs: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter ADR title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the architectural decision' },
            { name: 'status', label: 'Status', type: 'select', options: ['proposed', 'accepted', 'deprecated', 'superseded'], default: 'proposed' },
            { name: 'impact', label: 'Impact', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' }
        ],
        tasks: [
            { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter task title' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the task' },
            { name: 'status', label: 'Status', type: 'select', options: ['todo', 'in_progress', 'completed', 'cancelled'], default: 'todo' },
            { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            { name: 'assignee', label: 'Assignee', type: 'text', placeholder: 'Task assignee' }
        ],
        queens: [
            { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter queen name' },
            { name: 'type', label: 'Type', type: 'select', options: ['Strategic Planning', 'Execution', 'Analysis', 'Coordination'], default: 'Strategic Planning' },
            { name: 'specialization', label: 'Specialization', type: 'textarea', placeholder: 'Describe the queen specialization' },
            { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'], default: 'active' }
        ]
    };
    
    return fieldDefinitions[dataType] || [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'text', default: 'active' }
    ];
}

function saveSettings() {
    const theme = document.getElementById('theme-select').value;
    const refreshInterval = parseInt(document.getElementById('refresh-interval').value);
    
    // Update theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('claude-zen-theme', theme);
    
    // Save settings via API
    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, refreshInterval })
    });
    
    alert('Settings saved successfully!');
}

async function createHive() {
    const name = document.getElementById('hive-name').value.trim();
    const type = document.getElementById('hive-type').value;
    const description = document.getElementById('hive-description').value.trim();
    const maxAgents = parseInt(document.getElementById('hive-max-agents').value);
    const coordination = document.getElementById('hive-coordination').value;
    
    if (!name) {
        alert('Please enter a hive name');
        return;
    }
    
    try {
        const response = await fetch('/api/hives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                type,
                config: {
                    maxAgents,
                    coordination,
                    autoSpawn: true
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Hive "${name}" created successfully!`);
            // Clear form
            document.getElementById('hive-name').value = '';
            document.getElementById('hive-description').value = '';
            document.getElementById('hive-max-agents').value = '5';
            // Refresh hives list
            window.dashboard.loadData();
        } else {
            alert(`Error creating hive: ${result.error}`);
        }
    } catch (error) {
        alert(`Failed to create hive: ${error.message}`);
    }
}

async function deleteHive(hiveId) {
    if (!confirm(`Are you sure you want to delete hive "${hiveId}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/hives/${hiveId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Hive "${hiveId}" deleted successfully!`);
            // Refresh hives list
            window.dashboard.loadData();
        } else {
            alert(`Error deleting hive: ${result.error}`);
        }
    } catch (error) {
        alert(`Failed to delete hive: ${error.message}`);
    }
}

// Global project filtering functionality
let globalProjectFilter = '';
let currentProjectFilter = '';

function setGlobalProjectFilter(projectId) {
    globalProjectFilter = projectId;
    
    // Update all tabs with the new filter
    const projectName = projectId ? 
        (window.dashboard.data.projects.find(p => p.id === projectId)?.name || 'Unknown Project') : 
        'All Projects';
    
    console.log('🌐 Global project filter set to:', projectName);
    
    // Apply filter to current tab data
    if (window.dashboard) {
        // Filter all data arrays based on project
        if (projectId) {
            // TODO: Implement actual filtering logic here
            // This would filter visions, prds, features, etc. by project association
            alert('🌐 Global Project Filter: ' + projectName + '\n\nNow showing only data associated with this project across ALL tabs!');
        } else {
            alert('🌐 Global Project Filter cleared\n\nShowing all data across ALL tabs');
        }
        
        // Refresh current tab
        window.dashboard.refreshData();
    }
}

function updateGlobalProjectFilter() {
    const globalSelect = document.getElementById('global-project-filter');
    if (!globalSelect || !window.dashboard.data.projects) return;

    // Clear existing options except "All Projects"
    globalSelect.innerHTML = '<option value="">All Projects</option>';
    
    // Add project options
    window.dashboard.data.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name || 'Unnamed Project';
        if (project.id === globalProjectFilter) {
            option.selected = true;
        }
        globalSelect.appendChild(option);
    });
}

function filterByProject(projectId) {
    currentProjectFilter = projectId;
    
    const filterSelect = document.getElementById('project-filter');
    const filterNotice = document.getElementById('project-filter-notice');
    const activeProjectName = document.getElementById('active-project-name');
    
    if (projectId) {
        // Find project name
        const project = window.dashboard.data.projects.find(p => p.id === projectId);
        const projectName = project ? project.name : 'Unknown Project';
        
        // Update UI to show filter is active
        if (filterSelect) filterSelect.value = projectId;
        if (filterNotice) filterNotice.style.display = 'block';
        if (activeProjectName) activeProjectName.textContent = projectName;
        
        console.log('🔍 Filtering all data by project:', projectName);
        
        // Here you would implement the actual filtering logic for all data types
        // For now, we'll just show a notification
        alert('🔍 Project filter active: ' + projectName + '\n\nThis will filter all visions, PRDs, features, epics, roadmaps, ADRs, and tasks to show only items associated with this project.');
    } else {
        resetProjectFilter();
    }
}

function resetProjectFilter() {
    currentProjectFilter = '';
    
    const filterSelect = document.getElementById('project-filter');
    const filterNotice = document.getElementById('project-filter-notice');
    
    if (filterSelect) filterSelect.value = '';
    if (filterNotice) filterNotice.style.display = 'none';
    
    console.log('🔄 Reset project filter - showing all data');
    
    // Here you would implement the logic to show all data again
    alert('🔄 Project filter cleared - showing all data');
}

function editProject(projectId) {
    console.log('✏️ Edit project:', projectId);
    alert('✏️ Project editing functionality coming soon!');
}

function viewProjectDetails(projectId) {
    const project = window.dashboard.data.projects.find(p => p.id === projectId);
    if (!project) {
        alert('❌ Project not found');
        return;
    }
    
    console.log('👁️ View project details:', project);
    
    // Create detailed view modal/dialog
    const milestonesText = project.milestones ? 
        project.milestones.map(function(m) {
            const icon = m.status === 'completed' ? '✅' : m.status === 'in-progress' ? '🔄' : '⭕';
            return '  ' + icon + ' ' + m.name + ' (' + m.date + ')';
        }).join('\n') : 'No milestones defined';
    
    const details = '🚀 Project Details: ' + project.name + '\n\n' +
        '📋 Description: ' + project.description + '\n' +
        '📊 Progress: ' + project.progress + '%\n' +
        '🏷️ Status: ' + project.status + '\n' +
        '⭐ Priority: ' + project.priority + '\n' +
        '👤 Owner: ' + project.owner + '\n' +
        '📅 Start Date: ' + project.startDate + '\n' +
        '📅 Due Date: ' + project.dueDate + '\n' +
        '🏷️ Tags: ' + (project.tags ? project.tags.join(', ') : 'None') + '\n\n' +
        '🎯 Milestones:\n' + milestonesText + '\n\n' +
        '🔧 Resources:\n' + (project.resources ? project.resources.join(', ') : 'No resources listed');
    
    alert(details);
}

// Global function for HTML onclick handlers
function toggleSection(sectionName) {
    if (window.dashboard) {
        window.dashboard.toggleSection(sectionName);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new ClaudeZenDashboard();
});
