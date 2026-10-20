/**
 * KeskinDev Cloudflare Worker & D1 SQL Dynamic Engine
 * Database ID: b4c9d5f7-c90e-4c2d-b1f0-577377bdaa56 (keskindev)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json; charset=utf-8'
};

// In-memory active tokens (Workers isolate memory)
const activeAdminTokens = new Set();

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders }
  });
}

function formatAppRow(row) {
  if (!row) return null;
  return {
    ...row,
    platforms: typeof row.platforms === 'string' ? JSON.parse(row.platforms || '[]') : (row.platforms || []),
    features: typeof row.features === 'string' ? JSON.parse(row.features || '[]') : (row.features || []),
    techStack: typeof row.tech_stack === 'string' ? JSON.parse(row.tech_stack || '[]') : (row.tech_stack || []),
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
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
    date: row.published_at,
    coverGradient: row.cover_gradient,
    featured: Boolean(row.is_featured)
  };
}

function checkAdminAuth(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return false;
  // If token starts with kd_live_ or exists in activeAdminTokens
  if (activeAdminTokens.has(token) || (token.startsWith('kd_live_') && token.length > 20)) {
    return true;
  }
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // Handle CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const pathname = url.pathname;

    // ==========================================
    // 1. PUBLIC API ROUTES
    // ==========================================

    // Live Real Stats
    if (pathname === '/api/public/stats' && method === 'GET') {
      try {
        const totalAppsRow = await env.DB.prepare('SELECT COUNT(*) as count FROM apps WHERE is_active = 1').first();
        const totalBlogsRow = await env.DB.prepare('SELECT COUNT(*) as count FROM blogs').first();
        const { results: apps } = await env.DB.prepare('SELECT platforms, tech_stack FROM apps WHERE is_active = 1').all();

        const platformSet = new Set();
        const techSet = new Set();

        (apps || []).forEach(a => {
          try {
            const pList = JSON.parse(a.platforms || '[]');
            pList.forEach(p => platformSet.add(p));
          } catch (_) {}

          try {
            const tList = JSON.parse(a.tech_stack || '[]');
            tList.forEach(t => techSet.add(t));
          } catch (_) {}
        });

        return jsonResponse({
          success: true,
          data: {
            totalApps: totalAppsRow?.count || 0,
            totalBlogs: totalBlogsRow?.count || 0,
            platformCount: platformSet.size || 4,
            platforms: Array.from(platformSet),
            techList: Array.from(techSet),
            systemStatus: 'Cloudflare D1 Aktif & Canlı'
          }
        });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // Public Apps
    if (pathname === '/api/public/apps' && method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT * FROM apps WHERE is_active = 1 ORDER BY created_at ASC').all();
        return jsonResponse({ success: true, data: (results || []).map(formatAppRow) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // Public Blogs
    if (pathname === '/api/public/blogs' && method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT * FROM blogs ORDER BY published_at DESC').all();
        return jsonResponse({ success: true, data: (results || []).map(formatBlogRow) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // Public Single Blog by Slug
    if (pathname.startsWith('/api/public/blogs/') && method === 'GET') {
      const slug = pathname.replace('/api/public/blogs/', '').trim();
      try {
        const row = await env.DB.prepare('SELECT * FROM blogs WHERE slug = ?').bind(slug).first();
        if (!row) return jsonResponse({ success: false, error: 'Yazı bulunamadı.' }, 404);
        return jsonResponse({ success: true, data: formatBlogRow(row) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // Public Settings
    if (pathname === '/api/public/settings' && method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
        const map = {};
        (results || []).forEach(r => { map[r.key] = r.value; });

        return jsonResponse({
          success: true,
          data: {
            companyName: map.company_name || 'KeskinDev',
            legalName: map.company_name || 'KeskinDev',
            slogan: map.slogan || 'Yarının Teknolojisini Bugün İnşa Ediyoruz',
            description: map.description || 'Modern mobil, SaaS ve kurumsal yazılımlar geliştiren yenilikçi teknoloji kuruluşu.',
            contact: {
              email: map.contact_email || 'iletisim@keskindev.com'
            },
            geo: {
              region: map.geo_region || 'TR-38',
              placename: map.geo_placename || 'Kayseri, Türkiye',
              latitude: parseFloat(map.geo_latitude) || 38.7205,
              longitude: parseFloat(map.geo_longitude) || 35.4826
            },
            seo: {
              title: map.seo_title || 'KeskinDev | Modern Mobil, SaaS & Kurumsal Yazılım Teknolojileri',
              metaKeywords: map.seo_keywords || 'keskindev, mümin pusulası, site yönetimi, ticko'
            }
          }
        });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // Public Contact Form
    if (pathname === '/api/public/contact' && method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !message) {
          return jsonResponse({ error: 'Lütfen zorunlu alanları (Ad, E-posta, Mesaj) doldurunuz.' }, 400);
        }

        const id = 'msg-' + Date.now();
        const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';

        await env.DB.prepare(`
          INSERT INTO messages (id, name, email, phone, subject, message, status, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
        `).bind(id, name, email, phone || '', subject || '', message, clientIp).run();

        return jsonResponse({ success: true, message: 'Mesajınız başarıyla iletildi. En kısa sürede geri dönüş yapılacaktır.' }, 201);
      } catch (err) {
        return jsonResponse({ error: 'Mesaj gönderilemedi: ' + err.message }, 500);
      }
    }

    // ==========================================
    // 2. ADMIN AUTHENTICATION
    // ==========================================

    // Admin Login
    if (pathname === '/api/admin/auth/login' && method === 'POST') {
      try {
        const { passcode } = await request.json();
        if (!passcode) {
          return jsonResponse({ error: 'Lütfen PIN kodunuzu girin.' }, 400);
        }

        const passRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_passcode'").first();
        const validPass = passRow?.value || env.ADMIN_PASSCODE_DEFAULT || 'keskin2026';

        if (passcode.trim() === validPass.trim()) {
          const token = 'kd_live_' + crypto.randomUUID().replace(/-/g, '') + '_' + Date.now();
          activeAdminTokens.add(token);
          return jsonResponse({ success: true, message: 'Giriş başarılı.', token });
        } else {
          return jsonResponse({ error: 'Hatalı yönetici şifresi!' }, 401);
        }
      } catch (err) {
        return jsonResponse({ error: 'Giriş yapılamadı: ' + err.message }, 500);
      }
    }

    // Admin Auth Verify
    if (pathname === '/api/admin/auth/verify' && method === 'GET') {
      if (checkAdminAuth(request)) {
        return jsonResponse({ success: true, authenticated: true });
      }
      return jsonResponse({ error: 'Yetkilendirme geçersiz.' }, 401);
    }

    // Admin Logout
    if (pathname === '/api/admin/auth/logout' && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace(/^Bearer\s+/, '').trim();
      activeAdminTokens.delete(token);
      return jsonResponse({ success: true, message: 'Oturum kapatıldı.' });
    }

    // ==========================================
    // 3. ADMIN PROTECTED ROUTES
    // ==========================================

    if (pathname.startsWith('/api/admin/')) {
      if (!checkAdminAuth(request)) {
        return jsonResponse({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, 401);
      }

      // Admin Stats
      if (pathname === '/api/admin/stats' && method === 'GET') {
        try {
          const totalApps = (await env.DB.prepare('SELECT COUNT(*) as count FROM apps').first())?.count || 0;
          const totalBlogs = (await env.DB.prepare('SELECT COUNT(*) as count FROM blogs').first())?.count || 0;
          const totalAdKeys = (await env.DB.prepare('SELECT COUNT(*) as count FROM ad_keys').first())?.count || 0;
          const activeAdKeys = (await env.DB.prepare("SELECT COUNT(*) as count FROM ad_keys WHERE status = 'active'").first())?.count || 0;
          const unreadMessages = (await env.DB.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'new'").first())?.count || 0;

          return jsonResponse({
            success: true,
            data: { totalApps, totalBlogs, totalAdKeys, activeAdKeys, unreadMessages }
          });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Ad Keys: GET
      if (pathname === '/api/admin/ad-keys' && method === 'GET') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM ad_keys ORDER BY created_at DESC').all();
          const data = (results || []).map(r => ({
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
          return jsonResponse({ success: true, data });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Ad Keys: POST
      if (pathname === '/api/admin/ad-keys' && method === 'POST') {
        try {
          const body = await request.json();
          const { appId, appName, network, platform, unitType, adUnitId, testMode, status, notes } = body;

          if (!appId || !network || !platform || !unitType || !adUnitId) {
            return jsonResponse({ error: 'Tüm zorunlu alanları doldurun.' }, 400);
          }

          const id = 'key-' + Date.now();
          await env.DB.prepare(`
            INSERT INTO ad_keys (id, app_id, app_name, network, platform, unit_type, ad_unit_id, test_mode, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, appId, appName || appId, network, platform, unitType, adUnitId.trim(), testMode ? 1 : 0, status || 'active', notes || '').run();

          return jsonResponse({ success: true, message: 'Reklam kimliği Cloudflare D1 kasasına kaydedildi.', id }, 201);
        } catch (err) {
          return jsonResponse({ error: 'Kayıt başarısız: ' + err.message }, 500);
        }
      }

      // Ad Keys: Toggle Status
      if (pathname.match(/^\/api\/admin\/ad-keys\/[^\/]+\/toggle$/) && method === 'PATCH') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare("UPDATE ad_keys SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, message: 'Durum güncellendi.' });
        } catch (err) {
          return jsonResponse({ error: 'Güncelleme hatası: ' + err.message }, 500);
        }
      }

      // Ad Keys: DELETE
      if (pathname.match(/^\/api\/admin\/ad-keys\/[^\/]+$/) && method === 'DELETE') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare('DELETE FROM ad_keys WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Reklam kimliği kasadan silindi.' });
        } catch (err) {
          return jsonResponse({ error: 'Silme hatası: ' + err.message }, 500);
        }
      }

      // Apps: GET
      if (pathname === '/api/admin/apps' && method === 'GET') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM apps ORDER BY created_at ASC').all();
          return jsonResponse({ success: true, data: (results || []).map(formatAppRow) });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Blogs: GET
      if (pathname === '/api/admin/blogs' && method === 'GET') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM blogs ORDER BY published_at DESC').all();
          return jsonResponse({ success: true, data: (results || []).map(formatBlogRow) });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Blogs: POST
      if (pathname === '/api/admin/blogs' && method === 'POST') {
        try {
          const body = await request.json();
          const { title, slug, category, author, readTime, tags, summary, content } = body;
          if (!title || !category || !content) {
            return jsonResponse({ error: 'Başlık, kategori ve içerik zorunludur.' }, 400);
          }

          const id = 'blog-' + Date.now();
          const safeSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || id;
          const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
          const publishedDate = new Date().toISOString().slice(0, 10);

          await env.DB.prepare(`
            INSERT INTO blogs (id, slug, title, category, author, read_time, tags, summary, content, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, safeSlug, title, category, author || 'KeskinDev', readTime || '5 dk okuma', JSON.stringify(tagList), summary || '', content, publishedDate).run();

          return jsonResponse({ success: true, message: 'Blog makalesi yayınlandı.', id }, 201);
        } catch (err) {
          return jsonResponse({ error: 'Blog eklenemedi: ' + err.message }, 500);
        }
      }

      // Blogs: DELETE
      if (pathname.match(/^\/api\/admin\/blogs\/[^\/]+$/) && method === 'DELETE') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Blog makalesi silindi.' });
        } catch (err) {
          return jsonResponse({ error: 'Silme hatası: ' + err.message }, 500);
        }
      }

      // Messages: GET
      if (pathname === '/api/admin/messages' && method === 'GET') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
          return jsonResponse({ success: true, data: results || [] });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Messages: Mark Read
      if (pathname.match(/^\/api\/admin\/messages\/[^\/]+\/read$/) && method === 'PATCH') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare("UPDATE messages SET status = 'read' WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true });
        } catch (err) {
          return jsonResponse({ error: 'Hata: ' + err.message }, 500);
        }
      }

      // Messages: DELETE
      if (pathname.match(/^\/api\/admin\/messages\/[^\/]+$/) && method === 'DELETE') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true });
        } catch (err) {
          return jsonResponse({ error: 'Hata: ' + err.message }, 500);
        }
      }

      // Settings: GET
      if (pathname === '/api/admin/settings' && method === 'GET') {
        try {
          const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
          const map = {};
          (results || []).forEach(r => { map[r.key] = r.value; });

          return jsonResponse({
            success: true,
            data: {
              companyName: map.company_name || 'KeskinDev',
              slogan: map.slogan || '',
              adminPasscode: map.admin_passcode || 'keskin2026',
              seo: {
                title: map.seo_title || '',
                metaKeywords: map.seo_keywords || ''
              },
              geo: {
                region: map.geo_region || 'TR-38',
                placename: map.geo_placename || 'Kayseri, Türkiye',
                latitude: parseFloat(map.geo_latitude) || 38.7205,
                longitude: parseFloat(map.geo_longitude) || 35.4826
              }
            }
          });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Settings: PUT
      if (pathname === '/api/admin/settings' && method === 'PUT') {
        try {
          const body = await request.json();
          const { companyName, slogan, adminPasscode, seo, geo } = body;

          const statements = [];
          if (companyName) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('company_name', ?)").bind(companyName));
          if (slogan) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('slogan', ?)").bind(slogan));
          if (adminPasscode) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_passcode', ?)").bind(adminPasscode));
          if (seo?.title) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seo_title', ?)").bind(seo.title));
          if (seo?.metaKeywords) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seo_keywords', ?)").bind(seo.metaKeywords));
          if (geo?.region) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('geo_region', ?)").bind(geo.region));
          if (geo?.placename) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('geo_placename', ?)").bind(geo.placename));
          if (geo?.latitude) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('geo_latitude', ?)").bind(String(geo.latitude)));
          if (geo?.longitude) statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('geo_longitude', ?)").bind(String(geo.longitude)));

          if (statements.length > 0) {
            await env.DB.batch(statements);
          }

          return jsonResponse({ success: true, message: 'Ayarlar Cloudflare D1 veritabanında güncellendi.' });
        } catch (err) {
          return jsonResponse({ error: 'Ayarlar kaydedilemedi: ' + err.message }, 500);
        }
      }

      // Backup: GET
      if (pathname === '/api/admin/backup' && method === 'GET') {
        try {
          const apps = (await env.DB.prepare('SELECT * FROM apps').all()).results;
          const adKeys = (await env.DB.prepare('SELECT * FROM ad_keys').all()).results;
          const blogs = (await env.DB.prepare('SELECT * FROM blogs').all()).results;
          const messages = (await env.DB.prepare('SELECT * FROM messages').all()).results;
          const settings = (await env.DB.prepare('SELECT * FROM settings').all()).results;

          return jsonResponse({
            exportDate: new Date().toISOString(),
            engine: 'Cloudflare D1 (b4c9d5f7-c90e-4c2d-b1f0-577377bdaa56)',
            apps,
            adKeys,
            blogs,
            messages,
            settings
          });
        } catch (err) {
          return jsonResponse({ error: 'Yedek alınamadı: ' + err.message }, 500);
        }
      }
    }

    // ==========================================
    // 4. STATIC ASSETS & SPA ROUTING
    // ==========================================
    if (env.ASSETS) {
      if (pathname === '/blog') {
        return env.ASSETS.fetch(new Request(new URL('/blog.html', request.url), request));
      }
      if (pathname === '/admin') {
        return env.ASSETS.fetch(new Request(new URL('/admin.html', request.url), request));
      }
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && !pathname.startsWith('/api/')) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }
      return assetRes;
    }

    return new Response('KeskinDev Cloudflare D1 Platform', { status: 200 });
  }
};
