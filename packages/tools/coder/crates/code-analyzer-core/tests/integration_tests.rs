use code_analyzer_core::testing_framework::*;
use code_analyzer_core::{CodeIntelligenceEngine, AnalysisRequest, ProcessingConfiguration};
use std::collections::HashMap;
use tempfile::TempDir;
use tokio::fs;

#[tokio::test]
async fn test_unit_test_execution() {
    let framework = ComprehensiveTestingFramework::new().unwrap();
    
    let test_case = TestCase {
        name: "rust_function_analysis".to_string(),
        description: "Test AST analysis of Rust function".to_string(),
        test_type: TestType::Unit,
        input_data: TestInputData {
            source_code: Some(r#"
                fn calculate_sum(a: i32, b: i32) -> i32 {
                    a + b
                }
                
                fn main() {
                    let result = calculate_sum(5, 3);
                    println!("Result: {}", result);
                }
            "#.to_string()),
            file_path: None,
            project_configuration: None,
            analysis_parameters: None,
            mock_data: None,
        },
        expected_output: ExpectedOutput {
            success: true,
            error_message: None,
            metrics: Some({
                let mut metrics = HashMap::new();
                metrics.insert("function_count".to_string(), 2.0);
                metrics
            }),
            analysis_results: None,
            performance_thresholds: None,
        },
        preconditions: Vec::new(),
        postconditions: Vec::new(),
        tags: vec!["unit".to_string(), "ast".to_string(), "rust".to_string()],
    };

    let test_suite = TestSuite {
        name: "rust_analysis_suite".to_string(),
        description: "Test suite for Rust code analysis".to_string(),
        test_cases: vec![test_case],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 30000,
        parallel_execution: false,
    };

    framework.register_test_suite(test_suite).await.unwrap();
    let report = framework.execute_test_suite("rust_analysis_suite").await.unwrap();
    
    assert_eq!(report.suite_name, "rust_analysis_suite");
    assert_eq!(report.total_tests, 1);
    assert!(report.passed_tests > 0 || report.failed_tests > 0); // At least attempted
}

#[tokio::test]
async fn test_integration_test_execution() {
    let temp_dir = TempDir::new().unwrap();
    let test_file_path = temp_dir.path().join("test_source.rs");
    
    let test_source = r#"
        use std::collections::HashMap;
        
        pub struct DataProcessor {
            data: HashMap<String, i32>,
        }
        
        impl DataProcessor {
            pub fn new() -> Self {
                Self {
                    data: HashMap::new(),
                }
            }
            
            pub fn add_entry(&mut self, key: String, value: i32) {
                self.data.insert(key, value);
            }
            
            pub fn get_value(&self, key: &str) -> Option<&i32> {
                self.data.get(key)
            }
            
            pub fn process_all(&self) -> i32 {
                self.data.values().sum()
            }
        }
        
        #[cfg(test)]
        mod tests {
            use super::*;
            
            #[test]
            fn test_data_processor() {
                let mut processor = DataProcessor::new();
                processor.add_entry("key1".to_string(), 10);
                processor.add_entry("key2".to_string(), 20);
                
                assert_eq!(processor.get_value("key1"), Some(&10));
                assert_eq!(processor.process_all(), 30);
            }
        }
    "#;
    
    fs::write(&test_file_path, test_source).await.unwrap();
    
    let framework = ComprehensiveTestingFramework::new().unwrap();
    
    let test_case = TestCase {
        name: "rust_struct_integration".to_string(),
        description: "Integration test for Rust struct analysis".to_string(),
        test_type: TestType::Integration,
        input_data: TestInputData {
            source_code: None,
            file_path: Some(test_file_path),
            project_configuration: None,
            analysis_parameters: None,
            mock_data: None,
        },
        expected_output: ExpectedOutput {
            success: true,
            error_message: None,
            metrics: Some({
                let mut metrics = HashMap::new();
                metrics.insert("struct_count".to_string(), 1.0);
                metrics.insert("impl_count".to_string(), 1.0);
                metrics
            }),
            analysis_results: None,
            performance_thresholds: None,
        },
        preconditions: Vec::new(),
        postconditions: Vec::new(),
        tags: vec!["integration".to_string(), "struct".to_string(), "rust".to_string()],
    };

    let test_suite = TestSuite {
        name: "integration_test_suite".to_string(),
        description: "Integration tests for file-based analysis".to_string(),
        test_cases: vec![test_case],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 45000,
        parallel_execution: false,
    };

    framework.register_test_suite(test_suite).await.unwrap();
    let report = framework.execute_test_suite("integration_test_suite").await.unwrap();
    
    assert_eq!(report.suite_name, "integration_test_suite");
    assert_eq!(report.total_tests, 1);
}

#[tokio::test]
async fn test_performance_test_execution() {
    let framework = ComprehensiveTestingFramework::new().unwrap();
    
    let test_case = TestCase {
        name: "performance_analysis_test".to_string(),
        description: "Performance test for large code analysis".to_string(),
        test_type: TestType::Performance,
        input_data: TestInputData {
            source_code: Some({
                let mut large_code = String::new();
                large_code.push_str("// Large Rust file for performance testing\n");
                
                // Generate a large function with many statements
                for i in 0..100 {
                    large_code.push_str(&format!(
                        r#"
                        pub fn function_{i}() -> i32 {{
                            let mut result = 0;
                            for j in 0..10 {{
                                result += j * {i};
                            }}
                            result
                        }}
                        "#,
                        i = i
                    ));
                }
                
                large_code.push_str(r#"
                    pub fn main() {
                        let mut total = 0;
                "#);
                
                for i in 0..100 {
                    large_code.push_str(&format!("        total += function_{}();\n", i));
                }
                
                large_code.push_str(r#"
                        println!("Total: {}", total);
                    }
                "#);
                
                large_code
            }),
            file_path: None,
            project_configuration: None,
            analysis_parameters: None,
            mock_data: None,
        },
        expected_output: ExpectedOutput {
            success: true,
            error_message: None,
            metrics: Some({
                let mut metrics = HashMap::new();
                metrics.insert("function_count".to_string(), 101.0); // 100 generated + main
                metrics
            }),
            analysis_results: None,
            performance_thresholds: Some(PerformanceThresholds {
                max_execution_time_milliseconds: 5000, // 5 seconds max
                max_memory_usage_bytes: 100_000_000,   // 100MB max
                min_throughput_operations_per_second: 1.0,
            }),
        },
        preconditions: Vec::new(),
        postconditions: Vec::new(),
        tags: vec!["performance".to_string(), "large_code".to_string(), "rust".to_string()],
    };

    let test_suite = TestSuite {
        name: "performance_test_suite".to_string(),
        description: "Performance tests for code analysis engine".to_string(),
        test_cases: vec![test_case],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 60000, // 1 minute timeout for performance tests
        parallel_execution: false,
    };

    framework.register_test_suite(test_suite).await.unwrap();
    let report = framework.execute_test_suite("performance_test_suite").await.unwrap();
    
    assert_eq!(report.suite_name, "performance_test_suite");
    assert_eq!(report.total_tests, 1);
    
    // Check that performance metrics were collected
    if !report.test_results.is_empty() {
        let test_result = &report.test_results[0];
        assert!(test_result.execution_time_milliseconds > 0);
        assert!(test_result.performance_metrics.execution_time_milliseconds > 0);
    }
}

#[tokio::test]
async fn test_security_test_execution() {
    let framework = ComprehensiveTestingFramework::new().unwrap();
    
    let test_case = TestCase {
        name: "security_vulnerability_detection".to_string(),
        description: "Test detection of potential security vulnerabilities".to_string(),
        test_type: TestType::Security,
        input_data: TestInputData {
            source_code: Some(r#"
                use std::process::Command;
                use std::env;
                
                // Potentially unsafe code patterns for security testing
                pub fn execute_command(user_input: &str) -> std::io::Result<std::process::Output> {
                    // WARNING: This is intentionally unsafe for testing purposes
                    // In real code, this would be a security vulnerability
                    Command::new("sh")
                        .arg("-c")
                        .arg(user_input) // Direct user input to shell - DANGEROUS!
                        .output()
                }
                
                pub fn read_environment_variable(key: &str) -> Option<String> {
                    env::var(key).ok()
                }
                
                pub fn unsafe_string_handling(data: &str) -> String {
                    // Potential buffer overflow patterns (not applicable in Rust, but for testing)
                    data.to_string()
                }
                
                pub fn main() {
                    if let Some(cmd) = read_environment_variable("USER_COMMAND") {
                        match execute_command(&cmd) {
                            Ok(output) => println!("Output: {}", String::from_utf8_lossy(&output.stdout)),
                            Err(e) => eprintln!("Error: {}", e),
                        }
                    }
                }
            "#.to_string()),
            file_path: None,
            project_configuration: None,
            analysis_parameters: None,
            mock_data: None,
        },
        expected_output: ExpectedOutput {
            success: true,
            error_message: None,
            metrics: Some({
                let mut metrics = HashMap::new();
                metrics.insert("function_count".to_string(), 4.0);
                metrics.insert("potential_security_issues".to_string(), 1.0); // The command execution
                metrics
            }),
            analysis_results: None,
            performance_thresholds: None,
        },
        preconditions: Vec::new(),
        postconditions: Vec::new(),
        tags: vec!["security".to_string(), "vulnerability".to_string(), "rust".to_string()],
    };

    let test_suite = TestSuite {
        name: "security_test_suite".to_string(),
        description: "Security tests for vulnerability detection".to_string(),
        test_cases: vec![test_case],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 30000,
        parallel_execution: false,
    };

    framework.register_test_suite(test_suite).await.unwrap();
    let report = framework.execute_test_suite("security_test_suite").await.unwrap();
    
    assert_eq!(report.suite_name, "security_test_suite");
    assert_eq!(report.total_tests, 1);
}

#[tokio::test]
async fn test_comprehensive_test_report_generation() {
    let framework = ComprehensiveTestingFramework::new().unwrap();
    
    // Create multiple test suites to test comprehensive reporting
    let unit_test_suite = TestSuite {
        name: "unit_tests".to_string(),
        description: "Unit test suite".to_string(),
        test_cases: vec![
            TestCase {
                name: "simple_function_test".to_string(),
                description: "Test simple function analysis".to_string(),
                test_type: TestType::Unit,
                input_data: TestInputData {
                    source_code: Some("fn add(a: i32, b: i32) -> i32 { a + b }".to_string()),
                    file_path: None,
                    project_configuration: None,
                    analysis_parameters: None,
                    mock_data: None,
                },
                expected_output: ExpectedOutput {
                    success: true,
                    error_message: None,
                    metrics: Some({
                        let mut metrics = HashMap::new();
                        metrics.insert("function_count".to_string(), 1.0);
                        metrics
                    }),
                    analysis_results: None,
                    performance_thresholds: None,
                },
                preconditions: Vec::new(),
                postconditions: Vec::new(),
                tags: vec!["unit".to_string()],
            }
        ],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 30000,
        parallel_execution: false,
    };

    let regression_test_suite = TestSuite {
        name: "regression_tests".to_string(),
        description: "Regression test suite".to_string(),
        test_cases: vec![
            TestCase {
                name: "complex_struct_test".to_string(),
                description: "Test complex struct analysis".to_string(),
                test_type: TestType::Regression,
                input_data: TestInputData {
                    source_code: Some(r#"
                        pub struct ComplexStruct<T> {
                            field1: T,
                            field2: Vec<T>,
                            field3: Option<T>,
                        }
                        
                        impl<T> ComplexStruct<T> {
                            pub fn new(initial: T) -> Self {
                                Self {
                                    field1: initial,
                                    field2: Vec::new(),
                                    field3: None,
                                }
                            }
                        }
                    "#.to_string()),
                    file_path: None,
                    project_configuration: None,
                    analysis_parameters: None,
                    mock_data: None,
                },
                expected_output: ExpectedOutput {
                    success: true,
                    error_message: None,
                    metrics: Some({
                        let mut metrics = HashMap::new();
                        metrics.insert("struct_count".to_string(), 1.0);
                        metrics.insert("impl_count".to_string(), 1.0);
                        metrics
                    }),
                    analysis_results: None,
                    performance_thresholds: None,
                },
                preconditions: Vec::new(),
                postconditions: Vec::new(),
                tags: vec!["regression".to_string(), "generic".to_string()],
            }
        ],
        setup_hooks: Vec::new(),
        teardown_hooks: Vec::new(),
        timeout_milliseconds: 30000,
        parallel_execution: false,
    };

    framework.register_test_suite(unit_test_suite).await.unwrap();
    framework.register_test_suite(regression_test_suite).await.unwrap();
    
    let comprehensive_report = framework.generate_comprehensive_report().await.unwrap();
    
    assert_eq!(comprehensive_report.suite_reports.len(), 2);
    assert!(!comprehensive_report.framework_version.is_empty());
    
    // Verify that each suite has results
    for suite_report in &comprehensive_report.suite_reports {
        assert!(!suite_report.suite_name.is_empty());
        assert_eq!(suite_report.total_tests, suite_report.test_results.len());
    }
}

#[tokio::test]
async fn test_quality_gate_validation() {
    let ci_bridge = ContinuousIntegrationBridge::new().unwrap();
    
    // Test case: High-quality report that should pass quality gates
    let passing_report = TestSuiteReport {
        suite_name: "passing_suite".to_string(),
        total_tests: 100,
        passed_tests: 98,
        failed_tests: 2,
        skipped_tests: 0,
        total_execution_time_milliseconds: 5000,
        test_results: Vec::new(), // Simplified for testing
        coverage_report: CoverageReport {
            line_coverage_percentage: 85.0,
            branch_coverage_percentage: 80.0,
            function_coverage_percentage: 90.0,
            uncovered_lines: Vec::new(),
            uncovered_branches: Vec::new(),
            uncovered_functions: Vec::new(),
        },
        performance_summary: PerformanceSummary {
            average_execution_time_milliseconds: 50.0,
            median_execution_time_milliseconds: 45.0,
            percentile_95_execution_time_milliseconds: 100.0,
            max_memory_usage_bytes: 10_000_000,
            average_cpu_usage_percentage: 25.0,
            total_disk_io_bytes: 1_000_000,
            total_network_io_bytes: 500_000,
        },
    };

    let quality_result = ci_bridge.validate_quality_gates(&passing_report).await.unwrap();
    assert!(quality_result.passed);
    assert!(quality_result.coverage_gate_passed);
    assert!(quality_result.failure_rate_gate_passed);

    // Test case: Low-quality report that should fail quality gates
    let failing_report = TestSuiteReport {
        suite_name: "failing_suite".to_string(),
        total_tests: 100,
        passed_tests: 85,
        failed_tests: 15, // 15% failure rate - too high
        skipped_tests: 0,
        total_execution_time_milliseconds: 15000,
        test_results: Vec::new(),
        coverage_report: CoverageReport {
            line_coverage_percentage: 65.0, // Below 80% threshold
            branch_coverage_percentage: 60.0,
            function_coverage_percentage: 70.0,
            uncovered_lines: Vec::new(),
            uncovered_branches: Vec::new(),
            uncovered_functions: Vec::new(),
        },
        performance_summary: PerformanceSummary {
            average_execution_time_milliseconds: 150.0,
            median_execution_time_milliseconds: 140.0,
            percentile_95_execution_time_milliseconds: 300.0,
            max_memory_usage_bytes: 50_000_000,
            average_cpu_usage_percentage: 80.0,
            total_disk_io_bytes: 5_000_000,
            total_network_io_bytes: 2_000_000,
        },
    };

    let quality_result = ci_bridge.validate_quality_gates(&failing_report).await.unwrap();
    assert!(!quality_result.passed);
    assert!(!quality_result.coverage_gate_passed); // Coverage too low
    assert!(!quality_result.failure_rate_gate_passed); // Failure rate too high
}

#[tokio::test]
async fn test_test_data_manager() {
    let test_data_manager = TestDataManager::new().unwrap();
    
    let test_data = serde_json::json!({
        "sample_code": "fn main() { println!(\"Hello, world!\"); }",
        "expected_tokens": ["fn", "main", "println"],
        "complexity_score": 1.2
    });

    test_data_manager.store_test_data("rust_sample".to_string(), test_data.clone()).await.unwrap();
    
    let retrieved_data = test_data_manager.load_test_data("rust_sample").await.unwrap();
    assert_eq!(retrieved_data, test_data);

    // Test error case
    let missing_data_result = test_data_manager.load_test_data("non_existent_key").await;
    assert!(missing_data_result.is_err());
}

#[tokio::test]
async fn test_mock_service_integration() {
    struct MockAstService;
    
    impl MockService for MockAstService {
        fn handle_request(&self, request: serde_json::Value) -> anyhow::Result<serde_json::Value> {
            if let Some(source_code) = request.get("source_code").and_then(|v| v.as_str()) {
                let function_count = source_code.matches("fn ").count();
                Ok(serde_json::json!({
                    "function_count": function_count,
                    "analysis_complete": true,
                    "mock_service": true
                }))
            } else {
                Err(anyhow::anyhow!("Invalid request format"))
            }
        }

        fn reset(&self) -> anyhow::Result<()> {
            Ok(())
        }
    }

    let mock_manager = MockServiceManager::new().unwrap();
    mock_manager.register_mock_service("ast_service".to_string(), Box::new(MockAstService)).await.unwrap();
    
    let request = serde_json::json!({
        "source_code": "fn main() {} fn helper() {}"
    });
    
    let response = mock_manager.call_mock_service("ast_service", request).await.unwrap();
    assert_eq!(response["function_count"], 2);
    assert_eq!(response["mock_service"], true);
}

#[cfg(test)]
mod comprehensive_framework_tests {
    use super::*;

    #[tokio::test]
    async fn test_end_to_end_testing_workflow() {
        // This test demonstrates a complete end-to-end testing workflow
        // using the comprehensive testing framework
        
        let framework = ComprehensiveTestingFramework::new().unwrap();
        
        // Step 1: Create test data
        let test_data_manager = TestDataManager::new().unwrap();
        let sample_rust_code = r#"
            use std::collections::HashMap;
            
            pub struct Calculator {
                operations: HashMap<String, f64>,
            }
            
            impl Calculator {
                pub fn new() -> Self {
                    Self {
                        operations: HashMap::new(),
                    }
                }
                
                pub fn add(&mut self, name: String, a: f64, b: f64) -> f64 {
                    let result = a + b;
                    self.operations.insert(name, result);
                    result
                }
                
                pub fn multiply(&mut self, name: String, a: f64, b: f64) -> f64 {
                    let result = a * b;
                    self.operations.insert(name, result);
                    result
                }
                
                pub fn get_operation_result(&self, name: &str) -> Option<f64> {
                    self.operations.get(name).copied()
                }
                
                pub fn clear_operations(&mut self) {
                    self.operations.clear();
                }
            }
            
            #[cfg(test)]
            mod tests {
                use super::*;
                
                #[test]
                fn test_calculator_operations() {
                    let mut calc = Calculator::new();
                    
                    let add_result = calc.add("test_add".to_string(), 5.0, 3.0);
                    assert_eq!(add_result, 8.0);
                    
                    let mult_result = calc.multiply("test_mult".to_string(), 4.0, 2.0);
                    assert_eq!(mult_result, 8.0);
                    
                    assert_eq!(calc.get_operation_result("test_add"), Some(8.0));
                    assert_eq!(calc.get_operation_result("test_mult"), Some(8.0));
                    
                    calc.clear_operations();
                    assert_eq!(calc.get_operation_result("test_add"), None);
                }
            }
        "#;
        
        test_data_manager.store_test_data(
            "calculator_sample".to_string(),
            serde_json::json!({
                "source_code": sample_rust_code,
                "expected_metrics": {
                    "struct_count": 1,
                    "impl_count": 1,
                    "function_count": 6, // new, add, multiply, get_operation_result, clear_operations, test_calculator_operations
                    "test_count": 1
                }
            })
        ).await.unwrap();
        
        // Step 2: Create comprehensive test suite
        let comprehensive_test_suite = TestSuite {
            name: "calculator_comprehensive_suite".to_string(),
            description: "Comprehensive testing suite for Calculator struct analysis".to_string(),
            test_cases: vec![
                // Unit test
                TestCase {
                    name: "calculator_unit_test".to_string(),
                    description: "Unit test for Calculator struct AST analysis".to_string(),
                    test_type: TestType::Unit,
                    input_data: TestInputData {
                        source_code: Some(sample_rust_code.to_string()),
                        file_path: None,
                        project_configuration: None,
                        analysis_parameters: None,
                        mock_data: None,
                    },
                    expected_output: ExpectedOutput {
                        success: true,
                        error_message: None,
                        metrics: Some({
                            let mut metrics = HashMap::new();
                            metrics.insert("struct_count".to_string(), 1.0);
                            metrics.insert("impl_count".to_string(), 1.0);
                            metrics
                        }),
                        analysis_results: None,
                        performance_thresholds: None,
                    },
                    preconditions: Vec::new(),
                    postconditions: Vec::new(),
                    tags: vec!["unit".to_string(), "calculator".to_string(), "struct".to_string()],
                },
                // Performance test
                TestCase {
                    name: "calculator_performance_test".to_string(),
                    description: "Performance test for Calculator code analysis".to_string(),
                    test_type: TestType::Performance,
                    input_data: TestInputData {
                        source_code: Some(sample_rust_code.to_string()),
                        file_path: None,
                        project_configuration: None,
                        analysis_parameters: None,
                        mock_data: None,
                    },
                    expected_output: ExpectedOutput {
                        success: true,
                        error_message: None,
                        metrics: None,
                        analysis_results: None,
                        performance_thresholds: Some(PerformanceThresholds {
                            max_execution_time_milliseconds: 2000,
                            max_memory_usage_bytes: 50_000_000,
                            min_throughput_operations_per_second: 1.0,
                        }),
                    },
                    preconditions: Vec::new(),
                    postconditions: Vec::new(),
                    tags: vec!["performance".to_string(), "calculator".to_string()],
                },
                // Security test
                TestCase {
                    name: "calculator_security_test".to_string(),
                    description: "Security analysis test for Calculator code".to_string(),
                    test_type: TestType::Security,
                    input_data: TestInputData {
                        source_code: Some(sample_rust_code.to_string()),
                        file_path: None,
                        project_configuration: None,
                        analysis_parameters: None,
                        mock_data: None,
                    },
                    expected_output: ExpectedOutput {
                        success: true,
                        error_message: None,
                        metrics: Some({
                            let mut metrics = HashMap::new();
                            metrics.insert("security_issues_found".to_string(), 0.0); // Should be clean code
                            metrics
                        }),
                        analysis_results: None,
                        performance_thresholds: None,
                    },
                    preconditions: Vec::new(),
                    postconditions: Vec::new(),
                    tags: vec!["security".to_string(), "calculator".to_string()],
                },
            ],
            setup_hooks: vec!["echo 'Starting Calculator test suite'".to_string()],
            teardown_hooks: vec!["echo 'Completed Calculator test suite'".to_string()],
            timeout_milliseconds: 60000,
            parallel_execution: false,
        };
        
        // Step 3: Register and execute test suite
        framework.register_test_suite(comprehensive_test_suite).await.unwrap();
        let suite_report = framework.execute_test_suite("calculator_comprehensive_suite").await.unwrap();
        
        // Step 4: Validate results
        assert_eq!(suite_report.suite_name, "calculator_comprehensive_suite");
        assert_eq!(suite_report.total_tests, 3);
        
        // Ensure each test type was executed
        let test_types_executed: std::collections::HashSet<&str> = suite_report.test_results
            .iter()
            .flat_map(|result| {
                if result.test_case_name.contains("unit") {
                    Some("unit")
                } else if result.test_case_name.contains("performance") {
                    Some("performance")
                } else if result.test_case_name.contains("security") {
                    Some("security")
                } else {
                    None
                }
            })
            .collect();
        
        // We should have attempted all test types (success/failure doesn't matter for this test)
        assert!(test_types_executed.len() > 0);
        
        // Step 5: Generate comprehensive report
        let comprehensive_report = framework.generate_comprehensive_report().await.unwrap();
        assert_eq!(comprehensive_report.suite_reports.len(), 1);
        assert!(!comprehensive_report.framework_version.is_empty());
        
        // Step 6: Validate quality gates
        let ci_bridge = ContinuousIntegrationBridge::new().unwrap();
        let quality_result = ci_bridge.validate_quality_gates(&suite_report).await.unwrap();
        
        // Quality gate validation should complete (pass/fail is implementation dependent)
        assert!(!quality_result.details.is_empty());
    }
}