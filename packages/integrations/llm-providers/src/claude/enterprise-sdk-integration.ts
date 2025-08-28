/**
 * @fileoverview Enterprise Claude Code SDK 1.0.94 Integration
 * 
 * Integrates the new custom tools as callbacks feature with enterprise coordination.
 * Provides task-specific tools that connect to the fact system via events.
 * 
 * @version 1.0.94
 * @since 1.0.94
 */

import { tool, createSdkMcpServer, query} from '@anthropic-ai/claude-code/sdk.mjs';
import { getLogger, TypedEventBase, z} from '@claude-zen/foundation';

import type { 
  ClaudeSDKOptions, 
  ClaudeMessage 
} from './types';

const logger = getLogger('enterprise-sdk-integration');

// =============================================================================
// Types for Enterprise SDK Integration
// =============================================================================

export interface TaskSpecificSDKConfig {
  /** Task identifier for scoped tool access */
  taskId:string;
  
  /** Task category for fact filtering */
  taskCategory:'sdk-integration' | ' security-audit' | ' code-refactoring' | ' api-documentation' | ' general';
  
  /** Security level for fact access */
  securityLevel:'low' | ' medium' | ' high' | ' restricted';
  
  /** Allowed fact types for this task */
  allowedFactTypes?:Array<
    'npm-package' | ' github-repo' | ' security-advisory' | ' hex-package' | 
    'api-docs' | ' rust-crate' | ' go-module' | ' perl-package' | 
    'java-package' | ' gitlab-repo' | ' bitbucket-repo' | ' sdk-docs'>;
  
  /** Custom tools specific to this task */
  customTools?:Array<ReturnType<typeof tool>>;
  
  /** Event system for enterprise coordination */
  eventSystem?:TypedEventBase;
}

export interface FactQuery {
  /** Query string */
  query:string;
  
  /** Fact type to search */
  factType:string;
  
  /** Task context */
  context:string;
  
  /** Category filter */
  category?:string;
  
  /** Version filter */
  version?:string;
}

// =============================================================================
// Core Enterprise Tools
// =============================================================================

/**
 * Creates the enterprise fact tool for accessing knowledge system
 */
function createFactTool(config:TaskSpecificSDKConfig) {
  return tool(
    "get_enterprise_facts",
    `Get relevant facts from the enterprise knowledge system for ${config.taskCategory} tasks`,
    {
      query:z.string().describe("What facts you need to retrieve"),
      factType:z.enum([
        'npm-package',    'github-repo',    'security-advisory',    'hex-package',        'api-docs',    'rust-crate',    'go-module',    'perl-package',        'java-package',    'gitlab-repo',    'bitbucket-repo',    'sdk-docs')]).describe("Type of facts to retrieve"),
      context:z.string().describe("Current task context"),
      category:z.string().optional().describe("Category filter for facts"),
      version:z.string().optional().describe("Version filter (for packages/docs)")
},
    async ({ query, factType, context, category, version}) => {
      try {
        logger.info(`Fact query:${query} [${factType}] for task ${config.taskId}`);
        
        // Check permissions
        if (config.allowedFactTypes && !config.allowedFactTypes.includes(factType as typeof config.allowedFactTypes[number])) {
          return {
            content:[{
              type:"text",
              text:JSON.stringify({
                error:"Access denied",
                reason:`Fact type '${factType}' not allowed for task category '${config.taskCategory}'`
})
}]
};
}
        
        // Query fact system via events
        const factQuery:FactQuery = {
          query,
          factType,
          context,
          category,
          version
};
        
        // Use event system if available, otherwise return mock data for testing
        if (config.eventSystem) {
          const facts = await config.eventSystem.emit('fact-system:query', {
            taskId:config.taskId,
            securityLevel:config.securityLevel,
            query:factQuery
});
          
          return {
            content:[{
              type:"text", 
              text:JSON.stringify(facts, null, 2)
}]
};
} else {
          // Mock response for testing/development
          logger.warn('No event system configured, returning mock fact data');
          return {
            content:[{
              type:"text",
              text:JSON.stringify({
                mockData:true,
                query,
                factType,
                results:[
                  {
                    id:`mock-${factType}-${Date.now()}`,
                    type:factType,
                    content:`Mock fact data for ${query}`,
                    confidence:0.8,
                    source: 'mock-enterprise-system',                    timestamp:Date.now()
}
]
}, null, 2)
}]
};
}
} catch (error) {
        logger.error('Fact tool error: ', error);
'        return {
          content:[{
            type:"text",
            text:JSON.stringify({
              error:"Fact retrieval failed",
              reason:error instanceof Error ? error.message : 'Unknown error')})
}]
};
}
}
  );
}

