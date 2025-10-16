describe('安全测试', () => {
    describe('输入验证测试', () => {
        test('SQL注入防护', async () => {
            const sqlInjectionPayloads = [
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "' UNION SELECT * FROM users --",
                "1; INSERT INTO events VALUES (null, 'hacked') --"
            ];

            for (const payload of sqlInjectionPayloads) {
                // 测试活动搜索
                const searchResponse = await request(API_BASE_URL)
                    .get('/events/search')
                    .query({ q: payload });
                
                // 应该返回正常响应或错误，但不应该暴露数据库信息
                expect(searchResponse.status).not.toBe(500);
                
                // 测试注册邮箱
                const registrationResponse = await request(API_BASE_URL)
                    .post('/registrations')
                    .send({
                        event_id: 1,
                        full_name: '测试用户',
                        email: payload,
                        ticket_count: 1
                    });
                
                // 应该返回验证错误而不是服务器错误
                if (registrationResponse.status === 400) {
                    expect(registrationResponse.body.code).toBe('VALIDATION_ERROR');
                }
            }
        });

        test('XSS攻击防护', async () => {
            const xssPayloads = [
                '<script>alert("XSS")</script>',
                '<img src="x" onerror="alert(1)">',
                '<svg onload="alert(1)">',
                'javascript:alert("XSS")'
            ];

            for (const payload of xssPayloads) {
                // 尝试创建包含XSS payload的活动
                const eventResponse = await request(API_BASE_URL)
                    .post('/events')
                    .send({
                        title: payload,
                        description: '测试描述',
                        event_date: '2025-12-31 18:00:00',
                        location: '测试地点',
                        max_attendees: 50
                    });
                
                // 应该被拒绝或清理
                if (eventResponse.status === 201) {
                    // 如果创建成功，检查返回的数据是否被清理
                    expect(eventResponse.body.data.title).not.toContain('<script>');
                    expect(eventResponse.body.data.title).not.toContain('javascript:');
                }
            }
        });
    });

    describe('API安全测试', () => {
        test('CORS配置正确', async () => {
            const response = await request(API_BASE_URL)
                .get('/events')
                .set('Origin', 'http://malicious-site.com');
            
            // 检查CORS头
            expect(response.headers['access-control-allow-origin']).not.toBe('*');
            expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
        });

        test('速率限制生效', async () => {
            const requests = [];
            
            // 快速发送多个请求
            for (let i = 0; i < 110; i++) { // 超过限制
                requests.push(
                    request(API_BASE_URL)
                        .get('/events')
                        .catch(err => err) // 捕获可能的错误
                );
            }
            
            const results = await Promise.all(requests);
            
            // 检查是否有请求被限制
            const rateLimited = results.filter(result => 
                result.status === 429 || 
                (result.response && result.response.status === 429)
            );
            
            expect(rateLimited.length).toBeGreaterThan(0);
        });
    });

    describe('数据验证测试', () => {
        test('邮箱格式验证', async () => {
            const invalidEmails = [
                'invalid',
                'invalid@',
                'invalid@domain',
                '@domain.com',
                'invalid@.com'
            ];

            for (const email of invalidEmails) {
                const response = await request(API_BASE_URL)
                    .post('/registrations')
                    .send({
                        event_id: 1,
                        full_name: '测试用户',
                        email: email,
                        ticket_count: 1
                    });
                
                expect(response.status).toBe(400);
            }
        });

        test('日期验证', async () => {
            const invalidDates = [
                'invalid-date',
                '2020-01-01', // 过去日期
                '1899-12-31' // 太早的日期
            ];

            for (const date of invalidDates) {
                const response = await request(API_BASE_URL)
                    .post('/events')
                    .send({
                        title: '测试活动',
                        description: '测试描述',
                        event_date: date,
                        location: '测试地点',
                        max_attendees: 50
                    });
                
                expect(response.status).not.toBe(201);
            }
        });
    });
});