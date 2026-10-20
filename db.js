// KeskinDev Dynamic Database Connector (SQLite Engine & SQL Query Interface)
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'database', 'keskindev.sqlite');
let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

// Helper methods for clean SQL querying
module.exports = {
  getDb,
  
  query(sql, params = []) {
    return getDb().prepare(sql).all(...params);
  },
  
  get(sql, params = []) {
    return getDb().prepare(sql).get(...params);
  },
  
  run(sql, params = []) {
    return getDb().prepare(sql).run(...params);
  },
  
  exec(sql) {
    return getDb().exec(sql);
  }
};
