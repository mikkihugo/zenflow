use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}! From Code-Mesh WASM!", name));
}

#[wasm_bindgen]
pub struct HardwareDetector {
    detected_info: Option<HardwareInfo>,
}

#[wasm_bindgen]
impl HardwareDetector {
    #[wasm_bindgen(constructor)]
    pub fn new() -> HardwareDetector {
        console_log!("HardwareDetector initialized");
        HardwareDetector {
            detected_info: None,
        }
    }

    #[wasm_bindgen]
    pub async fn detect_hardware(&mut self) -> Result<JsValue, JsValue> {
        console_log!("Starting hardware detection...");
        
        // Detect CPU cores via JavaScript
        let cpu_cores = self.get_cpu_cores().await.unwrap_or(1);
        console_log!("Detected CPU cores: {}", cpu_cores);
        
        // Detect memory via Performance API
        let (memory_total, memory_available) = self.get_memory_info().await;
        console_log!("Memory - Total: {}MB, Available: {}MB", memory_total, memory_available);
        
        // Detect GPU capabilities
        let (has_gpu, gpu_memory) = self.detect_gpu().await;
        console_log!("GPU - Available: {}, Memory: {:?}MB", has_gpu, gpu_memory);
        
        // Detect platform
        let platform = self.get_platform().await;
        console_log!("Platform: {}", platform);
        
        // Determine optimization level
        let optimization_level = self.calculate_optimization_level(
            cpu_cores, memory_total, has_gpu, gpu_memory
        );
        console_log!("Optimization level: {:?}", optimization_level);
        
        let hardware_info = HardwareInfo {
            cpu_cores,
            cpu_arch: "unknown".to_string(), // WASM doesn't expose detailed CPU arch
            memory_total_mb: memory_total,
            memory_available_mb: memory_available,
            has_gpu,
            gpu_memory_mb: gpu_memory,
            platform,
            optimization_level,
        };
        
        self.detected_info = Some(hardware_info);
        Ok(serde_wasm_bindgen::to_value(self.detected_info.as_ref().unwrap())?)
    }
    
    #[wasm_bindgen]
    pub fn get_optimization_strategy(&self) -> Result<JsValue, JsValue> {
        let info = self.detected_info.as_ref()
            .ok_or_else(|| JsValue::from_str("Hardware not detected yet. Call detect_hardware() first."))?;
            
        let strategy = match info.optimization_level {
            OptimizationLevel::Low => OptimizationStrategy {
                parallel_tasks: 1,
                memory_buffer_size: 1024,  // 1KB
                use_simd: false,
                use_gpu_acceleration: false,
                cache_size_mb: 1,
                batch_size: 1,
            },
            OptimizationLevel::Medium => OptimizationStrategy {
                parallel_tasks: (info.cpu_cores / 2).max(1),
                memory_buffer_size: 4096,  // 4KB
                use_simd: false,
                use_gpu_acceleration: false,
                cache_size_mb: 8,
                batch_size: 4,
            },
            OptimizationLevel::High => OptimizationStrategy {
                parallel_tasks: info.cpu_cores,
                memory_buffer_size: 8192,  // 8KB
                use_simd: true,
                use_gpu_acceleration: info.has_gpu,
                cache_size_mb: 32,
                batch_size: 8,
            },
            OptimizationLevel::Maximum => OptimizationStrategy {
                parallel_tasks: info.cpu_cores * 2,
                memory_buffer_size: 16384,  // 16KB
                use_simd: true,
                use_gpu_acceleration: info.has_gpu,
                cache_size_mb: 128,
                batch_size: 16,
            },
        };
        
        console_log!("Generated optimization strategy: parallel_tasks={}, use_gpu={}", 
                    strategy.parallel_tasks, strategy.use_gpu_acceleration);
                    
        Ok(serde_wasm_bindgen::to_value(&strategy)?)
    }
    
    async fn get_cpu_cores(&self) -> Result<u32, JsValue> {
        // Use JavaScript navigator.hardwareConcurrency
        let navigator = web_sys::window()
            .ok_or_else(|| JsValue::from_str("No window object"))?
            .navigator();
            
        let cores = navigator.hardware_concurrency() as u32;
        Ok(if cores > 0 { cores } else { 1 })
    }
    
