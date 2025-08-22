<script lang="ts">
  import { writable } from 'svelte/store';

  export let data: any;
  export let userRole: string;
  export let immersionLevel: 'basic' | 'enhanced' | 'production';

  const conversationStore = writable([]);
  let currentMessage = '';
  let isCoachTyping = false;

  // AI Coach personality based on role
  const coachPersonalities = {
    team_member: {
      name: 'Alex',
      avatar: '👨‍💻',
      personality: 'Encouraging technical mentor',
      focus: 'Technical excellence and collaboration'
    },
    scrum_master: {
      name: 'Sam',
      avatar: '🎯',
      personality: 'Facilitation expert',
      focus: 'Team dynamics and process improvement'
    },
    po: {
      name: 'Pat',
      avatar: '🎨',
      personality: 'Product strategy guide',
      focus: 'Value delivery and stakeholder alignment'
    },
    rte: {
      name: 'Riley',
      avatar: '🚀',
      personality: 'Program excellence coach',
      focus: 'ART coordination and scaling'
    },
    architect: {
      name: 'Ava',
      avatar: '🏗️',
      personality: 'Technical leadership advisor',
      focus: 'Architecture evolution and innovation'
    },
    business_owner: {
      name: 'Blake',
      avatar: '💼',
      personality: 'Strategic business advisor',
      focus: 'Portfolio optimization and ROI'
    }
  };

  $: coach = coachPersonalities[userRole] || coachPersonalities.team_member;
  $: activeSession = data?.activeSession || { confidence: 0.85, currentFocus: 'general_guidance' };
  $: suggestions = data?.suggestions || [];
  $: nextActions = data?.nextActions || [];

  function sendMessage() {
    if (!currentMessage.trim()) return;

    // Add user message
    conversationStore.update(conv => [
      ...conv,
      {
        type: 'user',
        message: currentMessage,
        timestamp: new Date()
      }
    ]);

    const userMsg = currentMessage;
    currentMessage = '';
    
    // Simulate AI coach response
    isCoachTyping = true;
    setTimeout(() => {
      const response = generateCoachResponse(userMsg);
      conversationStore.update(conv => [
        ...conv,
        {
          type: 'coach',
          message: response,
          timestamp: new Date()
        }
      ]);
      isCoachTyping = false;
    }, 1500);
  }

  function generateCoachResponse(userMessage: string): string {
    const responses = {
      team_member: [
        "Great question! Let's break this down into manageable steps. First, consider...",
        "I've noticed similar patterns before. Here's what usually works well...",
        "That's a thoughtful approach. Have you considered the impact on your team's workflow?",
        "Excellent progress! To build on this, you might want to explore...",
        "I see you're facing a common challenge. Let me share some proven strategies..."
      ],
      scrum_master: [
        "This is a perfect opportunity to practice facilitation. Try using the 'Five Whys' technique...",
        "I can see this is affecting team dynamics. Consider having a focused retrospective on...",
        "Your team health metrics suggest this is the right area to focus on. Let's explore...",
        "Facilitation tip: When this happens, I recommend creating psychological safety by...",
        "Great observation! This pattern often indicates deeper team needs. Have you considered..."
      ],
      po: [
        "From a value delivery perspective, this aligns well with your customer outcomes. Consider...",
        "I see an opportunity to strengthen stakeholder alignment here. What if you...",
        "Your backlog prioritization is crucial here. Based on business value, I'd suggest...",
        "This connects nicely to your product vision. To maximize impact, you might...",
        "Excellent product thinking! To validate this assumption, consider running..."
      ],
      rte: [
        "This is exactly the kind of cross-team coordination challenge RTEs excel at. Try...",
        "Your ART health metrics show this is impacting multiple teams. I recommend...",
        "PI Planning insight: This dependency pattern suggests we need better architectural alignment...",
        "Great systems thinking! To scale this across the ART, consider implementing...",
        "This is a perfect use case for our Solution Train coordination. Let's..."
      ],
      architect: [
        "From an architectural perspective, this creates an interesting design challenge. Consider...",
        "Your technical debt metrics suggest this is the right investment. To maximize ROI...",
        "This aligns well with our architectural runway needs. I'd recommend prioritizing...",
        "Excellent technical leadership! To influence the broader architecture, you might...",
        "This decision will impact multiple ARTs. Have you considered the enterprise implications..."
      ],
      business_owner: [
        "This directly impacts our portfolio ROI. From an investment perspective, I'd recommend...",
        "Your business outcomes tracking shows this is a high-value opportunity. Consider...",
        "Excellent strategic thinking! To maximize business value across the portfolio...",
        "This connects well to our Lean Portfolio Management principles. You might want to...",
        "From a funding perspective, this creates an interesting optimization opportunity..."
      ]
    };

    const roleResponses = responses[userRole] || responses.team_member;
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function applySuggestion(suggestion: string) {
    currentMessage = `Can you help me with: ${suggestion}`;
    sendMessage();
  }
</script>

<div class="flex flex-col h-full">
  <!-- Coach Header -->
  <div class="flex items-center space-x-3 mb-4 p-3 bg-slate-700/30 rounded-lg">
    <div class="text-2xl">{coach.avatar}</div>
    <div class="flex-1">
      <div class="font-semibold text-slate-200">{coach.name}</div>
      <div class="text-xs text-slate-400">{coach.personality}</div>
      <div class="text-xs text-blue-400">{coach.focus}</div>
    </div>
    <div class="text-right">
      <div class="text-xs text-slate-400">Confidence</div>
      <div class="text-sm font-semibold text-green-400">
        {(activeSession.confidence * 100).toFixed(0)}%
      </div>
    </div>
  </div>

  <!-- Quick Suggestions -->
  {#if suggestions.length > 0}
    <div class="mb-4">
      <div class="text-xs font-medium text-slate-300 mb-2">💡 Quick Suggestions</div>
      <div class="space-y-1">
        {#each suggestions.slice(0, 2) as suggestion}
          <button 
            class="w-full text-left text-xs p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-200 transition-colors"
            on:click={() => applySuggestion(suggestion)}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Conversation Area -->
  <div class="flex-1 min-h-0 mb-4">
    <div class="h-full overflow-y-auto space-y-2 p-2 bg-slate-900/30 rounded-lg">
      {#each $conversationStore as message (message.timestamp)}
        <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[80%] p-2 rounded-lg text-xs {
            message.type === 'user' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-200'
          }">
            {message.message}
          </div>
        </div>
      {/each}
      
      {#if isCoachTyping}
        <div class="flex justify-start">
          <div class="bg-slate-700 text-slate-200 p-2 rounded-lg text-xs">
            <div class="flex space-x-1">
              <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
              <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Input Area -->
  <div class="flex space-x-2">
    <input
      type="text"
      bind:value={currentMessage}
      on:keypress={handleKeyPress}
      placeholder="Ask {coach.name} for guidance..."
      class="flex-1 px-3 py-2 text-xs bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
      disabled={isCoachTyping}
    />
    <button
      on:click={sendMessage}
      disabled={!currentMessage.trim() || isCoachTyping}
      class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
    >
      Send
    </button>
  </div>

  <!-- Next Actions -->
  {#if nextActions.length > 0}
    <div class="mt-4 pt-3 border-t border-slate-700">
      <div class="text-xs font-medium text-slate-300 mb-2">🎯 Recommended Actions</div>
      <div class="space-y-1">
        {#each nextActions.slice(0, 2) as action}
          <div class="text-xs p-2 bg-slate-700/20 rounded border-l-2 {
            action.priority === 'high' ? 'border-red-400' : 
            action.priority === 'medium' ? 'border-yellow-400' : 'border-green-400'
          }">
            <div class="text-slate-200 font-medium">{action.action}</div>
            <div class="text-slate-400">{action.estimatedTime} • {action.reasoning}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Custom animations for typing indicator */
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
</style>