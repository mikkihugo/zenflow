/**
 * Advanced Neural Training Techniques Test Suite - Classical TDD
 *
 * @file Tests for regularization, optimization algorithms, early stopping, and cross-validation
 * Focus: Training algorithm effectiveness, overfitting prevention, model selection
 */

import {
  createNeuralTestSuite,
  NeuralTestDataGenerator,
} from '../../../helpers/neural-test-helpers.ts';

interface TrainingMetrics {
  trainLoss: number[];
  validationLoss: number[];
  trainAccuracy: number[];
  validationAccuracy: number[];
  epochs: number;
  converged: boolean;
  bestEpoch: number;
}

interface RegularizationConfig {
  l1Lambda: number;
  l2Lambda: number;
  dropoutRate: number;
  batchNormalization: boolean;
}

interface OptimizerConfig {
  type: 'sgd' | 'momentum' | 'adam' | 'adagrad' | 'rmsprop';
  learningRate: number;
  momentum?: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
  decay?: number;
}

describe('Advanced Neural Training Techniques - Classical TDD', () => {
  let _neuralSuite: ReturnType<typeof createNeuralTestSuite>;

  beforeEach(() => {
    _neuralSuite = createNeuralTestSuite({
      epochs: 1000,
      learningRate: 0.01,
      tolerance: 1e-8,
      convergenceThreshold: 0.01,
      maxTrainingTime: 180000, // 3 minutes for complex training tests
    });
  });

  describe('🛡️ Regularization Techniques', () => {
    it('should implement L1 regularization correctly', () => {
      // Classical TDD: Test L1 regularization implementation
      const network = createRegularizedNetwork([10, 20, 10, 1]);
      const weights = flattenNetworkWeights(network);

      const l1Config: RegularizationConfig = {
        l1Lambda: 0.01,
        l2Lambda: 0,
        dropoutRate: 0,
        batchNormalization: false,
      };

      // Test L1 penalty calculation
      const l1Penalty = calculateL1Penalty(weights, l1Config?.l1Lambda);
      const expectedL1 =
        l1Config?.l1Lambda * weights.reduce((sum, w) => sum + Math.abs(w), 0);

      expect(Math.abs(l1Penalty - expectedL1)).toBeLessThan(1e-10);

      // Test L1 gradient computation
      const l1Gradients = computeL1Gradients(weights, l1Config?.l1Lambda);
      weights.forEach((weight, i) => {
        const expectedGradient = l1Config?.l1Lambda * Math.sign(weight);
        expect(Math.abs(l1Gradients[i] - expectedGradient)).toBeLessThan(1e-10);
      });
    });

    it('should implement L2 regularization correctly', () => {
      // Classical TDD: Test L2 regularization implementation
      const network = createRegularizedNetwork([8, 15, 8, 2]);
      const weights = flattenNetworkWeights(network);

      const l2Config: RegularizationConfig = {
        l1Lambda: 0,
        l2Lambda: 0.001,
        dropoutRate: 0,
        batchNormalization: false,
      };

      // Test L2 penalty calculation
      const l2Penalty = calculateL2Penalty(weights, l2Config?.l2Lambda);
      const expectedL2 =
        (l2Config?.l2Lambda * weights.reduce((sum, w) => sum + w * w, 0)) / 2;

      expect(Math.abs(l2Penalty - expectedL2)).toBeLessThan(1e-10);

      // Test L2 gradient computation
      const l2Gradients = computeL2Gradients(weights, l2Config?.l2Lambda);
      weights.forEach((weight, i) => {
        const expectedGradient = l2Config?.l2Lambda * weight;
        expect(Math.abs(l2Gradients[i] - expectedGradient)).toBeLessThan(1e-10);
      });
    });

    it('should prevent overfitting with L1/L2 regularization', () => {
      // Classical TDD: Test overfitting prevention effectiveness
      const trainingData = NeuralTestDataGenerator?.generatePolynomialData(
        100,
        3,
        0.1,
      );
      const validationData = NeuralTestDataGenerator?.generatePolynomialData(
        50,
        3,
        0.1,
      );

      // Train without regularization (prone to overfitting)
      const unregularizedNetwork = createRegularizedNetwork([1, 50, 50, 1]);
      const unregularizedResult = trainWithRegularization(
        unregularizedNetwork,
        trainingData,
        validationData,
        { l1Lambda: 0, l2Lambda: 0, dropoutRate: 0, batchNormalization: false },
        { type: 'sgd', learningRate: 0.01 },
        { epochs: 200, patience: 50 },
      );

      // Train with L2 regularization
      const regularizedNetwork = createRegularizedNetwork([1, 50, 50, 1]);
      const regularizedResult = trainWithRegularization(
        regularizedNetwork,
        trainingData,
        validationData,
        {
          l1Lambda: 0,
          l2Lambda: 0.01,
          dropoutRate: 0,
          batchNormalization: false,
        },
        { type: 'sgd', learningRate: 0.01 },
        { epochs: 200, patience: 50 },
      );

      // Regularized model should have better generalization
      const unregularizedGap = calculateGeneralizationGap(unregularizedResult);
      const regularizedGap = calculateGeneralizationGap(regularizedResult);

      expect(regularizedGap).toBeLessThan(unregularizedGap);
      expect(
        regularizedResult?.validationLoss?.[regularizedResult?.bestEpoch],
      ).toBeLessThan(
        unregularizedResult?.validationLoss?.[unregularizedResult?.bestEpoch] *
          1.1,
      );
    });

    it('should implement dropout correctly during training', () => {
      // Classical TDD: Test dropout implementation
      const _network = createRegularizedNetwork([10, 20, 10, 1]);
      const dropoutRate = 0.5;

      // Test dropout mask generation
      const activations = Array(20)
        .fill(0)
        .map(() => Math.random());
      const dropoutMask = generateDropoutMask(activations.length, dropoutRate);

      // Verify dropout mask properties
      expect(dropoutMask).toHaveLength(activations.length);
      dropoutMask.forEach((mask) => {
        expect(mask).toBeGreaterThanOrEqual(0);
        expect(mask).toBeLessThanOrEqual(1);
      });

      // Approximately correct dropout rate
      const activeNeurons = dropoutMask.filter((mask) => mask > 0).length;
      const actualDropoutRate = 1 - activeNeurons / dropoutMask.length;
      expect(Math.abs(actualDropoutRate - dropoutRate)).toBeLessThan(0.2); // Allow 20% variance

      // Test dropout application
      const droppedActivations = applyDropout(activations, dropoutMask);
      droppedActivations.forEach((activation, i) => {
        if (dropoutMask[i] === 0) {
          expect(activation).toBe(0);
        } else {
          // Scaling factor should be applied during training
          expect(activation).toBe(activations[i] / (1 - dropoutRate));
        }
      });
    });

    it('should handle combined regularization techniques', () => {
      // Classical TDD: Test combination of L1, L2, and dropout
      const network = createRegularizedNetwork([5, 15, 10, 2]);
      const combinedConfig: RegularizationConfig = {
        l1Lambda: 0.001,
        l2Lambda: 0.01,
        dropoutRate: 0.3,
        batchNormalization: false,
      };

      const trainingData = NeuralTestDataGenerator?.generateSpiralData(100, 2);
      const validationData = NeuralTestDataGenerator?.generateSpiralData(50, 2);

      const result = trainWithRegularization(
        network,
        trainingData,
        validationData,
        combinedConfig,
        { type: 'adam', learningRate: 0.001 },
        { epochs: 100, patience: 20 },
      );

      // Combined regularization should prevent overfitting
      expect(result?.converged).toBe(true);
      expect(result?.trainLoss.length).toBeGreaterThan(10);

      // Validation loss should not diverge significantly from training loss
      const finalGap = calculateGeneralizationGap(result);
      expect(finalGap).toBeLessThan(0.5);

      // Network weights should be constrained by regularization
      const finalWeights = flattenNetworkWeights(network);
      const avgWeightMagnitude =
        finalWeights.reduce((sum, w) => sum + Math.abs(w), 0) /
        finalWeights.length;
      expect(avgWeightMagnitude).toBeLessThan(2.0); // Weights should be reasonably bounded
    });
  });

  describe('⚡ Learning Rate Optimization Algorithms', () => {
    it('should implement Adam optimizer correctly', () => {
      // Classical TDD: Test Adam optimizer implementation
      const adamConfig: OptimizerConfig = {
        type: 'adam',
        learningRate: 0.001,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8,
      };

      const optimizer = createOptimizer(adamConfig);
      const weights = [0.5, -0.3, 0.8, -0.1];
      const gradients = [0.1, -0.05, 0.2, -0.15];

      // Initialize optimizer state
      const state = optimizer.initializeState(weights.length);

      // Test first update
      const firstUpdate = optimizer.update(weights, gradients, state, 1);

      // Verify Adam update components
      expect(state.m).toHaveLength(weights.length);
      expect(state.v).toHaveLength(weights.length);
      expect(firstUpdate).toHaveLength(weights.length);

      // Test momentum accumulation
      gradients.forEach((grad, i) => {
        const expectedM =
          adamConfig?.beta1! * 0 + (1 - adamConfig?.beta1!) * grad;
        expect(Math.abs(state.m[i] - expectedM)).toBeLessThan(1e-10);
      });

      // Test second update (momentum should accumulate)
      const secondGradients = [0.05, -0.1, 0.15, -0.08];
      const secondUpdate = optimizer.update(weights, secondGradients, state, 2);

      expect(secondUpdate).toHaveLength(weights.length);

      // Momentum should be accumulated from previous step
      secondGradients.forEach((grad, i) => {
        const prevM = state.m[i];
        const expectedM =
          adamConfig?.beta1! * prevM + (1 - adamConfig?.beta1!) * grad;
        expect(Math.abs(state.m[i] - expectedM)).toBeLessThan(1e-8);
      });
    });

    it('should implement RMSprop optimizer correctly', () => {
      // Classical TDD: Test RMSprop optimizer implementation
      const rmspropConfig: OptimizerConfig = {
        type: 'rmsprop',
        learningRate: 0.01,
        decay: 0.9,
        epsilon: 1e-8,
      };

      const optimizer = createOptimizer(rmspropConfig);
      const weights = [1.0, -0.5, 0.2];
      const gradients = [0.1, -0.2, 0.05];

      const state = optimizer.initializeState(weights.length);
      const update = optimizer.update(weights, gradients, state, 1);

      // Verify RMSprop state updates
      expect(state.v).toHaveLength(weights.length);
      expect(update).toHaveLength(weights.length);

      gradients.forEach((grad, i) => {
        const expectedV =
          rmspropConfig?.decay! * 0 + (1 - rmspropConfig?.decay!) * grad * grad;
        expect(Math.abs(state.v[i] - expectedV)).toBeLessThan(1e-10);

        const expectedUpdate =
          (-rmspropConfig?.learningRate * grad) /
          (Math.sqrt(expectedV) + rmspropConfig?.epsilon!);
        expect(Math.abs(update[i] - expectedUpdate)).toBeLessThan(1e-10);
      });
    });

    it('should compare optimizer performance on XOR problem', () => {
      // Classical TDD: Compare optimizer convergence rates
      const xorData = NeuralTestDataGenerator?.generateXORData();
      const networkTopology = [2, 8, 1];

      const optimizers: OptimizerConfig[] = [
        { type: 'sgd', learningRate: 0.5 },
        { type: 'momentum', learningRate: 0.1, momentum: 0.9 },
        {
          type: 'adam',
          learningRate: 0.01,
          beta1: 0.9,
          beta2: 0.999,
          epsilon: 1e-8,
        },
        { type: 'rmsprop', learningRate: 0.01, decay: 0.9, epsilon: 1e-8 },
      ];

      const results: Array<{
        optimizer: string;
        epochs: number;
        finalError: number;
        converged: boolean;
      }> = [];

      optimizers.forEach((optimizerConfig) => {
        const network = createRegularizedNetwork(networkTopology);
        const result = trainWithOptimizer(network, xorData, optimizerConfig, {
          epochs: 1000,
          targetError: 0.01,
        });

        results?.push({
          optimizer: optimizerConfig?.type,
          epochs: result?.epochs,
          finalError: result?.finalError,
          converged: result?.converged,
        });
      });
      results?.forEach((_result) => {});

      // At least some optimizers should converge
      const convergedOptimizers = results?.filter((r) => r.converged);
      expect(convergedOptimizers.length).toBeGreaterThan(0);

      // Adam should perform well on this problem
      const adamResult = results?.find((r) => r.optimizer === 'adam');
      expect(adamResult).toBeDefined();
      expect(adamResult?.finalError).toBeLessThan(0.1);
    });

    it('should adapt learning rates dynamically', () => {
      // Classical TDD: Test adaptive learning rate mechanisms
      const network = createRegularizedNetwork([5, 10, 1]);
      const trainingData = NeuralTestDataGenerator?.generateLinearData(
        200,
        0.1,
      );

      // Test learning rate scheduling
      const scheduleConfig = {
        type: 'exponential' as const,
        initialLearningRate: 0.1,
        decayRate: 0.95,
        decaySteps: 50,
      };

      const learningRateHistory: number[] = [];
      const errorHistory: number[] = [];

      for (let epoch = 0; epoch < 200; epoch++) {
        const currentLR = calculateScheduledLearningRate(scheduleConfig, epoch);
        learningRateHistory.push(currentLR);

        // Simulate training step
        const epochError = simulateTrainingEpoch(
          network,
          trainingData,
          currentLR,
        );
        errorHistory.push(epochError);
      }

      // Learning rate should decrease over time
      expect(learningRateHistory[0]).toBeGreaterThan(
        learningRateHistory[learningRateHistory.length - 1],
      );

      // Verify exponential decay formula
      const expectedFinalLR =
        scheduleConfig?.initialLearningRate *
        scheduleConfig?.decayRate **
          Math.floor(199 / scheduleConfig?.decaySteps);
      const actualFinalLR = learningRateHistory[learningRateHistory.length - 1];
      expect(Math.abs(actualFinalLR - expectedFinalLR)).toBeLessThan(1e-10);

      // Error should generally decrease (allowing for some fluctuation)
      const initialError =
        errorHistory.slice(0, 20).reduce((a, b) => a + b) / 20;
      const finalError = errorHistory.slice(-20).reduce((a, b) => a + b) / 20;
      expect(finalError).toBeLessThan(initialError);
    });
  });

  describe('⏰ Early Stopping and Convergence Detection', () => {
    it('should implement early stopping correctly', () => {
      // Classical TDD: Test early stopping mechanism
      const trainingData = NeuralTestDataGenerator?.generatePolynomialData(
        150,
        2,
        0.1,
      );
      const validationData = NeuralTestDataGenerator?.generatePolynomialData(
        50,
        2,
        0.1,
      );

      const network = createRegularizedNetwork([1, 20, 10, 1]);
      const earlyStoppingConfig = {
        patience: 10,
        minDelta: 0.001,
        restoreBestWeights: true,
      };

      const result = trainWithEarlyStopping(
        network,
        trainingData,
        validationData,
        earlyStoppingConfig,
        { epochs: 200 },
      );

      // Early stopping should have triggered
      expect(result?.epochs).toBeLessThan(200);
      expect(result?.bestEpoch).toBeLessThan(result?.epochs);
      expect(result?.stoppedEarly).toBe(true);

      // Best validation loss should be better than final training loss plateau
      const bestValidationLoss = Math.min(...result?.validationLoss);
      const finalValidationLoss =
        result?.validationLoss?.[result?.validationLoss.length - 1];

      expect(bestValidationLoss).toBeLessThanOrEqual(
        finalValidationLoss + earlyStoppingConfig?.minDelta,
      );
    });

    it('should detect convergence accurately', () => {
      // Classical TDD: Test convergence detection algorithms
      const lossHistory = [
        1.0, 0.8, 0.6, 0.45, 0.35, 0.3, 0.28, 0.27, 0.265, 0.263, 0.262, 0.261,
        0.261, 0.261,
      ];

      const convergenceConfig = {
        window: 5,
        threshold: 0.001,
        relativeTolerance: 0.01,
      };

      // Test different convergence detection methods
      const plateauConverged = detectConvergencePlateau(
        lossHistory,
        convergenceConfig,
      );
      const relativeConverged = detectConvergenceRelative(
        lossHistory,
        convergenceConfig,
      );
      const absoluteConverged = detectConvergenceAbsolute(lossHistory, 0.262);

      expect(plateauConverged).toBe(true); // Loss has plateaued
      expect(relativeConverged).toBe(true); // Relative improvement is minimal
      expect(absoluteConverged).toBe(true); // Close to target value

      // Test with non-converged sequence
      const divergentHistory = [1.0, 0.8, 0.9, 0.7, 0.85, 0.6, 0.75, 0.5, 0.65];
      expect(
        detectConvergencePlateau(divergentHistory, convergenceConfig),
      ).toBe(false);
      expect(
        detectConvergenceRelative(divergentHistory, convergenceConfig),
      ).toBe(false);
    });

    it('should handle learning rate reduction on plateau', () => {
      // Classical TDD: Test learning rate reduction strategy
      const network = createRegularizedNetwork([2, 15, 1]);
      const trainingData = NeuralTestDataGenerator?.generateXORData();

      const plateauConfig = {
        patience: 5,
        factor: 0.5,
        minLearningRate: 1e-6,
        threshold: 0.01,
      };

      let currentLearningRate = 0.1;
      const learningRateHistory: number[] = [];
      const lossHistory: number[] = [];
      let lastImprovement = 0;

      for (let epoch = 0; epoch < 100; epoch++) {
        // Simulate training
        const epochLoss = simulateTrainingEpoch(
          network,
          trainingData,
          currentLearningRate,
        );
        lossHistory.push(epochLoss);
        learningRateHistory.push(currentLearningRate);

        // Check for plateau and reduce learning rate
        if (epoch > plateauConfig?.patience) {
          const recentLoss = lossHistory.slice(-plateauConfig?.patience);
          const bestRecentLoss = Math.min(...recentLoss);
          const bestOverallLoss = Math.min(...lossHistory);

          if (bestOverallLoss - bestRecentLoss < plateauConfig?.threshold) {
            if (epoch - lastImprovement >= plateauConfig?.patience) {
              const newLearningRate = Math.max(
                currentLearningRate * plateauConfig?.factor,
                plateauConfig?.minLearningRate,
              );

              if (newLearningRate < currentLearningRate) {
                currentLearningRate = newLearningRate;
                lastImprovement = epoch;
              }
            }
          } else {
            lastImprovement = epoch;
          }
        }
      }

      // Learning rate should have been reduced at least once
      const initialLR = learningRateHistory[0];
      const finalLR = learningRateHistory[learningRateHistory.length - 1];
      expect(finalLR).toBeLessThan(initialLR);

      // Verify minimum learning rate bound
      learningRateHistory.forEach((lr) => {
        expect(lr).toBeGreaterThanOrEqual(plateauConfig?.minLearningRate);
      });
    });

    it('should implement patience-based stopping correctly', () => {
      // Classical TDD: Test patience mechanism with different scenarios
      const scenarios = [
        {
          validationLoss: [1.0, 0.8, 0.6, 0.7, 0.75, 0.8, 0.85],
          patience: 3,
          shouldStop: true,
        },
        {
          validationLoss: [1.0, 0.8, 0.6, 0.4, 0.2, 0.1, 0.05],
          patience: 3,
          shouldStop: false,
        },
        {
          validationLoss: [1.0, 0.9, 0.8, 0.79, 0.78, 0.77, 0.76],
          patience: 5,
          shouldStop: false,
        },
        {
          validationLoss: [1.0, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
          patience: 2,
          shouldStop: true,
        },
      ];

      scenarios.forEach((scenario, _index) => {
        const earlyStopping = createEarlyStoppingMonitor(
          scenario.patience,
          0.001,
        );
        let stoppedEarly = false;
        let stopEpoch = -1;

        for (let epoch = 0; epoch < scenario.validationLoss.length; epoch++) {
          const shouldStop = earlyStopping.update(
            scenario.validationLoss[epoch],
            epoch,
          );
          if (shouldStop) {
            stoppedEarly = true;
            stopEpoch = epoch;
            break;
          }
        }

        expect(stoppedEarly).toBe(scenario.shouldStop);

        if (scenario.shouldStop) {
          expect(stopEpoch).toBeGreaterThan(-1);
        } else {
        }
      });
    });
  });

  describe('🔄 Cross-Validation and Model Selection', () => {
    it('should implement k-fold cross-validation correctly', () => {
      // Classical TDD: Test k-fold cross-validation implementation
      const fullDataset = NeuralTestDataGenerator?.generateSpiralData(100, 2);
      const k = 5;

      const folds = createKFolds(fullDataset, k);

      // Verify fold properties
      expect(folds).toHaveLength(k);

      // Each fold should have roughly equal size
      const expectedFoldSize = Math.floor(fullDataset.length / k);
      folds.forEach((fold, _i) => {
        expect(fold.length).toBeGreaterThanOrEqual(expectedFoldSize);
        expect(fold.length).toBeLessThanOrEqual(expectedFoldSize + 1);
      });

      // All data points should be included exactly once
      const allFoldData = folds.flat();
      expect(allFoldData).toHaveLength(fullDataset.length);

      // Verify no data leakage between folds
      const allIndices = new Set();
      folds.forEach((fold) => {
        fold.forEach((sample) => {
          const index = fullDataset?.indexOf(sample);
          expect(allIndices.has(index)).toBe(false);
          allIndices.add(index);
        });
      });
    });

    it('should perform cross-validation model evaluation', () => {
      // Classical TDD: Test cross-validation evaluation
      const dataset = NeuralTestDataGenerator?.generateLinearData(200, 0.1);
      const k = 5;

      const networkConfigs = [
        { topology: [1, 5, 1], name: 'Small' },
        { topology: [1, 15, 10, 1], name: 'Medium' },
        { topology: [1, 30, 20, 10, 1], name: 'Large' },
      ];

      const cvResults: Array<{
        config: string;
        foldResults: number[];
        meanError: number;
        stdError: number;
        bestFold: number;
        worstFold: number;
      }> = [];

      networkConfigs?.forEach((config) => {
        const foldResults = performKFoldCrossValidation(
          dataset,
          config?.topology,
          k,
          {
            epochs: 100,
            learningRate: 0.01,
          },
        );

        const meanError =
          foldResults?.reduce((sum, err) => sum + err, 0) / foldResults.length;
        const variance =
          foldResults?.reduce((sum, err) => sum + (err - meanError) ** 2, 0) /
          foldResults.length;
        const stdError = Math.sqrt(variance);
        const bestFold = Math.min(...foldResults);
        const worstFold = Math.max(...foldResults);

        cvResults?.push({
          config: config?.name,
          foldResults,
          meanError,
          stdError,
          bestFold,
          worstFold,
        });

        expect(foldResults).toHaveLength(k);
        expect(meanError).toBeGreaterThan(0);
        expect(stdError).toBeGreaterThanOrEqual(0);
      });
      cvResults?.forEach((_result) => {});

      // Best model should have lowest mean error
      const bestModel = cvResults?.reduce((best, current) =>
        current?.meanError < best.meanError ? current : best,
      );

      expect(bestModel.meanError).toBeLessThan(1.0);
    });

    it('should implement hyperparameter grid search', () => {
      // Classical TDD: Test hyperparameter optimization
      const trainingData = NeuralTestDataGenerator?.generateXORData();
      const validationData = NeuralTestDataGenerator?.generateXORData(); // Same for XOR

      const hyperparameterGrid = {
        learningRate: [0.01, 0.1, 0.5],
        hiddenSize: [4, 8, 16],
        regularization: [0, 0.001, 0.01],
      };

      const gridSearchResults: Array<{
        params?: unknown;
        validationError: number;
        trainingError: number;
        epochs: number;
      }> = [];

      // Perform grid search
      hyperparameterGrid.learningRate.forEach((lr) => {
        hyperparameterGrid.hiddenSize.forEach((hiddenSize) => {
          hyperparameterGrid.regularization.forEach((reg) => {
            const network = createRegularizedNetwork([2, hiddenSize, 1]);
            const result = trainWithRegularization(
              network,
              trainingData,
              validationData,
              {
                l1Lambda: 0,
                l2Lambda: reg,
                dropoutRate: 0,
                batchNormalization: false,
              },
              { type: 'sgd', learningRate: lr },
              { epochs: 200, patience: 30 },
            );

            gridSearchResults?.push({
              params: { learningRate: lr, hiddenSize, regularization: reg },
              validationError: result?.validationLoss?.[result?.bestEpoch],
              trainingError: result?.trainLoss?.[result?.bestEpoch],
              epochs: result?.epochs,
            });
          });
        });
      });

      // Find best hyperparameters
      const bestResult = gridSearchResults?.reduce((best, current) =>
        current?.validationError < best.validationError ? current : best,
      );

      expect(bestResult?.validationError).toBeLessThan(0.1);
      expect(bestResult?.trainingError).toBeLessThan(0.1);

      // Verify grid search covered all combinations
      const expectedCombinations =
        hyperparameterGrid.learningRate.length *
        hyperparameterGrid.hiddenSize.length *
        hyperparameterGrid.regularization.length;

      expect(gridSearchResults).toHaveLength(expectedCombinations);
    });

    it('should implement stratified cross-validation for classification', () => {
      // Classical TDD: Test stratified k-fold for balanced sampling
      const dataset = NeuralTestDataGenerator?.generateSpiralData(60, 3); // 3 classes
      const k = 5;

      const stratifiedFolds = createStratifiedKFolds(dataset, k);

      expect(stratifiedFolds).toHaveLength(k);

      // Count class distribution in each fold
      stratifiedFolds.forEach((fold, _foldIndex) => {
        const classCounts = countClasses(fold);

        // Each fold should have samples from all classes
        Object.keys(classCounts).forEach((classKey) => {
          expect(classCounts[classKey]).toBeGreaterThan(0);
        });
      });

      // Overall class distribution should be preserved
      const originalClassCounts = countClasses(dataset);
      const reconstructedData = stratifiedFolds.flat();
      const reconstructedClassCounts = countClasses(reconstructedData);

      Object.keys(originalClassCounts).forEach((classKey) => {
        expect(reconstructedClassCounts[classKey]).toBe(
          originalClassCounts[classKey],
        );
      });
    });

    it('should implement nested cross-validation for unbiased evaluation', () => {
      // Classical TDD: Test nested CV for model selection and evaluation
      const dataset = NeuralTestDataGenerator?.generatePolynomialData(
        150,
        2,
        0.15,
      );
      const outerK = 5;
      const innerK = 3;

      const modelConfigurations = [
        { topology: [1, 5, 1], regularization: 0.001 },
        { topology: [1, 10, 5, 1], regularization: 0.01 },
        { topology: [1, 15, 10, 1], regularization: 0.1 },
      ];

      const nestedCVResults = performNestedCrossValidation(
        dataset,
        modelConfigurations,
        outerK,
        innerK,
        { epochs: 100, patience: 20 },
      );

      expect(nestedCVResults?.outerFoldResults).toHaveLength(outerK);
      expect(nestedCVResults?.selectedModels).toHaveLength(outerK);

      // Each outer fold should have selected a model
      nestedCVResults?.selectedModels?.forEach((selectedModel, _foldIndex) => {
        expect(selectedModel?.configIndex).toBeGreaterThanOrEqual(0);
        expect(selectedModel?.configIndex).toBeLessThan(
          modelConfigurations.length,
        );
        expect(selectedModel?.validationError).toBeGreaterThan(0);
      });

      // Unbiased performance estimate
      const unbiasedError = nestedCVResults?.unbiasedPerformanceEstimate;
      expect(unbiasedError).toBeGreaterThan(0);
      expect(unbiasedError).toBeLessThan(2.0); // Reasonable for polynomial data
    });
  });
});

// Helper Functions for Advanced Training Techniques Testing

function createRegularizedNetwork(topology: number[]): any {
  const weights: number[][][] = [];
  const biases: number[][] = [];

  for (let i = 0; i < topology.length - 1; i++) {
    const layerWeights: number[][] = [];
    const layerBiases: number[] = [];

    for (let j = 0; j < topology[i + 1]; j++) {
      const neuronWeights: number[] = [];
      for (let k = 0; k < topology[i]; k++) {
        neuronWeights.push(Math.random() * 0.2 - 0.1);
      }
      layerWeights.push(neuronWeights);
      layerBiases.push(Math.random() * 0.1);
    }

    weights.push(layerWeights);
    biases.push(layerBiases);
  }

  return { topology, weights, biases };
}

function flattenNetworkWeights(network: unknown): number[] {
  const flatWeights: number[] = [];
  network.weights.forEach((layer: number[][]) => {
    layer.forEach((neuron: number[]) => {
      neuron.forEach((weight: number) => {
        flatWeights.push(weight);
      });
    });
  });
  return flatWeights;
}

function calculateL1Penalty(weights: number[], lambda: number): number {
  return lambda * weights.reduce((sum, w) => sum + Math.abs(w), 0);
}

function calculateL2Penalty(weights: number[], lambda: number): number {
  return (lambda / 2) * weights.reduce((sum, w) => sum + w * w, 0);
}

function computeL1Gradients(weights: number[], lambda: number): number[] {
  return weights.map((w) => lambda * Math.sign(w));
}

function computeL2Gradients(weights: number[], lambda: number): number[] {
  return weights.map((w) => lambda * w);
}

function generateDropoutMask(size: number, dropoutRate: number): number[] {
  return Array(size)
    .fill(0)
    .map(() => (Math.random() > dropoutRate ? 1 : 0));
}

function applyDropout(activations: number[], mask: number[]): number[] {
  const scaleFactor =
    1 / (1 - mask.filter((m) => m === 0).length / mask.length);
  return activations.map((activation, i) =>
    mask[i] === 0 ? 0 : activation * scaleFactor,
  );
}

function trainWithRegularization(
  network: any,
  trainingData: unknown[],
  validationData: unknown[],
  regularization: RegularizationConfig,
  optimizer: OptimizerConfig,
  trainingConfig: any,
): TrainingMetrics {
  const trainLoss: number[] = [];
  const validationLoss: number[] = [];
  const trainAccuracy: number[] = [];
  const validationAccuracy: number[] = [];

  let bestEpoch = 0;
  let bestValidationLoss = Number.POSITIVE_INFINITY;
  let patienceCounter = 0;

  for (let epoch = 0; epoch < trainingConfig?.epochs; epoch++) {
    // Training epoch
    let epochTrainLoss = 0;
    trainingData?.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      const loss = calculateLoss(prediction, sample.output);
      epochTrainLoss += loss;

      // Apply regularization to loss
      const weights = flattenNetworkWeights(network);
      const l1Penalty = calculateL1Penalty(weights, regularization.l1Lambda);
      const l2Penalty = calculateL2Penalty(weights, regularization.l2Lambda);
      epochTrainLoss += l1Penalty + l2Penalty;

      // Simplified backward pass with regularization
      updateWeightsWithRegularization(
        network,
        sample,
        prediction,
        optimizer,
        regularization,
      );
    });

    // Validation epoch
    let epochValidationLoss = 0;
    validationData?.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      const loss = calculateLoss(prediction, sample.output);
      epochValidationLoss += loss;
    });

    const avgTrainLoss = epochTrainLoss / trainingData.length;
    const avgValidationLoss = epochValidationLoss / validationData.length;

    trainLoss.push(avgTrainLoss);
    validationLoss.push(avgValidationLoss);
    trainAccuracy.push(0); // Simplified
    validationAccuracy.push(0); // Simplified

    // Early stopping check
    if (avgValidationLoss < bestValidationLoss) {
      bestValidationLoss = avgValidationLoss;
      bestEpoch = epoch;
      patienceCounter = 0;
    } else {
      patienceCounter++;
    }

    if (patienceCounter >= trainingConfig?.patience) {
      break;
    }
  }

  return {
    trainLoss,
    validationLoss,
    trainAccuracy,
    validationAccuracy,
    epochs: trainLoss.length,
    converged: bestValidationLoss < 0.1,
    bestEpoch,
  };
}

