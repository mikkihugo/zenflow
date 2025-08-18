/**
 * Project management store for Svelte dashboard
 * 
 * Provides centralized project state management with automatic persistence
 */

import { writable, derived } from 'svelte/store';
import type { Project, ProjectStore } from '$lib/types/dashboard';

// Create the project store
function createProjectStore() {
  const { subscribe, set, update } = writable<ProjectStore>({
    currentProject: null,
    projects: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    // Load projects from API
    async loadProjects() {
      update(store => ({ ...store, loading: true, error: null }));
      
      try {
        const response = await fetch('/api/v1/projects');
        if (response.ok) {
          const data = await response.json();
          const projects = data.data || [];
          
          update(store => ({
            ...store,
            projects,
            loading: false,
            currentProject: projects.find(p => p.status === 'active') || projects[0] || null
          }));
          
          return projects;
        } else {
          throw new Error(`Failed to load projects: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load projects from API:', error);
        
        // Fallback to default project
        const defaultProject = await this.createDefaultProject();
        
        update(store => ({
          ...store,
          projects: [defaultProject],
          currentProject: defaultProject,
          loading: false,
          error: null
        }));
        
        return [defaultProject];
      }
    },
    
    // Create default project
    async createDefaultProject(): Promise<Project> {
      const defaultProject: Project = {
        id: 'default-project',
        name: 'Claude Code Zen Development',
        description: 'Default project for claude-code-zen development',
        status: 'active',
        priority: 'high',
        currentPhase: 'architecture',
        created: new Date(),
        updated: new Date(),
        progress: 75,
        team: ['Claude Code'],
        tags: ['development', 'ai', 'typescript']
      };
      
      // Try to save to backend
      try {
        await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultProject)
        });
        console.log('✅ Default project saved to backend');
      } catch (error) {
        console.warn('Could not save default project to backend:', error);
      }
      
      return defaultProject;
    },
    
    // Set current project
    setCurrentProject(project: Project) {
      update(store => ({
        ...store,
        currentProject: project
      }));
      
      console.log('🎯 Selected project:', project.name);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('claude-zen-current-project', project.id);
      } catch (error) {
        console.warn('Could not save current project to localStorage:', error);
      }
    },
    
    // Add new project
    async addProject(project: Omit<Project, 'id' | 'created' | 'updated'>) {
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        created: new Date(),
        updated: new Date()
      };
      
      try {
        const response = await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });
        
        if (response.ok) {
          update(store => ({
            ...store,
            projects: [...store.projects, newProject]
          }));
          
          return newProject;
        } else {
          throw new Error(`Failed to create project: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to create project:', error);
        update(store => ({
          ...store,
          error: error instanceof Error ? error.message : 'Failed to create project'
        }));
        throw error;
      }
    },
    
    // Update project
    async updateProject(projectId: string, updates: Partial<Project>) {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updates, updated: new Date() })
        });
        
        if (response.ok) {
          update(store => ({
            ...store,
            projects: store.projects.map(p => 
              p.id === projectId ? { ...p, ...updates, updated: new Date() } : p
            ),
            currentProject: store.currentProject?.id === projectId 
              ? { ...store.currentProject, ...updates, updated: new Date() }
              : store.currentProject
          }));
        } else {
          throw new Error(`Failed to update project: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to update project:', error);
        update(store => ({
          ...store,
          error: error instanceof Error ? error.message : 'Failed to update project'
        }));
        throw error;
      }
    },
    
    // Delete project
    async deleteProject(projectId: string) {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          update(store => {
            const newProjects = store.projects.filter(p => p.id !== projectId);
            return {
              ...store,
              projects: newProjects,
              currentProject: store.currentProject?.id === projectId 
                ? newProjects[0] || null 
                : store.currentProject
            };
          });
        } else {
          throw new Error(`Failed to delete project: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        update(store => ({
          ...store,
          error: error instanceof Error ? error.message : 'Failed to delete project'
        }));
        throw error;
      }
    },
    
    // Clear error
    clearError() {
      update(store => ({ ...store, error: null }));
    }
  };
}

// Export the store
export const projectStore = createProjectStore();

// Derived stores for common queries
export const currentProject = derived(
  projectStore,
  $projectStore => $projectStore.currentProject
);

export const projects = derived(
  projectStore,
  $projectStore => $projectStore.projects
);

export const activeProjects = derived(
  projectStore,
  $projectStore => $projectStore.projects.filter(p => p.status === 'active')
);

export const isProjectRelated = derived(
  [projectStore],
  ([$projectStore]) => {
    // This can be enhanced to check current route
    return $projectStore.currentProject !== null;
  }
);