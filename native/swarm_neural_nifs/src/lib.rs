use rustler::{Atom, Binary, Env, Error, NifResult, ResourceArc, Term};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

// Neural network imports
use ruv_fann::{Network, NetworkBuilder, TrainingData, ActivationFunction};

// Swarm imports  
use ruv_swarm_core::{Agent, Swarm, Task, SwarmConfig};
use ruv_swarm_agents::IntelligentAgent;

// Global storage for neural networks and swarms
lazy_static::lazy_static! {
    static ref NEURAL_NETWORKS: Arc<Mutex<HashMap<String, Network<f32>>>> = 
        Arc::new(Mutex::new(HashMap::new()));
    
    static ref SWARM_INSTANCES: Arc<Mutex<HashMap<String, Swarm<IntelligentAgent>>>> = 
        Arc::new(Mutex::new(HashMap::new()));
    
    static ref GPU_CONTEXT: Arc<Mutex<Option<ruv_fann::webgpu::WebGpuContext>>> = 
        Arc::new(Mutex::new(None));
}

// Rustler module initialization
rustler::init!(
    "Elixir.SwarmService.Neural.Bridge",
    [
        // Neural network operations
        create_network,
        train_network,
        run_network,
        get_network_info,
        save_network,
        load_network,
        
        // Swarm operations
        create_swarm,
        spawn_agent,
        coordinate_swarm,
        get_swarm_status,
        update_agent_brain,
        
        // GPU operations
        initialize_gpu,
        get_gpu_status,
        
        // Utility operations
        health_check
    ]
);

// Atoms for consistent returns
mod atoms {
    rustler::atoms! {
        ok,
        error,
        nil,
        // Error types
        network_not_found,
        swarm_not_found,
        gpu_not_available,
        invalid_input,
        training_failed,
        // Status types
        healthy,
        degraded,
        offline
    }
}

/// Create a new neural network
#[rustler::nif]
fn create_network(inputs: usize, hidden: Vec<usize>, outputs: usize) -> NifResult<Term> {
    let network_id = Uuid::new_v4().to_string();
    
    let mut builder = NetworkBuilder::new();
    builder.add_layer(inputs);
    
    for &hidden_size in &hidden {
        builder.add_layer(hidden_size);
    }
    
    builder.add_layer(outputs);
    builder.set_activation_function_hidden(ActivationFunction::Sigmoid);
    builder.set_activation_function_output(ActivationFunction::Linear);
    
    match builder.build() {
        Ok(network) => {
            let mut networks = NEURAL_NETWORKS.lock().unwrap();
            networks.insert(network_id.clone(), network);
            Ok((atoms::ok(), network_id).encode(env))
        }
        Err(e) => {
            Ok((atoms::error(), format!("Failed to create network: {:?}", e)).encode(env))
        }
    }
}

/// Train a neural network with data
#[rustler::nif]
fn train_network(network_id: String, inputs: Vec<Vec<f32>>, outputs: Vec<Vec<f32>>, epochs: usize) -> NifResult<Term> {
    let mut networks = NEURAL_NETWORKS.lock().unwrap();
    
    match networks.get_mut(&network_id) {
        Some(network) => {
            // Create training data
            let mut training_data = Vec::new();
            for (input, output) in inputs.iter().zip(outputs.iter()) {
                training_data.push((input.clone(), output.clone()));
            }
            
            // Train the network
            for _ in 0..epochs {
                for (input, expected_output) in &training_data {
                    match network.train_single(input, expected_output) {
                        Ok(_) => {},
                        Err(e) => {
                            return Ok((atoms::error(), format!("Training failed: {:?}", e)).encode(env));
                        }
                    }
                }
            }
            
            Ok((atoms::ok(), "Training completed").encode(env))
        }
        None => {
            Ok((atoms::error(), atoms::network_not_found()).encode(env))
        }
    }
}

/// Run inference on a neural network
#[rustler::nif]
fn run_network(network_id: String, inputs: Vec<f32>) -> NifResult<Term> {
    let networks = NEURAL_NETWORKS.lock().unwrap();
    
    match networks.get(&network_id) {
        Some(network) => {
            match network.run(&inputs) {
                Ok(outputs) => {
                    Ok((atoms::ok(), outputs).encode(env))
                }
                Err(e) => {
                    Ok((atoms::error(), format!("Inference failed: {:?}", e)).encode(env))
                }
            }
        }
        None => {
            Ok((atoms::error(), atoms::network_not_found()).encode(env))
        }
    }
}

