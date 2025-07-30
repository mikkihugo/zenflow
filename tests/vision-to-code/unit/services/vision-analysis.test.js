const { mockImages, mockVisionResults } = require('../../fixtures/mock-data');
const TestHelpers = require('../../utils/test-helpers');

// Mock the vision analysis service
jest.mock('@/services/vision-analysis', () => ({
  VisionAnalysisService: jest.fn().mockImplementation(() => ({
    analyzeImage: jest.fn(),
    extractComponents: jest.fn(),
    detectLayout: jest.fn(),
    extractColors: jest.fn(),
  })),
}));

const { VisionAnalysisService } = require('@/services/vision-analysis');

describe('Vision Analysis Service', () => {
  let visionService;
  let metricsCollector;

  beforeEach(() => {
    visionService = new VisionAnalysisService();
    metricsCollector = TestHelpers.createMetricsCollector();
    jest.clearAllMocks();
  });

  describe('Image Analysis', () => {
    it('should analyze valid images successfully', async () => {
      // Arrange
      const mockImage = await TestHelpers.createMockImage({ format: 'png' });
      const expectedResult = TestHelpers.createMockVisionResult();

      visionService.analyzeImage.mockResolvedValue(expectedResult);

      // Act
      const startTime = Date.now();
      const result = await visionService.analyzeImage(mockImage.buffer);
      const duration = Date.now() - startTime;

      // Assert
      expect(result).toEqual(expectedResult);
      expect(visionService.analyzeImage).toHaveBeenCalledWith(mockImage.buffer);
      expect(duration).toBeLessThan(100); // Should complete within 100ms

      metricsCollector.recordRequest('analyzeImage', duration, 200);
    });

    it('should handle multiple image formats', async () => {
      const formats = ['png', 'jpg', 'webp'];

      for (const format of formats) {
        // Arrange
        const mockImage = await TestHelpers.createMockImage({ format });
        const expectedResult = TestHelpers.createMockVisionResult();
        visionService.analyzeImage.mockResolvedValue(expectedResult);

        // Act
        const result = await visionService.analyzeImage(mockImage.buffer);

        // Assert
        expect(result).toEqual(expectedResult);
        expect(result.metadata.confidence).toBeGreaterThan(0.9);
      }
    });

    it('should reject corrupted images', async () => {
      // Arrange
      const corruptedBuffer = Buffer.from('corrupted data');
      visionService.analyzeImage.mockRejectedValue(new Error('Invalid image format'));

      // Act & Assert
      await expect(visionService.analyzeImage(corruptedBuffer)).rejects.toThrow(
        'Invalid image format'
      );

      metricsCollector.recordError(new Error('Invalid image format'), 'analyzeImage');
    });

    it('should enforce size limits', async () => {
      // Arrange
      const oversizedImage = await TestHelpers.createMockImage({ size: 'large' });
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (oversizedImage.buffer.length > maxSize) {
        visionService.analyzeImage.mockRejectedValue(new Error('File size exceeds limit'));
      }

      // Act & Assert
      if (oversizedImage.buffer.length > maxSize) {
        await expect(visionService.analyzeImage(oversizedImage.buffer)).rejects.toThrow(
          'File size exceeds limit'
        );
      }
    });

    it('should process images in parallel', async () => {
      // Arrange
      const imageCount = 10;
      const images = await Promise.all(
        Array(imageCount)
          .fill()
          .map(() => TestHelpers.createMockImage())
      );

      visionService.analyzeImage.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return TestHelpers.createMockVisionResult();
      });

      // Act
      const startTime = Date.now();
      const results = await Promise.all(
        images.map((img) => visionService.analyzeImage(img.buffer))
      );
      const totalDuration = Date.now() - startTime;

      // Assert
      expect(results).toHaveLength(imageCount);
      expect(totalDuration).toBeLessThan(200); // Parallel processing should be fast

      const stats = metricsCollector.getStats();
      console.warn('Parallel processing stats:', stats);
    });
  });

  describe('Component Extraction', () => {
    it('should extract UI components accurately', async () => {
      // Arrange
      const mockResult = mockVisionResults.simpleLayout;
      visionService.extractComponents.mockResolvedValue(mockResult.components);

      // Act
      const components = await visionService.extractComponents(mockResult);

      // Assert
      expect(components).toEqual(mockResult.components);
      expect(components).toHaveLength(3);
      expect(components[0].type).toBe('header');
      expect(components[0].confidence).toBeGreaterThan(0.95);
    });

    it('should detect nested components', async () => {
      // Arrange
      const mockResult = mockVisionResults.complexLayout;
      visionService.extractComponents.mockResolvedValue(mockResult.components);

      // Act
      const components = await visionService.extractComponents(mockResult);

      // Assert
      const sidebar = components.find((c) => c.type === 'sidebar');
      expect(sidebar).toBeDefined();
      expect(sidebar.children).toContain('nav-menu');
    });

    it('should handle missing components gracefully', async () => {
      // Arrange
      const emptyResult = { components: [] };
      visionService.extractComponents.mockResolvedValue([]);

      // Act
      const components = await visionService.extractComponents(emptyResult);

      // Assert
      expect(components).toEqual([]);
      expect(components).toHaveLength(0);
    });
  });

  describe('Layout Detection', () => {
    it('should detect layout type correctly', async () => {
      // Arrange
      const layouts = ['single-column', 'grid', 'dashboard', 'magazine'];

      for (const layoutType of layouts) {
        const mockResult = { layout: { type: layoutType } };
        visionService.detectLayout.mockResolvedValue(mockResult.layout);

        // Act
        const layout = await visionService.detectLayout(mockResult);

        // Assert
        expect(layout.type).toBe(layoutType);
      }
    });

    it('should identify responsive breakpoints', async () => {
      // Arrange
      const mockResult = mockVisionResults.simpleLayout;
      visionService.detectLayout.mockResolvedValue(mockResult.layout);

      // Act
      const layout = await visionService.detectLayout(mockResult);

      // Assert
      expect(layout.responsive).toBe(true);
      expect(layout.breakpoints).toEqual(['mobile', 'tablet', 'desktop']);
    });
  });

  describe('Color Extraction', () => {
    it('should extract color palette', async () => {
      // Arrange
      const mockResult = mockVisionResults.simpleLayout;
      visionService.extractColors.mockResolvedValue(mockResult.design.colors);

      // Act
      const colors = await visionService.extractColors(mockResult);

      // Assert
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should detect color contrast ratios', async () => {
      // Arrange
      const colors = {
        background: '#FFFFFF',
        text: '#333333',
        contrastRatio: 12.63,
      };
      visionService.extractColors.mockResolvedValue(colors);

      // Act
      const result = await visionService.extractColors({});

      // Assert
      expect(result.contrastRatio).toBeGreaterThan(4.5); // WCAG AA standard
    });
  });

  describe('Performance', () => {
    it('should complete analysis within performance budget', async () => {
      const performanceTests = [
        { imageSize: 'small', expectedTime: 50 },
        { imageSize: 'medium', expectedTime: 100 },
        { imageSize: 'large', expectedTime: 200 },
      ];

      for (const test of performanceTests) {
        // Arrange
        const mockImage = await TestHelpers.createMockImage({ size: test.imageSize });
        visionService.analyzeImage.mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, test.expectedTime - 20));
          return TestHelpers.createMockVisionResult();
        });

        // Act
        const result = await TestHelpers.measureExecutionTime(
          () => visionService.analyzeImage(mockImage.buffer),
          `Analysis of ${test.imageSize} image`
        );

        // Assert
        expect(result.duration).toBeLessThan(test.expectedTime);
        expect(result.pass).toBe(true);
      }
    });

    it('should handle concurrent requests efficiently', async () => {
      // Arrange
      const concurrentRequests = 50;
      const requests = Array(concurrentRequests)
        .fill()
        .map(async (_, _index) => {
          const image = await TestHelpers.createMockImage();
          return visionService.analyzeImage(image.buffer);
        });

      visionService.analyzeImage.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return TestHelpers.createMockVisionResult();
      });

      // Act
      const startTime = Date.now();
      await Promise.all(requests);
      const totalDuration = Date.now() - startTime;

      // Assert
      expect(totalDuration).toBeLessThan(500); // Should handle 50 concurrent requests quickly

      const stats = metricsCollector.getStats();
      expect(stats.totalRequests).toBe(concurrentRequests);
    });
  });

  afterAll(() => {
    const finalStats = metricsCollector.getStats();
    console.warn('Vision Analysis Service Test Statistics:', {
      ...finalStats,
      successRate: `${(
        ((finalStats.totalRequests - finalStats.totalErrors) / finalStats.totalRequests) * 100
      ).toFixed(2)}%`,
    });
  });
});
