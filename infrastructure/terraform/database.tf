# Database Infrastructure

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.cluster_name}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-db-subnet-group"
  })
}

# RDS Parameter Group
resource "aws_db_parameter_group" "postgres" {
  name   = "${var.cluster_name}-postgres-params"
  family = "postgres15"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,pgvector"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-postgres-params"
  })
}

# KMS Key for RDS Encryption
resource "aws_kms_key" "rds" {
  description             = "RDS encryption key"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-rds-kms"
  })
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.cluster_name}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# RDS Instances for each service
resource "aws_db_instance" "service_db" {
  for_each = toset(local.services)

  identifier = "${var.cluster_name}-${each.key}-db"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.database_instance_class

  allocated_storage     = var.database_storage_size
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  db_name  = replace(each.key, "-", "_")
  username = "dbadmin"
  password = random_password.db_password[each.key].result

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.postgres.name

  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az               = var.environment == "production"
  deletion_protection    = var.environment == "production"
  skip_final_snapshot    = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.cluster_name}-${each.key}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql"]
  monitoring_interval             = var.enable_monitoring ? 60 : 0
  monitoring_role_arn            = var.enable_monitoring ? aws_iam_role.rds_monitoring.arn : null

  performance_insights_enabled          = var.enable_monitoring
  performance_insights_retention_period = var.enable_monitoring ? 7 : 0
  performance_insights_kms_key_id      = var.enable_monitoring ? aws_kms_key.rds.arn : null

  tags = merge(local.common_tags, {
    Name    = "${var.cluster_name}-${each.key}-db"
    Service = each.key
  })
}

# Generate random passwords for databases
resource "random_password" "db_password" {
  for_each = toset(local.services)
  
  length  = 32
  special = true
}

# Store database credentials in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  for_each = toset(local.services)

  name = "${var.cluster_name}/${each.key}/db-credentials"
  description = "Database credentials for ${each.key}"

  kms_key_id = aws_kms_key.rds.id

  tags = merge(local.common_tags, {
    Service = each.key
  })
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  for_each = toset(local.services)

  secret_id = aws_secretsmanager_secret.db_credentials[each.key].id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.db_password[each.key].result
    engine   = "postgres"
    host     = aws_db_instance.service_db[each.key].address
    port     = aws_db_instance.service_db[each.key].port
    dbname   = aws_db_instance.service_db[each.key].db_name
  })
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.cluster_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache for Redis (Session Storage)
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.cluster_name}-cache-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-cache-subnet-group"
  })
}

resource "aws_elasticache_parameter_group" "redis" {
  name   = "${var.cluster_name}-redis-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-redis-params"
  })
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.cluster_name}-redis"
  description                = "Redis cluster for session storage"
  node_type                  = "cache.t3.medium"
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.redis.name
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.cache.id]
  
  engine_version             = "7.0"
  num_cache_clusters         = var.environment == "production" ? 3 : 1
  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled          = var.environment == "production"
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                = aws_kms_key.rds.arn
  
  snapshot_retention_limit   = 5
  snapshot_window           = "03:00-05:00"
  maintenance_window        = "sun:05:00-sun:06:00"
  
  notification_topic_arn    = aws_sns_topic.alerts.arn
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }
  
  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-redis"
  })
}

# Security Group for ElastiCache
resource "aws_security_group" "cache" {
  name_prefix = "${var.cluster_name}-cache-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for ElastiCache"

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.cluster.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-cache-sg"
  })
}

# CloudWatch Log Group for Redis
resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/${var.cluster_name}-redis"
  retention_in_days = 7
  kms_key_id        = aws_kms_key.rds.arn

  tags = local.common_tags
}