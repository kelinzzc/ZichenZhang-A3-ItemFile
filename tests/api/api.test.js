const request = require('supertest');
const app = require('../app');
const { db } = require('../config/database');

describe('PROG2002 A3 API 测试套件', () => {
  beforeAll(async () => {
    // 确保数据库连接
    await db.testConnection();
  });

  describe('健康检查端点', () => {
    test('GET /health 应该返回健康状态', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBeDefined();
    });
  });

  describe('事件API端点', () => {
    test('GET /api/events 应该返回活动列表', async () => {
      const response = await request(app).get('/api/events');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/events/:id 应该返回单个活动详情（包含注册记录）', async () => {
      const response = await request(app).get('/api/events/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBeDefined();
      expect(response.body.data.registrations).toBeDefined();
      expect(Array.isArray(response.body.data.registrations)).toBe(true);
    });

    test('POST /api/events 应该创建新活动', async () => {
      const newEvent = {
        title: '测试活动',
        description: '测试活动描述',
        full_description: '完整的测试活动描述',
        category_id: 1,
        organization_id: 1,
        event_date: '2025-12-31 18:00:00',
        location: '测试地点',
        venue_details: '测试场地详情',
        ticket_price: 50.00,
        goal_amount: 5000.00,
        max_attendees: 100,
        latitude: -33.87,
        longitude: 151.21
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEvent);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    test('DELETE /api/events/:id 有注册记录时应该阻止删除', async () => {
      const response = await request(app).delete('/api/events/1');
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.registrationsCount).toBeGreaterThan(0);
    });
  });

  describe('注册API端点', () => {
    test('POST /api/registrations 应该创建注册记录', async () => {
      const newRegistration = {
        event_id: 2,
        full_name: '测试用户',
        email: 'test.registration@example.com',
        phone: '0400000000',
        ticket_count: 2
      };

      const response = await request(app)
        .post('/api/registrations')
        .send(newRegistration);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    test('POST /api/registrations 应该阻止重复注册', async () => {
      const duplicateRegistration = {
        event_id: 1,
        full_name: '重复测试用户',
        email: 'zhang.wei@email.com', // 已存在的邮箱
        ticket_count: 1
      };

      const response = await request(app)
        .post('/api/registrations')
        .send(duplicateRegistration);
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('DUPLICATE_REGISTRATION');
    });

    test('GET /api/registrations/event/:eventId 应该返回按时间倒序的注册记录', async () => {
      const response = await request(app).get('/api/registrations/event/1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 检查排序
      if (response.body.data.length >= 2) {
        const firstDate = new Date(response.body.data[0].registration_date);
        const secondDate = new Date(response.body.data[1].registration_date);
        expect(firstDate >= secondDate).toBe(true);
      }
    });
  });

  describe('天气API端点', () => {
    test('GET /api/weather 应该返回天气信息', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ latitude: -33.87, longitude: 151.21 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.weatherDescription).toBeDefined();
    });

    test('GET /api/weather 缺少参数时应该返回错误', async () => {
      const response = await request(app).get('/api/weather');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('错误处理', () => {
    test('访问不存在的端点应该返回404', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('无效的活动ID应该返回400', async () => {
      const response = await request(app).get('/api/events/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});