const mysql = require('mysql2');

// 基于A2数据库的配置
const devConfig = {
  host: 'localhost',
  user: 'root', 
  password: '817817',
  database: 'charityevents_db',  // 使用A2的数据库名
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+10:00'
};

// 生产环境配置
const prodConfig = {
  host: 'localhost',
  user: 'your_cpanel_db_user',
  password: 'your_cpanel_db_password', 
  database: 'your_cpanel_db_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+10:00'
};

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
const pool = mysql.createPool(config);
const promisePool = pool.promise();

// 测试连接
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ 数据库连接成功 - charityevents_db');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

// 数据库操作函数
const db = {
  query: async (sql, params = []) => {
    try {
      const [rows, fields] = await promisePool.execute(sql, params);
      return { success: true, data: rows, fields };
    } catch (error) {
      console.error('数据库查询错误:', error);
      return { success: false, error: error.message };
    }
  },

  getConnection: () => promisePool.getConnection(),

  transaction: async (callback) => {
    const connection = await promisePool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return { success: true, data: result };
    } catch (error) {
      await connection.rollback();
      console.error('事务执行失败:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  close: () => promisePool.end()
};

module.exports = {
  db,
  testConnection,
  rawPool: promisePool
};