import { chromium } from 'playwright';
import TestHelpers from '../vision-to-code/utils/test-helpers.js';
import { mockImages } from '../vision-to-code/fixtures/mock-data.js';

describe('Vision-to-Code E2E Tests', () => {
  let browser;
  let context;
  let page;
  let metricsCollector;

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false'
    });
    metricsCollector = TestHelpers.createMetricsCollector();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Vision2Code E2E Tests)'
    });
    page = await context.newPage();
    
    // Set up request interception for performance monitoring
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/')) {
        request.timing = { start: Date.now() };
      }
    });
    
    page.on('response', response => {
      const request = response.request();
      if (request.timing) {
        const duration = Date.now() - request.timing.start;
        metricsCollector.recordRequest(request.url(), duration, response.status());
      }
    });
  });

  afterEach(async () => {
    await context.close();
  });

  describe('Complete User Journey', () => {
    it('should complete full flow from image upload to code download', async () => {
      // Navigate to application
      await page.goto('http://localhost:3000');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="upload-area"]');
      
      // Step 1: Upload an image
      const uploadArea = await page.locator('[data-testid="upload-area"]');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        uploadArea.click()
      ]);
      
      // Create a test image file
      const testImagePath = './test-fixtures/dashboard-ui.png';
      await fileChooser.setFiles(testImagePath);
      
      // Wait for upload to complete
      await page.waitForSelector('[data-testid="upload-success"]', { timeout: 10000 });
      
      // Step 2: Wait for vision analysis
      await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 30000 });
      
      // Verify analysis results are displayed
      const componentsDetected = await page.locator('[data-testid="components-list"] > li').count();
      expect(componentsDetected).toBeGreaterThan(0);
      
      // Step 3: Configure code generation options
      await page.selectOption('[data-testid="framework-select"]', 'react');
      await page.selectOption('[data-testid="language-select"]', 'typescript');
      
      // Enable additional options
      await page.check('[data-testid="include-tests"]');
      await page.check('[data-testid="include-styles"]');
      
      // Step 4: Generate code
      await page.click('[data-testid="generate-code-btn"]');
      
      // Wait for code generation to complete
      await page.waitForSelector('[data-testid="code-preview"]', { timeout: 30000 });
      
      // Verify code preview is displayed
      const codeFiles = await page.locator('[data-testid="file-tab"]').count();
      expect(codeFiles).toBeGreaterThan(0);
      
      // Step 5: Download generated code
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('[data-testid="download-code-btn"]')
      ]);
      
      // Verify download
      expect(download.suggestedFilename()).toContain('.zip');
      
      // Measure total journey time
      const totalTime = await page.evaluate(() => performance.now());
      expect(totalTime).toBeLessThan(60000); // Complete journey in under 60 seconds
    });

    it('should handle errors gracefully during the flow', async () => {
      await page.goto('http://localhost:3000');
      
      // Simulate network error
      await context.route('**/api/v1/images/upload', route => route.abort());
      
      // Try to upload an image
      const uploadArea = await page.locator('[data-testid="upload-area"]');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        uploadArea.click()
      ]);
      
      await fileChooser.setFiles('./test-fixtures/test-image.png');
      
      // Should show error message
      await page.waitForSelector('[data-testid="error-message"]');
      const errorText = await page.textContent('[data-testid="error-message"]');
      expect(errorText).toContain('Failed to upload');
      
      // Should allow retry
      const retryButton = await page.locator('[data-testid="retry-button"]');
      expect(await retryButton.isVisible()).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(viewport => {
      it(`should work on ${viewport.name} viewport`, async () => {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:3000');
        
        // Verify layout adapts to viewport
        const uploadArea = await page.locator('[data-testid="upload-area"]');
        expect(await uploadArea.isVisible()).toBe(true);
        
        // Check if mobile menu is visible on small screens
        if (viewport.width < 768) {
          const mobileMenu = await page.locator('[data-testid="mobile-menu-button"]');
          expect(await mobileMenu.isVisible()).toBe(true);
        }
        
        // Verify all critical elements are accessible
        const criticalElements = [
          '[data-testid="upload-area"]',
          '[data-testid="framework-select"]',
          '[data-testid="generate-code-btn"]'
        ];
        
        for (const selector of criticalElements) {
          const element = await page.locator(selector);
          expect(await element.isVisible()).toBe(true);
        }
      });
    });
  });

  describe('Performance Tests', () => {
    it('should load the application quickly', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle'
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Page should load in under 3 seconds
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return {
          lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
          fid: performance.getEntriesByType('first-input')[0]?.processingStart,
          cls: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0)
        };
      });
      
      expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
      expect(metrics.cls).toBeLessThan(0.1);  // CLS < 0.1
    });

    it('should handle multiple concurrent uploads', async () => {
      await page.goto('http://localhost:3000');
      
      const uploadCount = 5;
      const uploadPromises = [];
      
      for (let i = 0; i < uploadCount; i++) {
        const newPage = await context.newPage();
        await newPage.goto('http://localhost:3000');
        
        uploadPromises.push(
          newPage.evaluate(async () => {
            // Simulate file upload via API
            const response = await fetch('/api/v1/images/upload', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer test-token'
              },
              body: new FormData()
            });
            return response.ok;
          })
        );
      }
      
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r).length;
      
      expect(successCount).toBe(uploadCount); // All uploads should succeed
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      await page.goto('http://localhost:3000');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Continue tabbing through all interactive elements
      const interactiveElements = await page.$$('[tabindex], button, input, select, a');
      
      for (let i = 0; i < interactiveElements.length; i++) {
        await page.keyboard.press('Tab');
        const element = await page.evaluate(() => document.activeElement);
        expect(element).toBeTruthy();
      }
    });

    it('should have proper ARIA labels', async () => {
      await page.goto('http://localhost:3000');
      
      // Check for ARIA labels on key elements
      const uploadArea = await page.locator('[data-testid="upload-area"]');
      const ariaLabel = await uploadArea.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      
      // Check form inputs have labels
      const inputs = await page.$$('input, select');
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const label = await page.$(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    });

    it('should pass automated accessibility tests', async () => {
      await page.goto('http://localhost:3000');
      
      // Inject axe-core for accessibility testing
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
      });
      
      // Run accessibility tests
      const violations = await page.evaluate(async () => {
        const results = await window.axe.run();
        return results.violations;
      });
      
      // Log any violations for debugging
      if (violations.length > 0) {
        console.log('Accessibility violations:', violations);
      }
      
      // Critical violations should be zero
      const criticalViolations = violations.filter(v => v.impact === 'critical');
      expect(criticalViolations).toHaveLength(0);
    });
  });

  describe('Browser Compatibility', () => {
    const browsers = ['chromium', 'firefox', 'webkit'];
    
    browsers.forEach(browserType => {
      it(`should work in ${browserType}`, async () => {
        const testBrowser = await playwright[browserType].launch();
        const testContext = await testBrowser.newContext();
        const testPage = await testContext.newPage();
        
        await testPage.goto('http://localhost:3000');
        
        // Verify basic functionality works
        const uploadArea = await testPage.locator('[data-testid="upload-area"]');
        expect(await uploadArea.isVisible()).toBe(true);
        
        await testBrowser.close();
      });
    });
  });

  afterAll(() => {
    const stats = metricsCollector.getStats();
    console.log('E2E Test Performance Statistics:', {
      ...stats,
      averagePageLoadTime: (stats.averageDuration).toFixed(2) + 'ms'
    });
  });
});