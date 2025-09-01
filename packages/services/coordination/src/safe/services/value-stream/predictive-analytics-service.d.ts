/**
* @fileoverview Predictive Analytics Service
*
* Service for value delivery time predictions and forecasting.
* Handles predictive modeling, forecasting algorithms, and trend analysis.
*
* SINGLE RESPONSIBILITY: dateFns;';
import {
groupBy,
meanBy,')lodash-es')../../types');
* Predictive analytics configuration
*/
export interface PredictiveAnalyticsConfig {
readonly analyticsId: 'time_series';
'}
/**
* Prediction algorithm
*/
export declare enum PredictionAlgorithm {
') = 0,
arima = 1,
') = 2,
linear_regression = 3,
') = 4,
polynomial_regression = 5,
') = 6,
lstm = 7,
') = 8,
random_forest = 9,
') = 10,
gradient_boosting = 11,
') = 12,
exponential_smoothing = 13,
')) MAE =' = 0,
mae = 1,// Mean Absolute Error')mape,// Mean Absolute Percentage Error')rmse,// Root Mean Squared Error')r_squared')aic,// Akaike Information Criterion')bic,// Bayesian Information Criterion')numeric';
'}
/**
* Data source
*/
export interface DataSource {
readonly sourceId: 'skip';
'}
/**
* Feature transformation
*/
export interface FeatureTransformation {
readonly transformationId: 'normalization';
'}
/**
* Feature importance
*/
export interface FeatureImportance {
readonly score: 'correlation';
'}
/**
* Preprocessing configuration
*/
export interface PreprocessingConfig {
readonly missingValues: 'z_score';
'}
/**
* Outlier treatment
*/
export declare enum OutlierTreatment {
') = 0,
remove = 1,
') = 2,
cap = 3,
') = 4,
transform = 5,
') = 6,
ignore = 7,
')join';
'}
/**
* Accuracy requirements
*/
export interface AccuracyRequirements {
readonly targetAccuracy: 'real_time';
'}
/**
* Value delivery prediction result
*/
export interface ValueDeliveryPrediction {
readonly predictionId: 'data_quality';
'}
/**
* Prediction accuracy
*/
export interface PredictionAccuracy {
readonly historical: 'increasing';
'}
/**
* Trend forecast
*/
export interface TrendForecast {
readonly continuationProbability: new () => Map<string, ValueDeliveryPrediction>;
(): any;
'}
//# sourceMappingURL=predictive-analytics-service.d.ts.map