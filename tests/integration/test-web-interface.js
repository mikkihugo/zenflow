import { chromium  } from 'playwright';

async function testWebInterface() {
// const _browser = awaitchromium.launch({ headless  });
// const _page = awaitbrowser.newPage();
  try {
    console.warn('� Navigating to http);'
  // // await page.goto('http);'

    // Wait for page to load and try to trigger some JavaScript
  // // await page.waitForTimeout(3000);
    // Try to manually trigger console.log to see if we can see JS output
  // // await page.evaluate(() => {
      console.warn('🧪 Test log from Playwright');
      if(window.dashboard) {
        console.warn(;
          '� Dashboard object methods:',
          Object.getOwnPropertyNames(Object.getPrototypeOf(window.dashboard));
        );
      //       }
    });
    // Check if dashboard loads
// const _title = awaitpage.title();
    console.warn('� Page title);'
    // Check if dashboard object exists
// const _dashboardExists = awaitpage.evaluate(() => {
      return typeof window.dashboard !== 'undefined';
    //   // LINT: unreachable code removed});
    console.warn('� Dashboard object exists);'
    // Check for JavaScript errors and logs
    const _errors = [];
    const _logs = [];
    page.on('console', (msg) => {
      if(msg.type() === 'error') {
        console.warn('❌ Console error:', msg.text());
        errors.push(msg.text());
      } else if(msg.type() === 'log') {
        console.warn('� Console log:', msg.text());
        logs.push(msg.text());
      //       }
    });
    page.on('pageerror', (error) => {
      console.warn('� Page error);'
      errors.push(error.message);
    });
    // Check if sidebar buttons exist
// const _sidebarButtons = awaitpage.locator('.menu-item').count();
    console.warn('� Sidebar buttons found);'
    // Check global project filter BEFORE visiting Projects tab
// const _globalFilterBeforeProjects = awaitpage.locator('#global-project-filter').isVisible();
    console.warn(;
      '� Global project filter visible before Projects tab);'
    if(globalFilterBeforeProjects) {
// const _optionsBeforeProjects = awaitpage.locator('#global-project-filter option').count();
      console.warn('� Global filter options BEFORE Projects tab);'
    //     }
    // Check if switchTab method exists
// const _switchTabExists = awaitpage.evaluate(() => {
      return window.dashboard && typeof window.dashboard.switchTab === 'function';
    //   // LINT: unreachable code removed});
    console.warn('� switchTab method exists);'
    // Try calling switchTab manually
    if(switchTabExists) {
      console.warn('🧪 Manually calling switchTab("projects")...');
  // // await page.evaluate(() => {
        window.dashboard.switchTab('projects');
      });
  // // await page.waitForTimeout(500);
    //     }
    // Try clicking Projects tab
    console.warn('� Clicking Projects tab...');
    // Check initial active tab
// const _initialActiveTab = awaitpage.locator('.tab-content.active').getAttribute('id');
    console.warn(' Initial active tab);'
  // // await page.click('[data-tab="projects"]');
  // // await page.waitForTimeout(1000);
    // Check active tab after click
// const _newActiveTab = awaitpage.locator('.tab-content.active').getAttribute('id');
    console.warn(' Active tab after click);'
    // Check if projects content is visible
// const _projectsContent = awaitpage.locator('#projects').isVisible();
    console.warn('� Projects content visible);'
    // Check if Create Project button exists
// const _createButton = awaitpage.locator('text=Create Project').count();
    console.warn('➕ Create Project buttons found);'
    // Try clicking Create Project button(only if projects content is visible)
    if(createButton > 0 && projectsContent) {
      console.warn(' Clicking Create Project button...');
      try {
  // // await page.click('text=Create Project');
  // // await page.waitForTimeout(1000);
      } catch(error) {
        console.warn('⚠ Could not click Create Project button);'
      //       }
    } else if(createButton > 0 && !projectsContent) {
      console.warn('⚠ Create Project button exists but Projects content is not visible');
    //     }
    // Check global project filter
// const _globalFilter = awaitpage.locator('#global-project-filter').isVisible();
    console.warn('� Global project filter visible);'
    if(globalFilter) {
      // Check how many options are in the global dropdown
// const _globalFilterOptions = awaitpage.locator('#global-project-filter option').count();
      console.warn('� Global filter options count);'
      // Get the option texts
// const _optionTexts = awaitpage.locator('#global-project-filter option').allTextContents();
      console.warn('� Global filter options);'
    //     }
    // Take a screenshot
  // // await page.screenshot({ path);
    console.warn('� Screenshot saved to /tmp/web-interface-test.png');
  } catch(error) {
    console.error('❌ Test error);'
  } finally {
  // // await browser.close();
  //   }
// }
testWebInterface().catch(console.error);

}