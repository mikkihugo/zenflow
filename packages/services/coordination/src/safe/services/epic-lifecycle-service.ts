/**
 * @fileoverview Epic Lifecycle Service - Portfolio Kanban Management
 *
 * Service for managing epic lifecycle through Portfolio Kanban states.
 * Handles epic progression, gate criteria, and WSJF prioritization.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  orderBy,
} from 'lodash-es')import type { Logger, PortfolioEpic} from '../types')import type {';
  EpicBlocker,
  GateCriterion,
  PortfolioKanbanState,
  WSJFScore,
} from '../types/epic-management')/**`;
 * Epic lifecycle service configuration
 */
export interface EpicLifecycleConfig {
  readonly analysisTimeLimit: new Map<string, PortfolioEpic>();
  private wsjfScores = new Map<string, WSJFScore>();
  private blockers = new Map<string, EpicBlocker[]>();
  constructor(config: config;
    this.logger = logger;
}
  /**
   * Progress epic through Portfolio Kanban states
   */
  async progressEpicState(
    epicId: this.epics.get(epicId);
    if (!epic) {
      throw new Error(`Epic not found: this.getCurrentLifecycleStage(epicId);
    const blockers = this.blockers.get(epicId)|| [];
    // Validate gate criteria for progression
    const gateValidation = await this.validateGateCriteria(
      epicId,
      targetState,
      gateEvidence;
    );
    if (!gateValidation.canProgress) {
      return {
        success: {
      ...epic,
      status: {
      stage: this.lifecycleStages.get(epicId)|| [];
    stages.push(newStage);
    this.lifecycleStages.set(epicId, stages);
    this.logger.info(`Epic state progressed successfully,{`;
      epicId,
      newState: this.wsjfScores.get(input.epicId);
    // Calculate Cost of Delay (CoD)
    const costOfDelay =
      input.businessValue +
      input.urgency +
      input.riskReduction +;
      input.opportunityEnablement;
    // Calculate WSJF score (CoD / Size)
    const wsjfScore = costOfDelay / Math.max(input.size, 1);
    const newScore: {
      businessValue: Array.from(this.wsjfScores.entries())();
    const sortedByScore = orderBy(
      allScores,
      ([, score]) => score.wsjfScore,')     'desc'));
    const currentRank =;
      sortedByScore.findIndex(([id]) => id === input.epicId) + 1;
    let previousRank = currentRank;
    if (previousScore) {
      const previousSorted = orderBy(
        allScores,
        ([id, score]) =>
          id === input.epicId ? previousScore.wsjfScore: score.wsjfScore,
       'desc'));
      previousRank =
        previousSorted.findIndex(([id]) => id === input.epicId) + 1;
}
    const rankChange = previousRank - currentRank;
    const recommendations = this.generateWSJFRecommendations(
      newScore,
      previousScore;
    );
    this.logger.info('WSJF score calculated,{';
      epicId: {
    ')      id,    ')      identifiedAt: this.blockers.get(epicId)|' | '[];)    existingBlockers.push(blocker)';;
    this.blockers.set(epicId, existingBlockers);')    this.logger.warn('Epic blocker added,{
      epicId,
      blockerId: this.blockers.get(epicId)|| [];
    const blockerIndex = blockers.findIndex((b) => b.id === blockerId);
    if (blockerIndex === -1) {
    `)      throw new Error(`Blocker not found: {`
      ...blockers[blockerIndex],
      resolvedAt: Array.from(this.epics.values())();
    const allStages = Array.from(this.lifecycleStages.values()).flat();
    const allBlockers = Array.from(this.blockers.values()).flat();
    const allScores = Array.from(this.wsjfScores.values())();
    // State distribution')    const stateDistribution = countBy(allEpics,'status)as Record<';
      PortfolioKanbanState,
      number
    >;
    // Lead time calculation (funnel to done)
    const completedEpics = filter(
      allEpics,
      (e) => e.status === PortfolioKanbanState.DONE;
    );
    const leadTimes = completedEpics.map((epic) => {
      const stages = this.lifecycleStages.get(epic.id)|| [];
      const firstStage = stages[0];
      const lastStage = stages[stages.length - 1];
      if (firstStage && lastStage) {
        return differenceInDays(lastStage.enteredAt, firstStage.enteredAt);
}
      return 0;
});
    const averageLeadTime =;
      leadTimes.length > 0 ? meanBy(leadTimes, (t) => t) :0;
    // Cycle time calculation (implementing to done)
    const cycleTimeStages = filter(
      allStages,
      (s) =>
        s.stage === PortfolioKanbanState.IMPLEMENTING|| s.stage === PortfolioKanbanState.DONE;
    );
    const averageCycleTime =
      cycleTimeStages.length > 1
        ? meanBy(cycleTimeStages, (s) => s.duration|| 0);
        :0;
    // Throughput (completed epics per month)
    const recentCompletions = filter(completedEpics, (epic) => {
      const stages = this.lifecycleStages.get(epic.id)|| [];
      const doneStage = stages.find(
        (s) => s.stage === PortfolioKanbanState.DONE;
      );
      return (
        doneStage && differenceInDays(new Date(), doneStage.enteredAt) <= 30
      );
});
    const throughput = recentCompletions.length;
    // WSJF score distribution
    const wsjfScoreDistribution =
      allScores.length > 0
        ? {
            min: Math.min(...allScores.map((s) => s.wsjfScore)),')            max: Math.max(...allScores.map((s) => s.wsjfScore)),')            avg: [
      PortfolioKanbanState.ANALYZING,
      PortfolioKanbanState.IMPLEMENTING,
];
    const valueAddedTime = sumBy(
      filter(allStages, (s) => valueAddedStates.includes(s.stage)),')     'duration'));
    const totalTime = sumBy(allStages, 'duration');
    const flowEfficiency =;
      totalTime > 0 ? (valueAddedTime / totalTime) * 100: Array.from(this.wsjfScores.entries())
      .map(([epicId, score]) => ({
        epic: this.epics.get(epicId)!,
        wsjfScore: score,
        rank: 0,
}));
      .filter((item) => item.epic);
    // Sort by WSJF score and assign ranks')    const sorted = orderBy(epicScores,'wsjfScore.wsjfScore,' desc');
    return sorted.map((item, index) => ({
      ...item,
      rank: this.lifecycleStages.get(epicId)|| [];
    return stages.length > 0 ? stages[stages.length - 1] :null;
}
  /**
   * Validate gate criteria for epic progression
   */
  private async validateGateCriteria(
    epicId: this.getGateCriteria(targetState);
    const passedCriteria: [];
    const unmetCriteria: [];
    for (const criterion of gateCriteria) {
      const hasEvidence = evidence && evidence[criterion.criterion]?.length > 0;')      const isCompleted = hasEvidence|| criterion.status ===completed')      if (isCompleted) {';
        passedCriteria.push({
          ...criterion,
          status : 'completed,'
          completionDate: unmetCriteria.length === 0;)    const recommendations = canProgress`)      ? [`Epic meets all criteria for ${targetState}];)      :[``${unmetCriteria.lengthcriteria still need to be met}];``)    const _nextActions = unmetCriteria.map((c) => `Complete: {`
      [PortfolioKanbanState.FUNNEL]:[],
      [PortfolioKanbanState.ANALYZING]:[
        {
          criterion : 'Epic hypothesis defined')          status : 'pending')          owner : 'Epic Owner,'
'          dueDate: 'Initial market research completed',)          status : 'pending')          owner : 'Product Manager,'
'          dueDate: 'Business case approved',)          status : 'pending')          owner : 'Portfolio Manager,'
'          dueDate: 'WSJF score calculated',)          status : 'pending')          owner : 'Epic Owner,'
'          dueDate: 'Implementation capacity allocated',)          status : 'pending')          owner : 'RTE,'
'          dueDate: 'Epic acceptance criteria met',)          status : 'pending')          owner : 'Epic Owner,'
'          dueDate: 'Business value realized',)          status : 'pending')          owner : 'Portfolio Manager,'
'          dueDate: {
      [PortfolioKanbanState.FUNNEL]:10,
      [PortfolioKanbanState.ANALYZING]:25,
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:40,
      [PortfolioKanbanState.IMPLEMENTING]:80,
      [PortfolioKanbanState.DONE]:100,
      [PortfolioKanbanState.CANCELLED]:0,
};
    return completionMap[state]|| 0;
}
  /**
   * Get key activities for lifecycle stage
   */
  private getStageActivities(state: {
    ')      [PortfolioKanbanState.FUNNEL]:['Capture epic idea,')       'Initial assessment,';
],
      [PortfolioKanbanState.ANALYZING]:[
       'Develop business case,')       'Conduct market research,';
       'Define MVP,';
],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:[';'];;
       'Prioritize with WSJF,')       'Resource planning,';
       'Dependency analysis,';
],
      [PortfolioKanbanState.IMPLEMENTING]:[';'];;
       'Feature development,')       'Solution implementation,';
       'Value delivery,';
],
      [PortfolioKanbanState.DONE]:[';'];;
       'Value realization,')       'Lessons learned,';
       'Epic closure,';
],
      [PortfolioKanbanState.CANCELLED]:[';'];;
       'Document cancellation,')       'Resource reallocation,';
],
};
    return activitiesMap[state]|| [];
}
  /**
   * Get stakeholders involved in lifecycle stage
   */
  private getStageStakeholders(state: {
      [PortfolioKanbanState.FUNNEL]:['Epic Owner,' Portfolio Manager'],';
      [PortfolioKanbanState.ANALYZING]:[
       'Epic Owner,')       'Product Manager,';
       'Solution Architect,';
],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:[';'];;
       'Portfolio Manager,')       'Epic Owner,';
       'RTE,';
],
      [PortfolioKanbanState.IMPLEMENTING]:[';'];;
       'Epic Owner,')       'ARTs,';
       'Solution Train,';
],
      [PortfolioKanbanState.DONE]:[';'];;
       'Portfolio Manager,')       'Epic Owner,';
       'Business Stakeholders,';
],')      [PortfolioKanbanState.CANCELLED]:['Portfolio Manager,' Epic Owner'],';
};
    return stakeholdersMap[state]|| [];
}
  /**
   * Get next actions for lifecycle stage
   */
  private getNextActions(state: {
      [PortfolioKanbanState.FUNNEL]:['Develop epic hypothesis,')       'Schedule analysis,';
],
      [PortfolioKanbanState.ANALYZING]:[
       'Complete business case,')       'Calculate WSJF,';
],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:[
       'Allocate capacity,')       'Plan implementation,';
],
      [PortfolioKanbanState.IMPLEMENTING]:[
       'Track progress,')       'Manage dependencies,';
],
      [PortfolioKanbanState.DONE]:['Measure outcomes,' Capture learnings'],';
      [PortfolioKanbanState.CANCELLED]:[
       'Document reasons,')       'Notify stakeholders,';
],
};
    return actionsMap[state]|| [];
}
  /**
   * Map PortfolioKanbanState to PortfolioEpic status
   */
  private mapKanbanStateToEpicStatus(
    kanbanState: ';
        return',implementing')      case PortfolioKanbanState.DONE : ';
        return'done')      case PortfolioKanbanState.PORTFOLIO_BACKLOG  = ';
      case PortfolioKanbanState.FUNNEL: []'; 
    if (current.wsjfScore > 15) {
      recommendations.push('High WSJF score - prioritize for implementation');
} else if (current.wsjfScore < 5) {
    ')      recommendations.push('Low WSJF score - consider deferring or cancelling');
}
    if (current.confidence < 70) {
    ')      recommendations.push('Low confidence in WSJF scoring - gather more data');
}
    if (previous && current.wsjfScore < previous.wsjfScore) {
    ')      recommendations.push('WSJF score decreased - review assumptions');
}
    if (current.size > 15) {
      recommendations.push(';')';
       'Large epic size - consider splitting into smaller epics));
}
    return recommendations;
}
}
;)`;