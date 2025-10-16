describe('数据流验证测试', () => {
    test('活动创建到注册的完整流程', async () => {
        // 1. 创建测试活动
        const newEvent = {
            title: `集成测试活动 ${Date.now()}`,
            description: '这是一个用于集成测试的活动',
            full_description: '完整的活动描述信息',
            category_id: 1,
            organization_id: 1,
            event_date: '2025-12-31 18:00:00',
            location: '测试地点',
            venue_details: '测试场地详情',
            ticket_price: 50.00,
            goal_amount: 5000.00,
            max_attendees: 50,
            latitude: -33.87,
            longitude: 151.21,
            is_active: true,
            is_suspended: false
        };

        const createResponse = await request(API_BASE_URL)
            .post('/events')
            .send(newEvent);
        
        expect(createResponse.status).toBe(201);
        const eventId = createResponse.body.data.id;

        // 2. 验证活动已创建
        const getEventResponse = await request(API_BASE_URL)
            .get(`/events/${eventId}`);
        
        expect(getEventResponse.status).toBe(200);
        expect(getEventResponse.body.data.event.title).toBe(newEvent.title);

        // 3. 创建注册记录
        const registration = {
            event_id: eventId,
            full_name: '数据流测试用户',
            email: `dataflow.${Date.now()}@example.com`,
            ticket_count: 2,
            phone: '0400000000'
        };

        const registerResponse = await request(API_BASE_URL)
            .post('/registrations')
            .send(registration);
        
        expect(registerResponse.status).toBe(201);

        // 4. 验证注册记录出现在活动详情中
        const eventWithRegistrations = await request(API_BASE_URL)
            .get(`/events/${eventId}`);
        
        expect(eventWithRegistrations.body.data.registrations.length).toBe(1);
        expect(eventWithRegistrations.body.data.registrations[0].email).toBe(registration.email);

        // 5. 清理测试数据
        // 注意：由于有注册记录，删除活动会失败，这是预期的
        const deleteResponse = await request(API_BASE_URL)
            .delete(`/events/${eventId}`);
        
        expect(deleteResponse.status).toBe(409); // 应该被阻止删除
    });

    test('搜索和筛选功能的数据流', async () => {
        // 测试搜索功能
        const searchResponse = await request(API_BASE_URL)
            .get('/events/search')
            .query({ q: '慈善' });
        
        expect(searchResponse.status).toBe(200);
        expect(Array.isArray(searchResponse.body.data)).toBe(true);

        // 测试分类筛选
        const categoryResponse = await request(API_BASE_URL)
            .get('/events')
            .query({ category: 1 });
        
        expect(categoryResponse.status).toBe(200);
        
        // 验证返回的活动都属于指定分类
        if (categoryResponse.body.data.length > 0) {
            categoryResponse.body.data.forEach(event => {
                expect(event.category_id).toBe(1);
            });
        }
    });
});