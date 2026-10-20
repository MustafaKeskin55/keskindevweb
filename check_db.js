const db = require('./db');
console.log('Tables:', db.query("SELECT name FROM sqlite_master WHERE type='table'"));
console.log('Apps:', db.query("SELECT id, name FROM apps"));
console.log('Ad keys count:', db.query("SELECT COUNT(*) FROM ad_keys"));
console.log('Blogs count:', db.query("SELECT COUNT(*) FROM blogs"));
console.log('Settings:', db.query("SELECT * FROM settings"));
