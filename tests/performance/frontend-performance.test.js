const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');

describe('前端性能测试', () => {
    let browser;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('页面加载性能', () => {
        test('客户端首页加载时间应小于3秒', async () => {
            const page = await browser.newPage();
            
            // 启用性能监控
            await page.setViewport({ width: 1920, height: 1080 });
            
            const startTime = performance.now();
            await page.goto('http://localhost:3001', { 
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            const loadTime = performance.now() - startTime;
            
            console.log(`客户端首页加载时间: ${loadTime}ms`);
            
            // 检查核心内容是否加载
            await page.waitForSelector('.featured-events');
            const contentLoadTime = performance.now() - startTime;
            
            console.log(`核心内容加载时间: ${contentLoadTime}ms`);
            
            expect(loadTime).toBeLessThan(3000); // 总加载时间应小于3秒
            expect(contentLoadTime).toBeLessThan(2000); // 核心内容应更快加载
            
            await page.close();
        });

        test('管理端仪表板加载时间应小于2秒', async () => {
            const page = await browser.newPage();
            
            const startTime = performance.now();
            await page.goto('http://localhost:3002', { 
                waitUntil: 'networkidle0' 
            });
            const loadTime = performance.now() - startTime;
            
            console.log(`管理端仪表板加载时间: ${loadTime}ms`);
            
            await page.waitForSelector('.stats-grid');
            const contentLoadTime = performance.now() - startTime;
            
            console.log(`统计卡片加载时间: ${contentLoadTime}ms`);
            
            expect(loadTime).toBeLessThan(2000);
            
            await page.close();
        });
    });

    describe('前端资源优化检查', () => {
        test('检查未压缩的资源', async () => {
            const page = await browser.newPage();
            
            await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
            
            const resources = await page.evaluate(() => {
                return performance.getEntriesByType('resource')
                    .filter(entry => 
                        entry.name.includes('.js') || 
                        entry.name.includes('.css') ||
                        entry.name.includes('.png') ||
                        entry.name.includes('.jpg')
                    )
                    .map(entry => ({
                        name: entry.name,
                        size: entry.transferSize,
                        duration: entry.duration
                    }));
            });
            
            console.log('资源加载分析:');
            resources.forEach(resource => {
                console.log(`- ${resource.name}: ${resource.size} bytes, ${resource.duration}ms`);
                
                // 检查大文件
                if (resource.size > 500000) { // 500KB
                    console.warn(`⚠️ 大文件警告: ${resource.name} (${resource.size} bytes)`);
                }
            });
            
            // 检查是否有未压缩的JS/CSS文件
            const largeUncompressed = resources.filter(r => 
                (r.name.includes('.js') || r.name.includes('.css')) && 
                r.size > 100000
            );
            
            expect(largeUncompressed.length).toBe(0);
            
            await page.close();
        });
    });

    describe('AngularJS应用性能', () => {
        test('检查AngularJS digest cycle性能', async () => {
            const page = await browser.newPage();
            
            await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle0' });
            
            // 模拟用户交互并测量响应时间
            const interactionTimes = [];
            
            // 测试搜索功能响应时间
            const searchStart = performance.now();
            await page.type('input[ng-model*="searchQuery"]', '测试');
            await page.waitForTimeout(100); // 等待AngularJS处理
            const searchTime = performance.now() - searchStart;
            interactionTimes.push(searchTime);
            
            console.log(`搜索输入响应时间: ${searchTime}ms`);
            
            // 测试筛选功能响应时间
            const filterStart = performance.now();
            await page.select('select[ng-model*="filters.category"]', '1');
            await page.waitForTimeout(100);
            const filterTime = performance.now() - filterStart;
            interactionTimes.push(filterTime);
            
            console.log(`分类筛选响应时间: ${filterTime}ms`);
            
            // 平均交互响应时间应小于100ms
            const averageTime = interactionTimes.reduce((a, b) => a + b) / interactionTimes.length;
            expect(averageTime).toBeLessThan(100);
            
            await page.close();
        });
    });
});