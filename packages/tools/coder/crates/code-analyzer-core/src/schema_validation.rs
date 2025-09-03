use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context, bail};
use regex::Regex;

/// Production-grade schema validation system inspired by Zod
/// Provides runtime type checking and validation for all data structures
#[derive(Debug, Clone)]
pub struct Schema {
    validators: Vec<Validator>,
    required: bool,
    default_value: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub enum Validator {
    String(StringValidator),
    Number(NumberValidator),
    Boolean,
    Array(Box<Schema>),
    Object(ObjectValidator),
    Enum(Vec<String>),
    Custom(CustomValidator),
}

#[derive(Debug, Clone)]
pub struct StringValidator {
    pub min_length: Option<usize>,
    pub max_length: Option<usize>,
    pub pattern: Option<Regex>,
    pub format: Option<StringFormat>,
}

#[derive(Debug, Clone)]
pub enum StringFormat {
    Email,
    Url,
    Uuid,
    DateTime,
    IpAddress,
    Domain,
    JsonPath,
    Regex,
}

#[derive(Debug, Clone)]
pub struct NumberValidator {
    pub min: Option<f64>,
    pub max: Option<f64>,
    pub integer_only: bool,
    pub positive: bool,
}

#[derive(Debug, Clone)]
pub struct ObjectValidator {
    pub fields: HashMap<String, Schema>,
    pub allow_additional: bool,
    pub strict: bool,
}

#[derive(Debug, Clone)]
pub struct CustomValidator {
    pub name: String,
    pub validation_fn: fn(&serde_json::Value) -> Result<()>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub field_path: String,
    pub error_type: ValidationErrorType,
    pub message: String,
    pub received_value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationErrorType {
    Required,
    Type,
    Format,
    Range,
    Pattern,
    Custom,
    Unknown,
}

#[derive(Debug, Clone)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<ValidationError>,
    pub warnings: Vec<ValidationError>,
}

impl Schema {
    /// Create a new schema builder
    pub fn new() -> Self {
        Self {
            validators: Vec::new(),
            required: false,
            default_value: None,
        }
    }

    /// String schema with validation rules
    pub fn string() -> StringSchemaBuilder {
        StringSchemaBuilder::new()
    }

    /// Number schema with validation rules
    pub fn number() -> NumberSchemaBuilder {
        NumberSchemaBuilder::new()
    }

    /// Boolean schema
    pub fn boolean() -> Self {
        Self {
            validators: vec![Validator::Boolean],
            required: false,
            default_value: None,
        }
    }

    /// Array schema with element validation
    pub fn array(element_schema: Schema) -> ArraySchemaBuilder {
        ArraySchemaBuilder::new(element_schema)
    }

    /// Object schema with field validation
    pub fn object() -> ObjectSchemaBuilder {
        ObjectSchemaBuilder::new()
    }

    /// Enum schema with allowed values
    pub fn enum_values(values: Vec<&str>) -> Self {
        Self {
            validators: vec![Validator::Enum(values.iter().map(|s| s.to_string()).collect())],
            required: false,
            default_value: None,
        }
    }

    /// Mark field as required
    pub fn required(mut self) -> Self {
        self.required = true;
        self
    }

    /// Set default value
    pub fn default<T: Serialize>(mut self, value: T) -> Result<Self> {
        self.default_value = Some(serde_json::to_value(value)?);
        Ok(self)
    }

    /// Validate a value against this schema
    pub fn validate(&self, value: &serde_json::Value, field_path: &str) -> ValidationResult {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Check if required field is missing
        if self.required && value.is_null() {
            errors.push(ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Required,
                message: "Field is required".to_string(),
                received_value: Some(value.clone()),
            });
            return ValidationResult { is_valid: false, errors, warnings };
        }

        // Apply default if value is null
        let effective_value = if value.is_null() && self.default_value.is_some() {
            self.default_value.as_ref().unwrap()
        } else {
            value
        };

