/**
 * @fileoverview Predictive Analytics Service
 *
 * Service for value delivery time predictions and forecasting.
 * Handles predictive modeling, forecasting algorithms, and trend analysis.
 *
 * SINGLE RESPONSIBILITY: Predictive analytics and forecasting
 * FOCUSES ON: Value delivery predictions, forecasting models, trend analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
/**
 * Predictive analytics configuration
 */
export interface PredictiveAnalyticsConfig {
    readonly analyticsId: string;
    readonly valueStreamId: string;
    readonly predictionHorizon: number;
    readonly modelConfig: PredictiveModelConfig;
    readonly dataConfig: DataConfiguration;
    readonly accuracy: AccuracyRequirements;
    readonly updateFrequency: UpdateFrequency;
}
/**
 * Predictive model configuration
 */
export interface PredictiveModelConfig {
    readonly modelType: ModelType;
    readonly algorithm: PredictionAlgorithm;
    readonly parameters: ModelParameters;
    readonly validation: ValidationConfig;
    readonly ensemble: EnsembleConfig;
}
/**
 * Model type
 */
export declare enum ModelType {
    TIME_SERIES = "time_series",
    REGRESSION = "regression",
    NEURAL_NETWORK = "neural_network",
    ENSEMBLE = "ensemble",
    HYBRID = "hybrid"
}
/**
 * Prediction algorithm
 */
export declare enum PredictionAlgorithm {
    ARIMA = "arima",
    LINEAR_REGRESSION = "linear_regression",
    POLYNOMIAL_REGRESSION = "polynomial_regression",
    LSTM = "lstm",
    RANDOM_FOREST = "random_forest",
    GRADIENT_BOOSTING = "gradient_boosting",
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
}
/**
 * Model parameters
 */
export interface ModelParameters {
    readonly learningRate?: number;
    readonly epochs?: number;
    readonly features?: string[];
    readonly seasonality?: SeasonalityConfig;
    readonly trend?: TrendConfig;
    readonly hyperparameters?: Record<string, any>;
}
/**
 * Seasonality configuration
 */
export interface SeasonalityConfig {
    readonly enabled: boolean;
    readonly periods: SeasonalityPeriod[];
    readonly strength: number;
    readonly automatic: boolean;
}
/**
 * Seasonality period
 */
export interface SeasonalityPeriod {
    readonly name: string;
    readonly length: number;
    readonly strength: number;
    readonly pattern: 'additive|multiplicative;;
}
/**
 * Trend configuration
 */
export interface TrendConfig {
    readonly enabled: boolean;
    readonly method: 'linear|exponential|logarithmic|polynomial;;
    readonly strength: number;
    readonly changepoints: ChangepointConfig;
}
/**
 * Changepoint configuration
 */
export interface ChangepointConfig {
    readonly automatic: boolean;
    readonly dates?: Date[];
    readonly flexibility: number;
    readonly threshold: number;
}
/**
 * Validation configuration
 */
export interface ValidationConfig {
    readonly method: ValidationMethod;
    readonly testSize: number;
    readonly crossValidationFolds?: number;
    readonly metrics: ValidationMetric[];
    readonly threshold: ValidationThreshold;
}
/**
 * Validation method
 */
export declare enum ValidationMethod {
    TRAIN_TEST_SPLIT = "train_test_split",
    CROSS_VALIDATION = "cross_validation",
    TIME_SERIES_SPLIT = "time_series_split",
    ROLLING_WINDOW = "rolling_window"
}
/**
 * Validation metric
 */
export declare enum ValidationMetric {
    MAE = "mae",// Mean Absolute Error'
    MAPE = "mape",// Mean Absolute Percentage Error'
    RMSE = "rmse",// Root Mean Squared Error'
    R_SQUARED = "r_squared",
    AIC = "aic",// Akaike Information Criterion'
    BIC = "bic"
}
/**
 * Validation threshold
 */
export interface ValidationThreshold {
    readonly metric: ValidationMetric;
    readonly acceptableValue: number;
    readonly targetValue: number;
}
/**
 * Ensemble configuration
 */
export interface EnsembleConfig {
    readonly enabled: boolean;
    readonly methods: EnsembleMethod[];
    readonly weights: EnsembleWeight[];
    readonly combination: CombinationStrategy;
}
/**
 * Ensemble method
 */
