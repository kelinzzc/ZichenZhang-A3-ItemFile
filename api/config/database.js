const mysql = require('mysql2');
const config = require('../../config/development.json');

const pool = mysql.createPool(config.database);

const promisePool = pool.promise();

module.exports = {
  query: (text, params) => promisePool.execute(text, params),
  getConnection: () => promisePool.getConnection(),
  end: () => promisePool.end()
};