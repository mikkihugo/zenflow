/**
 * Migration: Create Task State Transitions Table
 *
 * Creates audit trail for task state changes with:
 * - Complete transition history
 * - Performance tracking
 * - Compliance and audit support
 * - Analytics support
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('task_state_transitions', (table) => {'
    // Primary key
    table
      .uuid('id')'
      .primary()
      .notNullable()
      .comment('Unique transition identifier');'

    // Task reference
    table.uuid('task_id').notNullable().comment('Task being transitioned');'

    // State information
    table.string('from_state', 50).notNullable().comment('Previous state');'
    table.string('to_state', 50).notNullable().comment('New state');'
    table
      .enum('direction', ['forward', 'backward', 'lateral', 'exception'])'
      .notNullable()
      .comment('Transition direction classification');'

    // Actor and context
    table
      .uuid('performed_by')'
      .notNullable()
      .comment('User who performed the transition');'
    table
      .timestamp('timestamp')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('When the transition occurred');'
    table.text('reason').comment('Optional reason for the transition');'

    // Performance tracking
    table
      .integer('state_duration_seconds')'
      .comment('Time spent in previous state (seconds)');'
    table
      .decimal('cycle_time_hours', 10, 2)'
      .comment('Cumulative cycle time at this point');'
    table
      .decimal('lead_time_hours', 10, 2)'
      .comment('Total lead time from creation');'

    // System context
    table
      .string('transition_source', 50)'
      .defaultTo('manual')'
      .comment('Source of transition: manual, automation, api, etc.');'
    table
      .json('metadata')'
      .defaultTo('{}')'
      .comment('Additional transition metadata');'

    // Audit fields
    table.uuid('tenant_id').comment('Multi-tenant organization ID');'
    table
      .timestamp('created_at')'
      .defaultTo(knex.fn.now())
      .notNullable()
      .comment('Record creation timestamp');'

    // Indexes for performance
    table.index(['task_id'], 'idx_transitions_task_id');'
    table.index(['performed_by'], 'idx_transitions_performed_by');'
    table.index(['timestamp'], 'idx_transitions_timestamp');'
    table.index(['from_state'], 'idx_transitions_from_state');'
    table.index(['to_state'], 'idx_transitions_to_state');'
    table.index(['direction'], 'idx_transitions_direction');'
    table.index(['transition_source'], 'idx_transitions_source');'
    table.index(['tenant_id'], 'idx_transitions_tenant');'

    // Composite indexes for analytics
    table.index(['task_id', 'timestamp'], 'idx_transitions_task_timeline');'
    table.index(['from_state', 'to_state'], 'idx_transitions_state_flow');'
    table.index(['tenant_id', 'timestamp'], 'idx_transitions_tenant_timeline');'
    table.index(['performed_by', 'timestamp'], 'idx_transitions_user_timeline');'

    // Foreign key constraints
    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');'
    // table.foreign('performed_by').references('users.id').onDelete('RESTRICT');'

    // Check constraints
    table.check(
      'state_duration_seconds >= 0',
      [],
      'chk_transitions_duration_positive''
    );
    table.check(
      'cycle_time_hours >= 0',
      [],
      'chk_transitions_cycle_time_positive''
    );
    table.check(
      'lead_time_hours >= 0',
      [],
      'chk_transitions_lead_time_positive''
    );
    table.check(
      'from_state != to_state',
      [],
      'chk_transitions_different_states''
    );
  });

  // Add table comment
  await knex.raw(``
    COMMENT ON TABLE task_state_transitions IS 'Audit trail of task state changes for compliance and analytics''
  `);`
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_state_transitions');'
}
