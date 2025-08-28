const puppeteer = require('puppeteer');
const fs = require('fs');

const pages = [
  { name: 'home', url: 'http://localhost:3000/', description: 'Dashboard home' },
  { name: 'system', url: 'http://localhost:3000/system', description: 'System status' },
  { name: 'agents', url: 'http://localhost:3000/agents', description: 'Agent management' },
  { name: 'database', url: 'http://localhost:3000/database', description: 'Database operations' },
  { name: 'swarm', url: 'http://localhost:3000/swarm', description: 'Swarm coordination' },
  { name: 'stories', url: 'http://localhost:3000/stories', description: 'User stories' },
  { name: 'safe', url: 'http://localhost:3000/safe', description: 'SAFe framework' },
  { name: 'performance', url: 'http://localhost:3000/performance', description: 'Performance metrics' },
  { name: 'analytics', url: 'http://localhost:3000/analytics', description: 'Analytics dashboard' },
  { name: 'settings', url: 'http://localhost:3000/settings', description: 'System settings' }
];

async function testAllPages() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const results = [];

  for (const page of pages) {
    const browserPage = await browser.newPage();
    const result = {
      name: page.name,
      url: page.url,
      description: page.description,
      loads: false,
      hasErrors: false,
      errors: [],
      dataType: 'unknown'
    };

    try {
      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          result.errors.push(msg.text());
          result.hasErrors = true;
        }
      });

      browserPage.on('pageerror', error => {
        result.errors.push(error.toString());
        result.hasErrors = true;
      });

      await browserPage.setViewport({ width: 1920, height: 1080 });
      
      console.log(`Testing ${page.name}: ${page.url}`);
      
      const response = await browserPage.goto(page.url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      if (response && response.status() < 400) {
        result.loads = true;
      }

      await browserPage.waitForTimeout(3000);

      const hasContent = await browserPage.evaluate(() => {
        const bodyText = document.body.innerText || '';
        const hasMockText = bodyText.includes('Mock') || bodyText.includes('mock') || bodyText.includes('Sample') || bodyText.includes('placeholder');
        const hasNoDataText = bodyText.includes('No data') || bodyText.includes('no data') || bodyText.includes('Loading');
        const hasCharts = document.querySelectorAll('canvas, svg, .chart').length > 0;
        const hasTables = document.querySelectorAll('table, .table').length > 0;
        const hasCards = document.querySelectorAll('.card, .metric, .stat').length > 0;
        
        return {
          contentLength: bodyText.length,
          hasMockText,
          hasNoDataText,
          hasCharts,
          hasTables,
          hasCards
        };
      });

      if (hasContent.hasMockText) {
        result.dataType = 'mock';
      } else if (hasContent.hasNoDataText) {
        result.dataType = 'empty';
      } else if (hasContent.hasCharts || hasContent.hasTables || hasContent.hasCards) {
        result.dataType = 'real';
      } else {
        result.dataType = 'minimal';
      }

      await browserPage.screenshot({ 
        path: `page-test-${page.name}.png`,
        fullPage: true 
      });

      console.log(`✅ ${page.name}: Loads=${result.loads}, Errors=${result.hasErrors}, Data=${result.dataType}`);

    } catch (error) {
      result.hasErrors = true;
      result.errors.push(error.toString());
      console.log(`❌ ${page.name}: ${error.message}`);
      
      try {
        await browserPage.screenshot({ 
          path: `page-test-${page.name}.png`,
          fullPage: true 
        });
      } catch (e) {}
    }

    await browserPage.close();
    results.push(result);
  }

  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalPages: pages.length,
    workingPages: results.filter(r => r.loads).length,
    brokenPages: results.filter(r => !r.loads).length,
    pagesWithErrors: results.filter(r => r.hasErrors).length,
    pagesWithRealData: results.filter(r => r.dataType === 'real').length,
    pagesWithMockData: results.filter(r => r.dataType === 'mock').length,
    results: results
  };
  
  fs.writeFileSync('dashboard-test-report.json', JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Testing Complete!`);
  console.log(`✅ Working pages: ${report.workingPages}/${report.totalPages}`);
  console.log(`❌ Broken pages: ${report.brokenPages}`);
  console.log(`📊 Real data pages: ${report.pagesWithRealData}`);
  console.log(`🎭 Mock data pages: ${report.pagesWithMockData}`);
  
  return results;
}

testAllPages().catch(console.error);