        // Run all validators
        for validator in &self.validators {
            match validator {
                Validator::String(string_validator) => {
                    if let Err(error) = self.validate_string(effective_value, string_validator, field_path) {
                        errors.push(error);
                    }
                }
                Validator::Number(number_validator) => {
                    if let Err(error) = self.validate_number(effective_value, number_validator, field_path) {
                        errors.push(error);
                    }
                }
                Validator::Boolean => {
                    if !effective_value.is_boolean() {
                        errors.push(ValidationError {
                            field_path: field_path.to_string(),
                            error_type: ValidationErrorType::Type,
                            message: "Expected boolean".to_string(),
                            received_value: Some(effective_value.clone()),
                        });
                    }
                }
                Validator::Array(element_schema) => {
                    if let Err(error) = self.validate_array(effective_value, element_schema, field_path) {
                        errors.extend(error);
                    }
                }
                Validator::Object(object_validator) => {
                    if let Err(error) = self.validate_object(effective_value, object_validator, field_path) {
                        errors.extend(error);
                    }
                }
                Validator::Enum(allowed_values) => {
                    if let Err(error) = self.validate_enum(effective_value, allowed_values, field_path) {
                        errors.push(error);
                    }
                }
                Validator::Custom(custom_validator) => {
                    if let Err(err) = (custom_validator.validation_fn)(effective_value) {
                        errors.push(ValidationError {
                            field_path: field_path.to_string(),
                            error_type: ValidationErrorType::Custom,
                            message: err.to_string(),
                            received_value: Some(effective_value.clone()),
                        });
                    }
                }
            }
        }

        ValidationResult {
            is_valid: errors.is_empty(),
            errors,
            warnings,
        }
    }

