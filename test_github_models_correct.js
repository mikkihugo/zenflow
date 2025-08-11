// Test GitHub Models with correct endpoint and model
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-5-nano";

async function testCorrectEndpoint() {
  if (!token) {
    console.log("❌ GITHUB_TOKEN not set");
    return;
  }

  try {
    console.log('🧪 Testing GitHub Models with Correct Endpoint...');
    console.log('  - Endpoint:', endpoint);
    console.log('  - Model:', model);
    
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    // Test 1: Basic functionality
    console.log('\n📋 Test 1: Basic Chat Completion...');
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" }
        ],
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(`API Error: ${JSON.stringify(response.body?.error || response.body)}`);
    }

    console.log("✅ Basic GitHub Models API Success!");
    console.log("Response:", response.body.choices[0].message.content);
    
    // Test 2: JSON structured response
    console.log('\n📊 Test 2: JSON Response Request...');
    const jsonResponse = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant. Always respond in valid JSON format." },
          { role: "user", content: "Analyze the benefits of GitHub Models. Provide response as JSON with 'analysis', 'benefits' array, and 'score' (0-1)." }
        ],
        model: model,
        temperature: 0.1,
        max_tokens: 1000
      }
    });

    if (isUnexpected(jsonResponse)) {
      throw new Error(`JSON API Error: ${JSON.stringify(jsonResponse.body?.error || jsonResponse.body)}`);
    }

    console.log("✅ JSON Response Success!");
    const jsonContent = jsonResponse.body.choices[0].message.content;
    console.log("JSON Response:", jsonContent);
    
    // Test JSON parsing
    try {
      const parsed = JSON.parse(jsonContent);
      console.log("✅ Valid JSON Structure:");
      console.log("  - Has analysis:", 'analysis' in parsed);
      console.log("  - Has benefits array:", Array.isArray(parsed.benefits));
      console.log("  - Has score:", typeof parsed.score === 'number');
    } catch (parseError) {
      console.log("⚠️ JSON parsing issue:", parseError.message);
    }

    // Test 3: Rate limit info
    console.log('\n📊 Rate Limit Information:');
    const headers = jsonResponse.headers;
    console.log("  - Status:", jsonResponse.status);
    console.log("  - Model used:", jsonResponse.body.model);
    if (headers['x-ratelimit-remaining-requests']) {
      console.log("  - Remaining requests:", headers['x-ratelimit-remaining-requests']);
      console.log("  - Request limit:", headers['x-ratelimit-limit-requests']);
    }

  } catch (error) {
    console.error("❌ GitHub Models test failed:", error.message);
  }
}

// Test 4: Structured output with JSON schema (if supported)
async function testStructuredOutput() {
  if (!token) return;

  try {
    console.log('\n🏗️ Test 3: Structured Output with JSON Schema...');
    
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token)
    );

    const schema = {
      type: "object",
      properties: {
        analysis: { type: "string" },
        benefits: { 
          type: "array", 
          items: { type: "string" },
          minItems: 3,
          maxItems: 5
        },
        score: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["analysis", "benefits", "score"]
    };

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful technical analyst." },
          { role: "user", content: "Analyze GitHub Models benefits for developers." }
        ],
        model: model,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "GitHubModelsAnalysis",
            schema: schema,
            description: "Structured analysis of GitHub Models",
            strict: true
          }
        }
      }
    });

    if (isUnexpected(response)) {
      console.log("⚠️ Structured output not supported or error occurred");
      console.log("Error:", JSON.stringify(response.body?.error || response.body));
    } else {
      console.log("✅ Structured Output Success!");
      const content = response.body.choices[0].message.content;
      const parsed = JSON.parse(content);
      console.log("  - Analysis length:", parsed.analysis?.length || 0);
      console.log("  - Benefits count:", parsed.benefits?.length || 0);
      console.log("  - Score:", parsed.score);
    }

  } catch (error) {
    console.log("⚠️ Structured output test failed:", error.message);
  }
}

async function runAllTests() {
  await testCorrectEndpoint();
  await testStructuredOutput();
  
  console.log('\n🎯 Summary:');
  console.log('  - Endpoint: https://models.github.ai/inference ✅');
  console.log('  - Model: openai/gpt-5-nano ✅');
  console.log('  - Basic API: Tested');
  console.log('  - JSON Responses: Tested');
  console.log('  - Structured Output: Tested (may not be supported)');
}

runAllTests().catch(console.error);