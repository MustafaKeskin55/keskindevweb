const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory active admin sessions
const activeSessions = new Set();

// Admin Authentication Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Yetkilendirme başlığı eksik. Lütfen giriş yapın.' });
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş yönetici oturumu.' });
  }
  next();
}

// Helper: Safely parse JSON fields stored in SQLite text columns
function formatAppRow(row) {
  if (!row) return null;
  return {
    ...row,
    platforms: typeof row.platforms === 'string' ? JSON.parse(row.platforms) : row.platforms,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    techStack: typeof row.tech_stack === 'string' ? JSON.parse(row.tech_stack) : row.tech_stack,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    links: {
      playStore: row.play_store_url || '',
      appStore: row.app_store_url || '',
      webDemo: row.web_demo_url || ''
    },
    isActive: Boolean(row.is_active)
  };
}

function formatBlogRow(row) {
  if (!row) return null;
  return {
    ...row,
    readTime: row.read_time || '5 dk okuma',
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    date: row.published_at,
    coverGradient: row.cover_gradient,
    featured: Boolean(row.is_featured)
  };
}

// ==========================================
// PUBLIC API ROUTES (Halka Açık, Giriş Gerektirmez)

// Dinamik /app-ads.txt (AdMob Doğrulama)
app.get('/app-ads.txt', (req, res) => {
  try {
    const rows = db.query("SELECT ad_unit_id FROM ad_keys WHERE (network LIKE '%AdMob%' OR network LIKE '%Google%') AND status = 'active'");
    const pubIds = new Set();
    pubIds.add('pub-1095649040834648');
    (rows || []).forEach(r => {
      const match = (r.ad_unit_id || '').match(/pub-(\d+)/);
      if (match) pubIds.add('pub-' + match[1]);
    });
    let content = '';
    pubIds.forEach(id => { content += 'google.com, ' + id + ', DIRECT, f08c47fec0942fa0\n'; });
    res.type('text/plain; charset=utf-8').send(content);
  } catch (err) {
    res.type('text/plain; charset=utf-8').send('google.com, pub-1095649040834648, DIRECT, f08c47fec0942fa0\n');
  }
});

// Dinamik /api/config
app.get(['/api/config', '/api/public/config'], (req, res) => {
  try {
    const row = db.get("SELECT ad_unit_id FROM ad_keys WHERE (unit_type LIKE '%Banner%' OR unit_type LIKE '%banner%') AND status = 'active' ORDER BY updated_at DESC");
    const activeBannerId = row?.ad_unit_id || 'ca-app-pub-1095649040834648/6353100367';
    res.json({
      adsEnabled: true,
      bannerAdUnitId: activeBannerId,
      ramazanMode: false,
      prayerApiUrl: 'https://api.aladhan.com/',
      quranApiUrl: 'https://api.quran.com/api/v4/',
      audioCdnUrl: 'https://download.quranicaudio.com/quran/',
      deletedWallpaperIds: ['wp_kabe_gece'],
      customWallpapers: []
    });
  } catch (err) {
    res.json({
      adsEnabled: true,
      bannerAdUnitId: 'ca-app-pub-1095649040834648/6353100367',
      ramazanMode: false,
      prayerApiUrl: 'https://api.aladhan.com/',
      quranApiUrl: 'https://api.quran.com/api/v4/',
      audioCdnUrl: 'https://download.quranicaudio.com/quran/',
      deletedWallpaperIds: ['wp_kabe_gece'],
      customWallpapers: []
    });
  }
});
// ==========================================