function calculateGeneralizationGap(metrics: TrainingMetrics): number {
  const trainLossBest = metrics.trainLoss[metrics.bestEpoch];
  const validationLossBest = metrics.validationLoss[metrics.bestEpoch];
  return validationLossBest - trainLossBest;
}

function createOptimizer(config: OptimizerConfig): any {
  return {
    initializeState: (paramCount: number) => {
      switch (config?.type) {
        case 'adam':
          return {
            m: Array(paramCount).fill(0),
            v: Array(paramCount).fill(0),
          };
        case 'rmsprop':
          return {
            v: Array(paramCount).fill(0),
          };
        case 'momentum':
          return {
            velocity: Array(paramCount).fill(0),
          };
        default:
          return {};
      }
    },

    update: (
      _weights: number[],
      gradients: number[],
      state: any,
      t: number,
    ) => {
      const updates: number[] = [];

      switch (config?.type) {
        case 'adam':
          gradients.forEach((grad, i) => {
            state.m[i] =
              config?.beta1! * state.m[i] + (1 - config?.beta1!) * grad;
            state.v[i] =
              config?.beta2! * state.v[i] + (1 - config?.beta2!) * grad * grad;

            const mHat = state.m[i] / (1 - config?.beta1! ** t);
            const vHat = state.v[i] / (1 - config?.beta2! ** t);

            updates.push(
              (-config?.learningRate * mHat) /
                (Math.sqrt(vHat) + config?.epsilon!),
            );
          });
          break;

        case 'rmsprop':
          gradients.forEach((grad, i) => {
            state.v[i] =
              config?.decay! * state.v[i] + (1 - config?.decay!) * grad * grad;
            updates.push(
              (-config?.learningRate * grad) /
                (Math.sqrt(state.v[i]) + config?.epsilon!),
            );
          });
          break;

        case 'momentum':
          gradients.forEach((grad, i) => {
            state.velocity[i] =
              config?.momentum! * state.velocity[i] +
              config?.learningRate * grad;
            updates.push(-state.velocity[i]);
          });
          break;

        default: // SGD
          gradients.forEach((grad) => {
            updates.push(-config?.learningRate * grad);
          });
      }

      return updates;
    },
  };
}

