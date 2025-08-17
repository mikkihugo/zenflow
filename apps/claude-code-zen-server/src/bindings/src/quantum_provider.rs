//! IBM Quantum Provider Implementation
//!
//! This module provides secure integration with IBM Quantum services,
//! enabling quantum computing capabilities within the zen-swarm-orchestrator.
use crate::quantum_config::{QuantumConfig, QuantumJobConfig, QuantumCircuit, QuantumJobResult};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use uuid::Uuid;

/// IBM Quantum API endpoints
const IBM_QUANTUM_API_BASE: &str = "https://api.quantum-computing.ibm.com/api/Network";
const IBM_QUANTUM_API_VERSION: &str = "v1";

/// IBM Quantum provider for executing quantum circuits
#[derive(Debug)]
pub struct IBMQuantumProvider {
    config: QuantumConfig,
    client: Client,
    base_url: String,
}

/// IBM Quantum backend information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumBackend {
    pub name: String,
    pub status: String,
    pub pending_jobs: u32,
    pub max_shots: u32,
    pub num_qubits: u32,
    pub basis_gates: Vec<String>,
    pub coupling_map: Option<Vec<Vec<u32>>>,
    pub gate_errors: Option<HashMap<String, f64>>,
    pub readout_errors: Option<Vec<f64>>,
}

/// IBM Quantum job submission request
#[derive(Debug, Serialize)]
struct JobSubmissionRequest {
    pub backend: String,
    pub shots: u32,
    pub qasm: String,
    pub hub: Option<String>,
    pub group: Option<String>,
    pub project: Option<String>,
    pub job_name: Option<String>,
    pub job_tags: Option<Vec<String>>,
}

/// IBM Quantum job status response
#[derive(Debug, Deserialize)]
struct JobStatusResponse {
    pub id: String,
    pub status: String,
    pub backend: String,
    pub creation_date: String,
    pub shots: u32,
    pub result: Option<JobResultData>,
    pub error: Option<JobError>,
}

/// IBM Quantum job result data
#[derive(Debug, Deserialize)]
struct JobResultData {
    pub counts: Option<HashMap<String, u32>>,
    pub memory: Option<Vec<String>>,
    pub statevector: Option<Vec<f64>>,
    pub unitary: Option<Vec<Vec<f64>>>,
}

/// IBM Quantum job error information
#[derive(Debug, Deserialize)]
struct JobError {
    pub message: String,
    pub code: Option<u32>,
    pub details: Option<String>,
}

impl IBMQuantumProvider {
    /// Create a new IBM Quantum provider
    pub fn new(config: QuantumConfig) -> Result<Self, String> {
        // Validate configuration
        config.validate()?;
        
        if !config.has_ibm_quantum() {
            return Err("IBM Quantum token not configured".to_string());
        }

        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| format!("Failed to create HTTP client: {e}"))?;

        let base_url = format!("{IBM_QUANTUM_API_BASE}/{IBM_QUANTUM_API_VERSION}");