export interface EnsembleMethod {
    readonly methodId: string;
    readonly algorithm: PredictionAlgorithm;
    readonly parameters: ModelParameters;
    readonly weight: number;
}
/**
 * Ensemble weight
 */
export interface EnsembleWeight {
    readonly methodId: string;
    readonly weight: number;
    readonly dynamic: boolean;
}
/**
 * Combination strategy
 */
export declare enum CombinationStrategy {
    WEIGHTED_AVERAGE = "weighted_average",
    VOTING = "voting",
    STACKING = "stacking",
    DYNAMIC = "dynamic"
}
/**
 * Data configuration
 */
export interface DataConfiguration {
    readonly historicalWindow: number;
    readonly features: FeatureConfig[];
    readonly preprocessing: PreprocessingConfig;
    readonly quality: DataQualityConfig;
    readonly external: ExternalDataConfig[];
}
/**
 * Feature configuration
 */
export interface FeatureConfig {
    readonly featureName: string;
    readonly type: FeatureType;
    readonly source: DataSource;
    readonly transformation: FeatureTransformation[];
    readonly importance: FeatureImportance;
}
/**
 * Feature type
 */
export declare enum FeatureType {
    NUMERIC = "numeric",
    CATEGORICAL = "categorical",
    TEMPORAL = "temporal",
    TEXT = "text",
    DERIVED = "derived"
}
/**
 * Data source
 */
export interface DataSource {
    readonly sourceId: string;
    readonly name: string;
    readonly type: 'database|api|file|stream;;
    readonly connection: ConnectionConfig;
    readonly refresh: RefreshConfig;
}
/**
 * Connection configuration
 */
export interface ConnectionConfig {
    readonly endpoint: string;
    readonly authentication: AuthConfig;
    readonly timeout: number;
    readonly retries: number;
}
/**
 * Authentication configuration
 */
export interface AuthConfig {
    readonly type: 'none|basic|token|oauth;;
    readonly credentials: Record<string, string>;
}
/**
 * Refresh configuration
 */
export interface RefreshConfig {
    readonly frequency: number;
    readonly automatic: boolean;
    readonly failureHandling: FailureHandling;
}
/**
 * Failure handling
 */
export declare enum FailureHandling {
    SKIP = "skip",
    RETRY = "retry",
    FALLBACK = "fallback",
    ERROR = "error"
}
/**
 * Feature transformation
 */
export interface FeatureTransformation {
    readonly transformationId: string;
    readonly type: TransformationType;
    readonly parameters: Record<string, any>;
    readonly order: number;
}
/**
 * Transformation type
 */
export declare enum TransformationType {
    NORMALIZATION = "normalization",
    STANDARDIZATION = "standardization",
    LOG = "log",
    SQUARE_ROOT = "square_root",
    POLYNOMIAL = "polynomial",
    BINNING = "binning",
    ONE_HOT_ENCODING = "one_hot_encoding",
    SMOOTHING = "smoothing"
}
/**
 * Feature importance
 */
export interface FeatureImportance {
    readonly score: number;
    readonly rank: number;
    readonly method: ImportanceMethod;
    readonly confidence: number;
}
/**
 * Importance method
 */
export declare enum ImportanceMethod {
    CORRELATION = "correlation",
    MUTUAL_INFORMATION = "mutual_information",
    FEATURE_SELECTION = "feature_selection",
    PERMUTATION = "permutation",
    SHAP = "shap"
}
/**
 * Preprocessing configuration
 */
export interface PreprocessingConfig {
    readonly missingValues: MissingValueHandling;
    readonly outliers: OutlierHandling;
    readonly scaling: ScalingMethod;
    readonly encoding: EncodingMethod[];
}
/**
 * Missing value handling
 */
export interface MissingValueHandling {
    readonly strategy: 'remove' | 'impute' | 'interpolate';
    readonly method?: mean | median | mode | forward_fill | 'backward_fill;;
    readonly threshold: number;
}
/**
 * Outlier handling
 */
export interface OutlierHandling {
    readonly detection: OutlierDetection;
    readonly treatment: OutlierTreatment;
    readonly threshold: OutlierThreshold;
}
/**
 * Outlier detection
 */
export declare enum OutlierDetection {
    Z_SCORE = "z_score",
    IQR = "iqr",
    ISOLATION_FOREST = "isolation_forest",
    LOCAL_OUTLIER_FACTOR = "local_outlier_factor"
}
/**
 * Outlier treatment
 */
