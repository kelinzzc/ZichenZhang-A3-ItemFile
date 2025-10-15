const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 数据库连接配置
const db = mysql.createConnection({
  host: 'localhost',
  user: 'dev_user',
  password: 'dev_password',
  database: 'charity_events_dev'
});

// 测试数据库连接
db.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('成功连接到MySQL数据库');
});

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Charity Events API Server', 
    version: '1.0.0',
    status: 'running'
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;