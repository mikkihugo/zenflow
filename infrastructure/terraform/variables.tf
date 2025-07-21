# Infrastructure Variables

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either staging or production"
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "vision-to-code-cluster"
}

variable "node_instance_types" {
  description = "EC2 instance types for worker nodes"
  type        = list(string)
  default     = ["t3.large", "t3.xlarge"]
}

variable "min_nodes" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 10
}

variable "desired_nodes" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 5
}

variable "database_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "database_storage_size" {
  description = "RDS storage size in GB"
  type        = number
  default     = 100
}

variable "enable_monitoring" {
  description = "Enable enhanced monitoring"
  type        = bool
  default     = true
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for services"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "vision-to-code.example.com"
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS"
  type        = string
  default     = ""
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
}

variable "gemini_api_key_secret_name" {
  description = "AWS Secrets Manager secret name for Gemini API key"
  type        = string
  default     = "vision-to-code/gemini-api-key"
}

variable "service_configs" {
  description = "Configuration for each microservice"
  type = map(object({
    cpu              = string
    memory           = string
    min_replicas     = number
    max_replicas     = number
    health_check_path = string
    port             = number
  }))
  default = {
    business-service = {
      cpu              = "500m"
      memory           = "1Gi"
      min_replicas     = 2
      max_replicas     = 5
      health_check_path = "/health"
      port             = 4001
    }
    core-service = {
      cpu              = "1000m"
      memory           = "2Gi"
      min_replicas     = 3
      max_replicas     = 8
      health_check_path = "/health"
      port             = 4002
    }
    swarm-service = {
      cpu              = "2000m"
      memory           = "4Gi"
      min_replicas     = 2
      max_replicas     = 10
      health_check_path = "/health"
      port             = 4003
    }
    development-service = {
      cpu              = "1000m"
      memory           = "2Gi"
      min_replicas     = 2
      max_replicas     = 6
      health_check_path = "/health"
      port             = 4004
    }
  }
}