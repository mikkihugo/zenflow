//! TypeScript compiler (stub)

use crate::{error::V8Error, types::CompilerConfig};

pub struct TypeScriptCompiler {
    _config: CompilerConfig,
}

impl TypeScriptCompiler {
    pub fn new(config: &CompilerConfig) -> Result<Self, V8Error> {
        Ok(Self { _config: config.clone() })
    }
    
    pub async fn compile_typescript(&self, source: &str) -> Result<String, V8Error> {
        // Simple stub - just return the source (in real implementation, this would transpile TS to JS)
        Ok(source.to_string())
    }
}