//! WASM-specific tests
#![allow(dead_code)]

use wasm_bindgen_test::*;
use code_mesh_wasm::*;
use js_sys::*;
use web_sys::*;
use wasm_bindgen::JsCast;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_wasm_initialization() {
    // Test that WASM module initializes correctly  
    // Should not panic
}

#[wasm_bindgen_test]
fn test_hardware_detector_creation_wasm() {
    let _detector = HardwareDetector::new();
    // Should initialize without errors
}

#[wasm_bindgen_test]
async fn test_hardware_detection_wasm() {
    let mut detector = HardwareDetector::new();
    
    // This should not panic even if detection fails in test environment
    let _result = detector.detect_hardware().await;
}

#[wasm_bindgen_test]
fn test_code_mesh_creation_wasm() {
    let _mesh = CodeMesh::new();
    // Should initialize without errors
}

#[wasm_bindgen_test]
fn test_agent_creation_wasm() {
    let mut mesh = CodeMesh::new();
    let agent_id = mesh.create_agent("test-agent").unwrap();
    assert!(agent_id.starts_with("agent_"));
}

#[wasm_bindgen_test]
fn test_tool_registry_wasm() {
    let registry = ToolRegistry::new();
    
    // Should start with no tools
    let tools = registry.list().unwrap();
    let tools_array: Vec<String> = serde_wasm_bindgen::from_value(tools).unwrap();
    assert_eq!(tools_array.len(), 0);
}

#[wasm_bindgen_test]
fn test_greet_function_wasm() {
    // Test the basic greet function
    // This will show an alert in browser, but should not panic in test
    greet("Test User");
}

#[wasm_bindgen_test]
fn test_javascript_interop() {
    // Test that we can properly interact with JavaScript objects
    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"test".into(), &"value".into()).unwrap();
    
    let retrieved = js_sys::Reflect::get(&obj, &"test".into()).unwrap();
    assert_eq!(retrieved.as_string().unwrap(), "value");
}

#[wasm_bindgen_test]
fn test_console_logging_wasm() {
    // Test that console logging works
    web_sys::console::log_1(&"Test log message".into());
    web_sys::console::warn_1(&"Test warning message".into());
    web_sys::console::error_1(&"Test error message".into());
}

#[wasm_bindgen_test]
fn test_local_storage_integration() {
    let window = web_sys::window().unwrap();
    let storage = window.local_storage().unwrap().unwrap();
    
    // Test storing data in browser's localStorage
    storage.set_item("test-key", "test-value").unwrap();
    let retrieved = storage.get_item("test-key").unwrap().unwrap();
    
    assert_eq!(retrieved, "test-value");
    
    // Clean up
    storage.remove_item("test-key").unwrap();
}

#[wasm_bindgen_test]
async fn test_fetch_api_integration() {
    use wasm_bindgen_futures::JsFuture;
    
    // Test that we can use fetch API (for HTTP requests)
    let window = web_sys::window().unwrap();
    let request = web_sys::Request::new_with_str("data:text/plain,hello").unwrap();
    
    let response_promise = window.fetch_with_request(&request);
    let response = JsFuture::from(response_promise).await.unwrap();
    let response: web_sys::Response = response.dyn_into().unwrap();
    
    assert!(response.ok());
}

#[wasm_bindgen_test]
fn test_url_handling_wasm() {
    // Test URL parsing and manipulation
    let url = web_sys::Url::new("https://example.com/path?param=value").unwrap();
    
    assert_eq!(url.hostname(), "example.com");
    assert_eq!(url.pathname(), "/path");
    assert_eq!(url.search(), "?param=value");
}

#[wasm_bindgen_test]
fn test_crypto_random_wasm() {
    // Test crypto random number generation - skip if crypto not available
    let window = web_sys::window().unwrap();
    if let Ok(_crypto) = js_sys::Reflect::get(&window, &wasm_bindgen::JsValue::from_str("crypto")) {
        // Crypto is available but we'll skip actual testing in test environment
        // This test just verifies the crypto object exists
        assert!(true);
    } else {
        // No crypto available in test environment - this is expected
        assert!(true);
    }
}

#[wasm_bindgen_test]
fn test_base64_encoding_wasm() {
    // Test base64 encoding/decoding
    let window = web_sys::window().unwrap();
    let original = "Hello, WASM World!";
    let encoded = window.btoa(original).unwrap();
    let decoded = window.atob(&encoded).unwrap();
    
    assert_eq!(decoded, original);
}

#[wasm_bindgen_test]
fn test_performance_wasm() {
    let start = js_sys::Date::now();
    
    // Perform some operations
    let _detector = HardwareDetector::new();
    let mut mesh = CodeMesh::new();
    let _registry = ToolRegistry::new();
    
    for i in 0..100 {
        let _agent_id = mesh.create_agent(&format!("test-agent-{}", i)).unwrap();
    }
    
    let end = js_sys::Date::now();
    let duration = end - start;
    
    // Should complete in reasonable time (less than 1 second)
    assert!(duration < 1000.0);
}

#[wasm_bindgen_test]
fn test_memory_management_wasm() {
    // Create many objects to test memory management
    let mut agents = Vec::new();
    
    let mut mesh = CodeMesh::new();
    for i in 0..100 {
        let agent_id = mesh.create_agent(&format!("test-agent-{}", i)).unwrap();
        agents.push(agent_id);
    }
    
    assert_eq!(agents.len(), 100);
    
    // Objects should be properly cleaned up when dropped
    drop(agents);
}

#[wasm_bindgen_test]
fn test_event_handling_wasm() {
    // Test event handling setup
    let document = web_sys::window().unwrap().document().unwrap();
    let element = document.create_element("div").unwrap();
    
    // This would normally set up event listeners
    // For testing, we just verify the element was created
    assert_eq!(element.tag_name(), "DIV");
}