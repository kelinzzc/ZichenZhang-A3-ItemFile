const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');

// 导入路由
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const categoryRoutes = require('./routes/categories');
const organizationRoutes = require('./routes/organizations');
const weatherRoutes = require('./routes/weather');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// 压缩中间件
app.use(compression());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP每15分钟最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: 900 // 15分钟
  }
});
app.use(limiter);

// CORS配置
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析请求体
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static('public'));

// 请求日志
app.use(requestLogger);

// 数据库连接检查中间件
app.use(async (req, res, next) => {
  const isConnected = await testConnection();
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      error: '数据库服务暂时不可用，请稍后重试',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// 基础路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '慈善活动平台 API 服务器',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      events: '/api/events',
      registrations: '/api/registrations',
      categories: '/api/categories',
      organizations: '/api/organizations',
      weather: '/api/weather'
    }
  });
});

// 健康检查端点
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection() ? 'connected' : 'disconnected';
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/weather', weatherRoutes);

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API 文档',
    version: '1.0.0',
    endpoints: {
      events: {
        'GET /api/events': '获取所有活动',
        'GET /api/events/:id': '获取单个活动详情（包含注册记录）',
        'POST /api/events': '创建新活动（管理端）',
        'PUT /api/events/:id': '更新活动（管理端）',
        'DELETE /api/events/:id': '删除活动（管理端）'
      },
      registrations: {
        'GET /api/registrations': '获取所有注册记录（管理端）',
        'GET /api/registrations/event/:eventId': '获取活动的注册记录',
        'POST /api/registrations': '创建注册记录',
        'DELETE /api/registrations/:id': '删除注册记录（管理端）'
      },
      categories: {
        'GET /api/categories': '获取所有类别'
      },
      organizations: {
        'GET /api/organizations': '获取所有组织'
      },
      weather: {
        'GET /api/weather': '获取天气信息'
      }
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '端点不存在',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/events',
      'GET /api/events/:id',
      'POST /api/events',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'GET /api/registrations',
      'POST /api/registrations',
      'GET /api/categories',
      'GET /api/organizations',
      'GET /api/weather'
    ]
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(PORT, async () => {
  console.log('🚀 慈善活动平台 API 服务器启动成功');
  console.log(`📍 服务器运行在: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  
  // 测试数据库连接
  const dbStatus = await testConnection();
  console.log(`🗄️  数据库状态: ${dbStatus ? '✅ 已连接' : '❌ 连接失败'}`);
  
  console.log('\n📋 可用端点:');
  console.log(`  健康检查: http://localhost:${PORT}/health`);
  console.log(`  API文档: http://localhost:${PORT}/api`);
  console.log(`  事件API: http://localhost:${PORT}/api/events`);
  console.log(`  注册API: http://localhost:${PORT}/api/registrations`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，开始关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;