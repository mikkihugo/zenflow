

/// Workflow management for coordinating multiple projects
pub struct WorkflowManager {
    project_dependencies: HashMap<String, Vec<String>>,
    workflow_graph: HashMap<String, Vec<String>>,
    execution_queue: VecDeque<String>,
    running_projects: HashSet<String>,
    completed_projects: HashSet<String>,
    parallel_execution_limit: usize,
}

impl WorkflowManager {
    pub fn new() -> Self {
        Self {
            project_dependencies: HashMap::new(),
            workflow_graph: HashMap::new(),
            execution_queue: VecDeque::new(),
            running_projects: HashSet::new(),
            completed_projects: HashSet::new(),
            parallel_execution_limit: 5, // Allow up to 5 projects to run in parallel
        }
    }

    /// Add project dependency
    pub fn add_dependency(&mut self, project_id: &str, depends_on: &str) -> Result<()> {
        // Check for circular dependencies
        if self.would_create_circle(project_id, depends_on)? {
            return Err(anyhow!("Circular dependency detected: {} -> {}", project_id, depends_on));
        }
        
        self.project_dependencies.entry(project_id.to_string())
            .or_insert_with(Vec::new)
            .push(depends_on.to_string());
        
        self.workflow_graph.entry(depends_on.to_string())
            .or_insert_with(Vec::new)
            .push(project_id.to_string());
        
        info!("Added dependency: {} depends on {}", project_id, depends_on);
        Ok(())
    }

    /// Check if adding a dependency would create a circular reference
    fn would_create_circle(&self, project_id: &str, depends_on: &str) -> Result<bool> {
        if project_id == depends_on {
            return Ok(true); // Self-dependency
        }
        
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();
        
        Ok(self.has_cycle_dfs(depends_on, &mut visited, &mut rec_stack)?)
    }

    /// Depth-first search to detect cycles
    fn has_cycle_dfs(&self, node: &str, visited: &mut HashSet<String>, rec_stack: &mut HashSet<String>) -> Result<bool> {
        if rec_stack.contains(node) {
            return Ok(true); // Back edge found - cycle detected
        }
        
        if visited.contains(node) {
            return Ok(false); // Already processed
        }
        
        visited.insert(node.to_string());
        rec_stack.insert(node.to_string());
        
        if let Some(dependents) = self.workflow_graph.get(node) {
            for dependent in dependents {
                if self.has_cycle_dfs(dependent, visited, rec_stack)? {
                    return Ok(true);
                }
            }
        }
        
        rec_stack.remove(node);
        Ok(false)
    }

    /// Queue project for execution
    pub fn queue_project(&mut self, project_id: &str) -> Result<()> {
        if self.completed_projects.contains(project_id) {
            return Err(anyhow!("Project {} already completed", project_id));
        }
        
        if self.running_projects.contains(project_id) {
            return Err(anyhow!("Project {} already running", project_id));
        }
        
        // Check if dependencies are satisfied
        if let Some(dependencies) = self.project_dependencies.get(project_id) {
            for dep in dependencies {
                if !self.completed_projects.contains(dep) {
                    return Err(anyhow!("Project {} depends on {} which is not completed", project_id, dep));
                }
            }
        }
        
        self.execution_queue.push_back(project_id.to_string());
        info!("Queued project {} for execution", project_id);
        Ok(())
    }

    /// Start next available project
    pub fn start_next_project(&mut self) -> Result<Option<String>> {
        if self.running_projects.len() >= self.parallel_execution_limit {
            return Ok(None); // At capacity
        }
        
        if let Some(project_id) = self.execution_queue.pop_front() {
            self.running_projects.insert(project_id.clone());
            info!("Started project {} (running: {}/{})", 
                  project_id, self.running_projects.len(), self.parallel_execution_limit);
            Ok(Some(project_id))
        } else {
            Ok(None) // No projects in queue
        }
    }

