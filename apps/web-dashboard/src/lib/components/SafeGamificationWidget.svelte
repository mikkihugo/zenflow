<script lang="ts">
import { onMount } from "svelte";
import { cubicOut } from "svelte/easing";
import { tweened } from "svelte/motion";

export let data: any;
export let userRole: string;
export let immersionLevel: "basic" | "enhanced" | "production";

// Animated progress bars
const levelProgress = tweened(0, { duration: 1000, easing: cubicOut });
const experienceProgress = tweened(0, { duration: 1500, easing: cubicOut });

// Sample gamification data
$: currentLevel = data?.currentLevel || {
	level: 12,
	title: "SAFe Navigator",
	progress: 0.73,
	pointsToNext: 1250,
};
$: achievements = data?.achievements || [];
$: challenges = data?.challenges || [];
$: leaderboards = data?.leaderboards || {
	team: { rank: 2, total: 8 },
	art: { rank: 7, total: 45 },
};

// Sample achievements and challenges based on role
const roleContent = {
	team_member: {
		recentAchievements: [
			{
				id: "first_pr",
				title: "First Contribution",
				icon: "🚀",
				rarity: "common",
				points: 50,
			},
			{
				id: "code_quality",
				title: "Quality Champion",
				icon: "✨",
				rarity: "uncommon",
				points: 100,
			},
			{
				id: "team_player",
				title: "Team Player",
				icon: "🤝",
				rarity: "rare",
				points: 150,
			},
		],
		activeChallenges: [
			{
				id: "code_review",
				title: "Code Review Champion",
				progress: 7,
				target: 10,
				reward: "200 points + Review Master badge",
			},
			{
				id: "innovation",
				title: "Innovation Sprint",
				progress: 2,
				target: 3,
				reward: "500 points + Innovation badge",
			},
		],
	},
	scrum_master: {
		recentAchievements: [
			{
				id: "retro_master",
				title: "Retrospective Master",
				icon: "🎯",
				rarity: "uncommon",
				points: 125,
			},
			{
				id: "impediment_buster",
				title: "Impediment Buster",
				icon: "🔨",
				rarity: "rare",
				points: 200,
			},
			{
				id: "team_velocity",
				title: "Velocity Optimizer",
				icon: "⚡",
				rarity: "epic",
				points: 300,
			},
		],
		activeChallenges: [
			{
				id: "team_health",
				title: "Team Health Champion",
				progress: 85,
				target: 90,
				reward: "300 points + Health Master badge",
			},
			{
				id: "facilitation",
				title: "Facilitation Excellence",
				progress: 12,
				target: 15,
				reward: "400 points + Facilitator badge",
			},
		],
	},
	po: {
		recentAchievements: [
			{
				id: "value_delivery",
				title: "Value Delivery Hero",
				icon: "💎",
				rarity: "rare",
				points: 250,
			},
			{
				id: "stakeholder",
				title: "Stakeholder Whisperer",
				icon: "🎭",
				rarity: "uncommon",
				points: 175,
			},
			{
				id: "backlog_master",
				title: "Backlog Master",
				icon: "📋",
				rarity: "rare",
				points: 200,
			},
		],
		activeChallenges: [
			{
				id: "customer_satisfaction",
				title: "Customer Satisfaction Star",
				progress: 4.2,
				target: 4.5,
				reward: "500 points + Customer Hero badge",
			},
			{
				id: "story_clarity",
				title: "Story Clarity Champion",
				progress: 18,
				target: 20,
				reward: "350 points + Clarity Master badge",
			},
		],
	},
	rte: {
		recentAchievements: [
			{
				id: "pi_success",
				title: "PI Planning Master",
				icon: "🎪",
				rarity: "epic",
				points: 400,
			},
			{
				id: "dependency_resolver",
				title: "Dependency Resolver",
				icon: "🔗",
				rarity: "rare",
				points: 300,
			},
			{
				id: "art_health",
				title: "ART Health Guardian",
				icon: "🏥",
				rarity: "legendary",
				points: 500,
			},
		],
		activeChallenges: [
			{
				id: "art_coordination",
				title: "ART Coordination Excellence",
				progress: 87,
				target: 95,
				reward: "600 points + Coordination Master badge",
			},
			{
				id: "cross_team",
				title: "Cross-Team Collaboration",
				progress: 23,
				target: 25,
				reward: "450 points + Collaboration badge",
			},
		],
	},
	architect: {
		recentAchievements: [
			{
				id: "tech_debt",
				title: "Technical Debt Slayer",
				icon: "⚔️",
				rarity: "rare",
				points: 275,
			},
			{
				id: "architecture_vision",
				title: "Architecture Visionary",
				icon: "🏗️",
				rarity: "epic",
				points: 350,
			},
			{
				id: "innovation_enabler",
				title: "Innovation Enabler",
				icon: "🚀",
				rarity: "legendary",
				points: 450,
			},
		],
		activeChallenges: [
			{
				id: "architectural_runway",
				title: "Architectural Runway Builder",
				progress: 14,
				target: 20,
				reward: "550 points + Runway Master badge",
			},
			{
				id: "tech_leadership",
				title: "Technical Leadership",
				progress: 8,
				target: 10,
				reward: "400 points + Tech Leader badge",
			},
		],
	},
	business_owner: {
		recentAchievements: [
			{
				id: "roi_optimizer",
				title: "ROI Optimizer",
				icon: "💰",
				rarity: "epic",
				points: 400,
			},
			{
				id: "portfolio_master",
				title: "Portfolio Master",
				icon: "📊",
				rarity: "legendary",
				points: 500,
			},
			{
				id: "business_outcomes",
				title: "Business Outcomes Champion",
				icon: "🎯",
				rarity: "rare",
				points: 300,
			},
		],
		activeChallenges: [
			{
				id: "portfolio_health",
				title: "Portfolio Health Optimization",
				progress: 82,
				target: 90,
				reward: "700 points + Portfolio Master badge",
			},
			{
				id: "investment_efficiency",
				title: "Investment Efficiency",
				progress: 15,
				target: 20,
				reward: "600 points + Investment Expert badge",
			},
		],
	},
};