    fn validate_string(&self, value: &serde_json::Value, validator: &StringValidator, field_path: &str) -> Result<(), ValidationError> {
        let string_value = value.as_str().ok_or_else(|| ValidationError {
            field_path: field_path.to_string(),
            error_type: ValidationErrorType::Type,
            message: "Expected string".to_string(),
            received_value: Some(value.clone()),
        })?;

        // Length validation
        if let Some(min_len) = validator.min_length {
            if string_value.len() < min_len {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Range,
                    message: format!("String too short, minimum length is {}", min_len),
                    received_value: Some(value.clone()),
                });
            }
        }

        if let Some(max_len) = validator.max_length {
            if string_value.len() > max_len {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Range,
                    message: format!("String too long, maximum length is {}", max_len),
                    received_value: Some(value.clone()),
                });
            }
        }

        // Pattern validation
        if let Some(ref pattern) = validator.pattern {
            if !pattern.is_match(string_value) {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Pattern,
                    message: format!("String does not match pattern: {}", pattern.as_str()),
                    received_value: Some(value.clone()),
                });
            }
        }

        // Format validation
        if let Some(ref format) = validator.format {
            if let Err(err) = self.validate_string_format(string_value, format) {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Format,
                    message: err,
                    received_value: Some(value.clone()),
                });
            }
        }

        Ok(())
    }

    fn validate_string_format(&self, value: &str, format: &StringFormat) -> Result<(), String> {
        match format {
            StringFormat::Email => {
                let email_regex = Regex::new(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").unwrap();
                if !email_regex.is_match(value) {
                    return Err("Invalid email format".to_string());
                }
            }
            StringFormat::Url => {
                if !value.starts_with("http://") && !value.starts_with("https://") {
                    return Err("Invalid URL format".to_string());
                }
            }
            StringFormat::Uuid => {
                let uuid_regex = Regex::new(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$").unwrap();
                if !uuid_regex.is_match(value) {
                    return Err("Invalid UUID format".to_string());
                }
            }
            StringFormat::DateTime => {
                if chrono::DateTime::parse_from_rfc3339(value).is_err() {
                    return Err("Invalid DateTime format, expected RFC3339".to_string());
                }
            }
            StringFormat::IpAddress => {
                if value.parse::<std::net::IpAddr>().is_err() {
                    return Err("Invalid IP address format".to_string());
                }
            }
            StringFormat::Domain => {
                let domain_regex = Regex::new(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$").unwrap();
                if !domain_regex.is_match(value) {
                    return Err("Invalid domain format".to_string());
                }
            }
            StringFormat::JsonPath => {
                if !value.starts_with('$') {
                    return Err("Invalid JSON path, must start with $".to_string());
                }
            }
            StringFormat::Regex => {
                if Regex::new(value).is_err() {
                    return Err("Invalid regex pattern".to_string());
                }
            }
        }
        Ok(())
    }

    fn validate_number(&self, value: &serde_json::Value, validator: &NumberValidator, field_path: &str) -> Result<(), ValidationError> {
        let number_value = if let Some(num) = value.as_f64() {
            num
        } else {
            return Err(ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Type,
                message: "Expected number".to_string(),
                received_value: Some(value.clone()),
            });
        };

        // Integer validation
        if validator.integer_only && number_value.fract() != 0.0 {
            return Err(ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Type,
                message: "Expected integer".to_string(),
                received_value: Some(value.clone()),
            });
        }

        // Positive validation
        if validator.positive && number_value <= 0.0 {
            return Err(ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Range,
                message: "Number must be positive".to_string(),
                received_value: Some(value.clone()),
            });
        }

        // Range validation
        if let Some(min) = validator.min {
            if number_value < min {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Range,
                    message: format!("Number too small, minimum is {}", min),
                    received_value: Some(value.clone()),
                });
            }
        }

        if let Some(max) = validator.max {
            if number_value > max {
                return Err(ValidationError {
                    field_path: field_path.to_string(),
                    error_type: ValidationErrorType::Range,
                    message: format!("Number too large, maximum is {}", max),
                    received_value: Some(value.clone()),
                });
            }
        }

        Ok(())
    }

    fn validate_array(&self, value: &serde_json::Value, element_schema: &Schema, field_path: &str) -> Result<(), Vec<ValidationError>> {
        let array_value = value.as_array().ok_or_else(|| {
            vec![ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Type,
                message: "Expected array".to_string(),
                received_value: Some(value.clone()),
            }]
        })?;

        let mut errors = Vec::new();
        for (index, element) in array_value.iter().enumerate() {
            let element_path = format!("{}[{}]", field_path, index);
            let result = element_schema.validate(element, &element_path);
            errors.extend(result.errors);
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn validate_object(&self, value: &serde_json::Value, validator: &ObjectValidator, field_path: &str) -> Result<(), Vec<ValidationError>> {
        let object_value = value.as_object().ok_or_else(|| {
            vec![ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Type,
                message: "Expected object".to_string(),
                received_value: Some(value.clone()),
            }]
        })?;

        let mut errors = Vec::new();

        // Validate required fields
        for (field_name, field_schema) in &validator.fields {
            let field_value = object_value.get(field_name).unwrap_or(&serde_json::Value::Null);
            let field_path_full = if field_path.is_empty() {
                field_name.clone()
            } else {
                format!("{}.{}", field_path, field_name)
            };
            
            let result = field_schema.validate(field_value, &field_path_full);
            errors.extend(result.errors);
        }

        // Check for additional fields if strict mode
        if !validator.allow_additional {
            for field_name in object_value.keys() {
                if !validator.fields.contains_key(field_name) {
                    errors.push(ValidationError {
                        field_path: format!("{}.{}", field_path, field_name),
                        error_type: ValidationErrorType::Unknown,
                        message: format!("Unknown field: {}", field_name),
                        received_value: Some(object_value.get(field_name).unwrap().clone()),
                    });
                }
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn validate_enum(&self, value: &serde_json::Value, allowed_values: &[String], field_path: &str) -> Result<(), ValidationError> {
        let string_value = value.as_str().ok_or_else(|| ValidationError {
            field_path: field_path.to_string(),
            error_type: ValidationErrorType::Type,
            message: "Expected string for enum".to_string(),
            received_value: Some(value.clone()),
        })?;

        if !allowed_values.contains(&string_value.to_string()) {
            return Err(ValidationError {
                field_path: field_path.to_string(),
                error_type: ValidationErrorType::Range,
                message: format!("Value must be one of: {}", allowed_values.join(", ")),
                received_value: Some(value.clone()),
            });
        }

        Ok(())
    }
}

impl Default for Schema {
    fn default() -> Self {
        Self::new()
    }
}

/// Builder for string schemas
#[derive(Debug, Clone)]
pub struct StringSchemaBuilder {
    validator: StringValidator,
}

impl StringSchemaBuilder {
    pub fn new() -> Self {
        Self {
            validator: StringValidator {
                min_length: None,
                max_length: None,
                pattern: None,
                format: None,
            },
        }
    }

    pub fn min(mut self, min_length: usize) -> Self {
        self.validator.min_length = Some(min_length);
        self
    }

    pub fn max(mut self, max_length: usize) -> Self {
        self.validator.max_length = Some(max_length);
        self
    }

    pub fn regex(mut self, pattern: &str) -> Result<Self> {
        self.validator.pattern = Some(Regex::new(pattern)?);
        Ok(self)
    }

    pub fn email(mut self) -> Self {
        self.validator.format = Some(StringFormat::Email);
        self
    }

    pub fn url(mut self) -> Self {
        self.validator.format = Some(StringFormat::Url);
        self
    }

    pub fn uuid(mut self) -> Self {
        self.validator.format = Some(StringFormat::Uuid);
        self
    }

    pub fn datetime(mut self) -> Self {
        self.validator.format = Some(StringFormat::DateTime);
        self
    }

    pub fn build(self) -> Schema {
        Schema {
            validators: vec![Validator::String(self.validator)],
            required: false,
            default_value: None,
        }
    }
}

/// Builder for number schemas
#[derive(Debug, Clone)]
pub struct NumberSchemaBuilder {
    validator: NumberValidator,
}

impl NumberSchemaBuilder {
    pub fn new() -> Self {
        Self {
            validator: NumberValidator {
                min: None,
                max: None,
                integer_only: false,
                positive: false,
            },
        }
    }

    pub fn min(mut self, min: f64) -> Self {
        self.validator.min = Some(min);
        self
    }

    pub fn max(mut self, max: f64) -> Self {
        self.validator.max = Some(max);
        self
    }

    pub fn integer(mut self) -> Self {
        self.validator.integer_only = true;
        self
    }

    pub fn positive(mut self) -> Self {
        self.validator.positive = true;
        self
    }

    pub fn build(self) -> Schema {
        Schema {
            validators: vec![Validator::Number(self.validator)],
            required: false,
            default_value: None,
        }
    }
}

/// Builder for array schemas
#[derive(Debug, Clone)]
pub struct ArraySchemaBuilder {
    element_schema: Schema,
}

impl ArraySchemaBuilder {
    pub fn new(element_schema: Schema) -> Self {
        Self { element_schema }
    }

    pub fn build(self) -> Schema {
        Schema {
            validators: vec![Validator::Array(Box::new(self.element_schema))],
            required: false,
            default_value: None,
        }
    }
}

/// Builder for object schemas
#[derive(Debug, Clone)]
pub struct ObjectSchemaBuilder {
    validator: ObjectValidator,
}

impl ObjectSchemaBuilder {
    pub fn new() -> Self {
        Self {
            validator: ObjectValidator {
                fields: HashMap::new(),
                allow_additional: true,
                strict: false,
            },
        }
    }

    pub fn field(mut self, name: &str, schema: Schema) -> Self {
        self.validator.fields.insert(name.to_string(), schema);
        self
    }

    pub fn strict(mut self) -> Self {
        self.validator.allow_additional = false;
        self.validator.strict = true;
        self
    }

    pub fn build(self) -> Schema {
        Schema {
            validators: vec![Validator::Object(self.validator)],
            required: false,
            default_value: None,
        }
    }
}

/// Production-grade validation schemas for common patterns
pub struct ProductionSchemas;

impl ProductionSchemas {
    /// Security pattern validation schema
    pub fn security_pattern() -> Schema {
        Schema::object()
            .field("pattern", Schema::string().min(1).max(1000).build().required())
            .field("severity", Schema::enum_values(vec!["low", "medium", "high", "critical"]).required())
            .field("confidence", Schema::number().min(0.0).max(1.0).build().required())
            .field("enabled", Schema::boolean().required())
            .field("description", Schema::string().min(1).max(500).build())
            .strict()
            .build()
    }

    /// Configuration validation schema
    pub fn analyzer_config() -> Schema {
        Schema::object()
            .field("version", Schema::string().regex(r"^\d+\.\d+\.\d+$").unwrap().build().required())
            .field("security", Self::security_config())
            .field("quality", Self::quality_config())
            .field("sparc", Self::sparc_config())
            .strict()
            .build()
    }

    pub fn security_config() -> Schema {
        Schema::object()
            .field("suspicious_patterns", Schema::array(Schema::string().min(1).build()).build().required())
            .field("ml_enabled", Schema::boolean().required())
            .field("confidence_threshold", Schema::number().min(0.0).max(1.0).build().required())
            .build()
    }

    pub fn quality_config() -> Schema {
        Schema::object()
            .field("thresholds", Schema::object().build())
            .field("enabled", Schema::boolean().required())
            .build()
    }

    pub fn sparc_config() -> Schema {
        Schema::object()
            .field("phase_definitions", Schema::object().build())
            .field("automation_settings", Schema::object().build())
            .build()
    }

    /// Validate project metadata
    pub fn project_metadata() -> Schema {
        Schema::object()
            .field("name", Schema::string().min(1).max(100).regex(r"^[a-zA-Z0-9_-]+$").unwrap().build().required())
            .field("version", Schema::string().regex(r"^\d+\.\d+\.\d+$").unwrap().build().required())
            .field("description", Schema::string().max(1000).build())
            .field("authors", Schema::array(Schema::string().email().build()).build())
            .field("created_at", Schema::string().datetime().build().required())
            .field("updated_at", Schema::string().datetime().build().required())
            .strict()
            .build()
    }

    /// Validate API endpoints
    pub fn api_endpoint() -> Schema {
        Schema::object()
            .field("path", Schema::string().regex(r"^/[a-zA-Z0-9/_-]*$").unwrap().build().required())
            .field("method", Schema::enum_values(vec!["GET", "POST", "PUT", "DELETE", "PATCH"]).required())
            .field("description", Schema::string().min(1).max(500).build())
            .field("deprecated", Schema::boolean())
            .strict()
            .build()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_string_validation() {
        let schema = Schema::string()
            .min(3)
            .max(10)
            .build()
            .required();

        // Valid string
        let result = schema.validate(&json!("hello"), "test");
        assert!(result.is_valid);

        // Too short
        let result = schema.validate(&json!("hi"), "test");
        assert!(!result.is_valid);
        assert_eq!(result.errors[0].error_type, ValidationErrorType::Range);

        // Too long
        let result = schema.validate(&json!("this_is_too_long"), "test");
        assert!(!result.is_valid);

        // Missing required
        let result = schema.validate(&json!(null), "test");
        assert!(!result.is_valid);
        assert_eq!(result.errors[0].error_type, ValidationErrorType::Required);
    }

    #[test]
    fn test_number_validation() {
        let schema = Schema::number()
            .min(0.0)
            .max(100.0)
            .integer()
            .positive()
            .build();

        // Valid number
        let result = schema.validate(&json!(42), "test");
        assert!(result.is_valid);

        // Negative number
        let result = schema.validate(&json!(-5), "test");
        assert!(!result.is_valid);

        // Decimal when integer required
        let result = schema.validate(&json!(42.5), "test");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_object_validation() {
        let schema = Schema::object()
            .field("name", Schema::string().min(1).build().required())
            .field("age", Schema::number().min(0.0).integer().build().required())
            .field("email", Schema::string().email().build())
            .strict()
            .build();

        // Valid object
        let result = schema.validate(&json!({
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com"
        }), "");
        assert!(result.is_valid);

        // Missing required field
        let result = schema.validate(&json!({
            "name": "John Doe"
        }), "");
        assert!(!result.is_valid);

        // Invalid email format
        let result = schema.validate(&json!({
            "name": "John Doe",
            "age": 30,
            "email": "invalid-email"
        }), "");
        assert!(!result.is_valid);
    }

    #[test]
    fn test_security_pattern_schema() {
        let schema = ProductionSchemas::security_pattern();
        
        // Valid security pattern
        let result = schema.validate(&json!({
            "pattern": "admin.*password",
            "severity": "high",
            "confidence": 0.95,
            "enabled": true,
            "description": "Admin password pattern"
        }), "");
        assert!(result.is_valid);

        // Invalid severity
        let result = schema.validate(&json!({
            "pattern": "test",
            "severity": "invalid",
            "confidence": 0.5,
            "enabled": true
        }), "");
        assert!(!result.is_valid);
    }
}