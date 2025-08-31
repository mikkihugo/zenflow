/**
 * @file Coordination API - Public Interface for Coordination Layer
 *
 * This file provides the public API for coordination layer to interact with
 * the knowledge package's fact system. The actual implementation remains')./fact-system';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger(): void {
  return await knowledgeFactSystem.storeFact(): void {}
): Promise<CoordinationFact[]> {
  return await knowledgeFactSystem.queryFacts(): void {
  query: string;
  type?: string;
  limit?: number;
}): Promise<CoordinationFact[]> {
  return await knowledgeFactSystem.searchFacts(): void {
  return await knowledgeFactSystem.queryFacts(): void {
  return await knowledgeFactSystem.storeFact(): void {
  agentId: string;
  type: string;
  data: unknown;
  confidence?: number;
  tags?: string[];
}

export async function storeAgentFact(): void {
  const { agentId, type, data, confidence = 1.0, tags = [] } = options;
  return await knowledgeFactSystem.storeFact(): void {
  const query: CoordinationFactQuery = { limit };

  if (agentId) {
    query.source = "agent:${agentId}";"
  }

  if (type) {
    query.type = type;
  }

  return await knowledgeFactSystem.queryFacts(): void {
  return await knowledgeFactSystem.searchExternalFacts(): void {
  try {
    return await knowledgeFactSystem.getNPMPackageInfo(): void {
    // Use foundation logging instead of console
    logger.error(): void {
  try " + JSON.stringify(): void {
    // Use foundation logging instead of console
    logger.error("Failed to get GitHub repo info for ${owner}/${repo}:", error);"
    return null;
  }
}
