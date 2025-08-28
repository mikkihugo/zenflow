/**
 * @fileoverview Predictive Analytics Service
 *
 * Service for value delivery time predictions and forecasting.
 * Handles predictive modeling, forecasting algorithms, and trend analysis.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  groupBy,
  meanBy,')} from 'lodash-es')import type { Logger} from '../../types')/**';
 * Predictive analytics configuration
 */
export interface PredictiveAnalyticsConfig {
    readonly analyticsId: 'time_series';
}
/**
 * Prediction algorithm
 */
export declare enum PredictionAlgorithm {
    ')  ARIMA = ' = 0,
    arima = 1,
    ')  LINEAR_REGRESSION = ' = 2,
    linear_regression = 3,
    ')  POLYNOMIAL_REGRESSION = ' = 4,
    polynomial_regression = 5,
    ')  LSTM = ' = 6,
    lstm = 7,
    ')  RANDOM_FOREST = ' = 8,
    random_forest = 9,
    ')  GRADIENT_BOOSTING = ' = 10,
    gradient_boosting = 11,
    ')  EXPONENTIAL_SMOOTHING = ' = 12,
    exponential_smoothing = 13,
    ')};; 
    /**
     * Model parameters
     */
    = 14
    /**
     * Model parameters
     */
    ,
    /**
     * Model parameters
     */
    export = 15,
    interface = 16,
    ModelParameters = 17
}
/**
 * Validation metric
 */
export declare enum ValidationMetric {
    ')  MAE =' = 0,
    mae = 1,// Mean Absolute Error')  MAPE ='mape,// Mean Absolute Percentage Error')  RMSE ='rmse,// Root Mean Squared Error')  R_SQUARED = 'r_squared')  AIC ='aic,// Akaike Information Criterion')  BIC ='bic,// Bayesian Information Criterion')};;
    /**
     * Validation threshold
     */
    export = 2,
    interface = 3,
    ValidationThreshold = 4
}
/**
 * Data configuration
 */
export interface DataConfiguration {
    readonly historicalWindow: 'numeric';
}
/**
 * Data source
 */
export interface DataSource {
    readonly sourceId: 'skip';
}
/**
 * Feature transformation
 */
export interface FeatureTransformation {
    readonly transformationId: 'normalization';
}
/**
 * Feature importance
 */
export interface FeatureImportance {
    readonly score: 'correlation';
}
/**
 * Preprocessing configuration
 */
export interface PreprocessingConfig {
    readonly missingValues: 'z_score';
}
/**
 * Outlier treatment
 */
export declare enum OutlierTreatment {
    ')  REMOVE = ' = 0,
    remove = 1,
    ')  CAP = ' = 2,
    cap = 3,
    ')  TRANSFORM = ' = 4,
    transform = 5,
    ')  IGNORE = ' = 6,
    ignore = 7,
    ')};; 
    /**
     * Outlier threshold
     */
    = 8
    /**
     * Outlier threshold
     */
    ,
    /**
     * Outlier threshold
     */
    export = 9,
    interface = 10,
    OutlierThreshold = 11
}
/**
 * Encoding method
 */
export interface EncodingMethod {
    readonly feature: 'join';
}
/**
 * Accuracy requirements
 */
export interface AccuracyRequirements {
    readonly targetAccuracy: 'real_time';
}
/**
 * Value delivery prediction result
 */
export interface ValueDeliveryPrediction {
    readonly predictionId: 'data_quality';
}
/**
 * Prediction accuracy
 */
export interface PredictionAccuracy {
    readonly historical: 'increasing';
}
/**
 * Trend forecast
 */
export interface TrendForecast {
    readonly continuationProbability: new () => Map<string, ValueDeliveryPrediction>;
    (): any;
}
//# sourceMappingURL=predictive-analytics-service.d.ts.map