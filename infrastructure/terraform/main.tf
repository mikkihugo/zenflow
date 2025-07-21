# Vision-to-Code Infrastructure - Main Configuration
# Production-ready infrastructure for multi-service deployment

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  backend "s3" {
    bucket         = "vision-to-code-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# Provider configurations
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "vision-to-code"
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Local variables
locals {
  common_tags = {
    Project     = "vision-to-code"
    Environment = var.environment
    Component   = "infrastructure"
  }
  
  services = [
    "business-service",
    "core-service",
    "swarm-service",
    "development-service"
  ]
  
  availability_zones = data.aws_availability_zones.available.names
}