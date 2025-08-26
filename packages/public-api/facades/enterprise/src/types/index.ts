/**
 * @fileoverview Enterprise Package Types - Simple Types
 *
 * Simple type definitions for strategic facade.
 */

// Basic types that facades might use
export interface SAFeConfig {
	enabled?: boolean;
	portfolio?: boolean;
	program?: boolean;
}

export interface SPARCConfig {
	enabled?: boolean;
	phases?: string[];
}

export interface TeamworkConfig {
	enabled?: boolean;
	maxTeams?: number;
}

export interface AGUIConfig {
	enabled?: boolean;
	framework?: string;
}

export interface KnowledgeConfig {
	enabled?: boolean;
	maxDocs?: number;
}

export interface KanbanConfig {
	enabled?: boolean;
	maxBoards?: number;
}