    /// Complete a project
    pub fn complete_project(&mut self, project_id: &str) -> Result<()> {
        if !self.running_projects.contains(project_id) {
            return Err(anyhow!("Project {} is not running", project_id));
        }
        
        self.running_projects.remove(project_id);
        self.completed_projects.insert(project_id.to_string());
        
        info!("Completed project {} (running: {}/{})", 
              project_id, self.running_projects.len(), self.parallel_execution_limit);
        
        // Check if we can start more projects
        self.try_start_pending_projects()?;
        
        Ok(())
    }

    /// Try to start pending projects that have satisfied dependencies
    fn try_start_pending_projects(&mut self) -> Result<()> {
        let mut projects_to_start = Vec::new();
        
        // Find projects that can now start
        for project_id in self.execution_queue.iter() {
            if let Some(dependencies) = self.project_dependencies.get(project_id) {
                let all_deps_satisfied = dependencies.iter()
                    .all(|dep| self.completed_projects.contains(dep));
                
                if all_deps_satisfied {
                    projects_to_start.push(project_id.clone());
                }
            } else {
                // No dependencies, can start immediately
                projects_to_start.push(project_id.clone());
            }
        }
        
        // Start projects up to parallel limit
        for project_id in projects_to_start {
            if self.running_projects.len() >= self.parallel_execution_limit {
                break;
            }
            
            if let Some(index) = self.execution_queue.iter().position(|id| id == &project_id) {
                self.execution_queue.remove(index);
                self.running_projects.insert(project_id.clone());
                info!("Auto-started project {} (running: {}/{})", 
                      project_id, self.running_projects.len(), self.parallel_execution_limit);
            }
        }
        
        Ok(())
    }

    /// Get workflow status
    pub fn get_workflow_status(&self) -> WorkflowStatus {
        WorkflowStatus {
            total_projects: self.project_dependencies.len(),
            queued_projects: self.execution_queue.len(),
            running_projects: self.running_projects.len(),
            completed_projects: self.completed_projects.len(),
            parallel_limit: self.parallel_execution_limit,
            available_slots: self.parallel_execution_limit.saturating_sub(self.running_projects.len()),
        }
    }

    /// Get project dependencies
    pub fn get_project_dependencies(&self, project_id: &str) -> Vec<String> {
        self.project_dependencies.get(project_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Get projects that depend on this project
    pub fn get_dependent_projects(&self, project_id: &str) -> Vec<String> {
        self.workflow_graph.get(project_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Check if project can start (dependencies satisfied)
    pub fn can_project_start(&self, project_id: &str) -> bool {
        if let Some(dependencies) = self.project_dependencies.get(project_id) {
            dependencies.iter().all(|dep| self.completed_projects.contains(dep))
        } else {
            true // No dependencies
        }
    }

    /// Get execution order for projects
    pub fn get_execution_order(&self) -> Result<Vec<String>> {
        let mut order = Vec::new();
        let mut visited = HashSet::new();
        let mut temp_visited = HashSet::new();
        
        for project_id in self.project_dependencies.keys() {
            if !visited.contains(project_id) {
                self.topological_sort_dfs(project_id, &mut visited, &mut temp_visited, &mut order)?;
            }
        }
        
        Ok(order)
    }

    /// Topological sort using depth-first search
    fn topological_sort_dfs(
        &self,
        project_id: &str,
        visited: &mut HashSet<String>,
        temp_visited: &mut HashSet<String>,
        order: &mut Vec<String>
    ) -> Result<()> {
        if temp_visited.contains(project_id) {
            return Err(anyhow!("Circular dependency detected"));
        }
        
        if visited.contains(project_id) {
            return Ok(());
        }
        
        temp_visited.insert(project_id.to_string());
        
        if let Some(dependencies) = self.project_dependencies.get(project_id) {
            for dep in dependencies {
                self.topological_sort_dfs(dep, visited, temp_visited, order)?;
            }
        }
        
        temp_visited.remove(project_id);
        visited.insert(project_id.to_string());
        order.push(project_id.to_string());
        
        Ok(())
    }
}

/// Workflow execution status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStatus {
    pub total_projects: usize,
    pub queued_projects: usize,
    pub running_projects: usize,
    pub completed_projects: usize,
    pub parallel_limit: usize,
    pub available_slots: usize,
}
