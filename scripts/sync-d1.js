// KeskinDev Cloudflare D1 Remote to Local SQLite Sync Utility
// Database ID: b4c9d5f7-c90e-4c2d-b1f0-577377bdaa56 (keskindev)
const { execSync } = require('child_process');
const db = require('../db');

console.log('🔄 Cloudflare D1 (keskindev: b4c9d5f7-c90e-4c2d-b1f0-577377bdaa56) verileri çekiliyor...');

try {
  const tables = ['apps', 'ad_keys', 'blogs', 'messages', 'settings'];
  
  for (const table of tables) {
    const cmd = `npx -y wrangler d1 execute keskindev --remote --command "SELECT * FROM ${table};" --json`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    const parsed = JSON.parse(output);
    const rows = parsed[0]?.results || [];

    console.log(`📦 [D1 -> Local] ${table}: ${rows.length} kayıt senkronize ediliyor...`);

    if (rows.length > 0) {
      const sample = rows[0];
      const cols = Object.keys(sample);
      const placeholders = cols.map(() => '?').join(', ');
      const insertSql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = cols.map(c => row[c]);
        db.run(insertSql, values);
      }
    }
  }

  console.log('✅ Cloudflare D1 verileri başarıyla yerel SQLite ile eşitlendi.');
} catch (err) {
  console.error('❌ Senkronizasyon hatası:', err.message);
  process.exit(1);
}
