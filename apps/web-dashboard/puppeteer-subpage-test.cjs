/* eslint-env node, browser */
const logger = console;

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function setupPageEventHandlers(page, result) {
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      result.errors.push(msg.text());
      logger.info(`Console Error: ${msg.text()}`);
    }
  });

  // Capture network failures
  page.on('response', response => {
    if (!response.ok()) {
      result.networkErrors.push(`${response.status()} ${response.url()}`);
      logger.info(`Network Error: ${response.status()} ${response.url()}`);
    }
  });
}

async function checkPageContent(page) {
  const bodyText = await page.$eval('body', el => el.textContent);
  const hasVisibleContent = await page.evaluate(() => {
    /* eslint-env browser */
    
    // Check if there are visible elements beyond just whitespace
    const {body} = document;
    const rect = body.getBoundingClientRect();
    const hasSize = rect.width > 0 && rect.height > 0;
    
    // Check for visible text content
    const textContent = body.textContent?.trim() || '';
    const hasText = textContent.length > 10; // More than just whitespace
    
    // Check for visible elements
    const visibleElements = Array.from(body.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    return hasSize && (hasText || visibleElements.length > 5);
  });

  return { hasVisibleContent, bodyTextLength: bodyText?.length || 0 };
}

async function checkFrameworkElements(page) {
  const hasSvelteKit = await page.evaluate(() => {
    /* eslint-env browser */
    
    return !!(document.querySelector('[data-sveltekit]') || 
             document.querySelector('script[type="module"]') ||
             window.__SVELTEKIT__);
  });

  const hasLoadingIndicator = await page.evaluate(() => {
    /* eslint-env browser */
    
    return !!(document.querySelector('[data-loading]') ||
             document.querySelector('.loading') ||
             document.querySelector('.spinner'));
  });

  const backgroundColor = await page.evaluate(() => {
    /* eslint-env browser */
    
    return window.getComputedStyle(document.body).backgroundColor;
  });

  return { hasSvelteKit, hasLoadingIndicator, backgroundColor };
}

async function testSinglePage(browser, baseUrl, subPage, screenshotsDir) {
  const page = await browser.newPage();
  const url = `${baseUrl}${subPage}`;
  
  logger.info(`\n=== Testing ${url} ===`);
  
  const result = {
    url,
    path: subPage,
    status: 'unknown',
    errors: [],
    networkErrors: [],
    hasContent: false,
    screenshot: `screenshot-${subPage.replace('/', '')}.png`
  };

  try {
    await setupPageEventHandlers(page, result);

    logger.info(`Loading ${url}...`);
    
    // Navigate to the page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    result.status = response.status();
    logger.info(`Response status: ${result.status}`);

    // Wait a bit for SPA to potentially load
    await page.waitForTimeout(3000);

    // Take screenshot
    const screenshotPath = path.join(screenshotsDir, result.screenshot);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Screenshot saved: ${screenshotPath}`);

    // Check page content
    const contentCheck = await checkPageContent(page);
    result.hasContent = contentCheck.hasVisibleContent;
    result.bodyTextLength = contentCheck.bodyTextLength;

    // Check framework elements
    const frameworkCheck = await checkFrameworkElements(page);
    result.backgroundColor = frameworkCheck.backgroundColor;

    logger.info(`Has content: ${result.hasContent}`);
    logger.info(`Body text length: ${result.bodyTextLength}`);
    logger.info(`Has SvelteKit elements: ${frameworkCheck.hasSvelteKit}`);
    logger.info(`Has loading indicator: ${frameworkCheck.hasLoadingIndicator}`);
    logger.info(`Console errors: ${result.errors.length}`);
    logger.info(`Network errors: ${result.networkErrors.length}`);

    // Determine final status
    if (!result.hasContent && result.bodyTextLength < 50) {
      result.status = 'WHITE_SCREEN';
      logger.info('🚨 WHITE SCREEN DETECTED');
    } else {
      result.status = 'CONTENT_LOADED';
      logger.info('✅ Content appears to be loaded');
    }

  } catch (error) {
    result.status = 'ERROR';
    result.errors.push(error.message);
    logger.info(`Error loading page: ${error.message}`);
    
    // Still try to take a screenshot for debugging
    try {
      const screenshotPath = path.join(screenshotsDir, result.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (screenshotError) {
      logger.info(`Could not take screenshot: ${screenshotError.message}`);
    }
  }

  await page.close();
  return result;
}

async function testSubPages() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const baseUrl = 'https://fra-d1.in.centralcloud.net';
  const subPages = ['/system', '/agents', '/safe', '/events', '/memory'];

  const results = [];

  for (const subPage of subPages) {
    const result = await testSinglePage(browser, baseUrl, subPage, screenshotsDir);
    results.push(result);
  }

  await browser.close();
  generateReport(results);

  return results;
}

function generateReport(results) {
  // Generate report
  logger.info(`\n${'='.repeat(60)}`);
  logger.info('FINAL REPORT');
  logger.info('='.repeat(60));

  for (const result of results) {
    logger.info(`\n📄 ${result.url}`);
    logger.info(`   Status: ${result.status}`);
    logger.info(`   Has Content: ${result.hasContent}`);
    logger.info(`   Body Text Length: ${result.bodyTextLength}`);
    logger.info(`   Background Color: ${result.backgroundColor || 'N/A'}`);
    logger.info(`   Console Errors: ${result.errors.length}`);
    logger.info(`   Network Errors: ${result.networkErrors.length}`);
    logger.info(`   Screenshot: ${result.screenshot}`);
    
    if (result.errors.length > 0) {
      logger.info(`   🚨 Console Errors:`);
      for (const error of result.errors) logger.info(`     - ${error}`);
    }
    
    if (result.networkErrors.length > 0) {
      logger.info(`   🌐 Network Errors:`);
      for (const error of result.networkErrors) logger.info(`     - ${error}`);
    }
  }

  const workingPages = results.filter(r => r.status === 'CONTENT_LOADED');
  const whiteScreenPages = results.filter(r => r.status === 'WHITE_SCREEN');
  const errorPages = results.filter(r => r.status === 'ERROR');

  logger.info(`\n📊 SUMMARY:`);
  logger.info(`   ✅ Working pages: ${workingPages.length}`);
  logger.info(`   ⚪ White screen pages: ${whiteScreenPages.length}`);
  logger.info(`   ❌ Error pages: ${errorPages.length}`);

  if (whiteScreenPages.length > 0) {
    logger.info(`\n🚨 WHITE SCREEN PAGES:`);
    for (const page of whiteScreenPages) logger.info(`   - ${page.url}`);
  }

  if (errorPages.length > 0) {
    logger.info(`\n❌ ERROR PAGES:`);
    for (const page of errorPages) logger.info(`   - ${page.url}: ${page.errors.join(', ')}`);
  }

  // Save detailed report to JSON
  const reportPath = path.join(__dirname, 'subpage-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  logger.info(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Run the test
// eslint-disable-next-line no-console
testSubPages().catch(console.error);