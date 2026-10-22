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
    readTime: row.read_time || '5 dk okuma',
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []),
    date: row.published_at,
    coverGradient: row.cover_gradient,
    featured: Boolean(row.is_featured)
  };
}

// ==========================================
// SECURITY: RATE LIMITING & CRYPTOGRAPHIC AUTH
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
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 dakika güvenlik kilidi
  }
  failedLoginAttempts.set(clientIp, record);
}

function resetFailedLogin(clientIp) {
  failedLoginAttempts.delete(clientIp);
}

async function getAdminSecret(env) {
  try {
    const passRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_passcode'").first();
    return passRow?.value || env.ADMIN_SECRET || 'kd_sec_fallback_key_2026';
  } catch (e) {
    return env.ADMIN_SECRET || 'kd_sec_fallback_key_2026';
  }
}

async function hmacSha256(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAdminToken(secret) {
  const ts = Date.now();
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const payload = `${ts}.${nonce}`;
  const sig = await hmacSha256(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [tsStr, nonce, clientSig] = parts;
  const ts = parseInt(tsStr, 10);
  if (isNaN(ts)) return false;

  // Oturum süresi: Maksimum 7 gün
  if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;

  const secret = await getAdminSecret(env);
  const payload = `${tsStr}.${nonce}`;
  const expectedSig = await hmacSha256(payload, secret);

  if (expectedSig.length !== clientSig.length) return false;
  let diff = 0;
  for (let i = 0; i < clientSig.length; i++) {
    diff |= clientSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return diff === 0;
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

    // ----------------------------------------------------
    // DİNAMİK /app-ads.txt (AdMob Resmi Doğrulama)
    // ----------------------------------------------------
    if (pathname === '/app-ads.txt' && method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          "SELECT ad_unit_id FROM ad_keys WHERE (network LIKE '%AdMob%' OR network LIKE '%Google%') AND status = 'active'"
        ).all();

        const pubIds = new Set();
        pubIds.add('pub-1095649040834648');

        (results || []).forEach(r => {
          const match = (r.ad_unit_id || '').match(/pub-(\d+)/);
          if (match) pubIds.add('pub-' + match[1]);
        });

        let content = '';
        pubIds.forEach(pubId => {
          content += 'google.com, ' + pubId + ', DIRECT, f08c47fec0942fa0\n';
        });

        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        return new Response('google.com, pub-1095649040834648, DIRECT, f08c47fec0942fa0\n', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // ----------------------------------------------------
    // DİNAMİK /api/config (Mümin Pusulası ve Uygulama Ayarları)
    // ----------------------------------------------------
    if ((pathname === '/api/config' || pathname === '/api/public/config') && method === 'GET') {
      try {
        const bannerRow = await env.DB.prepare(
          "SELECT ad_unit_id FROM ad_keys WHERE (unit_type LIKE '%Banner%' OR unit_type LIKE '%banner%') AND status = 'active' ORDER BY updated_at DESC"
        ).first();

        const activeBannerId = bannerRow?.ad_unit_id || 'ca-app-pub-1095649040834648/6353100367';

        return jsonResponse({
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
        return jsonResponse({
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
    }

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

        let parsedServices = [];
        try {
          parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
        } catch (_) {}

        return jsonResponse({
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

    // Admin Login (Rate-limited & Cryptographically Signed)
    if (pathname === '/api/admin/auth/login' && method === 'POST') {
      try {
        const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
        const rateCheck = checkLoginRateLimit(clientIp);
        if (!rateCheck.allowed) {
          return jsonResponse({
            error: `Güvenlik kilidi: Çok fazla başarısız giriş denemesi. Lütfen ${rateCheck.remainingMins} dakika sonra tekrar deneyin.`
          }, 429);
        }

        const { passcode } = await request.json();
        if (!passcode) {
          return jsonResponse({ error: 'Lütfen PIN kodunuzu girin.' }, 400);
        }

        const passRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_passcode'").first();
        const validPass = passRow?.value;
        if (!validPass) {
          return jsonResponse({ error: 'Sistem yöneticisi şifresi yapılandırılmamış.' }, 500);
        }

        if (passcode.trim() === validPass.trim()) {
          resetFailedLogin(clientIp);
          const token = await createAdminToken(validPass.trim());
          return jsonResponse({ success: true, message: 'Giriş başarılı.', token });
        } else {
          recordFailedLogin(clientIp);
          return jsonResponse({ error: 'Hatalı yönetici şifresi!' }, 401);
        }
      } catch (err) {
        return jsonResponse({ error: 'Giriş yapılamadı: ' + err.message }, 500);
      }
    }

    // Admin Auth Verify
    if (pathname === '/api/admin/auth/verify' && method === 'GET') {
      const isAuth = await verifyAdminAuth(request, env);
      if (isAuth) {
        return jsonResponse({ success: true, authenticated: true });
      }
      return jsonResponse({ error: 'Yetkilendirme geçersiz veya süresi dolmuş.' }, 401);
    }

    // Admin Logout
    if (pathname === '/api/admin/auth/logout' && method === 'POST') {
      return jsonResponse({ success: true, message: 'Oturum sonlandırıldı.' });
    }

    // ==========================================
    // 3. ADMIN PROTECTED ROUTES
    // ==========================================

    if (pathname.startsWith('/api/admin/')) {
      const isAuth = await verifyAdminAuth(request, env);
      if (!isAuth) {
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

      // Apps: POST
      if (pathname === '/api/admin/apps' && method === 'POST') {
        try {
          const body = await request.json();
          const { id, name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features, techStack, links, isActive } = body;
          if (!name || !category) {
            return jsonResponse({ error: 'Uygulama adı ve kategori zorunludur.' }, 400);
          }

          const appId = id || (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'app-' + Date.now();
          const safeSlug = slug || appId;
          const pList = Array.isArray(platforms) ? platforms : (typeof platforms === 'string' ? platforms.split(',').map(s => s.trim()) : []);
          const fList = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(s => s.trim()).filter(Boolean) : []);
          const tList = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);

          await env.DB.prepare(`
            INSERT INTO apps (
              id, name, slug, tagline, category, platforms, status,
              short_description, full_description, features, tech_stack,
              play_store_url, app_store_url, web_demo_url, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            appId, name, safeSlug, tagline || '', category,
            JSON.stringify(pList), status || 'Yayında',
            shortDescription || '', fullDescription || '',
            JSON.stringify(fList), JSON.stringify(tList),
            links?.playStore || '', links?.appStore || '', links?.webDemo || '',
            isActive !== undefined ? (isActive ? 1 : 0) : 1
          ).run();

          return jsonResponse({ success: true, message: 'Yeni uygulama kaydedildi.', id: appId }, 201);
        } catch (err) {
          return jsonResponse({ error: 'Uygulama kaydedilemedi: ' + err.message }, 500);
        }
      }

      // Apps: PUT
      if (pathname.match(/^\/api\/admin\/apps\/[^\/]+$/) && method === 'PUT') {
        const id = pathname.split('/')[4];
        try {
          const body = await request.json();
          const { name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features, techStack, links, isActive } = body;
          const pList = Array.isArray(platforms) ? platforms : (typeof platforms === 'string' ? platforms.split(',').map(s => s.trim()) : []);
          const fList = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').map(s => s.trim()).filter(Boolean) : []);
          const tList = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);

          await env.DB.prepare(`
            UPDATE apps SET
              name = ?, slug = ?, tagline = ?, category = ?, platforms = ?, status = ?,
              short_description = ?, full_description = ?, features = ?, tech_stack = ?,
              play_store_url = ?, app_store_url = ?, web_demo_url = ?, is_active = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            name, slug, tagline || '', category,
            JSON.stringify(pList), status || 'Yayında',
            shortDescription || '', fullDescription || '',
            JSON.stringify(fList), JSON.stringify(tList),
            links?.playStore || '', links?.appStore || '', links?.webDemo || '',
            isActive ? 1 : 0,
            id
          ).run();

          return jsonResponse({ success: true, message: 'Uygulama başarıyla güncellendi.' });
        } catch (err) {
          return jsonResponse({ error: 'Güncelleme hatası: ' + err.message }, 500);
        }
      }

      // Apps: DELETE
      if (pathname.match(/^\/api\/admin\/apps\/[^\/]+$/) && method === 'DELETE') {
        const id = pathname.split('/')[4];
        try {
          await env.DB.prepare('DELETE FROM apps WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Uygulama silindi.' });
        } catch (err) {
          return jsonResponse({ error: 'Silme hatası: ' + err.message }, 500);
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
          const { title, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = body;
          if (!title || !category || !content) {
            return jsonResponse({ error: 'Başlık, kategori ve içerik zorunludur.' }, 400);
          }

          const id = 'blog-' + Date.now();
          const safeSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || id;
          const tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
          const publishedDate = new Date().toISOString().slice(0, 10);

          await env.DB.prepare(`
            INSERT INTO blogs (id, slug, title, category, author, read_time, tags, summary, content, cover_gradient, is_featured, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, safeSlug, title, category, author || 'KeskinDev', readTime || '5 dk okuma', JSON.stringify(tagList), summary || '', content, coverGradient || 'linear-gradient(135deg, #059669 0%, #10b981 100%)', featured ? 1 : 0, publishedDate).run();

          return jsonResponse({ success: true, message: 'Blog makalesi yayınlandı.', id }, 201);
        } catch (err) {
          return jsonResponse({ error: 'Blog eklenemedi: ' + err.message }, 500);
        }
      }

      // Blogs: PUT
      if (pathname.match(/^\/api\/admin\/blogs\/[^\/]+$/) && method === 'PUT') {
        const id = pathname.split('/')[4];
        try {
          const body = await request.json();
          const { title, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = body;
          const tagList = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

          await env.DB.prepare(`
            UPDATE blogs SET
              title = ?, slug = ?, category = ?, author = ?, read_time = ?,
              tags = ?, summary = ?, content = ?, cover_gradient = ?, is_featured = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(title, slug, category, author || 'KeskinDev', readTime || '5 dk okuma', JSON.stringify(tagList), summary || '', content, coverGradient || '', featured ? 1 : 0, id).run();

          return jsonResponse({ success: true, message: 'Blog makalesi güncellendi.' });
        } catch (err) {
          return jsonResponse({ error: 'Güncelleme hatası: ' + err.message }, 500);
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

          let parsedServices = [];
          try {
            parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
          } catch (_) {}

          return jsonResponse({
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
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // Settings: PUT
      if (pathname === '/api/admin/settings' && method === 'PUT') {
        try {
          const payload = await request.json();
          const statements = [];

          for (const [key, value] of Object.entries(payload)) {
            if (typeof value === 'object' && value !== null) {
              if (key === 'services_json' || key === 'tech_stack_json') {
                statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, typeof value === 'string' ? value : JSON.stringify(value)));
              } else {
                for (const [subKey, subVal] of Object.entries(value)) {
                  const compositeKey = `${key}_${subKey}`;
                  statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(compositeKey, String(subVal ?? '')));
                }
              }
            } else {
              statements.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, String(value ?? '')));
            }
          }

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

      let assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && !pathname.startsWith('/api/')) {
        assetRes = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }

      // Edge HTML Rewriter for dynamic SEO, GEO & Branding injection on homepage
      if ((pathname === '/' || pathname === '/index.html') && assetRes.status === 200 && env.DB) {
        try {
          const { results } = await env.DB.prepare("SELECT key, value FROM settings WHERE key LIKE 'seo_%' OR key LIKE 'geo_%'").all();
          const sMap = {};
          (results || []).forEach(r => { sMap[r.key] = r.value; });

          const dynamicTitle = sMap.seo_title || 'KeskinDev | Modern Mobil, SaaS & Kurumsal Yazılım Teknolojileri';
          const dynamicDesc = sMap.seo_description || 'KeskinDev; Mümin Pusulası, Site Yönetimi ve Ticko gibi mobil uygulamalar, SaaS ve kurumsal yazılımlar geliştiren teknoloji kuruluşu.';
          const dynamicKeywords = sMap.seo_keywords || 'keskindev, keskin dev, mümin pusulası, mumin pusulasi, site yönetimi yazılımı, ticko biletleme, mobil uygulama geliştirme, kayseri yazılım, flutter türkiye, saas';
          const dynamicGeoRegion = sMap.geo_region || 'TR-38';
          const dynamicGeoPlace = sMap.geo_placename || 'Kayseri, Türkiye';
          const dynamicLat = sMap.geo_latitude || '38.7205';
          const dynamicLng = sMap.geo_longitude || '35.4826';
          const dynamicGeoPos = `${dynamicLat};${dynamicLng}`;
          const dynamicICBM = `${dynamicLat}, ${dynamicLng}`;

          return new HTMLRewriter()
            .on('title', { element(e) { e.setInnerContent(dynamicTitle); } })
            .on('meta[name="title"]', { element(e) { e.setAttribute('content', dynamicTitle); } })
            .on('meta[name="description"]', { element(e) { e.setAttribute('content', dynamicDesc); } })
            .on('meta[name="keywords"]', { element(e) { e.setAttribute('content', dynamicKeywords); } })
            .on('meta[property="og:title"]', { element(e) { e.setAttribute('content', dynamicTitle); } })
            .on('meta[property="og:description"]', { element(e) { e.setAttribute('content', dynamicDesc); } })
            .on('meta[property="twitter:title"]', { element(e) { e.setAttribute('content', dynamicTitle); } })
            .on('meta[property="twitter:description"]', { element(e) { e.setAttribute('content', dynamicDesc); } })
            .on('meta[name="geo.region"]', { element(e) { e.setAttribute('content', dynamicGeoRegion); } })
            .on('meta[name="geo.placename"]', { element(e) { e.setAttribute('content', dynamicGeoPlace); } })
            .on('meta[name="geo.position"]', { element(e) { e.setAttribute('content', dynamicGeoPos); } })
            .on('meta[name="ICBM"]', { element(e) { e.setAttribute('content', dynamicICBM); } })
            .transform(assetRes);
        } catch (_) {
          return assetRes;
        }
      }

      return assetRes;
    }

    return new Response('KeskinDev Cloudflare D1 Platform', { status: 200 });
  }
};