function trainWithOptimizer(
  network: any,
  trainingData: unknown[],
  optimizer: OptimizerConfig,
  config: Record<string, unknown>,
): any {
  const opt = createOptimizer(optimizer);
  const weights = flattenNetworkWeights(network);
  const state = opt.initializeState(weights.length);

  let finalError = Number.POSITIVE_INFINITY;
  let epochs = 0;

  for (let epoch = 0; epoch < config?.epochs; epoch++) {
    let epochError = 0;

    trainingData?.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      const error = calculateLoss(prediction, sample.output);
      epochError += error;

      // Simplified gradient computation
      const gradients = weights.map(() => (Math.random() - 0.5) * 0.01);
      const updates = opt.update(weights, gradients, state, epoch + 1);

      // Apply updates (simplified)
      updates.forEach((update, i) => {
        weights[i] += update;
      });
    });

    finalError = epochError / trainingData.length;
    epochs = epoch + 1;

    if (finalError < config?.targetError) {
      break;
    }
  }

  return {
    finalError,
    epochs,
    converged: finalError < config?.targetError,
  };
}

function forwardPass(network: any, input: number[]): number[] {
  let activations = [...input];

  for (let i = 0; i < network.weights.length; i++) {
    const newActivations: number[] = [];

    for (let j = 0; j < network.weights[i].length; j++) {
      let sum = network.biases[i]?.[j];
      for (let k = 0; k < activations.length; k++) {
        sum += activations[k] * network.weights[i]?.[j]?.[k];
      }
      newActivations.push(1 / (1 + Math.exp(-sum)));
    }

    activations = newActivations;
  }

  return activations;
}

