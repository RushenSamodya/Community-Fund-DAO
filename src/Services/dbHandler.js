const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Config = require('../Constants/Config');

let dbInstance = null;

function getDBPath() {
  return path.join(Config.CONTRACT_FS || '.', Config.DB_PATH);
}

function connect() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const dbPath = getDBPath();
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      dbInstance = db;
      resolve(dbInstance);
    });
  });
}

async function run(ctx, sql, params = []) {
  const db = await connect();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        if (ctx && ctx.log) ctx.log('DB run error: ' + err.message);
        return reject(err);
      }
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

async function get(ctx, sql, params = []) {
  const db = await connect();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        if (ctx && ctx.log) ctx.log('DB get error: ' + err.message);
        return reject(err);
      }
      resolve(row || null);
    });
  });
}

async function all(ctx, sql, params = []) {
  const db = await connect();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        if (ctx && ctx.log) ctx.log('DB all error: ' + err.message);
        return reject(err);
      }
      resolve(rows || []);
    });
  });
}

module.exports = { run, get, all, connect };
