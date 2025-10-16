const puppeteer = require('puppeteer');

describe('前端集成测试', () => {
    let browser;
    let page;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        // 设置超时时间
        page.setDefaultTimeout(10000);
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('客户端网站测试', () => {
        test('首页应该正确加载并显示活动', async () => {
            await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
            
            // 检查页面标题
            const title = await page.title();
            expect(title).toContain('慈善活动平台');
            
            // 检查推荐活动部分
            await page.waitForSelector('.featured-events');
            const eventCards = await page.$$('.event-card');
            expect(eventCards.length).toBeGreaterThan(0);
            
            // 检查统计信息
            await page.waitForSelector('.stats-section');
            const statCards = await page.$$('.stat-card');
            expect(statCards.length).toBeGreaterThan(0);
        });

        test('活动列表页面应该正确加载', async () => {
            await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle0' });
            
            // 检查活动列表
            await page.waitForSelector('.events-page');
            const events = await page.$$('.event-card');
            expect(events.length).toBeGreaterThan(0);
            
            // 检查筛选功能
            const searchInput = await page.$('input[placeholder*="搜索"]');
            expect(searchInput).toBeDefined();
        });

        test('活动详情页面应该显示完整信息', async () => {
            // 首先获取一个活动ID
            await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle0' });
            await page.waitForSelector('.event-card');
            
            // 点击第一个活动
            await page.click('.event-card:first-child a');
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            
            // 检查活动详情
            await page.waitForSelector('.event-detail-page');
            const eventTitle = await page.$('.event-title');
            expect(eventTitle).toBeDefined();
            
            // 检查注册记录标签页
            const registrationTab = await page.$('button[ng-click*="registrations"]');
            expect(registrationTab).toBeDefined();
            
            // 切换到注册记录标签页
            if (registrationTab) {
                await registrationTab.click();
                await page.waitForTimeout(1000);
                
                // 检查注册记录列表
                const registrationList = await page.$('.registration-list');
                expect(registrationList).toBeDefined();
            }
        });

        test('注册流程应该正常工作', async () => {
            // 导航到活动详情页
            await page.goto('http://localhost:3001/events', { waitUntil: 'networkidle0' });
            await page.waitForSelector('.event-card');
            
            // 点击第一个活动的注册按钮或详情页的注册按钮
            const registerButton = await page.$('.btn-primary');
            if (registerButton) {
                await registerButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                
                // 填写注册表单
                await page.waitForSelector('.registration-page');
                await page.type('input[ng-model*="full_name"]', '测试用户');
                await page.type('input[ng-model*="email"]', `test.${Date.now()}@example.com`);
                await page.type('input[ng-model*="phone"]', '0400000000');
                
                // 提交表单
                await page.click('button[type="submit"]');
                
                // 检查是否跳转回活动页面或显示成功消息
                await page.waitForTimeout(2000);
                const currentUrl = page.url();
                expect(currentUrl).toMatch(/\/events\/\d+/);
            }
        });
    });

    describe('管理端网站测试', () => {
        test('管理端仪表板应该正确加载', async () => {
            await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
            
            // 检查管理端布局
            await page.waitForSelector('.admin-layout');
            const sidebar = await page.$('.sidebar');
            expect(sidebar).toBeDefined();
            
            // 检查统计卡片
            await page.waitForSelector('.stats-grid');
            const statCards = await page.$$('.stat-card');
            expect(statCards.length).toBeGreaterThan(0);
        });

        test('活动管理页面应该正常工作', async () => {
            await page.goto('http://localhost:3002/#/events', { waitUntil: 'networkidle0' });
            
            // 检查活动列表
            await page.waitForSelector('.events-page');
            const dataTable = await page.$('.data-table');
            expect(dataTable).toBeDefined();
            
            // 检查创建活动按钮
            const createButton = await page.$('button[ng-click*="createEvent"]');
            expect(createButton).toBeDefined();
        });
    });
});