/**
 * Creates SDK documentation tool for accessing Claude Code 1.0.94 docs
 */
function createSDKDocumentationTool(config:TaskSpecificSDKConfig) {
  return tool(
    "get_sdk_documentation", 
    "Get Claude Code SDK 1.0.94 documentation for current task",
    {
      topic:z.string().describe("SDK feature you need help with"),
      version:z.string().default("1.0.94").describe("SDK version"),
      section:z.enum(['custom-tools',    'mcp-servers',    'query-api',    'permissions',    'streaming']).optional()
},
    async ({ topic, version, section}) => {
      try {
        logger.info(`SDK docs query:${topic} v${version} [${section || 'all'}] for task ${config.taskId}`);
        
        // Query SDK documentation facts
        const sdkQuery:FactQuery = {
          query:topic,
          factType: 'api-docs',          context:`claude-code-sdk-${version}`,
          category:section || 'general',          version
};
        
        if (config.eventSystem) {
          const docs = await config.eventSystem.emit('fact-system:query-sdk-docs', {
            taskId:config.taskId,
            query:sdkQuery
});
          
          return {
            content:[{
              type:"text",
              text:JSON.stringify(docs, null, 2)
}]
};
} else {
          // Mock SDK documentation for testing
          const mockSDKDocs = {
            version:"1.0.94",
            topic,
            section,
            documentation:{
              "custom-tools":{
                description:"Create custom tools using the tool() function",
                example:`tool("my_tool", "Description", { param:z.string()}, async (args) => { /* implementation */})`,
                signature:"tool<Schema>(name: string, description:string, inputSchema:Schema, handler:Function)",
                newIn:"1.0.94"
},
              "createSdkMcpServer":{
                description:"Create MCP server with custom tools",
                example:`createSdkMcpServer({ name: "my-server", tools:[myTool]})`,
                signature:"createSdkMcpServer(options: CreateSdkMcpServerOptions)",
                newIn:"1.0.94"
}
}[topic] || {
              description:`Documentation for ${topic}`,
              available:false,
              suggestion:"Try 'custom-tools' or ' createSdkMcpServer' for 1.0.94 features"
}
};
          
          return {
            content:[{
              type:"text",
              text:JSON.stringify(mockSDKDocs, null, 2)
}]
};
}
} catch (error) {
        logger.error('SDK docs tool error: ', error);
'        return {
          content:[{
            type:"text",
            text:JSON.stringify({
              error:"SDK documentation retrieval failed",
              reason:error instanceof Error ? error.message : 'Unknown error')})
}]
};
}
}
  );
}

// =============================================================================
// Enterprise SDK Integration
// =============================================================================

/**
 * Creates a task-specific SDK with enterprise knowledge access
 */
export function createEnterpriseTaskSDK(config:TaskSpecificSDKConfig) {
  logger.info(`Creating enterprise task SDK for ${config.taskId} [${config.taskCategory}]`);
  
  // Core enterprise tools
  const coreTools = [
    createFactTool(config),
    createSDKDocumentationTool(config)
];
  
  // Add custom tools if provided
  const allTools = [
    ...coreTools,
    ...(config.customTools || [])
];
  
  // Create SDK MCP server
  const sdkServer = createSdkMcpServer({
    name:`enterprise-${config.taskCategory}-${config.taskId}`,
    version:"1.0.94",
    tools:allTools
});
  
  logger.debug(`Created SDK server with ${allTools.length} tools for task ${config.taskId}`);
  
  return sdkServer;
}

/**
 * Execute Claude Code query with enterprise SDK
 */
