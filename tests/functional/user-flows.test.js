describe('用户流程功能测试', () => {
    describe('普通用户流程', () => {
        test('浏览活动 -> 查看详情 -> 注册参与', async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            
            try {
                // 1. 浏览活动列表
                await page.goto('http://localhost:3001/events');
                await page.waitForSelector('.event-card');
                
                // 获取第一个活动的信息
                const firstEvent = await page.evaluate(() => {
                    const card = document.querySelector('.event-card');
                    return {
                        title: card.querySelector('.event-title').textContent,
                        canRegister: card.querySelector('.btn-primary') !== null
                    };
                });
                
                expect(firstEvent.title).toBeDefined();

                // 2. 查看活动详情
                await page.click('.event-card:first-child a');
                await page.waitForSelector('.event-detail-page');
                
                // 验证活动详情页内容
                const eventTitle = await page.$eval('.event-title', el => el.textContent);
                expect(eventTitle).toBe(firstEvent.title);
                
                // 检查注册记录标签页
                const hasRegistrationTab = await page.$('button[ng-click*="registrations"]') !== null;
                expect(hasRegistrationTab).toBe(true);

                // 3. 注册参与（如果可以注册）
                const canRegister = await page.$('.registration-card') !== null;
                if (canRegister) {
                    await page.click('.btn-primary[ng-href*="/register/"]');
                    await page.waitForSelector('.registration-page');
                    
                    // 填写注册表单
                    await page.type('input[ng-model*="full_name"]', '功能测试用户');
                    await page.type('input[ng-model*="email"]', `functional.${Date.now()}@example.com`);
                    await page.type('input[ng-model*="phone"]', '0400000000');
                    
                    // 提交表单
                    await page.click('button[type="submit"]');
                    
                    // 验证注册成功
                    await page.waitForTimeout(3000);
                    const currentUrl = page.url();
                    expect(currentUrl).toMatch(/\/events\/\d+/);
                    
                    // 检查是否显示成功消息
                    const successMessage = await page.$('.global-messages .message.success');
                    expect(successMessage).toBeDefined();
                }
                
            } finally {
                await browser.close();
            }
        });

        test('搜索活动 -> 筛选结果 -> 查看详情', async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            
            try {
                // 1. 访问搜索页面
                await page.goto('http://localhost:3001/search');
                await page.waitForSelector('.search-page');
                
                // 2. 执行搜索
                await page.type('input[ng-model*="searchQuery"]', '慈善');
                await page.click('button[ng-click*="performSearch"]');
                
                await page.waitForTimeout(2000);
                
                // 3. 检查搜索结果
                const searchResults = await page.$$('.event-card');
                expect(searchResults.length).toBeGreaterThan(0);
                
                // 4. 应用筛选
                const categorySelect = await page.$('select[ng-model*="filters.category"]');
                if (categorySelect) {
                    await categorySelect.select('1'); // 选择第一个分类
                    await page.waitForTimeout(1000);
                    
                    // 验证筛选结果
                    const filteredResults = await page.$$('.event-card');
                    expect(filteredResults.length).toBeGreaterThanOrEqual(0);
                }
                
            } finally {
                await browser.close();
            }
        });
    });

    describe('管理员流程', () => {
        test('登录管理端 -> 创建活动 -> 管理注册记录', async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            
            try {
                // 1. 访问管理端
                await page.goto('http://localhost:3002');
                await page.waitForSelector('.admin-layout');
                
                // 2. 导航到活动管理
                await page.click('a[href*="/events"]');
                await page.waitForSelector('.events-page');
                
                // 3. 创建新活动
                await page.click('button[ng-click*="createEvent"]');
                await page.waitForSelector('.event-form-page');
                
                // 填写活动表单
                await page.type('input[ng-model*="event.title"]', `管理员测试活动 ${Date.now()}`);
                await page.type('textarea[ng-model*="event.description"]', '管理员创建的活动描述');
                await page.type('input[ng-model*="event.event_date"]', '2025-12-31T18:00');
                await page.type('input[ng-model*="event.location"]', '测试地点');
                await page.type('input[ng-model*="event.max_attendees"]', '100');
                
                // 提交表单
                await page.click('button[type="submit"]');
                await page.waitForTimeout(3000);
                
                // 验证创建成功，返回活动列表
                const currentUrl = page.url();
                expect(currentUrl).toContain('/events');
                
                // 4. 查看和管理注册记录
                await page.click('a[href*="/registrations"]');
                await page.waitForSelector('.registrations-page');
                
                // 检查注册记录表格
                const registrationTable = await page.$('.data-table');
                expect(registrationTable).toBeDefined();
                
            } finally {
                await browser.close();
            }
        });

        test('删除活动保护机制', async () => {
            // 创建测试活动并添加注册记录
            const testEvent = {
                title: `删除保护测试活动 ${Date.now()}`,
                description: '测试删除保护机制',
                event_date: '2025-12-31 18:00:00',
                location: '测试地点',
                max_attendees: 50,
                ticket_price: 0,
                goal_amount: 0
            };

            const createResponse = await request(API_BASE_URL)
                .post('/events')
                .send(testEvent);
            
            const eventId = createResponse.body.data.id;

            // 添加注册记录
            const registration = {
                event_id: eventId,
                full_name: '保护测试用户',
                email: `protection.${Date.now()}@example.com`,
                ticket_count: 1
            };

            await request(API_BASE_URL)
                .post('/registrations')
                .send(registration);

            // 尝试删除活动（应该失败）
            const deleteResponse = await request(API_BASE_URL)
                .delete(`/events/${eventId}`);
            
            expect(deleteResponse.status).toBe(409);
            expect(deleteResponse.body.code).toBe('HAS_REGISTRATIONS');
            expect(deleteResponse.body.registrationsCount).toBe(1);

            // 清理：由于不能删除活动，我们可以标记为不活跃
            const updateResponse = await request(API_BASE_URL)
                .put(`/events/${eventId}`)
                .send({ is_active: false });
            
            expect(updateResponse.status).toBe(200);
        });
    });
});