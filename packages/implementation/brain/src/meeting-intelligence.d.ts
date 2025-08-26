/**
 * Meeting Intelligence Module
 * Placeholder for future meeting intelligence features
 */
export declare class MeetingIntelligence {
	constructor();
	analyzeMeeting(data: any): Promise<any>;
	private generateMeetingRecommendations;
}
export declare function createMeetingIntelligence(): MeetingIntelligence;
export interface NeuralParticipantProfile {
	id: string;
	expertise: string[];
	availability: number;
}
export interface MeetingStructureParams {
	duration: number;
	participantCount: number;
	objectives: string[];
}
export interface MeetingStructureRecommendation {
	structure: string;
	timeline: string[];
	recommendations: string[];
}
export interface ParticipantSelectionRequest {
	requiredExpertise: string[];
	meetingType: string;
	duration: number;
}
export interface ParticipantSelectionRecommendation {
	selectedParticipants: NeuralParticipantProfile[];
	reasoning: string[];
	confidence: number;
}
export interface MeetingLearningOutcome {
	insights: string[];
	actionItems: string[];
	nextSteps: string[];
}
export default MeetingIntelligence;
//# sourceMappingURL=meeting-intelligence.d.ts.map
