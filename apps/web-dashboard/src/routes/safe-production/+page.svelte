<script lang="ts">
import { onMount } from "svelte";

// Get user info from URL params or default
let userId = "prod_user_001";
let userRole:
	| "team_member"
	| "scrum_master"
	| "po"
	| "rte"
	| "architect"
	| "business_owner" = "team_member";
let immersionLevel: "basic" | "enhanced" | "production" = "production";

onMount(() => {
	// Extract user preferences from URL or localStorage
	const params = new URLSearchParams(window.location.search);
	userId = params.get("userId") || localStorage.getItem("safeUserId") || userId;
	userRole =
		(params.get("userRole") as any) ||
		localStorage.getItem("safeUserRole") ||
		userRole;
	immersionLevel =
		(params.get("immersionLevel") as any) ||
		localStorage.getItem("safeImmersionLevel") ||
		immersionLevel;

	// Save preferences
	localStorage.setItem("safeUserId", userId);
	localStorage.setItem("safeUserRole", userRole);
	localStorage.setItem("safeImmersionLevel", immersionLevel);
});
</script>

<svelte:head>
  <title>SAFe Production Dashboard - claude-code-zen</title>
  <meta name="description" content="Production-ready SAFe 6.0 dashboard with AI coaching, gamification, and real-time collaboration" />
</svelte:head>

<div class="min-h-screen">
  <SafeProductionDashboard 
    {userId}
    {userRole}
    {immersionLevel}
  />
</div>