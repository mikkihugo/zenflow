//! Symbol table and reference tracking

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

pub use crate::{SymbolReference, SymbolType};

/// Symbol table for tracking definitions and references
#[derive(Debug, Default)]
pub struct SymbolTable {
    /// Map from symbol name to its definitions
    definitions: HashMap<String, Vec<SymbolReference>>,
    /// Map from symbol name to its references
    references: HashMap<String, Vec<SymbolReference>>,
}

impl SymbolTable {
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a symbol definition
    pub fn add_definition(&mut self, symbol: SymbolReference) {
        self.definitions
            .entry(symbol.name.clone())
            .or_default()
            .push(symbol);
    }

    /// Add a symbol reference
    pub fn add_reference(&mut self, symbol: SymbolReference) {
        self.references
            .entry(symbol.name.clone())
            .or_default()
            .push(symbol);
    }

    /// Get all definitions for a symbol
    pub fn get_definitions(&self, name: &str) -> Vec<&SymbolReference> {
        self.definitions
            .get(name)
            .map(|refs| refs.iter().collect())
            .unwrap_or_default()
    }

    /// Get all references for a symbol
    pub fn get_references(&self, name: &str) -> Vec<&SymbolReference> {
        self.references
            .get(name)
            .map(|refs| refs.iter().collect())
            .unwrap_or_default()
    }

    /// Get all symbols
    pub fn get_all_symbols(&self) -> Vec<&SymbolReference> {
        self.definitions
            .values()
            .flat_map(|refs| refs.iter())
            .chain(
                self.references
                    .values()
                    .flat_map(|refs| refs.iter())
            )
            .collect()
    }

    /// Find unused symbols (defined but not referenced)
    pub fn find_unused_symbols(&self) -> Vec<&SymbolReference> {
        self.definitions
            .iter()
            .filter(|(name, _)| !self.references.contains_key(*name))
            .flat_map(|(_, defs)| defs.iter())
            .collect()
    }

    /// Build symbol table from a list of symbols
    pub fn build_from_symbols(symbols: Vec<SymbolReference>) -> Self {
        let mut table = Self::new();
        
        for symbol in symbols {
            // For now, treat all symbols as definitions
            // In a more sophisticated implementation, we'd distinguish
            // between definitions and references
            table.add_definition(symbol);
        }
        
        table
    }

    /// Get symbol statistics
    pub fn get_statistics(&self) -> SymbolStatistics {
        let total_definitions = self.definitions.values().map(|v| v.len()).sum();
        let total_references = self.references.values().map(|v| v.len()).sum();
        let unique_symbols = self.definitions.len() + 
            self.references.keys()
                .filter(|k| !self.definitions.contains_key(*k))
                .count();

        let mut type_counts = HashMap::new();
        for symbol in self.get_all_symbols() {
            *type_counts.entry(symbol.symbol_type.clone()).or_insert(0) += 1;
        }

        SymbolStatistics {
            total_definitions,
            total_references,
            unique_symbols,
            type_counts,
        }
    }
}

/// Statistics about symbols in the codebase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolStatistics {
    pub total_definitions: usize,
    pub total_references: usize,
    pub unique_symbols: usize,
    pub type_counts: HashMap<SymbolType, usize>,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_symbol(name: &str, symbol_type: SymbolType) -> SymbolReference {
        SymbolReference {
            name: name.to_string(),
            symbol_type,
            file: "test.rs".to_string(),
            line: 1,
            column: 1,
            scope: "global".to_string(),
        }
    }

    #[test]
    fn test_symbol_table_creation() {
        let table = SymbolTable::new();
        assert!(table.definitions.is_empty());
        assert!(table.references.is_empty());
    }

    #[test]
    fn test_add_definition() {
        let mut table = SymbolTable::new();
        let symbol = create_test_symbol("test_func", SymbolType::Function);
        
        table.add_definition(symbol);
        assert_eq!(table.definitions.len(), 1);
    }

    #[test]
    fn test_get_definitions() {
        let mut table = SymbolTable::new();
        let symbol = create_test_symbol("test_func", SymbolType::Function);
        
        table.add_definition(symbol);
        let defs = table.get_definitions("test_func");
        assert_eq!(defs.len(), 1);
        assert_eq!(defs[0].name, "test_func");
    }

    #[test]
    fn test_statistics() {
        let symbols = vec![
            create_test_symbol("func1", SymbolType::Function),
            create_test_symbol("func2", SymbolType::Function),
            create_test_symbol("var1", SymbolType::Variable),
        ];
        
        let table = SymbolTable::build_from_symbols(symbols);
        let stats = table.get_statistics();
        
        assert_eq!(stats.total_definitions, 3);
        assert_eq!(stats.unique_symbols, 3);
    }
}