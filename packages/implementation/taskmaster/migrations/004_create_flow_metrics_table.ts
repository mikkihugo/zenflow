/**
 * Migration: Create Flow Metrics Table
 *
 * Creates time-series storage for flow metrics with:
 * - Performance tracking over time
 * - Analytics and reporting support
 * - Efficient time-series queries
 * - Data retention policies
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create flow metrics table
  await knex.schema.createTable('flow_metrics', (table) => {'
    // Primary key
    table
      .uuid('id')'
      .primary()
      .notNullable()
      .comment('Unique metrics record identifier');'

    // Time-series data
    table
      .timestamp('timestamp')'
      .notNullable()
      .comment('Metrics calculation timestamp');'
    table
      .string('time_period', 20)'
      .notNullable()
      .defaultTo('hour')'
      .comment('Aggregation period: hour, day, week, month');'

    // Core flow metrics
    table
      .decimal('throughput', 10, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Tasks completed per day');'
    table
      .decimal('avg_cycle_time', 10, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Average cycle time in hours');'
    table
      .decimal('avg_lead_time', 10, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Average lead time in hours');'

    // Efficiency metrics
    table
      .decimal('wip_efficiency', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Work in progress efficiency (0-1)');'
    table
      .decimal('flow_efficiency', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Flow efficiency (value-add time ratio, 0-1)');'
    table
      .decimal('blocked_time_percentage', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Percentage of time tasks are blocked (0-1)');'

    // Quality and predictability metrics
    table
      .decimal('predictability', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Delivery predictability score (0-1)');'
    table
      .decimal('quality_index', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Overall quality score (0-1)');'
    table
      .decimal('resource_utilization', 5, 4)'
      .notNullable()
      .defaultTo(0)
      .comment('Resource utilization rate (0-1)');'

    // Volume metrics
    table
      .integer('total_tasks')'
      .notNullable()
      .defaultTo(0)
      .comment('Total number of tasks in period');'
    table
      .integer('completed_tasks')'
      .notNullable()
      .defaultTo(0)
      .comment('Number of completed tasks');'
    table
      .integer('blocked_tasks')'
      .notNullable()
      .defaultTo(0)
      .comment('Number of blocked tasks');'
    table
      .integer('in_progress_tasks')'
      .notNullable()
      .defaultTo(0)
      .comment('Number of tasks in progress');'

    // State distribution (JSON for flexibility)
    table
      .json('task_distribution')'
      .defaultTo('{}')'
      .comment('Task count by state');'
    table
      .json('priority_distribution')'
      .defaultTo('{}')'
      .comment('Task count by priority');'
    table
      .json('complexity_distribution')'
      .defaultTo('{}')'
      .comment('Task count by complexity');'

    // Calculation metadata
    table
      .string('calculation_method', 50)'
      .defaultTo('real_time')'
      .comment(
        'How metrics were calculated: real_time, batch, wasm_accelerated''
      );
    table
      .integer('processing_time_ms')'
      .comment('Time taken to calculate metrics (ms)');'
    table
      .string('model_version', 20)'
      .comment('Version of calculation model used');'

    // Scope and context
    table.uuid('workflow_id').comment('Specific workflow instance (optional)');'
    table.uuid('tenant_id').comment('Multi-tenant organization ID');'
    table
      .json('metadata')'
      .defaultTo('{}')'
      .comment('Additional metrics metadata');'

    // Audit fields
    table
      .timestamp('created_at')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('Record creation timestamp');'

    // Indexes for time-series queries
    table.index(['timestamp'], 'idx_flow_metrics_timestamp');'
    table.index(['time_period'], 'idx_flow_metrics_period');'
    table.index(['workflow_id'], 'idx_flow_metrics_workflow');'
    table.index(['tenant_id'], 'idx_flow_metrics_tenant');'
    table.index(['created_at'], 'idx_flow_metrics_created');'

    // Composite indexes for common analytics queries
    table.index(['tenant_id', 'timestamp'], 'idx_flow_metrics_tenant_time');'
    table.index(['time_period', 'timestamp'], 'idx_flow_metrics_period_time');'
    table.index(['workflow_id', 'timestamp'], 'idx_flow_metrics_workflow_time');'
    table.index(
      ['tenant_id', 'time_period', 'timestamp'],
      'idx_flow_metrics_tenant_period_time''
    );

    // Check constraints for data integrity
    table.check('throughput >= 0', [], 'chk_flow_metrics_throughput_positive');'
    table.check(
      'avg_cycle_time >= 0',
      [],
      'chk_flow_metrics_cycle_time_positive''
    );
    table.check(
      'avg_lead_time >= 0',
      [],
      'chk_flow_metrics_lead_time_positive''
    );
    table.check(
      'wip_efficiency >= 0 AND wip_efficiency <= 1',
      [],
      'chk_flow_metrics_wip_efficiency_range''
    );
    table.check(
      'flow_efficiency >= 0 AND flow_efficiency <= 1',
      [],
      'chk_flow_metrics_flow_efficiency_range''
    );
    table.check(
      'blocked_time_percentage >= 0 AND blocked_time_percentage <= 1',
      [],
      'chk_flow_metrics_blocked_time_range''
    );
    table.check(
      'predictability >= 0 AND predictability <= 1',
      [],
      'chk_flow_metrics_predictability_range''
    );
    table.check(
      'quality_index >= 0 AND quality_index <= 1',
      [],
      'chk_flow_metrics_quality_range''
    );
    table.check(
      'resource_utilization >= 0 AND resource_utilization <= 1',
      [],
      'chk_flow_metrics_utilization_range''
    );
    table.check(
      'total_tasks >= 0',
      [],
      'chk_flow_metrics_total_tasks_positive''
    );
    table.check(
      'completed_tasks >= 0',
      [],
      'chk_flow_metrics_completed_tasks_positive''
    );
    table.check(
      'blocked_tasks >= 0',
      [],
      'chk_flow_metrics_blocked_tasks_positive''
    );
    table.check(
      'in_progress_tasks >= 0',
      [],
      'chk_flow_metrics_in_progress_tasks_positive''
    );
    table.check(
      'processing_time_ms >= 0 OR processing_time_ms IS NULL',
      [],
      'chk_flow_metrics_processing_time_positive''
    );
  });

  // Create bottleneck detection results table
  await knex.schema.createTable('bottleneck_detections', (table) => {'
    // Primary key
    table
      .uuid('id')'
      .primary()
      .notNullable()
      .comment('Unique bottleneck detection identifier');'

    // Detection metadata
    table
      .timestamp('timestamp')'
      .notNullable()
      .comment('When bottleneck was detected');'
    table
      .decimal('system_health', 5, 4)'
      .notNullable()
      .comment('Overall system health score (0-1)');'
    table
      .decimal('confidence', 5, 4)'
      .notNullable()
      .comment('Detection confidence level (0-1)');'
    table
      .string('detection_method', 50)'
      .notNullable()
      .comment('How bottleneck was detected: algorithm, manual, wasm_ml');'

    // Bottleneck details
    table
      .string('state', 50)'
      .notNullable()
      .comment('Workflow state where bottleneck occurs');'
    table
      .decimal('severity', 5, 4)'
      .notNullable()
      .comment('Bottleneck severity (0-1)');'
    table
      .integer('affected_task_count')'
      .notNullable()
      .comment('Number of tasks affected');'
    table
      .decimal('estimated_delay_hours', 10, 2)'
      .notNullable()
      .comment('Estimated delay in hours');'

    // Classification
    table
      .enum('bottleneck_type', ['
        'capacity',
        'skill',
        'dependency',
        'process',
        'resource',
      ])
      .notNullable()
      .comment('Type of bottleneck');'
    table.json('factors').defaultTo('[]').comment('Contributing factors array');'
    table
      .enum('trend', ['improving' | 'stable' | 'declining'', 'stable', 'degrading'])'
      .notNullable()
      .comment('Trend direction');'

    // Recommendations
    table
      .json('recommended_actions')'
      .defaultTo('[]')'
      .comment('Recommended resolution actions');'
    table
      .decimal('estimated_impact', 5, 4)'
      .comment('Estimated impact of resolution (0-1)');'
    table
      .integer('implementation_effort_hours')'
      .comment('Estimated effort to implement resolution');'

    // Context
    table.uuid('workflow_id').comment('Associated workflow instance');'
    table.uuid('tenant_id').comment('Multi-tenant organization ID');'
    table
      .json('metadata')'
      .defaultTo('{}')'
      .comment('Additional detection metadata');'

    // Resolution tracking
    table.timestamp('resolved_at').comment('When bottleneck was resolved');'
    table
      .text('resolution_notes')'
      .comment('Notes on how bottleneck was resolved');'

    // Audit fields
    table
      .timestamp('created_at')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('Record creation timestamp');'

    // Indexes
    table.index(['timestamp'], 'idx_bottleneck_detections_timestamp');'
    table.index(['state'], 'idx_bottleneck_detections_state');'
    table.index(['bottleneck_type'], 'idx_bottleneck_detections_type');'
    table.index(['severity'], 'idx_bottleneck_detections_severity');'
    table.index(['trend'], 'idx_bottleneck_detections_trend');'
    table.index(['workflow_id'], 'idx_bottleneck_detections_workflow');'
    table.index(['tenant_id'], 'idx_bottleneck_detections_tenant');'
    table.index(['resolved_at'], 'idx_bottleneck_detections_resolved');'

    // Composite indexes
    table.index(
      ['tenant_id', 'timestamp'],
      'idx_bottleneck_detections_tenant_time''
    );
    table.index(['state', 'timestamp'], 'idx_bottleneck_detections_state_time');'
    table.index(
      ['severity', 'timestamp'],
      'idx_bottleneck_detections_severity_time''
    );

    // Check constraints
    table.check(
      'system_health >= 0 AND system_health <= 1',
      [],
      'chk_bottleneck_detections_health_range''
    );
    table.check(
      'confidence >= 0 AND confidence <= 1',
      [],
      'chk_bottleneck_detections_confidence_range''
    );
    table.check(
      'severity >= 0 AND severity <= 1',
      [],
      'chk_bottleneck_detections_severity_range''
    );
    table.check(
      'affected_task_count >= 0',
      [],
      'chk_bottleneck_detections_task_count_positive''
    );
    table.check(
      'estimated_delay_hours >= 0',
      [],
      'chk_bottleneck_detections_delay_positive''
    );
    table.check(
      'estimated_impact >= 0 AND estimated_impact <= 1 OR estimated_impact IS NULL',
      [],
      'chk_bottleneck_detections_impact_range''
    );
    table.check(
      'implementation_effort_hours >= 0 OR implementation_effort_hours IS NULL',
      [],
      'chk_bottleneck_detections_effort_positive''
    );
  });

  // Add table comments
  await knex.raw(``
    COMMENT ON TABLE flow_metrics IS 'Time-series storage of workflow performance metrics;
    COMMENT ON TABLE bottleneck_detections IS 'Detection and tracking of workflow bottlenecks;
  `);`
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bottleneck_detections');'
  await knex.schema.dropTableIfExists('flow_metrics');'
}
