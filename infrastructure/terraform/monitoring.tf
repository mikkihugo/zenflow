# Monitoring and Alerting Infrastructure

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name              = "${var.cluster_name}-alerts"
  kms_master_key_id = aws_kms_key.sns.id

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-alerts"
  })
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# KMS Key for SNS
resource "aws_kms_key" "sns" {
  description             = "SNS encryption key"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-sns-kms"
  })
}

resource "aws_kms_alias" "sns" {
  name          = "alias/${var.cluster_name}-sns"
  target_key_id = aws_kms_key.sns.key_id
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "services" {
  for_each = toset(local.services)

  name              = "/aws/eks/${var.cluster_name}/${each.key}"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.sns.arn

  tags = merge(local.common_tags, {
    Service = each.key
  })
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.cluster_name}-overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            for service in local.services : [
              "AWS/EKS",
              "pod_cpu_utilization",
              "ClusterName",
              var.cluster_name,
              "Namespace",
              service
            ]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Service CPU Utilization"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            for service in local.services : [
              "AWS/EKS",
              "pod_memory_utilization",
              "ClusterName",
              var.cluster_name,
              "Namespace",
              service
            ]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Service Memory Utilization"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            for service, db in aws_db_instance.service_db : [
              "AWS/RDS",
              "DatabaseConnections",
              "DBInstanceIdentifier",
              db.id
            ]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Database Connections"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ElastiCache", "CacheMisses", "CacheClusterId", aws_elasticache_replication_group.main.id],
            [".", "CacheHits", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Cache Hit/Miss Rate"
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "service_cpu_high" {
  for_each = toset(local.services)

  alarm_name          = "${var.cluster_name}-${each.key}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "pod_cpu_utilization"
  namespace           = "AWS/EKS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "CPU utilization is too high for ${each.key}"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = var.cluster_name
    Namespace   = each.key
  }

  tags = merge(local.common_tags, {
    Service = each.key
  })
}

resource "aws_cloudwatch_metric_alarm" "service_memory_high" {
  for_each = toset(local.services)

  alarm_name          = "${var.cluster_name}-${each.key}-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "pod_memory_utilization"
  namespace           = "AWS/EKS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Memory utilization is too high for ${each.key}"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = var.cluster_name
    Namespace   = each.key
  }

  tags = merge(local.common_tags, {
    Service = each.key
  })
}

resource "aws_cloudwatch_metric_alarm" "database_cpu_high" {
  for_each = aws_db_instance.service_db

  alarm_name          = "${each.value.id}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Database CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = each.value.id
  }

  tags = merge(local.common_tags, {
    Service = each.key
  })
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.cluster_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.environment == "production"
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-alb"
  })
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name_prefix = "${var.cluster_name}-alb-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Application Load Balancer"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-alb-sg"
  })
}

# S3 Bucket for ALB Logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "${var.cluster_name}-alb-logs-${data.aws_caller_identity.current.account_id}"

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-alb-logs"
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# KMS Key for S3
resource "aws_kms_key" "s3" {
  description             = "S3 encryption key"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-s3-kms"
  })
}

resource "aws_kms_alias" "s3" {
  name          = "alias/${var.cluster_name}-s3"
  target_key_id = aws_kms_key.s3.key_id
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}