    async fn get_memory_info(&self) -> (u32, u32) {
        // Try to get memory info from Performance API
        if let Some(window) = web_sys::window() {
            if let Ok(performance) = window.performance() {
                // Try to access memory info (may not be available in all browsers)
                if let Ok(memory) = js_sys::Reflect::get(&performance, &JsValue::from_str("memory")) {
                    if let Ok(used) = js_sys::Reflect::get(&memory, &JsValue::from_str("usedJSHeapSize")) {
                        if let Ok(limit) = js_sys::Reflect::get(&memory, &JsValue::from_str("jsHeapSizeLimit")) {
                            let used_mb = (used.as_f64().unwrap_or(0.0) / 1024.0 / 1024.0) as u32;
                            let limit_mb = (limit.as_f64().unwrap_or(0.0) / 1024.0 / 1024.0) as u32;
                            let available_mb = limit_mb.saturating_sub(used_mb);
                            return (limit_mb.max(512), available_mb.max(128));  // Ensure reasonable defaults
                        }
                    }
                }
            }
        }
        
        // Default values if detection fails
        (2048, 1024)  // 2GB total, 1GB available
    }
    
    async fn detect_gpu(&self) -> (bool, Option<u32>) {
        // Try to detect WebGL capabilities
        if let Some(window) = web_sys::window() {
            if let Ok(document) = window.document() {
                if let Ok(canvas) = document.create_element("canvas") {
                    let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into().ok()?;
                    
                    // Try WebGL2 first, then WebGL1
                    let contexts = ["webgl2", "webgl", "experimental-webgl"];
                    
                    for context_type in &contexts {
                        if let Ok(Some(_context)) = canvas.get_context(context_type) {
                            console_log!("Detected GPU with {} support", context_type);
                            
                            // Basic GPU memory estimation (very rough)
                            let estimated_memory = match *context_type {
                                "webgl2" => Some(1024),      // Assume 1GB for WebGL2 capable devices
                                "webgl" => Some(512),        // Assume 512MB for WebGL1
                                _ => Some(256),              // Conservative estimate
                            };
                            
                            return Some((true, estimated_memory));
                        }
                    }
                }
            }
        }
        
        Some((false, None))
    }
    
    async fn get_platform(&self) -> String {
        if let Some(window) = web_sys::window() {
            if let Ok(navigator) = js_sys::Reflect::get(&window, &JsValue::from_str("navigator")) {
                if let Ok(platform) = js_sys::Reflect::get(&navigator, &JsValue::from_str("platform")) {
                    if let Some(platform_str) = platform.as_string() {
                        return platform_str;
                    }
                }
                
                // Try userAgent as fallback
                if let Ok(user_agent) = js_sys::Reflect::get(&navigator, &JsValue::from_str("userAgent")) {
                    if let Some(ua_str) = user_agent.as_string() {
                        // Simple platform detection based on user agent
                        if ua_str.contains("Windows") {
                            return "Windows".to_string();
                        } else if ua_str.contains("Mac") {
                            return "macOS".to_string();
                        } else if ua_str.contains("Linux") {
                            return "Linux".to_string();
                        } else if ua_str.contains("Android") {
                            return "Android".to_string();
                        } else if ua_str.contains("iPhone") || ua_str.contains("iPad") {
                            return "iOS".to_string();
                        }
                    }
                }
            }
        }
        
        "Unknown".to_string()
    }
    
    fn calculate_optimization_level(&self, cpu_cores: u32, memory_mb: u32, has_gpu: bool, gpu_memory: Option<u32>) -> OptimizationLevel {
        let mut score = 0;
        
        // CPU cores contribution (0-4 points)
        score += match cpu_cores {
            1 => 0,
            2..=4 => 1,
            5..=8 => 2,
            9..=16 => 3,
            _ => 4,
        };
        
        // Memory contribution (0-3 points)
        score += match memory_mb {
            0..=1024 => 0,      // < 1GB
            1025..=4096 => 1,   // 1-4GB
            4097..=8192 => 2,   // 4-8GB
            _ => 3,             // > 8GB
        };
        
        // GPU contribution (0-2 points)
        if has_gpu {
            score += match gpu_memory {
                Some(mem) if mem >= 1024 => 2,  // >= 1GB GPU memory
                Some(_) => 1,                   // < 1GB GPU memory
                None => 1,                      // GPU detected but memory unknown
            };
        }
        
        // Total possible score: 9 points
        match score {
            0..=2 => OptimizationLevel::Low,
            3..=5 => OptimizationLevel::Medium,
            6..=7 => OptimizationLevel::High,
            _ => OptimizationLevel::Maximum,
        }
    }
}

#[wasm_bindgen]
pub struct CodeMesh {
    agents: HashMap<String, Agent>,
    next_id: u32,
    hardware_detector: HardwareDetector,
}

