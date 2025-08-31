/**
 * @fileoverview Epic Lifecycle Service - Portfolio Kanban Management
 *
 * Service for managing epic lifecycle through Portfolio Kanban states.
 * Handles epic progression, gate criteria, and WSJF prioritization.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  orderBy,
} from 'lodash-es')../types');
  EpicBlocker,
  GateCriterion,
  PortfolioKanbanState,
  WSJFScore,
} from '../types/epic-management'))     'desc')desc')WSJF score calculated,{';
      epicId:  {
    '))      identifiedAt: this.blockers.get(): void {
      epicId,
      blockerId: this.blockers.get(): void {
    `)      throw new Error(): void {
      const stages = this.lifecycleStages.get(): void {
        return differenceInDays(): void {
      const stages = this.lifecycleStages.get(): void {
            min: Math.min(): void {
          ...criterion,
          status : 'completed,'
          completionDate: unmetCriteria.length === 0;)    const recommendations = canProgress")      ? ["Epic meets all criteria for $" + JSON.stringify(): void {unmetCriteria.lengthcriteria still need to be met}]"");
    return completionMap[state]|| 0;
}
  /**
   * Get key activities for lifecycle stage
   */
  private getStageActivities(): void {
      [PortfolioKanbanState.FUNNEL]:['Epic Owner,' Portfolio Manager'],';
      [PortfolioKanbanState.ANALYZING]:[
       'Epic Owner,')Product Manager,';
       'Solution Architect,';
],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:[';];
       'Portfolio Manager,')Epic Owner,';
       'RTE,';
],
      [PortfolioKanbanState.IMPLEMENTING]:[';];
       'Epic Owner,')ARTs,';
       'Solution Train,';
],
      [PortfolioKanbanState.DONE]:[';];
       'Portfolio Manager,')Epic Owner,';
       'Business Stakeholders,';
],')Portfolio Manager,' Epic Owner'],';
};
    return stakeholdersMap[state]|| [];
}
  /**
   * Get next actions for lifecycle stage
   */
  private getNextActions(): void {
      recommendations.push('High WSJF score - prioritize for implementation'))      recommendations.push('Low WSJF score - consider deferring or cancelling'))      recommendations.push('Low confidence in WSJF scoring - gather more data'))      recommendations.push('WSJF score decreased - review assumptions');)';
       'Large epic size - consider splitting into smaller epics));
}
    return recommendations;
}
}
;)";"