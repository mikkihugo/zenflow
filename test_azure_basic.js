// Basic Azure AI inference test without structured output
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];

async function testBasicAzure() {
  if (!token) {
    console.log("❌ GITHUB_TOKEN not set");
    return;
  }

  try {
    console.log('🧪 Testing Basic Azure AI Inference...');
    
    const client = ModelClient(
      "https://models.github.ai",
      new AzureKeyCredential(token)
    );

    // Try different path structures for GitHub Models
    const response = await client.path("/v1/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant. Respond in valid JSON format." 
          },
          { 
            role: "user", 
            content: "Explain the benefits of Azure AI inference for GitHub Models in exactly 3 points. Format as JSON with 'benefits' array." 
          }
        ],
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 500
      }
    });

    if (isUnexpected(response)) {
      console.log('Response details:', {
        status: response.status,
        headers: response.headers,
        body: response.body
      });
      throw new Error(`Azure API Error: ${JSON.stringify(response.body?.error || response.body || 'Unknown error')}`);
    }

    const content = response.body.choices[0].message.content;
    console.log("✅ Azure Basic API Success!");
    console.log("Model:", response.body.model);
    console.log("Response:", content);
    
    // Check rate limits
    console.log("\n📊 Rate Limit Info:");
    console.log("  - Remaining requests:", response.headers['x-ratelimit-remaining-requests']);
    console.log("  - Request limit:", response.headers['x-ratelimit-limit-requests']);
    console.log("  - Remaining tokens:", response.headers['x-ratelimit-remaining-tokens']);
    console.log("  - Token limit:", response.headers['x-ratelimit-limit-tokens']);

    // Test JSON parsing
    try {
      const parsed = JSON.parse(content);
      console.log("\n✅ JSON Parsing Success:");
      console.log("  - Has 'benefits' array:", Array.isArray(parsed.benefits));
      console.log("  - Benefits count:", parsed.benefits?.length || 0);
    } catch (parseError) {
      console.log("\n⚠️ JSON Parsing Issue:", parseError.message);
      console.log("This shows the importance of structured output for guaranteed JSON responses");
    }

  } catch (error) {
    console.error("❌ Basic Azure test failed:", error.message);
  }
}

testBasicAzure().catch(console.error);