function calculateLoss(prediction: number[], target: number[]): number {
  return (
    prediction.reduce((sum, pred, i) => sum + (pred - target?.[i]) ** 2, 0) /
    prediction.length
  );
}

function updateWeightsWithRegularization(
  network: any,
  sample: any,
  prediction: number[],
  optimizer: OptimizerConfig,
  regularization: RegularizationConfig,
): void {
  // Simplified weight update with regularization
  const error = sample.output.map(
    (target: number, i: number) => target - prediction[i],
  );

  network.weights.forEach((layer: number[][], layerIdx: number) => {
    layer.forEach((neuron: number[], neuronIdx: number) => {
      neuron.forEach((weight: number, weightIdx: number) => {
        let gradient =
          error[neuronIdx % error.length] * optimizer.learningRate * 0.01;

        // Add regularization gradients
        gradient += regularization.l1Lambda * Math.sign(weight);
        gradient += regularization.l2Lambda * weight;

        network.weights[layerIdx]?.[neuronIdx][weightIdx] += gradient;
      });
    });
  });
}

function calculateScheduledLearningRate(
  config: Record<string, unknown>,
  epoch: number,
): number {
  switch (config?.type) {
    case 'exponential': {
      const decaySteps = Math.floor(epoch / config?.decaySteps);
      return config?.initialLearningRate * config?.decayRate ** decaySteps;
    }
    default:
      return config?.initialLearningRate;
  }
}