        Ok(Self {
            config,
            client,
            base_url,
        })
    }

    /// Get available quantum backends
    pub async fn get_backends(&self) -> Result<Vec<QuantumBackend>, String> {
        let token = self.config.get_ibm_token()?;
        let url = format!("{}/backends", self.base_url);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {token}"))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| format!("Failed to get backends: {e}"))?;

        if !response.status().is_success() {
            let status = response.status();
            return Err(format!("IBM Quantum API error: {status}"));
        }

        let backends_data: Vec<serde_json::Value> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse backends response: {e}"))?;

        let mut backends = Vec::new();
        for backend_data in backends_data {
            if let Ok(backend) = self.parse_backend_info(backend_data) {
                backends.push(backend);
            }
        }

        Ok(backends)
    }

    /// Submit a quantum job
    pub async fn submit_job(
        &self,
        circuit: &QuantumCircuit,
        job_config: &QuantumJobConfig,
    ) -> Result<String, String> {
        let token = self.config.get_ibm_token()?;
        
        // Validate circuit depth
        if circuit.depth > self.config.max_circuit_depth {
            let circuit_depth = circuit.depth;
            let max_circuit_depth = self.config.max_circuit_depth;
            return Err(format!(
                "Circuit depth {circuit_depth} exceeds maximum allowed depth {max_circuit_depth}"
            ));
        }

        // Validate shots
        if job_config.shots > self.config.simulation_shots {
            let shots = job_config.shots;
            let simulation_shots = self.config.simulation_shots;
            return Err(format!(
                "Shots {shots} exceeds maximum allowed shots {simulation_shots}"
            ));
        }

        let job_request = JobSubmissionRequest {
            backend: job_config.backend.clone(),
            shots: job_config.shots,
            qasm: circuit.qasm.clone(),
            hub: self.config.ibm_hub.clone(),
            group: self.config.ibm_group.clone(),
            project: self.config.ibm_project.clone(),
            job_name: Some(format!("zen-swarm-{}", Uuid::new_v4())),
            job_tags: Some(vec!["zen-swarm".to_string(), "automated".to_string()]),
        };

        let url = format!("{}/jobs", self.base_url);
        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {token}"))
            .header("Content-Type", "application/json")
            .json(&job_request)
            .send()
            .await
            .map_err(|e| format!("Failed to submit job: {e}"))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("IBM Quantum API error: {status} - {error_text}"));
        }

        let job_response: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse job submission response: {e}"))?;

        let job_id = job_response["id"]
            .as_str()
            .ok_or("No job ID in response")?
            .to_string();

        Ok(job_id)
    }

    /// Get job status and results
    pub async fn get_job_result(&self, job_id: &str) -> Result<QuantumJobResult, String> {
        let token = self.config.get_ibm_token()?;
        let url = format!("{}/jobs/{job_id}", self.base_url);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {token}"))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| format!("Failed to get job status: {e}"))?;

        if !response.status().is_success() {
            let status = response.status();
            return Err(format!("IBM Quantum API error: {status}"));
        }

        let job_status: JobStatusResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse job status response: {e}"))?;

        let mut metadata = HashMap::new();
        metadata.insert("backend".to_string(), serde_json::Value::String(job_status.backend));
        metadata.insert("creation_date".to_string(), serde_json::Value::String(job_status.creation_date));
        metadata.insert("shots".to_string(), serde_json::Value::Number(job_status.shots.into()));

        let result_data = if let Some(result) = job_status.result {
            if let Some(counts) = result.counts {
                Some(serde_json::to_value(counts).unwrap_or_default())
            } else if let Some(statevector) = result.statevector {
                Some(serde_json::to_value(statevector).unwrap_or_default())
            } else if let Some(unitary) = result.unitary {
                // Use the previously unused unitary field for quantum gate operations
                Some(serde_json::to_value(unitary).unwrap_or_default())
            } else {
                result.memory.map(|memory| serde_json::to_value(memory).unwrap_or_default())
            }
        } else {
            None
        };

        let error_message = job_status.error.map(|e| {
            // Use the previously unused code and details fields
            if let Some(code) = e.code {
                let message = e.message;
                let details = e.details.unwrap_or_default();
                format!("[{code}] {message}: {details}")
            } else {
                let message = e.message;
                let details = e.details.unwrap_or_default();
                format!("{message}: {details}")
            }
        });

        Ok(QuantumJobResult {
            job_id: job_status.id,
            status: job_status.status,
            result: result_data,
            execution_time: None, // IBM doesn't always provide this
            error: error_message,
            metadata,
        })
    }

    /// Wait for job completion with timeout
    pub async fn wait_for_job_completion(
        &self,
        job_id: &str,
        timeout_seconds: Option<u64>,
    ) -> Result<QuantumJobResult, String> {
        let timeout = timeout_seconds.unwrap_or(300); // 5 minutes default
        let start_time = Instant::now();
        let poll_interval = Duration::from_secs(5);

        loop {
            if start_time.elapsed().as_secs() > timeout {
                return Err(format!("Job {job_id} timed out after {timeout} seconds"));
            }

            let result = self.get_job_result(job_id).await?;
            
            match result.status.as_str() {
                "COMPLETED" => return Ok(result),
                "ERROR" | "CANCELLED" => {
                    let status = result.status;
                    let error = result.error.unwrap_or_default();
                    return Err(format!(
                        "Job {job_id} failed with status: {status} - {error}"
                    ));
                }
                "RUNNING" | "QUEUED" | "VALIDATING" => {
                    // Continue polling
                    tokio::time::sleep(poll_interval).await;
                }
                _ => {
                    // Unknown status, continue polling but log it
                    tokio::time::sleep(poll_interval).await;
                }
            }
        }
    }

    /// Execute a quantum circuit and wait for results
    pub async fn execute_circuit(
        &self,
        circuit: &QuantumCircuit,
        job_config: Option<&QuantumJobConfig>,
        timeout_seconds: Option<u64>,
    ) -> Result<QuantumJobResult, String> {
        let config = job_config.cloned().unwrap_or_else(|| QuantumJobConfig {
            backend: self.config.default_backend.clone(),
            ..Default::default()
        });

        let job_id = self.submit_job(circuit, &config).await?;
        self.wait_for_job_completion(&job_id, timeout_seconds).await
    }

    /// Parse backend information from IBM API response
    fn parse_backend_info(&self, data: serde_json::Value) -> Result<QuantumBackend, String> {
        let name = data["name"]
            .as_str()
            .ok_or("Missing backend name")?
            .to_string();

        let status = data["status"]
            .as_str()
            .unwrap_or("unknown")
            .to_string();

        let pending_jobs = data["pending_jobs"]
            .as_u64()
            .unwrap_or(0) as u32;

        let max_shots = data["max_shots"]
            .as_u64()
            .unwrap_or(8192) as u32;

        let num_qubits = data["configuration"]["num_qubits"]
            .as_u64()
            .unwrap_or(0) as u32;

        let basis_gates = data["configuration"]["basis_gates"]
            .as_array()
            .map(|gates| {
                gates.iter()
                    .filter_map(|g| g.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        Ok(QuantumBackend {
            name,
            status,
            pending_jobs,
            max_shots,
            num_qubits,
            basis_gates,
            coupling_map: self.parse_coupling_map(&data),
            gate_errors: self.parse_gate_errors(&data),
            readout_errors: self.parse_readout_errors(&data),
        })
    }

    /// Parse coupling map from IBM backend data (production implementation)
    fn parse_coupling_map(&self, data: &serde_json::Value) -> Option<Vec<Vec<u32>>> {
        data["configuration"]["coupling_map"]
            .as_array()
            .map(|coupling_array| {
                coupling_array.iter()
                    .filter_map(|pair| {
                        if let Some(pair_array) = pair.as_array() {
                            if pair_array.len() == 2 {
                                let qubit1 = pair_array[0].as_u64()? as u32;
                                let qubit2 = pair_array[1].as_u64()? as u32;
                                Some(vec![qubit1, qubit2])
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    })
                    .collect()
            })
    }

    /// Parse gate errors from IBM backend data (production implementation)
    fn parse_gate_errors(&self, data: &serde_json::Value) -> Option<HashMap<String, f64>> {
        data["properties"]["gates"]
            .as_array()
            .map(|gates| {
                let mut gate_errors = HashMap::new();
                for gate in gates {
                    if let (Some(name), Some(error)) = (
                        gate["gate"].as_str(),
                        gate["parameters"].as_array().and_then(|params| {
                            params.iter().find(|p| p["name"] == "gate_error")
                                .and_then(|p| p["value"].as_f64())
                        })
                    ) {
                        gate_errors.insert(name.to_string(), error);
                    }
                }
                gate_errors
            })
    }

    /// Parse readout errors from IBM backend data (production implementation)
    fn parse_readout_errors(&self, data: &serde_json::Value) -> Option<Vec<f64>> {
        data["properties"]["readout_errors"]
            .as_array()
            .map(|errors| {
                errors.iter()
                    .filter_map(|e| e.as_f64())
                    .collect()
            })
    }

    /// Test connection to IBM Quantum
    pub async fn test_connection(&self) -> Result<String, String> {
        let backends = self.get_backends().await?;
        let available_backends: Vec<&str> = backends.iter()
            .filter(|b| b.status == "online")
            .map(|b| b.name.as_str())
            .collect();

        let backends_list = available_backends.join(", ");
        Ok(format!(
            "IBM Quantum connection successful. Available backends: {backends_list}"
        ))
    }
}

/// Create a simple quantum circuit for testing
pub fn create_test_circuit() -> QuantumCircuit {
    let qasm = r#"
OPENQASM 3.0;
include "stdgates.inc";

// Simple Bell state circuit
qubit[2] q;
bit[2] c;

// Create Bell state |00⟩ + |11⟩
h q[0];
cx q[0], q[1];

// Measure
c[0] = measure q[0];
c[1] = measure q[1];
"#.trim().to_string();

    let mut metadata = HashMap::new();
    metadata.insert("description".to_string(), "Bell state test circuit".to_string());
    metadata.insert("created_by".to_string(), "zen-swarm-orchestrator".to_string());

    QuantumCircuit {
        qasm,
        num_qubits: 2,
        num_cbits: 2,
        depth: 2,
        metadata,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_test_circuit() {
        let circuit = create_test_circuit();
        assert_eq!(circuit.num_qubits, 2);
        assert_eq!(circuit.num_cbits, 2);
        assert_eq!(circuit.depth, 2);
        assert!(circuit.qasm.contains("OPENQASM 3.0"));
        assert!(circuit.qasm.contains("Bell state"));
    }

    #[tokio::test]
    async fn test_provider_creation_without_token() {
        let config = QuantumConfig::default();
        let result = IBMQuantumProvider::new(config);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("IBM Quantum token not configured"));
    }
}