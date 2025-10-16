const request = require('supertest');
const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';
const CLIENT_BASE_URL = 'http://localhost:3001';
const ADMIN_BASE_URL = 'http://localhost:3002';

describe('PROG2002 A3 集成测试套件', () => {
    let testEventId;
    let testRegistrationId;

    beforeAll(async () => {
        console.log('🚀 开始集成测试...');
    });

    describe('API 端点集成测试', () => {
        test('GET /api/events 应该返回活动列表', async () => {
            const response = await request(API_BASE_URL).get('/events');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            
            // 保存测试活动ID供后续测试使用
            if (response.body.data.length > 0) {
                testEventId = response.body.data[0].id;
            }
        });

        test('GET /api/events/:id 应该返回活动详情和注册记录', async () => {
            if (!testEventId) {
                console.warn('⚠️ 没有测试活动可用，跳过此测试');
                return;
            }

            const response = await request(API_BASE_URL).get(`/events/${testEventId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.event).toBeDefined();
            expect(response.body.data.registrations).toBeDefined();
            expect(Array.isArray(response.body.data.registrations)).toBe(true);
            
            // 验证注册记录按时间倒序排列
            if (response.body.data.registrations.length >= 2) {
                const firstDate = new Date(response.body.data.registrations[0].registration_date);
                const secondDate = new Date(response.body.data.registrations[1].registration_date);
                expect(firstDate >= secondDate).toBe(true);
            }
        });

        test('POST /api/registrations 应该创建注册记录', async () => {
            if (!testEventId) {
                console.warn('⚠️ 没有测试活动可用，跳过此测试');
                return;
            }

            const testRegistration = {
                event_id: testEventId,
                full_name: '集成测试用户',
                email: `integration.test.${Date.now()}@example.com`,
                ticket_count: 2,
                phone: '0400000000'
            };

            const response = await request(API_BASE_URL)
                .post('/registrations')
                .send(testRegistration);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBeDefined();
            
            testRegistrationId = response.body.data.id;
        });

        test('POST /api/registrations 应该阻止重复注册', async () => {
            if (!testEventId) {
                console.warn('⚠️ 没有测试活动可用，跳过此测试');
                return;
            }

            const duplicateRegistration = {
                event_id: testEventId,
                full_name: '重复注册测试',
                email: 'duplicate.test@example.com',
                ticket_count: 1
            };

            // 第一次注册
            await request(API_BASE_URL)
                .post('/registrations')
                .send(duplicateRegistration);

            // 第二次注册应该失败
            const response = await request(API_BASE_URL)
                .post('/registrations')
                .send(duplicateRegistration);
            
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.code).toBe('DUPLICATE_REGISTRATION');
        });

        test('DELETE /api/events/:id 有注册记录时应该阻止删除', async () => {
            if (!testEventId) {
                console.warn('⚠️ 没有测试活动可用，跳过此测试');
                return;
            }

            const response = await request(API_BASE_URL)
                .delete(`/events/${testEventId}`);
            
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.code).toBe('HAS_REGISTRATIONS');
            expect(response.body.registrationsCount).toBeGreaterThan(0);
        });
    });

    describe('天气API集成测试', () => {
        test('GET /api/weather 应该返回天气信息', async () => {
            const response = await request(API_BASE_URL)
                .get('/weather')
                .query({ latitude: -33.87, longitude: 151.21 });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.weatherDescription).toBeDefined();
            expect(response.body.data.temperatureMax).toBeDefined();
            expect(response.body.data.temperatureMin).toBeDefined();
        });

        test('GET /api/weather 应该处理无效坐标', async () => {
            const response = await request(API_BASE_URL)
                .get('/weather')
                .query({ latitude: 'invalid', longitude: 'invalid' });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});