function simulateTrainingEpoch(
  network: any,
  data: unknown[],
  learningRate: number,
): number {
  let epochError = 0;

  data?.forEach((sample) => {
    const prediction = forwardPass(network, sample.input);
    const error = calculateLoss(prediction, sample.output);
    epochError += error;

    // Simplified weight update
    const errorGradient = sample.output.map(
      (target: number, i: number) => target - prediction[i],
    );
    network.weights.forEach((layer: number[][]) => {
      layer.forEach((neuron: number[]) => {
        neuron.forEach((_weight: number, i: number) => {
          neuron[i] += learningRate * errorGradient[0] * 0.001;
        });
      });
    });
  });

  return epochError / data.length;
}

function trainWithEarlyStopping(
  network: any,
  trainingData: unknown[],
  validationData: unknown[],
  earlyStoppingConfig: any,
  trainingConfig: any,
): any {
  const trainLoss: number[] = [];
  const validationLoss: number[] = [];

  let bestValidationLoss = Number.POSITIVE_INFINITY;
  let bestEpoch = 0;
  let patienceCounter = 0;
  let stoppedEarly = false;

  for (let epoch = 0; epoch < trainingConfig?.epochs; epoch++) {
    // Training
    let epochTrainLoss = 0;
    trainingData?.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      epochTrainLoss += calculateLoss(prediction, sample.output);
    });
    trainLoss.push(epochTrainLoss / trainingData.length);

    // Validation
    let epochValidationLoss = 0;
    validationData?.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      epochValidationLoss += calculateLoss(prediction, sample.output);
    });
    const avgValidationLoss = epochValidationLoss / validationData.length;
    validationLoss.push(avgValidationLoss);

    // Early stopping check
    if (
      avgValidationLoss <
      bestValidationLoss - earlyStoppingConfig?.minDelta
    ) {
      bestValidationLoss = avgValidationLoss;
      bestEpoch = epoch;
      patienceCounter = 0;
    } else {
      patienceCounter++;
    }

    if (patienceCounter >= earlyStoppingConfig?.patience) {
      stoppedEarly = true;
      break;
    }
  }

  return {
    trainLoss,
    validationLoss,
    epochs: trainLoss.length,
    bestEpoch,
    stoppedEarly,
  };
}