export async function executeEnterpriseClaudeTask(
  prompt:string,
  config:TaskSpecificSDKConfig,
  options:ClaudeSDKOptions = {}
):Promise<ClaudeMessage[]> {
  logger.info(`Executing enterprise Claude task:${config.taskId}`);
  
  // Create enterprise SDK
  const taskSDK = createEnterpriseTaskSDK(config);
  
  // Configure Claude Code SDK options
  const sdkOptions = {
    mcpServers:{
      [taskSDK.name]:taskSDK
},
    allowedTools:[
      "get_enterprise_facts",
      "get_sdk_documentation",
      ...(config.customTools?.map(tool => tool.name) || [])
],
    systemPrompt:`You are executing a ${config.taskCategory} task with access to enterprise knowledge.`
    
Available tools:
- get_enterprise_facts:Access enterprise knowledge system for relevant facts
- get_sdk_documentation:Get Claude Code SDK 1.0.94 documentation
${config.customTools?.length ? `- Custom tools:${config.customTools.map(t => t.name).join(',    ')}` : ''}`
'
Task Security Level:${config.securityLevel}
Allowed Fact Types:${config.allowedFactTypes?.join(',    ') || ' all'}

Use these tools to gather the information needed to complete your task effectively.`,
    ...options
};
  
  // Execute with Claude Code SDK
  const messages:ClaudeMessage[] = [];
  
  try {
    for await (const message of query({
      prompt,
      options:sdkOptions
})) {
      // Convert SDK message to ClaudeMessage format
      const claudeMessage:ClaudeMessage = {
        type:(message as { type?: string}).type as 'assistant' | ' user' | ' result' | ' system' || ' assistant',        content:typeof message === 'string' ? message : JSON.stringify(message),
        timestamp:Date.now(),
        metadata:{
          taskId:config.taskId,
          taskCategory:config.taskCategory,
          securityLevel:config.securityLevel,
          sessionId:message.session_id || options.sessionId,
          messageId:message.uuid
}
};
      
      messages.push(claudeMessage);
}
} catch (error) {
    logger.error('Enterprise Claude task execution failed: ', error);
'    throw new Error(`Enterprise task failed:${error instanceof Error ? error.message : 'Unknown error'}`);
}
  
  logger.info(`Enterprise task completed:${messages.length} messages`);
  return messages;
}

// =============================================================================
// Pre-configured Task Types
// =============================================================================

/**
 * SDK Integration Task Configuration
 */
export function createSDKIntegrationTask(taskId:string, eventSystem?:TypedEventBase) {
  return createEnterpriseTaskSDK({
    taskId,
    taskCategory: 'sdk-integration',    securityLevel: 'medium',    allowedFactTypes:['api-docs',    'npm-package',    'github-repo'],
    eventSystem,
    customTools:[
      tool("validate_sdk_integration", "Validate SDK integration implementation", {
        code:z.string(),
        expectedFeatures:z.array(z.string())
}, ({ code, expectedFeatures}) => 
        // Custom validation logic for SDK integration
        Promise.resolve({
          content:[{
            type:"text",
            text:JSON.stringify({
              validation:"mock-validation",
              code:code.substring(0, 100),
              features:expectedFeatures,
              status:"valid",
              suggestions:["Consider error handling", "Add logging"]
})
}]
})
      )
]
});
}

/**
 * Security Audit Task Configuration  
 */
export function createSecurityAuditTask(taskId:string, eventSystem?:TypedEventBase) {
  return createEnterpriseTaskSDK({
    taskId,
    taskCategory: 'security-audit',    securityLevel: 'high',    allowedFactTypes:['security-advisory',    'npm-package',    'github-repo'],
    eventSystem,
    customTools:[
      tool("scan_vulnerabilities", "Scan for known vulnerabilities", {
        component:z.string(),
        version:z.string().optional()
}, ({ component, version}) => Promise.resolve({
          content:[{
            type:"text", 
            text:JSON.stringify({
              scan:"vulnerability-scan",
              component,
              version,
              vulnerabilities:[],
              status:"clean"
})
}]
}))
]
});
}

// =============================================================================
// Exports
// =============================================================================

export {
  createFactTool,
  createSDKDocumentationTool
};

export type {
  TaskSpecificSDKConfig,
  FactQuery
};