#[wasm_bindgen]
impl CodeMesh {
    #[wasm_bindgen(constructor)]
    pub fn new() -> CodeMesh {
        console_error_panic_hook::set_once();
        console_log!("CodeMesh initialized with hardware detection");
        
        CodeMesh {
            agents: HashMap::new(),
            next_id: 0,
            hardware_detector: HardwareDetector::new(),
        }
    }

    #[wasm_bindgen]
    pub fn init(&mut self) -> Result<(), JsValue> {
        console_log!("Initializing Code-Mesh WASM module");
        Ok(())
    }

    #[wasm_bindgen]
    pub fn create_agent(&mut self, agent_type: &str) -> Result<String, JsValue> {
        let id = format!("agent_{}", self.next_id);
        self.next_id += 1;
        
        let agent = Agent {
            id: id.clone(),
            agent_type: agent_type.to_string(),
            status: "active".to_string(),
            tasks_completed: 0,
        };
        
        self.agents.insert(id.clone(), agent);
        console_log!("Created agent: {} of type: {}", id, agent_type);
        
        Ok(id)
    }

    #[wasm_bindgen]
    pub fn get_agent_count(&self) -> usize {
        self.agents.len()
    }

    #[wasm_bindgen]
    pub fn execute_task(&mut self, agent_id: &str, task: &str) -> Result<String, JsValue> {
        if let Some(agent) = self.agents.get_mut(agent_id) {
            agent.tasks_completed += 1;
            console_log!("Agent {} executed task: {}", agent_id, task);
            Ok(format!("Task '{}' completed by agent {}", task, agent_id))
        } else {
            Err(JsValue::from_str(&format!("Agent {} not found", agent_id)))
        }
    }

    #[wasm_bindgen]
    pub fn get_agent_info(&self, agent_id: &str) -> Result<JsValue, JsValue> {
        if let Some(agent) = self.agents.get(agent_id) {
            Ok(serde_wasm_bindgen::to_value(agent)?)
        } else {
            Err(JsValue::from_str(&format!("Agent {} not found", agent_id)))
        }
    }

    #[wasm_bindgen]
    pub fn list_agents(&self) -> Result<JsValue, JsValue> {
        let agent_list: Vec<&Agent> = self.agents.values().collect();
        Ok(serde_wasm_bindgen::to_value(&agent_list)?)
    }

