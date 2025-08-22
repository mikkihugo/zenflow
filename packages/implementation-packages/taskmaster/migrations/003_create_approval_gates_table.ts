/**
 * Migration: Create Approval Gates Table
 * 
 * Creates approval gates system with:
 * - Gate definitions and requirements
 * - Approval tracking
 * - Escalation and timeout handling
 * - Audit compliance
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create approval gates table
  await knex.schema.createTable('approval_gates', (table) => {
    // Primary key
    table.uuid('id').primary().notNullable()
      .comment('Unique approval gate identifier');
    
    // Gate definition
    table.string('name', 200).notNullable()
      .comment('Human-readable gate name');
    table.text('description')
      .comment('Gate description and purpose');
    
    // Task association
    table.uuid('task_id').notNullable()
      .comment('Associated task ID');
    
    // Gate configuration
    table.json('required_approvers').notNullable()
      .comment('Array of required approver user IDs');
    table.integer('minimum_approvals').notNullable().defaultTo(1)
      .comment('Minimum number of approvals needed');
    table.boolean('is_required').notNullable().defaultTo(true)
      .comment('Whether approval is required to proceed');
    
    // Timeout configuration
    table.integer('timeout_hours')
      .comment('Timeout in hours for approval');
    table.json('auto_approval_conditions').defaultTo('[]')
      .comment('Conditions for automatic approval');
    
    // State tracking
    table.enum('state', ['pending', 'evaluating', 'approved', 'rejected', 'escalated', 'timed_out', 'cancelled'])
      .notNullable().defaultTo('pending')
      .comment('Current gate state');
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      .comment('Gate creation timestamp');
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      .comment('Last update timestamp');
    table.timestamp('timeout_at')
      .comment('When the gate will timeout');
    table.timestamp('escalated_at')
      .comment('When the gate was escalated');
    table.timestamp('completed_at')
      .comment('When the gate was completed (approved/rejected)');
    
    // Metadata
    table.json('metadata').defaultTo('{}')
      .comment('Additional gate metadata');
    table.uuid('tenant_id')
      .comment('Multi-tenant organization ID');
    
    // Indexes
    table.index(['task_id'], 'idx_approval_gates_task');
    table.index(['state'], 'idx_approval_gates_state');
    table.index(['created_at'], 'idx_approval_gates_created');
    table.index(['timeout_at'], 'idx_approval_gates_timeout');
    table.index(['tenant_id'], 'idx_approval_gates_tenant');
    table.index(['state', 'timeout_at'], 'idx_approval_gates_state_timeout');
    
    // Foreign key constraints
    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    
    // Check constraints
    table.check('minimum_approvals > 0', [], 'chk_approval_gates_min_approvals_positive');
    table.check('timeout_hours > 0 OR timeout_hours IS NULL', [], 'chk_approval_gates_timeout_positive');
    table.check('created_at <= updated_at', [], 'chk_approval_gates_timestamps_order');
  });
  
  // Create approval records table
  await knex.schema.createTable('approval_records', (table) => {
    // Primary key
    table.uuid('id').primary().notNullable()
      .comment('Unique approval record identifier');
    
    // Gate and task reference
    table.uuid('gate_id').notNullable()
      .comment('Associated approval gate ID');
    table.uuid('task_id').notNullable()
      .comment('Associated task ID');
    
    // Approver and decision
    table.uuid('approver_id').notNullable()
      .comment('User who provided the approval');
    table.enum('decision', ['approved', 'rejected', 'pending']).notNullable()
      .comment('Approval decision');
    table.text('reason')
      .comment('Reason for the decision');
    
    // Timing
    table.timestamp('timestamp').defaultTo(knex.fn.now()).notNullable()
      .comment('When the decision was made');
    
    // Metadata
    table.json('metadata').defaultTo('{}')
      .comment('Additional approval metadata');
    table.uuid('tenant_id')
      .comment('Multi-tenant organization ID');
    
    // Indexes
    table.index(['gate_id'], 'idx_approval_records_gate');
    table.index(['task_id'], 'idx_approval_records_task');
    table.index(['approver_id'], 'idx_approval_records_approver');
    table.index(['decision'], 'idx_approval_records_decision');
    table.index(['timestamp'], 'idx_approval_records_timestamp');
    table.index(['tenant_id'], 'idx_approval_records_tenant');
    table.index(['gate_id', 'approver_id'], 'idx_approval_records_gate_approver');
    
    // Foreign key constraints
    table.foreign('gate_id').references('approval_gates.id').onDelete('CASCADE');
    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    // table.foreign('approver_id').references('users.id').onDelete('RESTRICT');
    
    // Unique constraint to prevent duplicate approvals
    table.unique(['gate_id', 'approver_id'], {
      indexName: 'uk_approval_records_gate_approver'
    });
  });
  
  // Add table comments
  await knex.raw(`
    COMMENT ON TABLE approval_gates IS 'Approval gate definitions and state tracking';
    COMMENT ON TABLE approval_records IS 'Individual approval decisions within gates';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('approval_records');
  await knex.schema.dropTableIfExists('approval_gates');
}