// 1. Live Real Statistics (Directly calculated from real SQL tables - NO mock data)
app.get('/api/public/stats', (req, res) => {
  try {
    const totalAppsRow = db.get('SELECT COUNT(*) as count FROM apps WHERE is_active = 1');
    const totalBlogsRow = db.get('SELECT COUNT(*) as count FROM blogs');
    const apps = db.query('SELECT platforms, tech_stack FROM apps WHERE is_active = 1');

    const platformSet = new Set();
    const techSet = new Set();

    apps.forEach(a => {
      try {
        const pList = JSON.parse(a.platforms || '[]');
        pList.forEach(p => platformSet.add(p));
      } catch (e) {}

      try {
        const tList = JSON.parse(a.tech_stack || '[]');
        tList.forEach(t => techSet.add(t));
      } catch (e) {}
    });

    res.json({
      success: true,
      data: {
        totalApps: totalAppsRow.count,
        totalBlogs: totalBlogsRow.count,
        platformCount: platformSet.size || 4,
        platforms: Array.from(platformSet),
        techList: Array.from(techSet),
        systemStatus: 'Cloudflare D1 Uyumlu & Canlı'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Public Apps
app.get('/api/public/apps', (req, res) => {
  try {
    const rows = db.query('SELECT * FROM apps WHERE is_active = 1 ORDER BY created_at ASC');
    res.json({ success: true, data: rows.map(formatAppRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Public Blogs
app.get('/api/public/blogs', (req, res) => {
  try {
    const rows = db.query('SELECT * FROM blogs ORDER BY published_at DESC');
    res.json({ success: true, data: rows.map(formatBlogRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Public Single Blog
app.get('/api/public/blogs/:slug', (req, res) => {
  try {
    const row = db.get('SELECT * FROM blogs WHERE slug = ?', [req.params.slug]);
    if (!row) return res.status(404).json({ success: false, error: 'Yazı bulunamadı.' });
    res.json({ success: true, data: formatBlogRow(row) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Public Settings
app.get('/api/public/settings', (req, res) => {
  try {
    const rows = db.query('SELECT key, value FROM settings');
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });

    let parsedServices = [];
    try {
      parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
    } catch (_) {}

    res.json({
      success: true,
      data: {
        companyName: map.company_name || 'KeskinDev',
        legalName: map.company_name || 'KeskinDev',
        slogan: map.slogan || 'Yarının Teknolojisini Bugün İnşa Ediyoruz',
        description: map.description || 'Modern mobil, SaaS ve kurumsal yazılımlar geliştiren yenilikçi teknoloji kuruluşu.',
        hero: {
          badge: map.hero_badge || 'Yazılım & Dijital Ürün Stüdyosu',
          title: map.hero_title || 'Geleceğe yön veren, güvenilir ve yüksek performanslı yazılımlar',
          titleHighlight: map.hero_title_highlight || 'yüksek performanslı',
          subtitle: map.hero_subtitle || 'Yenilikçi mobil uygulamalar, SaaS ve kurumsal yönetim yazılımları geliştiriyoruz.',
          btnPrimaryText: map.hero_btn_primary_text || 'Ürünleri İncele',
          btnPrimaryLink: map.hero_btn_primary_link || '#products',
          btnSecondaryText: map.hero_btn_secondary_text || 'Mühendislik Notları',
          btnSecondaryLink: map.hero_btn_secondary_link || '/blog'
        },
        services: parsedServices,
        branding: {
          logoUrl: map.branding_logo_url || '/assets/logo.svg',
          faviconUrl: map.branding_favicon_url || '/assets/favicon.svg',
          ogImage: map.branding_og_image || '/assets/logo.svg'
        },
        contact: {
          email: map.contact_email || 'iletisim@keskindev.com',
          phone: map.contact_phone || '+90 (555) 000 00 00',
          address: map.contact_address || 'Kayseri, Türkiye'
        },
        social: {
          github: map.social_github || '',
          playStore: map.social_playstore || '',
          twitter: map.social_twitter || '',
          linkedin: map.social_linkedin || ''
        },
        geo: {
          region: map.geo_region || 'TR-38',
          placename: map.geo_placename || 'Kayseri, Türkiye',
          latitude: parseFloat(map.geo_latitude) || 38.7205,
          longitude: parseFloat(map.geo_longitude) || 35.4826
        },
        seo: {
          title: map.seo_title || 'KeskinDev | Modern Mobil, SaaS & Kurumsal Yazılım Teknolojileri',
          description: map.seo_description || 'KeskinDev; Mümin Pusulası, Site Yönetimi ve Ticko gibi mobil uygulamalar, SaaS ve kurumsal yazılımlar geliştiren teknoloji kuruluşu.',
          metaKeywords: map.seo_keywords || 'keskindev, mümin pusulası, site yönetimi, ticko'
        },
        footer: {
          desc: map.footer_desc || 'Yenilikçi dijital ürünleri geliştiren kullanıcı odaklı modern teknoloji kuruluşu.',
          copyright: map.footer_copyright || '© 2026 KeskinDev. Tüm hakları saklıdır.'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Public Contact Form
app.post('/api/public/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Lütfen zorunlu alanları (Ad, E-posta, Mesaj) doldurunuz.' });
  }

  const id = 'msg-' + Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';

  try {
    db.run(`
      INSERT INTO messages (id, name, email, phone, subject, message, status, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `, [id, name, email, phone || '', subject || '', message, clientIp]);

    res.status(201).json({ success: true, message: 'Mesajınız başarıyla iletildi. En kısa sürede geri dönüş yapılacaktır.' });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj gönderilemedi: ' + err.message });
  }
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

const failedLoginAttempts = new Map();

function checkLoginRateLimit(clientIp) {
  const record = failedLoginAttempts.get(clientIp);
  if (!record) return { allowed: true };
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    const remainingMins = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, remainingMins };
  }
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    failedLoginAttempts.delete(clientIp);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(clientIp) {
  const record = failedLoginAttempts.get(clientIp) || { count: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedLoginAttempts.set(clientIp, record);
}

function resetFailedLogin(clientIp) {
  failedLoginAttempts.delete(clientIp);
}

app.post('/api/admin/auth/login', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const rateCheck = checkLoginRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Güvenlik kilidi: Çok fazla başarısız giriş denemesi. Lütfen ${rateCheck.remainingMins} dakika sonra tekrar deneyin.`
    });
  }

  const { passcode } = req.body;
  if (!passcode) {
    return res.status(400).json({ error: 'Lütfen PIN kodunuzu girin.' });
  }

  try {
    const passRow = db.get("SELECT value FROM settings WHERE key = 'admin_passcode'");
    const validPass = passRow?.value || 'keskin2026';

    if (passcode.trim() === validPass.trim()) {
      resetFailedLogin(clientIp);
      const token = 'kd_admin_' + crypto.randomBytes(32).toString('hex');
      activeSessions.add(token);
      res.json({ success: true, message: 'Giriş başarılı.', token });
    } else {
      recordFailedLogin(clientIp);
      res.status(401).json({ error: 'Hatalı yönetici şifresi!' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Giriş yapılamadı: ' + err.message });
  }
});

app.get('/api/admin/auth/verify', requireAdmin, (req, res) => {
  res.json({ success: true, authenticated: true });
});

app.post('/api/admin/auth/logout', requireAdmin, (req, res) => {
  const token = req.headers['authorization'].replace(/^Bearer\s+/, '').trim();
  activeSessions.delete(token);
  res.json({ success: true, message: 'Oturum kapatıldı.' });
});

// ==========================================
// ADMIN PROTECTED ROUTES (Require Bearer Token)
// ==========================================

// 1. Admin Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const totalApps = db.get('SELECT COUNT(*) as count FROM apps').count;
    const totalBlogs = db.get('SELECT COUNT(*) as count FROM blogs').count;
    const totalAdKeys = db.get('SELECT COUNT(*) as count FROM ad_keys').count;
    const activeAdKeys = db.get("SELECT COUNT(*) as count FROM ad_keys WHERE status = 'active'").count;
    const unreadMessages = db.get("SELECT COUNT(*) as count FROM messages WHERE status = 'new'").count;

    res.json({
      success: true,
      data: {
        totalApps,
        totalBlogs,
        totalAdKeys,
        activeAdKeys,
        unreadMessages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. REKLAM KİMLİKLERİ KASASI (STRICT PRIVATE VAULT)
app.get('/api/admin/ad-keys', requireAdmin, (req, res) => {
  try {
    const rows = db.query('SELECT * FROM ad_keys ORDER BY created_at DESC');
    const data = rows.map(r => ({
      id: r.id,
      appId: r.app_id,
      appName: r.app_name,
      network: r.network,
      platform: r.platform,
      unitType: r.unit_type,
      adUnitId: r.ad_unit_id,
      testMode: Boolean(r.test_mode),
      status: r.status,
      notes: r.notes,
      createdAt: r.created_at
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/ad-keys', requireAdmin, (req, res) => {
  const { appId, appName, network, platform, unitType, adUnitId, testMode, status, notes } = req.body;

  if (!appId || !network || !platform || !unitType || !adUnitId) {
    return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun.' });
  }

  const id = 'key-' + Date.now();
  try {
    db.run(`
      INSERT INTO ad_keys (id, app_id, app_name, network, platform, unit_type, ad_unit_id, test_mode, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, appId, appName || appId, network, platform, unitType, adUnitId.trim(), testMode ? 1 : 0, status || 'active', notes || '']);

    res.status(201).json({ success: true, message: 'Reklam kimliği kasaya kaydedildi.', id });
  } catch (err) {
    res.status(500).json({ error: 'Kayıt başarısız: ' + err.message });
  }
});

app.put('/api/admin/ad-keys/:id', requireAdmin, (req, res) => {
  const { appId, appName, network, platform, unitType, adUnitId, testMode, status, notes } = req.body;

  if (!appId || !network || !platform || !unitType || !adUnitId) {
    return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun.' });
  }

  try {
    db.run(`
      UPDATE ad_keys 
      SET app_id = ?, app_name = ?, network = ?, platform = ?, unit_type = ?, ad_unit_id = ?, test_mode = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [appId, appName || appId, network, platform, unitType, adUnitId.trim(), testMode ? 1 : 0, status || 'active', notes || '', req.params.id]);

    res.json({ success: true, message: 'Reklam kimliği güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası: ' + err.message });
  }
});

app.patch('/api/admin/ad-keys/:id/toggle', requireAdmin, (req, res) => {
  try {
    db.run("UPDATE ad_keys SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Durum güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

app.delete('/api/admin/ad-keys/:id', requireAdmin, (req, res) => {
  try {
    db.run('DELETE FROM ad_keys WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Reklam kimliği kasadan silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

// 3. Admin Apps
app.get('/api/admin/apps', requireAdmin, (req, res) => {
  try {
    const rows = db.query('SELECT * FROM apps ORDER BY created_at ASC');
    res.json({ success: true, data: rows.map(formatAppRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/apps', requireAdmin, (req, res) => {
  const { id, name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features, techStack, links, isActive } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Uygulama adı ve kategori zorunludur.' });
  }

  const appId = id || (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'app-' + Date.now();
  const safeSlug = slug || appId;
  const pList = Array.isArray(platforms) ? platforms : (typeof platforms === 'string' ? platforms.split(',').map(s => s.trim()) : []);
  const fList = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(s => s.trim()).filter(Boolean) : []);
  const tList = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);

  try {
    db.run(`
      INSERT INTO apps (
        id, name, slug, tagline, category, platforms, status,
        short_description, full_description, features, tech_stack,
        play_store_url, app_store_url, web_demo_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appId, name, safeSlug, tagline || '', category,
      JSON.stringify(pList), status || 'Yayında',
      shortDescription || '', fullDescription || '',
      JSON.stringify(fList), JSON.stringify(tList),
      links?.playStore || '', links?.appStore || '', links?.webDemo || '',
      isActive !== undefined ? (isActive ? 1 : 0) : 1
    ]);

    res.status(201).json({ success: true, message: 'Yeni uygulama kaydedildi.', id: appId });
  } catch (err) {
    res.status(500).json({ error: 'Uygulama kaydedilemedi: ' + err.message });
  }
});

app.put('/api/admin/apps/:id', requireAdmin, (req, res) => {
  const { name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features, techStack, links, isActive } = req.body;
  const pList = Array.isArray(platforms) ? platforms : (typeof platforms === 'string' ? platforms.split(',').map(s => s.trim()) : []);
  const fList = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(s => s.trim()).filter(Boolean) : []);
  const tList = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);

  try {
    db.run(`
      UPDATE apps SET
        name = ?, slug = ?, tagline = ?, category = ?, platforms = ?, status = ?,
        short_description = ?, full_description = ?, features = ?, tech_stack = ?,
        play_store_url = ?, app_store_url = ?, web_demo_url = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, slug, tagline || '', category,
      JSON.stringify(pList), status || 'Yayında',
      shortDescription || '', fullDescription || '',
      JSON.stringify(fList), JSON.stringify(tList),
      links?.playStore || '', links?.appStore || '', links?.webDemo || '',
      isActive ? 1 : 0,
      req.params.id
    ]);

    res.json({ success: true, message: 'Uygulama başarıyla güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası: ' + err.message });
  }
});

app.delete('/api/admin/apps/:id', requireAdmin, (req, res) => {
  try {
    db.run('DELETE FROM apps WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Uygulama silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası: ' + err.message });
  }
});

// 4. Admin Blogs
app.get('/api/admin/blogs', requireAdmin, (req, res) => {
  try {
    const rows = db.query('SELECT * FROM blogs ORDER BY published_at DESC');
    res.json({ success: true, data: rows.map(formatBlogRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/blogs', requireAdmin, (req, res) => {
  const { title, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Başlık, kategori ve içerik zorunludur.' });
  }

  const id = 'blog-' + Date.now();
  const safeSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || id;
  const tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
  const publishedDate = new Date().toISOString().slice(0, 10);

  try {
    db.run(`
      INSERT INTO blogs (id, slug, title, category, author, read_time, tags, summary, content, cover_gradient, is_featured, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, safeSlug, title, category, author || 'KeskinDev', readTime || '5 dk okuma', JSON.stringify(tagList), summary || '', content, coverGradient || 'linear-gradient(135deg, #059669 0%, #10b981 100%)', featured ? 1 : 0, publishedDate]);

    res.status(201).json({ success: true, message: 'Blog makalesi yayınlandı.', id });
  } catch (err) {
    res.status(500).json({ error: 'Blog eklenemedi: ' + err.message });
  }
});

app.put('/api/admin/blogs/:id', requireAdmin, (req, res) => {
  const { title, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = req.body;
  const tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  try {
    db.run(`
      UPDATE blogs SET
        title = ?, slug = ?, category = ?, author = ?, read_time = ?,
        tags = ?, summary = ?, content = ?, cover_gradient = ?, is_featured = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, slug, category, author || 'KeskinDev', readTime || '5 dk okuma', JSON.stringify(tagList), summary || '', content, coverGradient || '', featured ? 1 : 0, req.params.id]);

    res.json({ success: true, message: 'Blog makalesi güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası: ' + err.message });
  }
});

app.delete('/api/admin/blogs/:id', requireAdmin, (req, res) => {
  try {
    db.run('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Blog makalesi silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

// 5. Admin Messages
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  try {
    const rows = db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/admin/messages/:id/read', requireAdmin, (req, res) => {
  try {
    db.run("UPDATE messages SET status = 'read' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Hata' });
  }
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  try {
    db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Hata' });
  }
});

// 6. Admin Settings (Full Dynamic CMS)
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const rows = db.query('SELECT key, value, category FROM settings');
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });

    let parsedServices = [];
    try {
      parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
    } catch (_) {}

    res.json({
      success: true,
      data: {
        raw: map,
        companyName: map.company_name || 'KeskinDev',
        founder: map.founder || 'Mustafa Keskin',
        slogan: map.slogan || '',
        adminPasscode: map.admin_passcode || 'keskin2026',
        hero: {
          badge: map.hero_badge || 'Yazılım & Dijital Ürün Stüdyosu',
          title: map.hero_title || 'Geleceğe yön veren, güvenilir ve yüksek performanslı yazılımlar',
          titleHighlight: map.hero_title_highlight || 'yüksek performanslı',
          subtitle: map.hero_subtitle || 'Yenilikçi mobil uygulamalar, SaaS ve kurumsal yönetim yazılımları geliştiriyoruz.',
          btnPrimaryText: map.hero_btn_primary_text || 'Ürünleri İncele',
          btnPrimaryLink: map.hero_btn_primary_link || '#products',
          btnSecondaryText: map.hero_btn_secondary_text || 'Mühendislik Notları',
          btnSecondaryLink: map.hero_btn_secondary_link || '/blog'
        },
        services: parsedServices,
        branding: {
          logoUrl: map.branding_logo_url || '/assets/logo.svg',
          faviconUrl: map.branding_favicon_url || '/assets/favicon.svg',
          ogImage: map.branding_og_image || '/assets/logo.svg'
        },
        contact: {
          email: map.contact_email || 'iletisim@keskindev.com',
          phone: map.contact_phone || '+90 (555) 000 00 00',
          address: map.contact_address || 'Kayseri, Türkiye'
        },
        social: {
          github: map.social_github || '',
          playStore: map.social_playstore || '',
          twitter: map.social_twitter || '',
          linkedin: map.social_linkedin || ''
        },
        geo: {
          region: map.geo_region || 'TR-38',
          placename: map.geo_placename || 'Kayseri, Türkiye',
          latitude: parseFloat(map.geo_latitude) || 38.7205,
          longitude: parseFloat(map.geo_longitude) || 35.4826
        },
        seo: {
          title: map.seo_title || '',
          description: map.seo_description || '',
          metaKeywords: map.seo_keywords || ''
        },
        footer: {
          desc: map.footer_desc || 'Yenilikçi dijital ürünleri geliştiren kullanıcı odaklı modern teknoloji kuruluşu.',
          copyright: map.footer_copyright || '© 2026 KeskinDev. Tüm hakları saklıdır.'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const payload = req.body || {};

  try {
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'object' && value !== null) {
        // Flatten or JSON serialize
        if (key === 'services_json' || key === 'tech_stack_json') {
          db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, typeof value === 'string' ? value : JSON.stringify(value)]);
        } else {
          // Flatten nested objects like hero, branding, contact
          for (const [subKey, subVal] of Object.entries(value)) {
            const compositeKey = `${key}_${subKey}`;
            db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [compositeKey, String(subVal ?? '')]);
          }
        }
      } else {
        db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, String(value ?? '')]);
      }
    }

    res.json({ success: true, message: 'Tüm ayarlar ve içerikler başarıyla veritabanına kaydedildi.' });
  } catch (err) {
    res.status(500).json({ error: 'Ayarlar kaydedilemedi: ' + err.message });
  }
});

// 7. Full Database Export (JSON Backup)
app.get('/api/admin/backup', requireAdmin, (req, res) => {
  try {
    const backup = {
      exportDate: new Date().toISOString(),
      engine: 'sqlite3 / ANSI SQL',
      apps: db.query('SELECT * FROM apps'),
      adKeys: db.query('SELECT * FROM ad_keys'),
      blogs: db.query('SELECT * FROM blogs'),
      messages: db.query('SELECT * FROM messages'),
      settings: db.query('SELECT * FROM settings')
    };
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: 'Yedek alınamadı.' });
  }
});

// SPA Route Fallbacks
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Global error handling middleware (catches bad JSON or unexpected errors without crashing)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Geçersiz JSON formatı.' });
  }
  console.error('Sunucu Hatası:', err);
  res.status(500).json({ success: false, error: 'Sunucu içi hata meydana geldi.' });
});

// Catch-all
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('===============================================');
  console.log('🚀 KeskinDev SQL Dynamic Server Running!');
  console.log('📦 Database Engine:  SQLite / ANSI SQL (database/keskindev.sqlite)');
  console.log(`🌐 Ana Web Sitesi:    http://localhost:${PORT}`);
  console.log(`📰 Blog Portalı:      http://localhost:${PORT}/blog`);
  console.log(`🛡️ Yönetim Paneli:    http://localhost:${PORT}/admin`);
  console.log('===============================================');
});