function detectConvergencePlateau(
  lossHistory: number[],
  config: Record<string, unknown>,
): boolean {
  if (lossHistory.length < config?.window) return false;

  const recentLosses = lossHistory.slice(-config?.window);
  const maxChange = Math.max(...recentLosses) - Math.min(...recentLosses);

  return maxChange < config?.threshold;
}

function detectConvergenceRelative(
  lossHistory: number[],
  config: Record<string, unknown>,
): boolean {
  if (lossHistory.length < config?.window) return false;

  const recentLosses = lossHistory.slice(-config?.window);
  const avgRecent = recentLosses.reduce((a, b) => a + b) / recentLosses.length;
  const prevLosses = lossHistory.slice(-config?.window * 2, -config?.window);

  if (prevLosses.length === 0) return false;

  const avgPrev = prevLosses.reduce((a, b) => a + b) / prevLosses.length;
  const relativeImprovement = (avgPrev - avgRecent) / avgPrev;

  return relativeImprovement < config?.relativeTolerance;
}

function detectConvergenceAbsolute(
  lossHistory: number[],
  targetLoss: number,
): boolean {
  if (lossHistory.length === 0) return false;
  return lossHistory[lossHistory.length - 1] <= targetLoss;
}

function createEarlyStoppingMonitor(patience: number, minDelta: number): any {
  let bestLoss = Number.POSITIVE_INFINITY;
  let patienceCounter = 0;
  let bestEpoch = 0;

  return {
    update: (validationLoss: number, epoch: number): boolean => {
      if (validationLoss < bestLoss - minDelta) {
        bestLoss = validationLoss;
        bestEpoch = epoch;
        patienceCounter = 0;
        return false;
      }
      patienceCounter++;
      return patienceCounter >= patience;
    },
    getBestEpoch: () => bestEpoch,
    getBestLoss: () => bestLoss,
  };
}

