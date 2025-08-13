#!/usr/bin/env node
/**
 * Neural Benchmark Visualization
 * Creates visual representations of benchmark results
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

class BenchmarkVisualizer {
  constructor() {
    this.benchmarkData = null;
  }

  async loadBenchmarkData() {
    const benchmarkPath = path.join(
      process.cwd(),
      '.ruv-swarm',
      'benchmarks',
      'neural-benchmark-1751398753060.json'
    );
    this.benchmarkData = JSON.parse(await fs.readFile(benchmarkPath, 'utf8'));
  }

  generateASCIIChart(data, _title, maxWidth = 60) {
    const maxValue = Math.max(...Object.values(data));

    Object.entries(data).forEach(([_label, value]) => {
      const barLength = Math.floor((value / maxValue) * (maxWidth - 20));
      const _bar = '█'.repeat(barLength);
      const _percentage = ((value / maxValue) * 100).toFixed(1);
    });
  }

  visualizeResults() {
    // Accuracy Comparison
    const accuracyData = {};
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      accuracyData[model.toUpperCase()] = Number.parseFloat(
        data.architecture.accuracy
      );
    });
    this.generateASCIIChart(
      accuracyData,
      '🎯 MODEL ACCURACY COMPARISON (%)',
      70
    );

    // Inference Speed Comparison
    const speedData = {};
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      speedData[model.toUpperCase()] = Math.floor(data.inference.mean);
    });
    this.generateASCIIChart(speedData, '⚡ INFERENCE SPEED (ops/sec)', 70);

    // Memory Usage Comparison
    const memoryData = {};
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      memoryData[model.toUpperCase()] = data.memory.totalMemory;
    });
    this.generateASCIIChart(memoryData, '💾 MEMORY USAGE (MB)', 70);

    // Training Time Comparison
    const trainingData = {};
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      trainingData[model.toUpperCase()] = Math.floor(data.timings.training);
    });
    this.generateASCIIChart(trainingData, '⏱️  TRAINING TIME (ms)', 70);

    // Parameter Count Comparison
    const paramData = {};
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      paramData[model.toUpperCase()] = Math.floor(
        data.architecture.parameters / 1000
      );
    });
    this.generateASCIIChart(paramData, '🔢 PARAMETERS (thousands)', 70);

    // Performance Matrix
    this.generatePerformanceMatrix();

    // Model Rankings
    this.generateModelRankings();

    // Trade-off Analysis
    this.generateTradeoffAnalysis();
  }

  generatePerformanceMatrix() {
    Object.entries(this.benchmarkData.results).forEach(([model, data]) => {
      const _row = [
        model.toUpperCase().padEnd(12),
        `${data.architecture.accuracy}%`.padEnd(9),
        `${Math.floor(data.inference.mean)} ops/s`.padEnd(9),
        `${data.memory.totalMemory} MB`.padEnd(8),
        `${(data.timings.training / 1000).toFixed(2)}s`.padEnd(9),
        `${(data.architecture.parameters / 1000).toFixed(0)}K`,
      ];
    });
  }

  generateModelRankings() {
    // Rank by different metrics
    const metrics = [
      {
        name: 'Accuracy',
        key: 'architecture.accuracy',
        higher: true,
        unit: '%',
      },
      {
        name: 'Inference Speed',
        key: 'inference.mean',
        higher: true,
        unit: ' ops/s',
      },
      {
        name: 'Memory Efficiency',
        key: 'memory.efficiency',
        higher: true,
        unit: '%',
      },
      {
        name: 'Training Speed',
        key: 'timings.training',
        higher: false,
        unit: 'ms',
      },
      {
        name: 'Parameter Efficiency',
        key: 'architecture.parameters',
        higher: false,
        unit: '',
      },
    ];

    metrics.forEach((metric) => {
      const ranked = Object.entries(this.benchmarkData.results)
        .map(([model, data]) => {
          const value = metric.key
            .split('.')
            .reduce((obj, key) => obj[key], data);
          return { model, value };
        })
        .sort((a, b) =>
          metric.higher ? b.value - a.value : a.value - b.value
        );

      ranked.forEach((item, index) => {
        const _medal =
          index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        const _value =
          metric.unit === '%'
            ? Number.parseFloat(item.value).toFixed(1)
            : Math.floor(item.value);
      });
    });
  }

  generateTradeoffAnalysis() {
    const models = Object.entries(this.benchmarkData.results).map(
      ([name, data]) => ({
        name: name.toUpperCase(),
        accuracy: Number.parseFloat(data.architecture.accuracy),
        speed: data.inference.mean,
        memory: data.memory.totalMemory,
        efficiency: data.memory.efficiency,
      })
    );
    models
      .sort((a, b) => b.accuracy * b.speed - a.accuracy * a.speed)
      .forEach((model) => {
        const _score = ((model.accuracy * model.speed) / 100).toFixed(1);
      });
    models
      .sort((a, b) => b.accuracy / b.memory - a.accuracy / a.memory)
      .forEach((model) => {
        const _score = ((model.accuracy / model.memory) * 1000).toFixed(2);
      });
    models.forEach((model) => {
      // Normalize values (0-1 scale)
      const normAccuracy = model.accuracy / 100;
      const normSpeed = model.speed / 350; // Max speed ~350
      const normMemEff = 1 - model.memory / 6000; // Inverse, lower is better
      const overallScore =
        (normAccuracy * 0.4 + normSpeed * 0.3 + normMemEff * 0.3) * 100;

      model.overallScore = overallScore;
    });

    models
      .sort((a, b) => b.overallScore - a.overallScore)
      .forEach((_model, index) => {
        const _medal = index === 0 ? '🏆' : '';
      });
  }

  async visualize() {
    try {
      await this.loadBenchmarkData();
      this.visualizeResults();
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run visualization
const visualizer = new BenchmarkVisualizer();
visualizer.visualize();
