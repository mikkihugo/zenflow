import { chromium } from 'playwright';

async function testWebInterface() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to http://localhost:3000');
        await page.goto('http://localhost:3000');
        
        // Wait for page to load and try to trigger some JavaScript
        await page.waitForTimeout(3000);
        
        // Try to manually trigger console.log to see if we can see JS output
        await page.evaluate(() => {
            console.log('🧪 Test log from Playwright');
            if (window.dashboard) {
                console.log('🎛️ Dashboard object methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.dashboard)));
            }
        });
        
        // Check if dashboard loads
        const title = await page.title();
        console.log('📄 Page title:', title);
        
        // Check if dashboard object exists
        const dashboardExists = await page.evaluate(() => {
            return typeof window.dashboard !== 'undefined';
        });
        console.log('🎛️ Dashboard object exists:', dashboardExists);
        
        // Check for JavaScript errors and logs
        const errors = [];
        const logs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console error:', msg.text());
                errors.push(msg.text());
            } else if (msg.type() === 'log') {
                console.log('📋 Console log:', msg.text());
                logs.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            console.log('💥 Page error:', error.message);
            errors.push(error.message);
        });
        
        // Check if sidebar buttons exist
        const sidebarButtons = await page.locator('.menu-item').count();
        console.log('📋 Sidebar buttons found:', sidebarButtons);
        
        // Check global project filter BEFORE visiting Projects tab
        const globalFilterBeforeProjects = await page.locator('#global-project-filter').isVisible();
        console.log('🌐 Global project filter visible before Projects tab:', globalFilterBeforeProjects);
        
        if (globalFilterBeforeProjects) {
            const optionsBeforeProjects = await page.locator('#global-project-filter option').count();
            console.log('🔢 Global filter options BEFORE Projects tab:', optionsBeforeProjects);
        }
        
        // Check if switchTab method exists
        const switchTabExists = await page.evaluate(() => {
            return window.dashboard && typeof window.dashboard.switchTab === 'function';
        });
        console.log('🔄 switchTab method exists:', switchTabExists);
        
        // Try calling switchTab manually
        if (switchTabExists) {
            console.log('🧪 Manually calling switchTab("projects")...');
            await page.evaluate(() => {
                window.dashboard.switchTab('projects');
            });
            await page.waitForTimeout(500);
        }
        
        // Try clicking Projects tab
        console.log('🚀 Clicking Projects tab...');
        
        // Check initial active tab
        const initialActiveTab = await page.locator('.tab-content.active').getAttribute('id');
        console.log('🎯 Initial active tab:', initialActiveTab);
        
        await page.click('[data-tab="projects"]');
        await page.waitForTimeout(1000);
        
        // Check active tab after click
        const newActiveTab = await page.locator('.tab-content.active').getAttribute('id');
        console.log('🎯 Active tab after click:', newActiveTab);
        
        // Check if projects content is visible
        const projectsContent = await page.locator('#projects').isVisible();
        console.log('📦 Projects content visible:', projectsContent);
        
        // Check if Create Project button exists
        const createButton = await page.locator('text=Create Project').count();
        console.log('➕ Create Project buttons found:', createButton);
        
        // Try clicking Create Project button (only if projects content is visible)
        if (createButton > 0 && projectsContent) {
            console.log('🎯 Clicking Create Project button...');
            try {
                await page.click('text=Create Project');
                await page.waitForTimeout(1000);
            } catch (error) {
                console.log('⚠️ Could not click Create Project button:', error.message);
            }
        } else if (createButton > 0 && !projectsContent) {
            console.log('⚠️ Create Project button exists but Projects content is not visible');
        }
        
        // Check global project filter
        const globalFilter = await page.locator('#global-project-filter').isVisible();
        console.log('🌐 Global project filter visible:', globalFilter);
        
        if (globalFilter) {
            // Check how many options are in the global dropdown
            const globalFilterOptions = await page.locator('#global-project-filter option').count();
            console.log('🔢 Global filter options count:', globalFilterOptions);
            
            // Get the option texts
            const optionTexts = await page.locator('#global-project-filter option').allTextContents();
            console.log('📋 Global filter options:', optionTexts);
        }
        
        // Take a screenshot
        await page.screenshot({ path: '/tmp/web-interface-test.png' });
        console.log('📸 Screenshot saved to /tmp/web-interface-test.png');
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
    }
}

testWebInterface().catch(console.error);