function createKFolds(dataset: unknown[], k: number): unknown[][] {
  const shuffled = [...dataset].sort(() => Math.random() - 0.5);
  const folds: unknown[][] = [];
  const foldSize = Math.floor(dataset.length / k);

  for (let i = 0; i < k; i++) {
    const start = i * foldSize;
    const end = i === k - 1 ? dataset.length : start + foldSize;
    folds.push(shuffled.slice(start, end));
  }

  return folds;
}

function performKFoldCrossValidation(
  dataset: unknown[],
  topology: number[],
  k: number,
  trainingConfig: any,
): number[] {
  const folds = createKFolds(dataset, k);
  const results: number[] = [];

  for (let i = 0; i < k; i++) {
    const testFold = folds[i];
    const trainFolds = folds.filter((_, index) => index !== i).flat();

    const network = createRegularizedNetwork(topology);
    const _result = trainWithOptimizer(
      network,
      trainFolds,
      { type: 'sgd', learningRate: trainingConfig?.learningRate },
      trainingConfig,
    );

    // Evaluate on test fold
    let testError = 0;
    testFold.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      testError += calculateLoss(prediction, sample.output);
    });

    results?.push(testError / testFold.length);
  }

  return results;
}

function createStratifiedKFolds(dataset: unknown[], k: number): unknown[][] {
  // Group by class
  const classSamples: { [key: string]: unknown[] } = {};
  dataset?.forEach((sample) => {
    const classKey = JSON.stringify(sample.output);
    if (!classSamples[classKey]) {
      classSamples[classKey] = [];
    }
    classSamples[classKey]?.push(sample);
  });

  // Create stratified folds
  const folds: unknown[][] = Array(k)
    .fill(0)
    .map(() => []);

  Object.values(classSamples).forEach((samples) => {
    const shuffled = [...samples].sort(() => Math.random() - 0.5);
    shuffled.forEach((sample, index) => {
      folds[index % k]?.push(sample);
    });
  });

  return folds;
}

