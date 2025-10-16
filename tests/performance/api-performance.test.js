const autocannon = require('autocannon');

describe('API性能测试', () => {
    describe('负载测试', () => {
        test('活动列表API应该处理高并发请求', async () => {
            const result = await autocannon({
                url: 'http://localhost:3000/api/events',
                connections: 10, // 并发连接数
                duration: 10, // 测试持续时间（秒）
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('活动列表API性能测试结果:');
            console.log(`- 请求总数: ${result.requests.total}`);
            console.log(`- 平均响应时间: ${result.latency.average}ms`);
            console.log(`- 每秒请求数: ${result.requests.average}`);
            console.log(`- 错误率: ${result.errors}%`);

            // 性能断言
            expect(result.errors).toBe(0);
            expect(result.latency.average).toBeLessThan(100); // 平均响应时间应小于100ms
            expect(result.requests.average).toBeGreaterThan(50); // 每秒至少处理50个请求
        });

        test('活动详情API性能', async () => {
            const result = await autocannon({
                url: 'http://localhost:3000/api/events/1',
                connections: 5,
                duration: 10,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('活动详情API性能测试结果:');
            console.log(`- 平均响应时间: ${result.latency.average}ms`);
            console.log(`- 错误率: ${result.errors}%`);

            expect(result.errors).toBe(0);
            expect(result.latency.average).toBeLessThan(200);
        });
    });

    describe('压力测试', () => {
        test('注册API在高负载下的表现', async () => {
            // 创建测试活动
            const testEvent = {
                title: `压力测试活动 ${Date.now()}`,
                description: '压力测试',
                event_date: '2025-12-31 18:00:00',
                location: '测试地点',
                max_attendees: 1000, // 设置较高的上限
                ticket_price: 0
            };

            const createResponse = await request(API_BASE_URL)
                .post('/events')
                .send(testEvent);
            
            const eventId = createResponse.body.data.id;

            // 压力测试
            const result = await autocannon({
                url: 'http://localhost:3000/api/registrations',
                connections: 20,
                duration: 30,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: eventId,
                    full_name: '压力测试用户',
                    email: `stress.${Date.now()}@example.com`,
                    ticket_count: 1
                })
            });

            console.log('注册API压力测试结果:');
            console.log(`- 总请求数: ${result.requests.total}`);
            console.log(`- 平均响应时间: ${result.latency.average}ms`);
            console.log(`- 错误率: ${result.errors}%`);

            expect(result.errors).toBeLessThan(5); // 错误率应低于5%
        });
    });

    describe('数据库查询优化测试', () => {
        test('活动搜索查询性能', async () => {
            const result = await autocannon({
                url: 'http://localhost:3000/api/events/search?q=慈善',
                connections: 5,
                duration: 10
            });

            console.log('搜索查询性能测试结果:');
            console.log(`- 平均响应时间: ${result.latency.average}ms`);

            expect(result.latency.average).toBeLessThan(150);
        });

        test('带筛选的活动列表查询性能', async () => {
            const testCases = [
                { params: '?category=1&location=悉尼' },
                { params: '?category=1&organization=1' },
                { params: '?date_from=2025-01-01&date_to=2025-12-31' }
            ];

            for (const testCase of testCases) {
                const result = await autocannon({
                    url: `http://localhost:3000/api/events${testCase.params}`,
                    connections: 3,
                    duration: 5
                });

                console.log(`筛选查询 ${testCase.params} 性能: ${result.latency.average}ms`);
                expect(result.latency.average).toBeLessThan(200);
            }
        });
    });
});