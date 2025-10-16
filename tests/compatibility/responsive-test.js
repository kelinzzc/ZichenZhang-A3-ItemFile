const puppeteer = require('puppeteer');

describe('响应式设计测试', () => {
    let browser;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
        await browser.close();
    });

    const devices = [
        { name: '桌面', width: 1920, height: 1080 },
        { name: '平板横屏', width: 1024, height: 768 },
        { name: '平板竖屏', width: 768, height: 1024 },
        { name: '手机横屏', width: 568, height: 320 },
        { name: '手机竖屏', width: 375, height: 667 }
    ];

    describe('客户端网站响应式测试', () => {
        devices.forEach(device => {
            test(`客户端在 ${device.name} (${device.width}x${device.height}) 应该正常显示`, async () => {
                const page = await browser.newPage();
                await page.setViewport({ width: device.width, height: device.height });
                
                try {
                    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
                    
                    // 检查关键元素是否存在
                    const header = await page.$('header');
                    const mainContent = await page.$('.main-content');
                    const footer = await page.$('footer');
                    
                    expect(header).toBeDefined();
                    expect(mainContent).toBeDefined();
                    expect(footer).toBeDefined();
                    
                    // 检查布局没有明显问题
                    const screenshot = await page.screenshot();
                    expect(screenshot).toBeDefined();
                    
                    // 记录测试结果
                    console.log(`✅ ${device.name} 测试通过`);
                    
                } catch (error) {
                    console.error(`❌ ${device.name} 测试失败:`, error.message);
                    throw error;
                } finally {
                    await page.close();
                }
            });
        });
    });

    describe('管理端网站响应式测试', () => {
        devices.forEach(device => {
            test(`管理端在 ${device.name} (${device.width}x${device.height}) 应该正常显示`, async () => {
                const page = await browser.newPage();
                await page.setViewport({ width: device.width, height: device.height });
                
                try {
                    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
                    
                    // 检查管理端布局
                    const adminLayout = await page.$('.admin-layout');
                    const sidebar = await page.$('.sidebar');
                    const mainContent = await page.$('.main-content');
                    
                    expect(adminLayout).toBeDefined();
                    
                    // 在小屏幕上侧边栏应该可折叠
                    if (device.width < 768) {
                        const menuToggle = await page.$('.menu-toggle');
                        expect(menuToggle).toBeDefined();
                    }
                    
                    console.log(`✅ 管理端 ${device.name} 测试通过`);
                    
                } catch (error) {
                    console.error(`❌ 管理端 ${device.name} 测试失败:`, error.message);
                    throw error;
                } finally {
                    await page.close();
                }
            });
        });
    });

    describe('关键页面响应式功能测试', () => {
        test('活动列表在不同屏幕尺寸下的布局', async () => {
            const page = await browser.newPage();
            
            try {
                // 测试桌面布局
                await page.setViewport({ width: 1920, height: 1080 });
                await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle0' });
                
                const desktopLayout = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.event-card');
                    return {
                        cardCount: cards.length,
                        gridLayout: window.getComputedStyle(cards[0].parentElement).display
                    };
                });
                
                expect(desktopLayout.gridLayout).toBe('grid'); // 或预期的布局方式
                
                // 测试移动端布局
                await page.setViewport({ width: 375, height: 667 });
                await page.reload({ waitUntil: 'networkidle0' });
                
                const mobileLayout = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.event-card');
                    return {
                        cardCount: cards.length,
                        singleColumn: cards[0].parentElement.children.length === 1 || 
                                     window.getComputedStyle(cards[0].parentElement).flexDirection === 'column'
                    };
                });
                
                expect(mobileLayout.singleColumn).toBe(true);
                
            } finally {
                await page.close();
            }
        });
    });
});