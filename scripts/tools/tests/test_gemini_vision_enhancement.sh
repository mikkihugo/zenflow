#!/bin/bash
# Test Gemini Vision Enhancement with full API key

export GEMINI_API_KEY="AIzaSyB7VWjbpAn9ZzTjs5G2lVGw32fDlxjL6sg"

echo "🚀 Testing Gemini Vision Enhancement"
echo "====================================="
echo

# Test 1: Vision Analysis using prompt command
echo "📊 Test 1: Strategic Vision Analysis"
node gemini_direct_api.js prompt "Analyze this strategic vision and provide roadmap recommendations in JSON format: {
  title: 'AI-Powered Development Platform',
  description: 'Create a comprehensive development platform that uses AI to accelerate software development',
  strategic_goals: ['Increase developer productivity by 10x', 'Reduce bugs by 90%', 'Automate repetitive tasks'],
  timeline: '6 months'
}" --format json

echo
echo "-----------------------------------"
echo

# Test 2: Swarm Optimization
echo "🐝 Test 2: Swarm Coordination Optimization"
node gemini_direct_api.js swarm '{"agents": ["vision_analyst", "roadmap_architect", "technical_lead", "qa_specialist"], "workflow": "vision_to_code", "current_bottleneck": "technical_design_phase"}' '{"type": "strategic_planning", "complexity": "high"}'

echo
echo "-----------------------------------"
echo

# Test 3: Code Analysis for Vision-to-Code System
echo "💻 Test 3: Vision-to-Code System Analysis"
node gemini_direct_api.js code 'defmodule VisionToCodeSystem do
  def create_vision(vision_data) do
    GenServer.call(__MODULE__, {:create_vision, vision_data})
  end
  
  def generate_roadmap_from_vision(vision) do
    %{
      phases: extract_phases(vision),
      features: extract_features_from_vision(vision),
      technical_requirements: identify_technical_requirements(vision),
      risks_and_mitigation: identify_risks(vision)
    }
  end
end' elixir

echo
echo "-----------------------------------"
echo

# Test 4: Directory Analysis
echo "📁 Test 4: Project Directory Analysis"
node gemini_direct_api.js directory '**/*.{ex,exs,js}' architecture

echo
echo "✅ Gemini Vision Enhancement Tests Complete!"