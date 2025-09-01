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

}
/**
* Prediction algorithm
*/
export declare enum PredictionAlgorithm {
    arima = 0,
    linear_regression = 1,
    exponential_smoothing = 2,
    machine_learning = 3,
    polynomial_regression = 4,
    lstm = 5,
    random_forest = 6,
    gradient_boosting = 7
}

/**
* Prediction metric
*/
export declare enum PredictionMetric {
    mae = 0,
    mape = 1,
    rmse = 2,
    r_squared = 3,
    aic = 4,
    bic = 5
}

/**
* Data source
*/
export interface DataSource {
    readonly sourceId: string;
    readonly type: string;
    readonly connection: string;
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
    remove = 0,
    cap = 1,
    transform = 2,
    ignore = 3
}

/**
* Accuracy requirements
*/
export interface AccuracyRequirements {
    readonly targetAccuracy: number;
    readonly acceptableError: number;
    readonly confidenceLevel: number;
}

/**
* Value delivery prediction result
*/
export interface ValueDeliveryPrediction {
    readonly predictionId: string;
    readonly predictedValue: number;
    readonly confidence: number;
    readonly timestamp: Date;
}

/**
* Prediction accuracy
*/
export interface PredictionAccuracy {
    readonly historical: number;
    readonly current: number;
    readonly trend: string;
}

/**
* Trend forecast
*/
export interface TrendForecast {
    readonly continuationProbability: number;
    readonly changeProbability: number;
    readonly expectedValue: number;
}
//# sourceMappingURL=predictive-analytics-service.d.ts.map