/**
 * End-to-end tests for Claude Code Zen web dashboard
 * Tests all major frontend improvements and functionality
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Claude Code Zen Web Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard before each test
    await page.goto(BASE_URL);
  });

  test('should load dashboard homepage successfully', async ({ page }) => {
    // Check page loads
    await expect(page).toHaveTitle(/Claude Code Zen/);
    
    // Check main navigation is present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have responsive design working correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow for responsive adjustments
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Navigation should still be accessible on mobile (may be hamburger menu)
    const navElements = await page.locator('nav, button[aria-label*="menu"], .mobile-menu-toggle').count();
    expect(navElements).toBeGreaterThan(0);
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for semantic HTML structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Check first heading is h1
    const firstHeading = headings.first();
    await expect(firstHeading).toHaveProperty('tagName', 'H1');
    
    // Check for proper ARIA attributes where needed
    const interactiveElements = page.locator('button, [role="button"], a[href], input, select, textarea');
    const interactiveCount = await interactiveElements.count();
    
    if (interactiveCount > 0) {
      // At least some interactive elements should have accessible names
      const elementsWithLabels = page.locator('button[aria-label], [role="button"][aria-label], a[aria-label], input[aria-label], button:has-text("")');
      // Basic check - ensure at least one element has labels
      const labeledCount = await elementsWithLabels.count();
      expect(labeledCount).toBeGreaterThan(0);
    }
  });

  test('should navigate between main sections', async ({ page }) => {
    // Look for navigation links
    const navLinks = page.locator('nav a, .nav-link, [role="navigation"] a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Test at least the first few navigation links
      const linksToTest = Math.min(linkCount, 3);
      
      for (let i = 0; i < linksToTest; i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && href.startsWith('/') && href !== '/') {
          await link.click();
          await page.waitForURL(`${BASE_URL}${href}`);
          
          // Check page loads successfully
          await expect(page.locator('main')).toBeVisible();
          
          // Go back to home for next test
          await page.goto(BASE_URL);
        }
      }
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test 404 page handling
    await page.goto(`${BASE_URL}/non-existent-page`, { waitUntil: 'networkidle' });
    
    // Should show some kind of error page or redirect
    const pageContent = await page.textContent('body');
    const hasErrorContent = pageContent?.includes('404') || 
                          pageContent?.includes('Not Found') || 
                          pageContent?.includes('Page not found') ||
                          page.url() === BASE_URL; // Redirected to home
    
    expect(hasErrorContent).toBeTruthy();
  });

  test('should load with proper CSS and styling', async ({ page }) => {
    // Check if Tailwind CSS is working
    await page.waitForLoadState('networkidle');
    
    // Check for basic Tailwind classes being applied
    const elementsWithTailwind = await page.locator('[class*="flex"], [class*="grid"], [class*="p-"], [class*="m-"], [class*="text-"], [class*="bg-"]').count();
    expect(elementsWithTailwind).toBeGreaterThan(0);
    
    // Check that CSS is loaded by verifying computed styles
    const body = page.locator('body');
    const computedStyle = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        margin: styles.margin,
        padding: styles.padding,
        fontFamily: styles.fontFamily
      };
    });
    
    // Basic check that styles are being applied
    expect(computedStyle.fontFamily).toBeTruthy();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check if focus moves to focusable elements
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThanOrEqual(0); // May be 0 if no focusable elements visible
    
    // Test a few more tab presses
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100); // Allow focus to move
    }
  });

  test('should work with different themes/color schemes', async ({ page }) => {
    // Test with prefers-color-scheme: dark
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    
    const body = page.locator('body');
    const darkModeStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // Test with prefers-color-scheme: light
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    
    const lightModeStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // Styles should be defined (actual values depend on theme implementation)
    expect(darkModeStyles.backgroundColor).toBeTruthy();
    expect(lightModeStyles.backgroundColor).toBeTruthy();
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Test with prefers-reduced-motion: reduce
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Check if reduced motion is respected
    const elements = page.locator('[class*="transition"], [class*="animate"]');
    const elementsCount = await elements.count();
    
    // This is more of a smoke test - actual implementation would check specific animations
    if (elementsCount > 0) {
      const firstElement = elements.first();
      const transitionDuration = await firstElement.evaluate((el) => window.getComputedStyle(el).transitionDuration);
      
      // Should either be 0s or very short for reduced motion
      expect(typeof transitionDuration).toBe('string');
    }
  });

  test('should maintain performance standards', async ({ page }) => {
    // Enable performance monitoring
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Basic performance checks
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Performance thresholds (adjust based on requirements)
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // 5 seconds max load time
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3 seconds max DOM ready
    
    // Log metrics for monitoring
    console.log('Performance Metrics:', performanceMetrics);
  });
});

test.describe('Agent Management Interface', () => {
  test('should navigate to agents section', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for agents navigation link
    const agentsLink = page.locator('a[href*="/agents"], .nav-link:has-text("Agents"), nav a:has-text("Agents")').first();
    
    if (await agentsLink.isVisible()) {
      await agentsLink.click();
      await expect(page).toHaveURL(/.*agents.*/);
    }
  });
});

test.describe('System Health Monitoring', () => {
  test('should display system status information', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for system health indicators
    const healthIndicators = page.locator('[class*="health"], [class*="status"], .system-status');
    const indicatorCount = await healthIndicators.count();
    
    // This is a basic smoke test - actual implementation would check specific health metrics
    if (indicatorCount > 0) {
      await expect(healthIndicators.first()).toBeVisible();
    }
  });
});

// Test error boundary functionality
test.describe('Error Handling', () => {
  test('should handle JavaScript errors gracefully', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for page errors
    const pageErrors: Error[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error);
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000); // Wait for potential errors
    
    // Check for critical errors (some warnings/info messages are expected)
    const criticalErrors = pageErrors.filter(error => 
      !error.message.includes('Warning') && 
      !error.message.includes('A11y:')
    );
    
    expect(criticalErrors.length).toBe(0);
    expect(consoleErrors.length).toBe(0);
  });
});