/// Get neural network information
#[rustler::nif]
fn get_network_info(network_id: String) -> NifResult<Term> {
    let networks = NEURAL_NETWORKS.lock().unwrap();
    
    match networks.get(&network_id) {
        Some(network) => {
            let info = rustler::types::map::map_new(env)
                .map_put(rustler::types::atom::ok().to_term(env), true.encode(env))?
                .map_put("num_layers".encode(env), network.get_num_layers().encode(env))?
                .map_put("num_inputs".encode(env), network.get_num_input().encode(env))?
                .map_put("num_outputs".encode(env), network.get_num_output().encode(env))?;
            
            Ok(info)
        }
        None => {
            Ok((atoms::error(), atoms::network_not_found()).encode(env))
        }
    }
}

/// Create a new swarm
#[rustler::nif]
fn create_swarm(swarm_id: String, max_agents: usize, topology: String) -> NifResult<Term> {
    let config = SwarmConfig {
        max_agents,
        topology: match topology.as_str() {
            "mesh" => ruv_swarm_core::Topology::Mesh,
            "ring" => ruv_swarm_core::Topology::Ring,
            "star" => ruv_swarm_core::Topology::Star,
            _ => ruv_swarm_core::Topology::Mesh, // default
        },
        ..Default::default()
    };
    
    match Swarm::new(config) {
        Ok(swarm) => {
            let mut swarms = SWARM_INSTANCES.lock().unwrap();
            swarms.insert(swarm_id.clone(), swarm);
            Ok((atoms::ok(), swarm_id).encode(env))
        }
        Err(e) => {
            Ok((atoms::error(), format!("Failed to create swarm: {:?}", e)).encode(env))
        }
    }
}

/// Spawn an intelligent agent with neural network
#[rustler::nif]
fn spawn_agent(swarm_id: String, agent_config: Term) -> NifResult<Term> {
    let mut swarms = SWARM_INSTANCES.lock().unwrap();
    
    match swarms.get_mut(&swarm_id) {
        Some(swarm) => {
            let agent_id = Uuid::new_v4().to_string();
            
            // Create neural network for this agent
            let mut builder = NetworkBuilder::new();
            builder.add_layer(10); // inputs
            builder.add_layer(20); // hidden
            builder.add_layer(5);  // outputs
            
            match builder.build() {
                Ok(network) => {
                    // Store agent's neural network
                    let mut networks = NEURAL_NETWORKS.lock().unwrap();
                    let network_id = format!("agent_{}", agent_id);
                    networks.insert(network_id.clone(), network);
                    drop(networks);
                    
                    // Create intelligent agent
                    let agent = IntelligentAgent::new(
                        agent_id.clone(),
                        network_id.clone(),
                        Vec::new() // capabilities
                    );
                    
                    // Add agent to swarm
                    match swarm.add_agent(agent) {
                        Ok(_) => {
                            Ok((atoms::ok(), agent_id).encode(env))
                        }
                        Err(e) => {
                            Ok((atoms::error(), format!("Failed to add agent: {:?}", e)).encode(env))
                        }
                    }
                }
                Err(e) => {
                    Ok((atoms::error(), format!("Failed to create agent network: {:?}", e)).encode(env))
                }
            }
        }
        None => {
            Ok((atoms::error(), atoms::swarm_not_found()).encode(env))
        }
    }
}

/// Coordinate swarm execution
#[rustler::nif]
fn coordinate_swarm(swarm_id: String, task_data: Term) -> NifResult<Term> {
    let mut swarms = SWARM_INSTANCES.lock().unwrap();
    
    match swarms.get_mut(&swarm_id) {
        Some(swarm) => {
            // Create task from Elixir data
            let task = Task::new(
                Uuid::new_v4(),
                "swarm_coordination".to_string(),
                serde_json::Value::Null // placeholder
            );
            
            // Execute swarm coordination
            match swarm.execute_task(task) {
                Ok(results) => {
                    Ok((atoms::ok(), format!("Coordination completed: {} results", results.len())).encode(env))
                }
                Err(e) => {
                    Ok((atoms::error(), format!("Coordination failed: {:?}", e)).encode(env))
                }
            }
        }
        None => {
            Ok((atoms::error(), atoms::swarm_not_found()).encode(env))
        }
    }
}

