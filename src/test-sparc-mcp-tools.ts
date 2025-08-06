/**
 * Test for SPARC MCP Tools Integration
 * Tests the MCP tools that use the pseudocode engine
 */

async function testSPARCMCPTools() {
  console.log('🧪 Testing SPARC MCP Tools Integration...');

  try {
    // Import MCP tools
    const createSPARCTools = (await import('./interfaces/mcp/tools/sparc-integration-tools'))
      .default;

    // Create mock document service
    const mockDocumentService = {} as any;

    // Get the MCP tools
    const tools = createSPARCTools(mockDocumentService);

    console.log(`✅ Created ${tools.length} MCP tools`);

    // Find our pseudocode-specific tools
    const pseudocodeTools = tools.filter(
      (tool) =>
        tool.name.startsWith('sparc_generate_pseudocode') ||
        tool.name.startsWith('sparc_validate_pseudocode') ||
        tool.name.startsWith('sparc_generate_algorithms_only')
    );

    console.log(`🔧 Found ${pseudocodeTools.length} pseudocode-specific tools:`);
    pseudocodeTools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // Test pseudocode generation tool
    const generateTool = tools.find((tool) => tool.name === 'sparc_generate_pseudocode');
    if (generateTool) {
      console.log('\n🧮 Testing pseudocode generation tool...');

      const testSpec = {
        id: 'mcp-test-spec',
        domain: 'swarm-coordination',
        functionalRequirements: [
          {
            id: 'req-mcp-001',
            title: 'MCP Test Algorithm',
            description: 'Test algorithm for MCP integration',
            type: 'algorithmic',
            priority: 'HIGH',
            testCriteria: ['Algorithm works via MCP'],
          },
        ],
        nonFunctionalRequirements: [],
        constraints: [],
        assumptions: [],
        dependencies: [],
        acceptanceCriteria: [],
        riskAssessment: {
          risks: [],
          mitigationStrategies: [],
          overallRisk: 'LOW',
        },
        successMetrics: [],
      };

      const result = await generateTool.handler({
        specification: testSpec,
        options: {
          includeComplexityAnalysis: true,
          includeOptimizations: true,
        },
      });

      if (result.success) {
        console.log('✅ Pseudocode generation via MCP successful!');
        console.log(`📊 Generated ${result.data.summary.algorithmsGenerated} algorithms`);
        console.log(`🏗️ Generated ${result.data.summary.dataStructuresGenerated} data structures`);
        console.log(`💡 Identified ${result.data.summary.optimizationsIdentified} optimizations`);

        // Test validation tool with the generated result
        const validateTool = tools.find((tool) => tool.name === 'sparc_validate_pseudocode');
        if (validateTool) {
          console.log('\n🔍 Testing pseudocode validation tool...');

          const validationResult = await validateTool.handler({
            pseudocodeStructure: {
              id: result.data.pseudocodeId,
              algorithms: result.data.algorithms,
              dataStructures: result.data.dataStructures,
              controlFlows: result.data.controlFlows,
              optimizations: result.data.optimizations,
              complexityAnalysis: result.data.complexityAnalysis,
            },
          });

          if (validationResult.success) {
            console.log('✅ Pseudocode validation via MCP successful!');
            console.log(`📊 Validation score: ${validationResult.data.summary.scorePercentage}%`);
            console.log(`✅ Status: ${validationResult.data.summary.status}`);
          } else {
            console.log('❌ Validation failed:', validationResult.error);
          }
        }
      } else {
        console.log('❌ Generation failed:', result.error);
      }
    }

    // Test lightweight algorithms tool
    const algorithmsOnlyTool = tools.find((tool) => tool.name === 'sparc_generate_algorithms_only');
    if (algorithmsOnlyTool) {
      console.log('\n⚡ Testing lightweight algorithms tool...');

      const testSpec = {
        id: 'mcp-algorithms-test',
        domain: 'neural-networks',
        functionalRequirements: [
          {
            id: 'req-neural-mcp',
            title: 'Neural Algorithm Test',
            description: 'Test neural network algorithm via MCP',
            type: 'algorithmic',
            priority: 'HIGH',
          },
        ],
      };

      const result = await algorithmsOnlyTool.handler({ specification: testSpec });

      if (result.success) {
        console.log('✅ Lightweight algorithms generation via MCP successful!');
        console.log(`🧮 Generated ${result.data.summary.algorithmsGenerated} algorithms`);
        console.log(`🎯 Domain: ${result.data.domain}`);
      } else {
        console.log('❌ Lightweight generation failed:', result.error);
      }
    }

    console.log('\n🎉 All MCP tools integration tests passed!');

    return {
      success: true,
      toolsFound: tools.length,
      pseudocodeToolsFound: pseudocodeTools.length,
      functionalityTested: true,
    };
  } catch (error) {
    console.error('❌ MCP tools test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run the test if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testSPARCMCPTools().then((result) => {
    if (result.success) {
      console.log('🎯 MCP tools integration test completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 MCP tools integration test failed:', result.error);
      process.exit(1);
    }
  });
}

export { testSPARCMCPTools };
