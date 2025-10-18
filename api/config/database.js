const mysql = require('mysql2');

// Development environment configuration
const devConfig = {
  host: 'localhost',
  user: 'root', 
  password: '817817',
  database: 'charityevents_db',  
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+10:00'
};

// Production environment configuration
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

// Test connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Database connection successful - charityevents_db');
    connection.release();
    return true;
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    return false;
  }
};

// Database operation functions
const db = {
  query: async (sql, params = []) => {
    try {
      const [rows, fields] = await promisePool.execute(sql, params);
      return { success: true, data: rows, fields };
    } catch (error) {
      console.error('Database query error:', error);
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
      console.error('Transaction execution failed:', error);
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