export declare enum OutlierTreatment {
    REMOVE = "remove",
    CAP = "cap",
    TRANSFORM = "transform",
    IGNORE = "ignore"
}
/**
 * Outlier threshold
 */
export interface OutlierThreshold {
    readonly method: OutlierDetection;
    readonly value: number;
    readonly adaptive: boolean;
}
/**
 * Scaling method
 */
export declare enum ScalingMethod {
    NONE = "none",
    MIN_MAX = "min_max",
    Z_SCORE = "z_score",
    ROBUST = "robust",
    QUANTILE = "quantile"
}
/**
 * Encoding method
 */
export interface EncodingMethod {
    readonly feature: string;
    readonly type: 'one_hot|label|target|binary;;
    readonly parameters: Record<string, any>;
}
/**
 * Data quality configuration
 */
export interface DataQualityConfig {
    readonly completeness: QualityThreshold;
    readonly accuracy: QualityThreshold;
    readonly consistency: QualityThreshold;
    readonly timeliness: QualityThreshold;
}
/**
 * Quality threshold
 */
export interface QualityThreshold {
    readonly minimum: number;
    readonly target: number;
    readonly measurement: string;
}
/**
 * External data configuration
 */
export interface ExternalDataConfig {
    readonly dataId: string;
    readonly name: string;
    readonly source: DataSource;
    readonly relevance: DataRelevance;
    readonly integration: IntegrationMethod;
}
/**
 * Data relevance
 */
export interface DataRelevance {
    readonly correlation: number;
    readonly importance: number;
    readonly lag: number;
    readonly confidence: number;
}
/**
 * Integration method
 */
export declare enum IntegrationMethod {
    JOIN = "join",
    APPEND = "append",
    FEATURE_ENGINEERING = "feature_engineering",
    EXTERNAL_MODEL = "external_model"
}
/**
 * Accuracy requirements
 */
export interface AccuracyRequirements {
    readonly targetAccuracy: number;
    readonly minimumAccuracy: number;
    readonly confidenceInterval: number;
    readonly tolerance: ToleranceConfig;
}
/**
 * Tolerance configuration
 */
export interface ToleranceConfig {
    readonly absolute: number;
    readonly relative: number;
    readonly timeWindow: number;
}
/**
 * Update frequency
 */
