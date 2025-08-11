//! CUDA code parsing module

pub mod ast;
pub mod cuda_parser;
pub mod kernel_extractor;
pub mod lexer;
pub mod ptx_parser;

pub use ast::{Ast, Expression, KernelDef, Statement};
pub use cuda_parser::CudaParser;

/// Parse CUDA source code and return AST
pub fn parse(source: &str) -> crate::Result<Ast> {
  let parser = CudaParser::new();
  parser.parse(source)
}
