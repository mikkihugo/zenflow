import { chromium } from 'playwright';

async function testWebInterface(): unknown {
  const _browser = await chromium.launch({ headless: true });
  const _page = await browser.newPage();
;
  try {
    console.warn('🌐 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');

    // Wait for page to load and try to trigger some JavaScript
    await page.waitForTimeout(3000);
;
    // Try to manually trigger console.log to see if we can see JS output
    await page.evaluate(() => {
      console.warn('🧪 Test log from Playwright');
      if (window.dashboard) {
        console.warn(;
          '🎛️ Dashboard object methods:',;
          Object.getOwnPropertyNames(Object.getPrototypeOf(window.dashboard));
        );
      }
    });
;
    // Check if dashboard loads
    const _title = await page.title();
    console.warn('📄 Page title:', title);
;
    // Check if dashboard object exists
    const _dashboardExists = await page.evaluate(() => {
      return typeof window.dashboard !== 'undefined';
    //   // LINT: unreachable code removed});
    console.warn('🎛️ Dashboard object exists:', dashboardExists);
;
    // Check for JavaScript errors and logs
    const _errors = [];
    const _logs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.warn('❌ Console error:', msg.text());
        errors.push(msg.text());
      } else if (msg.type() === 'log') {
        console.warn('📋 Console log:', msg.text());
        logs.push(msg.text());
      }
    });
;
    page.on('pageerror', (error) => {
      console.warn('💥 Page error:', error.message);
      errors.push(error.message);
    });
;
    // Check if sidebar buttons exist
    const _sidebarButtons = await page.locator('.menu-item').count();
    console.warn('📋 Sidebar buttons found:', sidebarButtons);
;
    // Check global project filter BEFORE visiting Projects tab
    const _globalFilterBeforeProjects = await page.locator('#global-project-filter').isVisible();
    console.warn(;
      '🌐 Global project filter visible before Projects tab:',;
      globalFilterBeforeProjects;
    );
;
    if (globalFilterBeforeProjects) {
      const _optionsBeforeProjects = await page.locator('#global-project-filter option').count();
      console.warn('🔢 Global filter options BEFORE Projects tab:', optionsBeforeProjects);
    }
;
    // Check if switchTab method exists
    const _switchTabExists = await page.evaluate(() => {
      return window.dashboard && typeof window.dashboard.switchTab === 'function';
    //   // LINT: unreachable code removed});
    console.warn('🔄 switchTab method exists:', switchTabExists);
;
    // Try calling switchTab manually
    if (switchTabExists) {
      console.warn('🧪 Manually calling switchTab("projects")...');
      await page.evaluate(() => {
        window.dashboard.switchTab('projects');
      });
      await page.waitForTimeout(500);
    }
;
    // Try clicking Projects tab
    console.warn('🚀 Clicking Projects tab...');
;
    // Check initial active tab
    const _initialActiveTab = await page.locator('.tab-content.active').getAttribute('id');
    console.warn('🎯 Initial active tab:', initialActiveTab);
;
    await page.click('[data-tab="projects"]');
    await page.waitForTimeout(1000);
;
    // Check active tab after click
    const _newActiveTab = await page.locator('.tab-content.active').getAttribute('id');
    console.warn('🎯 Active tab after click:', newActiveTab);
;
    // Check if projects content is visible
    const _projectsContent = await page.locator('#projects').isVisible();
    console.warn('📦 Projects content visible:', projectsContent);
;
    // Check if Create Project button exists
    const _createButton = await page.locator('text=Create Project').count();
    console.warn('➕ Create Project buttons found:', createButton);
;
    // Try clicking Create Project button (only if projects content is visible)
    if (createButton > 0 && projectsContent) {
      console.warn('🎯 Clicking Create Project button...');
      try {
        await page.click('text=Create Project');
        await page.waitForTimeout(1000);
      } catch (/* error */) {
        console.warn('⚠️ Could not click Create Project button:', error.message);
      }
    } else if (createButton > 0 && !projectsContent) {
      console.warn('⚠️ Create Project button exists but Projects content is not visible');
    }
;
    // Check global project filter
    const _globalFilter = await page.locator('#global-project-filter').isVisible();
    console.warn('🌐 Global project filter visible:', globalFilter);
;
    if (globalFilter) {
      // Check how many options are in the global dropdown
      const _globalFilterOptions = await page.locator('#global-project-filter option').count();
      console.warn('🔢 Global filter options count:', globalFilterOptions);
;
      // Get the option texts
      const _optionTexts = await page.locator('#global-project-filter option').allTextContents();
      console.warn('📋 Global filter options:', optionTexts);
    }
;
    // Take a screenshot
    await page.screenshot({ path: '/tmp/web-interface-test.png' });
    console.warn('📸 Screenshot saved to /tmp/web-interface-test.png');
  } catch (/* error */) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}
;
testWebInterface().catch(console.error);
;