export declare enum UpdateFrequency {
    REAL_TIME = "real_time",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
/**
 * Value delivery prediction result
 */
export interface ValueDeliveryPrediction {
    readonly predictionId: string;
    readonly valueStreamId: string;
    readonly timestamp: Date;
    readonly horizon: number;
    readonly modelInfo: ModelInfo;
    readonly predictions: DeliveryPrediction[];
    readonly confidence: PredictionConfidence;
    readonly accuracy: PredictionAccuracy;
    readonly trends: TrendAnalysis[];
    readonly scenarios: ScenarioPrediction[];
}
/**
 * Model info
 */
export interface ModelInfo {
    readonly modelId: string;
    readonly algorithm: PredictionAlgorithm;
    readonly version: string;
    readonly trainedOn: Date;
    readonly features: string[];
    readonly performance: ModelPerformance;
}
/**
 * Model performance
 */
export interface ModelPerformance {
    readonly accuracy: number;
    readonly mae: number;
    readonly rmse: number;
    readonly r2: number;
    readonly trainingTime: number;
    readonly predictionTime: number;
}
/**
 * Delivery prediction
 */
export interface DeliveryPrediction {
    readonly predictionDate: Date;
    readonly predictedDeliveryTime: number;
    readonly confidence: number;
    readonly range: PredictionRange;
    readonly factors: PredictionFactor[];
    readonly assumptions: string[];
}
/**
 * Prediction range
 */
export interface PredictionRange {
    readonly lower: number;
    readonly upper: number;
    readonly interval: number;
}
/**
 * Prediction factor
 */
export interface PredictionFactor {
    readonly factorName: string;
    readonly impact: FactorImpact;
    readonly confidence: number;
    readonly trend: FactorTrend;
}
/**
 * Factor impact
 */
export interface FactorImpact {
    readonly direction: 'positive' | 'negative' | 'neutral';
    readonly magnitude: number;
    readonly unit: string;
}
/**
 * Factor trend
 */
export interface FactorTrend {
    readonly direction: 'increasing' | 'decreasing' | 'stable';
    readonly rate: number;
    readonly stability: number;
}
/**
 * Prediction confidence
 */
export interface PredictionConfidence {
    readonly overall: number;
    readonly modelConfidence: number;
    readonly dataQuality: number;
    readonly historicalAccuracy: number;
    readonly uncertaintyFactors: UncertaintyFactor[];
}
/**
 * Uncertainty factor
 */
export interface UncertaintyFactor {
    readonly factorName: string;
    readonly impact: number;
    readonly category: UncertaintyCategory;
    readonly mitigation: string[];
}
/**
 * Uncertainty category
 */
export declare enum UncertaintyCategory {
    DATA_QUALITY = "data_quality",
    MODEL_LIMITATION = "model_limitation",
    EXTERNAL_FACTOR = "external_factor",
    SEASONAL_VARIATION = "seasonal_variation",
    TREND_CHANGE = "trend_change"
}
/**
 * Prediction accuracy
 */
export interface PredictionAccuracy {
    readonly historical: HistoricalAccuracy[];
    readonly validation: ValidationResult[];
    readonly realTimeTracking: AccuracyTracking;
}
/**
 * Historical accuracy
 */
export interface HistoricalAccuracy {
    readonly period: string;
    readonly accuracy: number;
    readonly mae: number;
    readonly predictions: number;
    readonly correctPredictions: number;
}
/**
 * Validation result
 */
export interface ValidationResult {
    readonly validationId: string;
    readonly method: ValidationMethod;
    readonly metric: ValidationMetric;
    readonly score: number;
    readonly threshold: number;
    readonly passed: boolean;
}
/**
 * Accuracy tracking
 */
export interface AccuracyTracking {
    readonly currentAccuracy: number;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly recentPredictions: RecentPrediction[];
    readonly alertThreshold: number;
}
/**
 * Recent prediction
 */
export interface RecentPrediction {
    readonly predictionDate: Date;
    readonly predicted: number;
    readonly actual?: number;
    readonly error?: number;
    readonly errorPercentage?: number;
}
/**
 * Trend analysis
 */
export interface TrendAnalysis {
    readonly trendId: string;
    readonly metric: string;
    readonly direction: TrendDirection;
    readonly strength: number;
    readonly duration: number;
    readonly significance: number;
    readonly forecast: TrendForecast;
}
/**
 * Trend direction
 */
export declare enum TrendDirection {
    INCREASING = "increasing",
    DECREASING = "decreasing",
    STABLE = "stable",
    CYCLICAL = "cyclical",
    VOLATILE = "volatile"
}
/**
 * Trend forecast
 */
export interface TrendForecast {
    readonly continuationProbability: number;
    readonly expectedDuration: number;
    readonly peakValue?: number;
    readonly troughValue?: number;
    readonly inflectionPoints: Date[];
}
/**
 * Scenario prediction
 */
export interface ScenarioPrediction {
    readonly scenarioId: string;
    readonly name: string;
    readonly description: string;
    readonly probability: number;
    readonly assumptions: ScenarioAssumption[];
    readonly predictions: DeliveryPrediction[];
    readonly impact: ScenarioImpact;
}
/**
 * Scenario assumption
 */
export interface ScenarioAssumption {
    readonly assumptionId: string;
    readonly description: string;
    readonly parameter: string;
    readonly value: any;
    readonly confidence: number;
}
/**
 * Scenario impact
 */
export interface ScenarioImpact {
    readonly deliveryTimeChange: number;
    readonly confidenceChange: number;
    readonly riskLevel: 'low|medium|high|critical;;
    readonly mitigationStrategies: string[];
}
/**
 * Predictive Analytics Service
 */
export declare class PredictiveAnalyticsService {
    private readonly logger;
    private predictions;
    private historicalData;
    constructor(logger: Logger);
    /**
     * Predict value delivery times
     */
    predictValueDeliveryTimes(config: PredictiveAnalyticsConfig, historicalData: any[], currentContext: any): Promise<ValueDeliveryPrediction>;
    /**
     * Private helper methods
     */
    private initializePredictiveModels;
    private preprocessData;
    private trainPredictiveModel;
    const throughputData: any;
    if(throughputData: any, length: any): any;
}
//# sourceMappingURL=predictive-analytics-service.d.ts.map