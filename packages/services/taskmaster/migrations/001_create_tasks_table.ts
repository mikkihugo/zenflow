/**
 * Migration: Create Tasks Table
 *
 * Creates the main tasks table with enterprise features:
 * - Complete task metadata
 * - Indexes for performance
 * - Constraints for data integrity
 * - Audit fields
 * - JSON fields for flexibility
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {'
    // Primary key
    table.uuid('id').primary().notNullable().comment('Unique task identifier');'

    // Basic task information
    table.string('title', 500).notNullable().comment('Task title');'
    table.text('description').comment('Detailed task description');'

    // Task classification
    table
      .enum('priority', ['critical', 'high', 'medium', 'low'])'
      .notNullable()
      .comment('Task priority level');'
    table
      .string('state', 50)'
      .notNullable()
      .defaultTo('backlog')'
      .comment('Current workflow state');'
    table
      .enum('complexity', ['trivial', 'simple', 'moderate', 'complex', 'epic'])'
      .notNullable()
      .comment('Task complexity classification');'

    // Effort tracking
    table.decimal('estimated_hours', 8, 2).comment('Estimated effort in hours');'
    table
      .decimal('actual_hours', 8, 2)'
      .defaultTo(0)
      .comment('Actual time logged in hours');'

    // Assignment and ownership
    table.uuid('assignee_id').comment('Currently assigned user ID');'
    table.uuid('created_by').notNullable().comment('User who created the task');'

    // Timestamps
    table
      .timestamp('created_at')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('Task creation timestamp');'
    table
      .timestamp('updated_at')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('Last modification timestamp');'
    table.timestamp('due_date').comment('Task due date');'
    table.timestamp('completed_at').comment('Task completion timestamp');'

    // Relationships
    table.uuid('parent_task_id').comment('Parent task for sub-tasks');'
    table.uuid('workflow_id').comment('Associated workflow instance');'

    // Flexible data storage
    table.json('tags').defaultTo('[]').comment('Task tags array');'
    table
      .json('dependencies')'
      .defaultTo('[]')'
      .comment('Task dependency IDs array');'
    table
      .json('approval_gates')'
      .defaultTo('[]')'
      .comment('Approval gate requirements');'
    table
      .json('custom_data')'
      .defaultTo('{}')'
      .comment('Custom metadata and extensions');'

    // Audit and versioning
    table.integer('version').defaultTo(1).comment('Optimistic locking version');'
    table.uuid('tenant_id').comment('Multi-tenant organization ID');'

    // Indexes for performance
    table.index(['state'], 'idx_tasks_state');'
    table.index(['priority'], 'idx_tasks_priority');'
    table.index(['assignee_id'], 'idx_tasks_assignee');'
    table.index(['created_by'], 'idx_tasks_creator');'
    table.index(['created_at'], 'idx_tasks_created_at');'
    table.index(['updated_at'], 'idx_tasks_updated_at');'
    table.index(['due_date'], 'idx_tasks_due_date');'
    table.index(['workflow_id'], 'idx_tasks_workflow');'
    table.index(['parent_task_id'], 'idx_tasks_parent');'
    table.index(['tenant_id'], 'idx_tasks_tenant');'

    // Composite indexes for common queries
    table.index(['state', 'assignee_id'], 'idx_tasks_state_assignee');'
    table.index(['priority', 'state'], 'idx_tasks_priority_state');'
    table.index(['tenant_id', 'state'], 'idx_tasks_tenant_state');'
    table.index(['created_at', 'state'], 'idx_tasks_created_state');'

    // Foreign key constraints (will be added when user tables exist)
    // table.foreign('assignee_id').references('users.id').onDelete('SET NULL');'
    // table.foreign('created_by').references('users.id').onDelete('RESTRICT');'
    // table.foreign('parent_task_id').references('tasks.id').onDelete('CASCADE');'

    // Check constraints
    table.check(
      'estimated_hours >= 0',
      [],
      'chk_tasks_estimated_hours_positive''
    );
    table.check('actual_hours >= 0', [], 'chk_tasks_actual_hours_positive');'
    table.check('version > 0', [], 'chk_tasks_version_positive');'
    table.check('created_at <= updated_at', [], 'chk_tasks_timestamps_order');'
  });

  // Add comments to the table
  await knex.raw(``
    COMMENT ON TABLE tasks IS 'Main tasks table for TaskMaster workflow management''
  `);`
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');'
}
