const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
  const subPages = [
    '/system',
    '/agents', 
    '/safe',
    '/events',
    '/memory'
  ];

  const results = [];

  for (const subPage of subPages) {
    const page = await browser.newPage();
    const url = `${baseUrl}${subPage}`;
    
    console.log(`\n=== Testing ${url} ===`);
    
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
      // Capture console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          result.errors.push(msg.text());
          console.log(`Console Error: ${msg.text()}`);
        }
      });

      // Capture network failures
      page.on('response', response => {
        if (!response.ok()) {
          result.networkErrors.push(`${response.status()} ${response.url()}`);
          console.log(`Network Error: ${response.status()} ${response.url()}`);
        }
      });

      console.log(`Loading ${url}...`);
      
      // Navigate to the page
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      result.status = response.status();
      console.log(`Response status: ${result.status}`);

      // Wait a bit for SPA to potentially load
      await page.waitForTimeout(3000);

      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, result.screenshot);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);

      // Check if page has meaningful content (not just white screen)
      const bodyText = await page.$eval('body', el => el.textContent);
      const hasVisibleContent = await page.evaluate(() => {
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

      result.hasContent = hasVisibleContent;
      result.bodyTextLength = bodyText?.length || 0;

      // Check for SvelteKit specific elements
      const hasSvelteKit = await page.evaluate(() => !!(document.querySelector('[data-sveltekit]') || 
                 document.querySelector('script[type="module"]') ||
                 window.__SVELTEKIT__));

      // Check for loading indicators
      const hasLoadingIndicator = await page.evaluate(() => !!(document.querySelector('[data-loading]') ||
                 document.querySelector('.loading') ||
                 document.querySelector('.spinner')));

      console.log(`Has content: ${hasVisibleContent}`);
      console.log(`Body text length: ${result.bodyTextLength}`);
      console.log(`Has SvelteKit elements: ${hasSvelteKit}`);
      console.log(`Has loading indicator: ${hasLoadingIndicator}`);
      console.log(`Console errors: ${result.errors.length}`);
      console.log(`Network errors: ${result.networkErrors.length}`);

      // Additional checks for white screen detection
      const backgroundColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      
      result.backgroundColor = backgroundColor;
      
      if (!hasVisibleContent && result.bodyTextLength < 50) {
        result.status = 'WHITE_SCREEN';
        console.log('🚨 WHITE SCREEN DETECTED');
      } else {
        result.status = 'CONTENT_LOADED';
        console.log('✅ Content appears to be loaded');
      }

    } catch (error) {
      result.status = 'ERROR';
      result.errors.push(error.message);
      console.log(`Error loading page: ${error.message}`);
      
      // Still try to take a screenshot for debugging
      try {
        const screenshotPath = path.join(screenshotsDir, result.screenshot);
        await page.screenshot({ path: screenshotPath, fullPage: true });
      } catch (screenshotError) {
        console.log(`Could not take screenshot: ${screenshotError.message}`);
      }
    }

    results.push(result);
    await page.close();
  }

  await browser.close();

  // Generate report
  console.log(`\n${  '='.repeat(60)}`);
  console.log('FINAL REPORT');
  console.log('='.repeat(60));

  for (const result of results) {
    console.log(`\n📄 ${result.url}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Has Content: ${result.hasContent}`);
    console.log(`   Body Text Length: ${result.bodyTextLength}`);
    console.log(`   Background Color: ${result.backgroundColor || 'N/A'}`);
    console.log(`   Console Errors: ${result.errors.length}`);
    console.log(`   Network Errors: ${result.networkErrors.length}`);
    console.log(`   Screenshot: ${result.screenshot}`);
    
    if (result.errors.length > 0) {
      console.log(`   🚨 Console Errors:`);
      for (const error of result.errors) console.log(`     - ${error}`);
    }
    
    if (result.networkErrors.length > 0) {
      console.log(`   🌐 Network Errors:`);
      for (const error of result.networkErrors) console.log(`     - ${error}`);
    }
  }

  const workingPages = results.filter(r => r.status === 'CONTENT_LOADED');
  const whiteScreenPages = results.filter(r => r.status === 'WHITE_SCREEN');
  const errorPages = results.filter(r => r.status === 'ERROR');

  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Working pages: ${workingPages.length}`);
  console.log(`   ⚪ White screen pages: ${whiteScreenPages.length}`);
  console.log(`   ❌ Error pages: ${errorPages.length}`);

  if (whiteScreenPages.length > 0) {
    console.log(`\n🚨 WHITE SCREEN PAGES:`);
    for (const page of whiteScreenPages) console.log(`   - ${page.url}`);
  }

  if (errorPages.length > 0) {
    console.log(`\n❌ ERROR PAGES:`);
    for (const page of errorPages) console.log(`   - ${page.url}: ${page.errors.join(', ')}`);
  }

  // Save detailed report to JSON
  const reportPath = path.join(__dirname, 'subpage-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return results;
}

// Run the test
testSubPages().catch(console.error);