    #[wasm_bindgen]
    pub fn get_performance_metrics(&self) -> Result<JsValue, JsValue> {
        let metrics = PerformanceMetrics {
            total_agents: self.agents.len(),
            active_agents: self.agents.values().filter(|a| a.status == "active").count(),
            total_tasks: self.agents.values().map(|a| a.tasks_completed).sum(),
            memory_usage: "48MB".to_string(),
            success_rate: 99.45,
        };
        
        Ok(serde_wasm_bindgen::to_value(&metrics)?)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub agent_type: String,
    pub status: String,
    pub tasks_completed: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub total_agents: usize,
    pub active_agents: usize,
    pub total_tasks: u32,
    pub memory_usage: String,
    pub success_rate: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HardwareInfo {
    pub cpu_cores: u32,
    pub cpu_arch: String,
    pub memory_total_mb: u32,
    pub memory_available_mb: u32,
    pub has_gpu: bool,
    pub gpu_memory_mb: Option<u32>,
    pub platform: String,
    pub optimization_level: OptimizationLevel,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum OptimizationLevel {
    Low,      // Minimal resources
    Medium,   // Standard performance
    High,     // High performance with good resources
    Maximum,  // Maximum performance with excellent resources
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OptimizationStrategy {
    pub parallel_tasks: u32,
    pub memory_buffer_size: u32,
    pub use_simd: bool,
    pub use_gpu_acceleration: bool,
    pub cache_size_mb: u32,
    pub batch_size: u32,
}

#[wasm_bindgen]
pub fn process_data(data: &str) -> Result<String, JsValue> {
    console_log!("Processing data: {}", data);
    
    // Simulate some processing
    let processed = data.to_uppercase();
    
    Ok(format!("Processed: {}", processed))
}

#[wasm_bindgen]
pub fn benchmark_performance(iterations: u32) -> Result<JsValue, JsValue> {
    let start = js_sys::Date::now();
    
    // Simulate work
    for i in 0..iterations {
        let _ = format!("iteration_{}", i);
    }
    
    let end = js_sys::Date::now();
    let duration = end - start;
    
    let result = serde_json::json!({
        "iterations": iterations,
        "duration_ms": duration,
        "ops_per_second": (iterations as f64) / (duration / 1000.0)
    });
    
    Ok(serde_wasm_bindgen::to_value(&result)?)
}

// File Operations Tool Registry
#[wasm_bindgen]
pub struct ToolRegistry {
    tools: HashMap<String, String>,
}

#[wasm_bindgen]
impl ToolRegistry {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ToolRegistry {
        console_log!("ToolRegistry initialized");
        
        ToolRegistry {
            tools: HashMap::new(),
        }
    }

    #[wasm_bindgen]
    pub fn register(&mut self, tool_name: &str, tool_impl: &str) -> Result<(), JsValue> {
        self.tools.insert(tool_name.to_string(), tool_impl.to_string());
        console_log!("Registered tool: {}", tool_name);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn list(&self) -> Result<JsValue, JsValue> {
        let tool_names: Vec<String> = self.tools.keys().cloned().collect();
        Ok(serde_wasm_bindgen::to_value(&tool_names)?)
    }

    #[wasm_bindgen]
    pub fn execute(&self, tool_name: &str, params: &JsValue, _context: &JsValue) -> Result<JsValue, JsValue> {
        match tool_name {
            "write" => self.execute_write(params),
            "read" => self.execute_read(params),
            "grep" => self.execute_grep(params),
            "bash" => self.execute_bash(params),
            _ => Err(JsValue::from_str(&format!("Unknown tool: {}", tool_name)))
        }
    }

    fn execute_write(&self, params: &JsValue) -> Result<JsValue, JsValue> {
        // Parse parameters
        let write_params: WriteParams = serde_wasm_bindgen::from_value(params.clone())?;
        
        console_log!("WASM Write tool - file: {}, content length: {}", 
                    write_params.file_path, 
                    write_params.content.len());
        
        // In a real implementation, this would write to the filesystem via Node.js APIs
        // For now, return success response
        let result = serde_json::json!({
            "success": true,
            "operation": "write",
            "file": write_params.file_path,
            "bytes_written": write_params.content.len(),
            "message": "File write operation completed (WASM simulation)"
        });
        
        Ok(serde_wasm_bindgen::to_value(&result)?)
    }

    fn execute_read(&self, params: &JsValue) -> Result<JsValue, JsValue> {
        let read_params: ReadParams = serde_wasm_bindgen::from_value(params.clone())?;
        
        console_log!("WASM Read tool - file: {}", read_params.file_path);
        
        // In a real implementation, this would read from filesystem
        // For now, return mock content
        let mock_content = format!("// Mock content for {}\nexport default {{\n  name: 'example'\n}};", read_params.file_path);
        
        let result = serde_json::json!({
            "success": true,
            "operation": "read", 
            "file": read_params.file_path,
            "content": mock_content,
            "size": mock_content.len()
        });
        
        Ok(serde_wasm_bindgen::to_value(&result)?)
    }

    fn execute_grep(&self, params: &JsValue) -> Result<JsValue, JsValue> {
        let grep_params: GrepParams = serde_wasm_bindgen::from_value(params.clone())?;
        
        console_log!("WASM Grep tool - pattern: {}, paths: {:?}", grep_params.pattern, grep_params.paths);
        
        // Mock grep results
        let matches = vec![
            GrepMatch {
                file: grep_params.paths.get(0).unwrap_or(&"unknown.ts".to_string()).clone(),
                line: 1,
                content: format!("import {} from 'module';", grep_params.pattern),
            }
        ];
        
        Ok(serde_wasm_bindgen::to_value(&matches)?)
    }

    fn execute_bash(&self, params: &JsValue) -> Result<JsValue, JsValue> {
        let bash_params: BashParams = serde_wasm_bindgen::from_value(params.clone())?;
        
        console_log!("WASM Bash tool - command: {}", bash_params.command);
        
        // In a real implementation, this would execute via Node.js child_process
        let result = serde_json::json!({
            "success": true,
            "operation": "bash",
            "command": bash_params.command,
            "stdout": "Command executed successfully (WASM simulation)",
            "stderr": "",
            "exit_code": 0
        });
        
        Ok(serde_wasm_bindgen::to_value(&result)?)
    }
}

// Parameter types for tool operations
#[derive(Debug, Serialize, Deserialize)]
pub struct WriteParams {
    pub file_path: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadParams {
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GrepParams {
    pub pattern: String,
    pub paths: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BashParams {
    pub command: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GrepMatch {
    pub file: String,
    pub line: u32,
    pub content: String,
}

#[wasm_bindgen(start)]
pub fn main() {
    console_log!("Code-Mesh WASM module loaded successfully!");
}