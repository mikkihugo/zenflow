/**
 * Vector Database Performance Test Suite
 * Classical TDD approach - testing actual database operations and performance
 */

import { LanceDBInterface } from '../../../../database/lancedb-interface';
import { VectorStore } from '../../../../memory/backends/lancedb.backend';
import { DatabaseTestHelper } from '../../../helpers/database-test-helper';
import { PerformanceMeasurement } from '../../../helpers/performance-measurement';

describe('Vector Database Performance (Classical TDD)', () => {
  let lancedb: LanceDBInterface;
  let vectorStore: VectorStore;
  let performance: PerformanceMeasurement;
  let testHelper: DatabaseTestHelper;

  const TEST_DB_PATH = '/tmp/claude-zen-test-db';
  const VECTOR_DIMENSION = 384; // Standard embedding dimension
  const PERFORMANCE_THRESHOLD_MS = 100;

  beforeAll(async () => {
    testHelper = new DatabaseTestHelper();
    performance = new PerformanceMeasurement();

    await testHelper.initializeTestDatabase(TEST_DB_PATH);
  });

  beforeEach(async () => {
    lancedb = new LanceDBInterface({
      path: TEST_DB_PATH,
      vectorDimension: VECTOR_DIMENSION,
    });

    vectorStore = new VectorStore(lancedb);
    await vectorStore.initialize();
  });

  afterEach(async () => {
    await vectorStore.close();
    await testHelper.clearTestData();
  });

  afterAll(async () => {
    await testHelper.cleanup();
  });

  describe('Vector Insertion Performance', () => {
    it('should insert single vectors within performance threshold', async () => {
      const testVector = testHelper.generateRandomVector(VECTOR_DIMENSION);
      const metadata = {
        id: 'test-vector-1',
        type: 'embedding',
        source: 'test',
        timestamp: Date.now(),
      };

      performance.start('single-vector-insert');

      const result = await vectorStore.insert({
        vector: testVector,
        metadata,
      });

      performance.end('single-vector-insert');

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();

      const insertTime = performance.getDuration('single-vector-insert');
      expect(insertTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it('should efficiently batch insert large numbers of vectors', async () => {
      const batchSize = 1000;
      const testVectors = Array.from({ length: batchSize }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: {
          id: `batch-vector-${i}`,
          type: 'embedding',
          source: 'batch-test',
          batchIndex: i,
        },
      }));

      performance.start('batch-vector-insert');

      const result = await vectorStore.batchInsert(testVectors);

      performance.end('batch-vector-insert');

      expect(result.success).toBe(true);
      expect(result.insertedCount).toBe(batchSize);
      expect(result.failedCount).toBe(0);

      const batchTime = performance.getDuration('batch-vector-insert');
      const timePerVector = batchTime / batchSize;

      // Batch insertion should be much faster per vector than individual inserts
      expect(timePerVector).toBeLessThan(PERFORMANCE_THRESHOLD_MS / 10);
      expect(batchTime).toBeLessThan(10000); // 10 seconds max for 1000 vectors
    });

    it('should handle high-dimensional vectors efficiently', async () => {
      const highDimension = 1536; // GPT-3 embedding dimension
      const testVectors = Array.from({ length: 100 }, (_, i) => ({
        vector: testHelper.generateRandomVector(highDimension),
        metadata: {
          id: `high-dim-vector-${i}`,
          dimension: highDimension,
          type: 'high-dimensional',
        },
      }));

      performance.start('high-dimensional-insert');

      const result = await vectorStore.batchInsert(testVectors);

      performance.end('high-dimensional-insert');

      expect(result.success).toBe(true);
      expect(result.insertedCount).toBe(100);

      const insertTime = performance.getDuration('high-dimensional-insert');
      expect(insertTime).toBeLessThan(5000); // 5 seconds max for 100 high-dim vectors
    });
  });

  describe('Vector Search Performance', () => {
    beforeEach(async () => {
      // Pre-populate database with test vectors
      const seedVectors = Array.from({ length: 10000 }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: {
          id: `seed-vector-${i}`,
          category: i % 10, // 10 categories
          value: Math.random() * 100,
          type: 'seed-data',
        },
      }));

      await vectorStore.batchInsert(seedVectors);
    });

    it('should perform similarity search within performance limits', async () => {
      const queryVector = testHelper.generateRandomVector(VECTOR_DIMENSION);
      const k = 10; // Top 10 similar vectors

      performance.start('similarity-search');

      const results = await vectorStore.similaritySearch({
        vector: queryVector,
        k,
        threshold: 0.7,
      });

      performance.end('similarity-search');

      expect(results.length).toBeLessThanOrEqual(k);
      expect(results.length).toBeGreaterThan(0);

      // Verify results are sorted by similarity (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].similarity).toBeLessThanOrEqual(results[i - 1].similarity);
      }

      const searchTime = performance.getDuration('similarity-search');
      expect(searchTime).toBeLessThan(500); // 500ms max for 10K vector search
    });

    it('should efficiently handle filtered similarity search', async () => {
      const queryVector = testHelper.generateRandomVector(VECTOR_DIMENSION);
      const targetCategory = 5;

      performance.start('filtered-search');

      const results = await vectorStore.similaritySearch({
        vector: queryVector,
        k: 20,
        filter: {
          category: targetCategory,
          value: { $gte: 50 }, // Value >= 50
        },
      });

      performance.end('filtered-search');

      // Verify all results match filter criteria
      results.forEach((result) => {
        expect(result.metadata.category).toBe(targetCategory);
        expect(result.metadata.value).toBeGreaterThanOrEqual(50);
      });

      const searchTime = performance.getDuration('filtered-search');
      expect(searchTime).toBeLessThan(1000); // 1 second max for filtered search
    });

    it('should optimize range queries on vector collections', async () => {
      const centerVector = testHelper.generateRandomVector(VECTOR_DIMENSION);
      const radius = 0.8; // Similarity radius

      performance.start('range-query');

      const results = await vectorStore.rangeSearch({
        vector: centerVector,
        radius,
        maxResults: 100,
      });

      performance.end('range-query');

      // Verify all results are within specified radius
      results.forEach((result) => {
        expect(result.similarity).toBeGreaterThanOrEqual(radius);
      });

      expect(results.length).toBeLessThanOrEqual(100);

      const queryTime = performance.getDuration('range-query');
      expect(queryTime).toBeLessThan(800); // 800ms max for range query
    });

    it('should handle approximate nearest neighbor search efficiently', async () => {
      const queryVector = testHelper.generateRandomVector(VECTOR_DIMENSION);

      // Exact search for comparison
      performance.start('exact-search');
      const exactResults = await vectorStore.similaritySearch({
        vector: queryVector,
        k: 10,
        exact: true,
      });
      performance.end('exact-search');

      // Approximate search
      performance.start('approximate-search');
      const approxResults = await vectorStore.similaritySearch({
        vector: queryVector,
        k: 10,
        exact: false,
        approximationFactor: 0.95, // 95% accuracy
      });
      performance.end('approximate-search');

      const exactTime = performance.getDuration('exact-search');
      const approxTime = performance.getDuration('approximate-search');

      // Approximate search should be significantly faster
      expect(approxTime).toBeLessThan(exactTime * 0.5);

      // Approximate results should be reasonably similar to exact
      const topExact = exactResults.slice(0, 5).map((r) => r.metadata.id);
      const topApprox = approxResults.slice(0, 5).map((r) => r.metadata.id);
      const overlap = topExact.filter((id) => topApprox.includes(id)).length;

      expect(overlap).toBeGreaterThanOrEqual(3); // At least 60% overlap in top 5
    });
  });

  describe('Index Optimization Performance', () => {
    it('should build and rebuild indexes efficiently', async () => {
      // Insert data without indexes
      const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: {
          id: `index-test-${i}`,
          timestamp: Date.now() + i,
          category: `cat-${i % 20}`,
        },
      }));

      await vectorStore.batchInsert(largeDataset);

      // Build indexes
      performance.start('index-build');

      await vectorStore.buildIndexes({
        vectorIndex: {
          type: 'IVF_FLAT',
          nlist: 100, // Number of clusters
          metric: 'L2',
        },
        metadataIndexes: [
          { field: 'category', type: 'hash' },
          { field: 'timestamp', type: 'btree' },
        ],
      });

      performance.end('index-build');

      const indexBuildTime = performance.getDuration('index-build');
      expect(indexBuildTime).toBeLessThan(30000); // 30 seconds max for 5K vectors

      // Verify search performance improvement
      const queryVector = testHelper.generateRandomVector(VECTOR_DIMENSION);

      performance.start('indexed-search');
      const indexedResults = await vectorStore.similaritySearch({
        vector: queryVector,
        k: 10,
      });
      performance.end('indexed-search');

      const indexedSearchTime = performance.getDuration('indexed-search');
      expect(indexedSearchTime).toBeLessThan(100); // Should be very fast with index
      expect(indexedResults.length).toBeGreaterThan(0);
    });

    it('should optimize index parameters based on data distribution', async () => {
      // Create clustered data
      const clusters = 5;
      const vectorsPerCluster = 1000;

      const clusteredData: any[] = [];

      for (let cluster = 0; cluster < clusters; cluster++) {
        const clusterCenter = testHelper.generateRandomVector(VECTOR_DIMENSION);

        for (let i = 0; i < vectorsPerCluster; i++) {
          const noisyVector = testHelper.addNoiseToVector(clusterCenter, 0.1);
          clusteredData.push({
            vector: noisyVector,
            metadata: {
              id: `cluster-${cluster}-vector-${i}`,
              cluster,
              distanceFromCenter: testHelper.calculateDistance(noisyVector, clusterCenter),
            },
          });
        }
      }

      await vectorStore.batchInsert(clusteredData);

      // Analyze data distribution
      performance.start('data-analysis');
      const distribution = await vectorStore.analyzeDataDistribution();
      performance.end('data-analysis');

      expect(distribution.clusters).toBe(clusters);
      expect(distribution.averageIntraClusterDistance).toBeLessThan(0.2);
      expect(distribution.averageInterClusterDistance).toBeGreaterThan(0.5);

      // Optimize index based on distribution
      performance.start('index-optimization');
      const optimizedIndex = await vectorStore.optimizeIndex({
        dataDistribution: distribution,
        targetSearchTime: 50, // 50ms target
        memoryBudget: 100 * 1024 * 1024, // 100MB
      });
      performance.end('index-optimization');

      expect(optimizedIndex.parameters.nlist).toBeCloseTo(clusters, 2);
      expect(optimizedIndex.estimatedSearchTime).toBeLessThanOrEqual(50);
      expect(optimizedIndex.estimatedMemoryUsage).toBeLessThanOrEqual(100 * 1024 * 1024);

      const optimizationTime = performance.getDuration('index-optimization');
      expect(optimizationTime).toBeLessThan(10000); // 10 seconds max
    });
  });

  describe('Memory Management and Compression', () => {
    it('should efficiently manage memory usage during large operations', async () => {
      const initialMemory = process.memoryUsage();

      // Perform memory-intensive operations
      const largeDataset = Array.from({ length: 20000 }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: {
          id: `memory-test-${i}`,
          largeText: 'x'.repeat(1000), // 1KB of text per vector
          timestamp: Date.now(),
        },
      }));

      performance.start('memory-intensive-operations');

      // Insert in chunks to test memory management
      const chunkSize = 1000;
      for (let i = 0; i < largeDataset.length; i += chunkSize) {
        const chunk = largeDataset.slice(i, i + chunkSize);
        await vectorStore.batchInsert(chunk);

        // Force garbage collection between chunks
        if (global.gc) {
          global.gc();
        }
      }

      performance.end('memory-intensive-operations');

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 500MB)
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024);

      const operationTime = performance.getDuration('memory-intensive-operations');
      expect(operationTime).toBeLessThan(60000); // 60 seconds max
    });

    it('should compress vector data without significant quality loss', async () => {
      const originalVectors = Array.from({ length: 1000 }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: { id: `compression-test-${i}` },
      }));

      await vectorStore.batchInsert(originalVectors);

      // Measure storage before compression
      const storageInfoBefore = await vectorStore.getStorageInfo();

      performance.start('vector-compression');

      const compressionResult = await vectorStore.compressVectors({
        compressionType: 'quantization',
        bits: 8, // 8-bit quantization
        preserveAccuracy: 0.95, // 95% accuracy preservation
      });

      performance.end('vector-compression');

      const storageInfoAfter = await vectorStore.getStorageInfo();

      // Verify compression efficiency
      const compressionRatio = storageInfoBefore.size / storageInfoAfter.size;
      expect(compressionRatio).toBeGreaterThan(2); // At least 2x compression

      // Verify search accuracy is preserved
      const queryVector = testHelper.generateRandomVector(VECTOR_DIMENSION);

      const compressedResults = await vectorStore.similaritySearch({
        vector: queryVector,
        k: 10,
      });

      expect(compressedResults.length).toBeGreaterThan(0);
      expect(compressionResult.accuracyRetention).toBeGreaterThanOrEqual(0.95);

      const compressionTime = performance.getDuration('vector-compression');
      expect(compressionTime).toBeLessThan(30000); // 30 seconds max
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle concurrent reads efficiently', async () => {
      // Pre-populate with test data
      const seedData = Array.from({ length: 5000 }, (_, i) => ({
        vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
        metadata: { id: `concurrent-read-${i}`, value: i },
      }));

      await vectorStore.batchInsert(seedData);

      const concurrentReads = 20;
      const queryVectors = Array.from({ length: concurrentReads }, () =>
        testHelper.generateRandomVector(VECTOR_DIMENSION),
      );

      performance.start('concurrent-reads');

      const readPromises = queryVectors.map((vector) =>
        vectorStore.similaritySearch({
          vector,
          k: 5,
        }),
      );

      const results = await Promise.all(readPromises);

      performance.end('concurrent-reads');

      // All reads should succeed
      expect(results.length).toBe(concurrentReads);
      results.forEach((result) => {
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(5);
      });

      const totalTime = performance.getDuration('concurrent-reads');
      const avgTimePerRead = totalTime / concurrentReads;

      expect(avgTimePerRead).toBeLessThan(200); // 200ms average per concurrent read
    });

    it('should handle mixed read/write operations safely', async () => {
      const mixedOperations = 50;
      const operations: Promise<any>[] = [];

      performance.start('mixed-operations');

      for (let i = 0; i < mixedOperations; i++) {
        if (i % 3 === 0) {
          // Write operation
          operations.push(
            vectorStore.insert({
              vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
              metadata: { id: `mixed-write-${i}`, operation: 'write' },
            }),
          );
        } else {
          // Read operation
          operations.push(
            vectorStore.similaritySearch({
              vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
              k: 3,
            }),
          );
        }
      }

      const results = await Promise.all(operations);

      performance.end('mixed-operations');

      // All operations should complete successfully
      expect(results.length).toBe(mixedOperations);

      let writeCount = 0;
      let readCount = 0;

      results.forEach((result, index) => {
        if (index % 3 === 0) {
          // Write result
          expect(result.success).toBe(true);
          writeCount++;
        } else {
          // Read result
          expect(Array.isArray(result)).toBe(true);
          readCount++;
        }
      });

      expect(writeCount).toBe(Math.ceil(mixedOperations / 3));
      expect(readCount).toBe(mixedOperations - writeCount);

      const totalTime = performance.getDuration('mixed-operations');
      expect(totalTime).toBeLessThan(10000); // 10 seconds max for mixed operations
    });

    it('should maintain consistency during concurrent updates', async () => {
      const testId = 'consistency-test-vector';
      const initialVector = testHelper.generateRandomVector(VECTOR_DIMENSION);

      // Insert initial vector
      await vectorStore.insert({
        vector: initialVector,
        metadata: { id: testId, version: 0 },
      });

      const concurrentUpdates = 10;
      const updatePromises: Promise<any>[] = [];

      performance.start('concurrent-updates');

      for (let i = 1; i <= concurrentUpdates; i++) {
        updatePromises.push(
          vectorStore.update(testId, {
            vector: testHelper.generateRandomVector(VECTOR_DIMENSION),
            metadata: { id: testId, version: i, updateTime: Date.now() },
          }),
        );
      }

      const updateResults = await Promise.all(updatePromises);

      performance.end('concurrent-updates');

      // Exactly one update should succeed due to concurrency control
      const successfulUpdates = updateResults.filter((result) => result.success);
      expect(successfulUpdates.length).toBe(1);

      // Verify final state is consistent
      const finalVector = await vectorStore.getById(testId);
      expect(finalVector).toBeDefined();
      expect(finalVector?.metadata.version).toBeGreaterThan(0);
      expect(finalVector?.metadata.version).toBeLessThanOrEqual(concurrentUpdates);

      const updateTime = performance.getDuration('concurrent-updates');
      expect(updateTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