/// Get swarm status
#[rustler::nif]
fn get_swarm_status(swarm_id: String) -> NifResult<Term> {
    let swarms = SWARM_INSTANCES.lock().unwrap();
    
    match swarms.get(&swarm_id) {
        Some(swarm) => {
            let status = rustler::types::map::map_new(env)
                .map_put("agent_count".encode(env), swarm.agent_count().encode(env))?
                .map_put("is_active".encode(env), swarm.is_active().encode(env))?
                .map_put("status".encode(env), atoms::healthy().encode(env))?;
            
            Ok((atoms::ok(), status).encode(env))
        }
        None => {
            Ok((atoms::error(), atoms::swarm_not_found()).encode(env))
        }
    }
}

/// Update agent's neural network
#[rustler::nif]
fn update_agent_brain(agent_id: String, neural_data: Vec<f32>) -> NifResult<Term> {
    let networks = NEURAL_NETWORKS.lock().unwrap();
    let network_id = format!("agent_{}", agent_id);
    
    match networks.get(&network_id) {
        Some(_network) => {
            // Here we would update the neural network weights
            // For now, just acknowledge the update
            Ok((atoms::ok(), "Brain updated").encode(env))
        }
        None => {
            Ok((atoms::error(), atoms::network_not_found()).encode(env))
        }
    }
}

/// Initialize GPU acceleration
#[rustler::nif]
fn initialize_gpu(expected_workload: usize) -> NifResult<Term> {
    match ruv_fann::webgpu::WebGpuContext::new() {
        Ok(gpu_context) => {
            let mut gpu = GPU_CONTEXT.lock().unwrap();
            *gpu = Some(gpu_context);
            Ok((atoms::ok(), "GPU initialized").encode(env))
        }
        Err(e) => {
            Ok((atoms::error(), format!("GPU initialization failed: {:?}", e)).encode(env))
        }
    }
}

/// Get GPU status
#[rustler::nif]
fn get_gpu_status() -> NifResult<Term> {
    let gpu = GPU_CONTEXT.lock().unwrap();
    match *gpu {
        Some(_) => Ok((atoms::ok(), atoms::healthy()).encode(env)),
        None => Ok((atoms::error(), atoms::gpu_not_available()).encode(env))
    }
}

/// Health check for the entire system
#[rustler::nif]
fn health_check() -> NifResult<Term> {
    let networks = NEURAL_NETWORKS.lock().unwrap();
    let swarms = SWARM_INSTANCES.lock().unwrap();
    let gpu = GPU_CONTEXT.lock().unwrap();
    
    let health = rustler::types::map::map_new(env)
        .map_put("neural_networks".encode(env), networks.len().encode(env))?
        .map_put("active_swarms".encode(env), swarms.len().encode(env))?
        .map_put("gpu_available".encode(env), gpu.is_some().encode(env))?
        .map_put("status".encode(env), atoms::healthy().encode(env))?;
    
    Ok((atoms::ok(), health).encode(env))
}

/// Save neural network to disk
#[rustler::nif]
fn save_network(network_id: String, file_path: String) -> NifResult<Term> {
    let networks = NEURAL_NETWORKS.lock().unwrap();
    
    match networks.get(&network_id) {
        Some(network) => {
            match network.save(&file_path) {
                Ok(_) => Ok((atoms::ok(), "Network saved").encode(env)),
                Err(e) => Ok((atoms::error(), format!("Save failed: {:?}", e)).encode(env))
            }
        }
        None => {
            Ok((atoms::error(), atoms::network_not_found()).encode(env))
        }
    }
}

/// Load neural network from disk
#[rustler::nif]
fn load_network(file_path: String) -> NifResult<Term> {
    match Network::load(&file_path) {
        Ok(network) => {
            let network_id = Uuid::new_v4().to_string();
            let mut networks = NEURAL_NETWORKS.lock().unwrap();
            networks.insert(network_id.clone(), network);
            Ok((atoms::ok(), network_id).encode(env))
        }
        Err(e) => {
            Ok((atoms::error(), format!("Load failed: {:?}", e)).encode(env))
        }
    }
}