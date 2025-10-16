describe('边界情况测试', () => {
    describe('表单验证边界测试', () => {
        test('注册表单边界值验证', async () => {
            const testCases = [
                {
                    name: '票数为0',
                    data: {
                        event_id: 1,
                        full_name: '测试用户',
                        email: 'test@example.com',
                        ticket_count: 0
                    },
                    shouldFail: true
                },
                {
                    name: '票数为负数',
                    data: {
                        event_id: 1,
                        full_name: '测试用户',
                        email: 'test@example.com',
                        ticket_count: -1
                    },
                    shouldFail: true
                },
                {
                    name: '票数超过上限',
                    data: {
                        event_id: 1,
                        full_name: '测试用户',
                        email: 'test@example.com',
                        ticket_count: 100
                    },
                    shouldFail: true // 假设有上限检查
                },
                {
                    name: '空姓名',
                    data: {
                        event_id: 1,
                        full_name: '',
                        email: 'test@example.com',
                        ticket_count: 1
                    },
                    shouldFail: true
                },
                {
                    name: '无效邮箱',
                    data: {
                        event_id: 1,
                        full_name: '测试用户',
                        email: 'invalid-email',
                        ticket_count: 1
                    },
                    shouldFail: true
                }
            ];

            for (const testCase of testCases) {
                const response = await request(API_BASE_URL)
                    .post('/registrations')
                    .send(testCase.data);
                
                if (testCase.shouldFail) {
                    expect(response.status).not.toBe(201);
                }
            }
        });

        test('活动创建表单边界值验证', async () => {
            const testCases = [
                {
                    name: '最大参与人数为0',
                    data: {
                        title: '测试活动',
                        description: '测试描述',
                        event_date: '2025-12-31 18:00:00',
                        location: '测试地点',
                        max_attendees: 0
                    },
                    shouldFail: true
                },
                {
                    name: '过去的活动日期',
                    data: {
                        title: '测试活动',
                        description: '测试描述',
                        event_date: '2020-01-01 18:00:00',
                        location: '测试地点',
                        max_attendees: 50
                    },
                    shouldFail: true
                },
                {
                    name: '负数的票价',
                    data: {
                        title: '测试活动',
                        description: '测试描述',
                        event_date: '2025-12-31 18:00:00',
                        location: '测试地点',
                        max_attendees: 50,
                        ticket_price: -10
                    },
                    shouldFail: true
                }
            ];

            for (const testCase of testCases) {
                const response = await request(API_BASE_URL)
                    .post('/events')
                    .send(testCase.data);
                
                if (testCase.shouldFail) {
                    expect(response.status).not.toBe(201);
                }
            }
        });
    });

    describe('并发测试', () => {
        test('同时注册同一活动', async () => {
            // 创建测试活动
            const testEvent = {
                title: `并发测试活动 ${Date.now()}`,
                description: '并发测试',
                event_date: '2025-12-31 18:00:00',
                location: '测试地点',
                max_attendees: 2, // 限制参与人数
                ticket_price: 0
            };

            const createResponse = await request(API_BASE_URL)
                .post('/events')
                .send(testEvent);
            
            const eventId = createResponse.body.data.id;

            // 并发注册请求
            const registrationPromises = [];
            for (let i = 0; i < 5; i++) {
                const registration = {
                    event_id: eventId,
                    full_name: `并发用户 ${i}`,
                    email: `concurrent.${i}.${Date.now()}@example.com`,
                    ticket_count: 1
                };

                registrationPromises.push(
                    request(API_BASE_URL)
                        .post('/registrations')
                        .send(registration)
                );
            }

            const results = await Promise.allSettled(registrationPromises);
            
            // 统计成功和失败的数量
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 201).length;
            const failed = results.filter(r => 
                r.status === 'fulfilled' && r.value.status !== 201 || 
                r.status === 'rejected'
            ).length;

            // 由于最大参与人数为2，最多只有2个成功注册
            expect(successful).toBeLessThanOrEqual(2);
            expect(failed).toBeGreaterThanOrEqual(3);

            // 验证实际注册数量
            const eventResponse = await request(API_BASE_URL)
                .get(`/events/${eventId}`);
            
            expect(eventResponse.body.data.registrations.length).toBe(successful);
        });
    });

    describe('错误处理测试', () => {
        test('处理不存在的资源', async () => {
            const responses = await Promise.all([
                request(API_BASE_URL).get('/events/999999'),
                request(API_BASE_URL).get('/registrations/999999'),
                request(API_BASE_URL).put('/events/999999').send({ title: '测试' }),
                request(API_BASE_URL).delete('/events/999999')
            ]);

            // 所有请求都应该返回适当的错误状态
            responses.forEach(response => {
                expect(response.status).not.toBe(200);
            });
        });

        test('处理无效的API端点', async () => {
            const response = await request(API_BASE_URL)
                .get('/api/nonexistent-endpoint');
            
            expect(response.status).toBe(404);
        });

        test('处理数据库连接失败', async () => {
            // 这个测试需要模拟数据库连接失败的环境
            // 在实际环境中，可以通过停止数据库服务来测试
            console.log('⚠️ 数据库连接失败测试需要在特定环境中进行');
        });
    });
});