$: roleData = roleContent[userRole] || roleContent.team_member;

onMount(() => {
	levelProgress.set(currentLevel.progress);
	experienceProgress.set(0.8); // Sample experience progress
});

function _getRarityColor(rarity: string): string {
	const colors = {
		common: "text-gray-400 border-gray-500",
		uncommon: "text-green-400 border-green-500",
		rare: "text-blue-400 border-blue-500",
		epic: "text-purple-400 border-purple-500",
		legendary: "text-yellow-400 border-yellow-500",
	};
	return colors[rarity] || colors.common;
}

function _getRarityGlow(rarity: string): string {
	const glows = {
		common: "shadow-gray-500/20",
		uncommon: "shadow-green-500/30",
		rare: "shadow-blue-500/30",
		epic: "shadow-purple-500/40",
		legendary: "shadow-yellow-500/50",
	};
	return glows[rarity] || glows.common;
}

function _formatProgress(current: number, target: number): string {
	if (current > 1) {
		return `${current}/${target}`;
	} else {
		return `${(current * 100).toFixed(1)}%`;
	}
}
</script>

<div class="flex flex-col h-full space-y-4">
  <!-- Current Level & Progress -->
  <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 rounded-lg border border-blue-500/30">
    <div class="flex items-center justify-between mb-2">
      <div>
        <div class="text-lg font-bold text-blue-400">Level {currentLevel.level}</div>
        <div class="text-sm text-slate-300">{currentLevel.title}</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-slate-400">Next Level</div>
        <div class="text-sm font-semibold text-purple-400">{currentLevel.pointsToNext} pts</div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="w-full bg-slate-700 rounded-full h-2 mb-2">
      <div 
        class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
        style="width: {$levelProgress * 100}%"
      ></div>
    </div>
    <div class="text-xs text-slate-400">{($levelProgress * 100).toFixed(0)}% to next level</div>
  </div>

  <!-- Recent Achievements -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-slate-200">🏆 Recent Achievements</h4>
      <div class="text-xs text-slate-400">{roleData.recentAchievements.length} unlocked</div>
    </div>
    
    <div class="space-y-2 max-h-32 overflow-y-auto">
      {#each roleData.recentAchievements as achievement}
        <div class="flex items-center space-x-3 p-2 bg-slate-700/30 rounded-lg border-l-2 {getRarityColor(achievement.rarity)} {getRarityGlow(achievement.rarity)} shadow-lg">
          <div class="text-lg">{achievement.icon}</div>
          <div class="flex-1">
            <div class="text-sm font-medium text-slate-200">{achievement.title}</div>
            <div class="text-xs {getRarityColor(achievement.rarity).split(' ')[0]} capitalize">{achievement.rarity} • {achievement.points} pts</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Active Challenges -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-slate-200">🎯 Active Challenges</h4>
      <div class="text-xs text-slate-400">{roleData.activeChallenges.length} active</div>
    </div>
    
    <div class="space-y-2">
      {#each roleData.activeChallenges as challenge}
        <div class="p-3 bg-slate-700/20 rounded-lg border border-slate-600/50">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-slate-200">{challenge.title}</div>
            <div class="text-xs text-slate-400">
              {formatProgress(challenge.progress, challenge.target)}
            </div>
          </div>
          
          <!-- Challenge Progress Bar -->
          <div class="w-full bg-slate-600 rounded-full h-1.5 mb-2">
            <div 
              class="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-1000"
              style="width: {(challenge.progress / challenge.target) * 100}%"
            ></div>
          </div>
          
          <div class="text-xs text-slate-400">{challenge.reward}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Leaderboards -->
  <div>
    <div class="text-sm font-semibold text-slate-200 mb-3">📊 Leaderboards</div>
    <div class="grid grid-cols-2 gap-2">
      <div class="p-2 bg-slate-700/20 rounded-lg text-center">
        <div class="text-lg font-bold text-green-400">#{leaderboards.team.rank}</div>
        <div class="text-xs text-slate-400">Team Rank</div>
        <div class="text-xs text-slate-500">of {leaderboards.team.total}</div>
      </div>
      <div class="p-2 bg-slate-700/20 rounded-lg text-center">
        <div class="text-lg font-bold text-blue-400">#{leaderboards.art.rank}</div>
        <div class="text-xs text-slate-400">ART Rank</div>
        <div class="text-xs text-slate-500">of {leaderboards.art.total}</div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar for achievements */
  .space-y-2::-webkit-scrollbar {
    width: 4px;
  }
  
  .space-y-2::-webkit-scrollbar-track {
    background: rgb(51, 65, 85);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb {
    background: rgb(71, 85, 105);
    border-radius: 2px;
  }
  
  .space-y-2::-webkit-scrollbar-thumb:hover {
    background: rgb(100, 116, 139);
  }
</style>