function countClasses(dataset: unknown[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  dataset?.forEach((sample) => {
    const classKey = JSON.stringify(sample.output);
    counts[classKey] = (counts[classKey] || 0) + 1;
  });
  return counts;
}

function performNestedCrossValidation(
  dataset: unknown[],
  modelConfigs: unknown[],
  outerK: number,
  innerK: number,
  trainingConfig: any,
): any {
  const outerFolds = createKFolds(dataset, outerK);
  const outerFoldResults: number[] = [];
  const selectedModels: unknown[] = [];

  for (let outerFold = 0; outerFold < outerK; outerFold++) {
    const testSet = outerFolds[outerFold];
    const trainValidationSet = outerFolds
      .filter((_, i) => i !== outerFold)
      .flat();

    // Inner CV for model selection
    let bestConfigIndex = 0;
    let bestValidationError = Number.POSITIVE_INFINITY;

    modelConfigs?.forEach((config, configIndex) => {
      const innerCVResults = performKFoldCrossValidation(
        trainValidationSet,
        config?.topology,
        innerK,
        trainingConfig,
      );

      const avgError =
        innerCVResults?.reduce((a, b) => a + b) / innerCVResults.length;

      if (avgError < bestValidationError) {
        bestValidationError = avgError;
        bestConfigIndex = configIndex;
      }
    });

    // Train best model on full train-validation set and test on outer test set
    const bestConfig = modelConfigs?.[bestConfigIndex];
    const network = createRegularizedNetwork(bestConfig?.topology);
    trainWithOptimizer(
      network,
      trainValidationSet,
      { type: 'sgd', learningRate: trainingConfig?.learningRate },
      trainingConfig,
    );

    // Evaluate on outer test set
    let testError = 0;
    testSet.forEach((sample) => {
      const prediction = forwardPass(network, sample.input);
      testError += calculateLoss(prediction, sample.output);
    });

    const outerTestError = testError / testSet.length;
    outerFoldResults?.push(outerTestError);
    selectedModels?.push({
      configIndex: bestConfigIndex,
      validationError: bestValidationError,
      testError: outerTestError,
    });
  }

  const unbiasedPerformanceEstimate =
    outerFoldResults?.reduce((a, b) => a + b) / outerFoldResults.length;

  return {
    outerFoldResults,
    selectedModels,
    unbiasedPerformanceEstimate,
  };
}
