-- ============================================================
-- KeskinDev Dynamic Enterprise Database Schema
-- Compatible with: PostgreSQL, SQLite 3, MySQL 8+, MariaDB
-- Character Set: UTF-8 / UTF8MB4
-- Description: Dynamic Software Management, Technical CMS & Private Vault
-- ============================================================

-- 1. APPS TABLE (Yazılım Ürünleri & Mobil Sistemler)
CREATE TABLE IF NOT EXISTS apps (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    category VARCHAR(64) NOT NULL,
    platforms TEXT NOT NULL, -- JSON array (e.g. '["Android", "iOS"]')
    status VARCHAR(32) DEFAULT 'Yayında',
    short_description TEXT NOT NULL,
    full_description TEXT,
    features TEXT NOT NULL, -- JSON array of bullet points
    tech_stack TEXT NOT NULL, -- JSON array (e.g. '["Flutter", "Kotlin"]')
    play_store_url VARCHAR(255),
    app_store_url VARCHAR(255),
    web_demo_url VARCHAR(255),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_is_active ON apps(is_active);

-- 2. AD_KEYS TABLE (Gizli Reklam Kimlikleri Kasası - STRICT PRIVACY)
-- NOTE: Halka açık API'lerde ve web sitesinde asla listelenmez.
CREATE TABLE IF NOT EXISTS ad_keys (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL,
    app_name VARCHAR(128) NOT NULL,
    network VARCHAR(64) NOT NULL, -- 'Google AdMob', 'Unity Ads', etc.
    platform VARCHAR(32) NOT NULL, -- 'Android', 'iOS', 'Web'
    unit_type VARCHAR(64) NOT NULL, -- 'Banner', 'Geçiş (Interstitial)', 'Ödüllü (Rewarded)', 'App ID'
    ad_unit_id VARCHAR(255) NOT NULL, -- 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'
    test_mode INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'active', -- 'active', 'paused'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_adkeys_app_id ON ad_keys(app_id);
CREATE INDEX IF NOT EXISTS idx_adkeys_platform ON ad_keys(platform);
CREATE INDEX IF NOT EXISTS idx_adkeys_status ON ad_keys(status);

-- 3. BLOGS TABLE (Teknik Mühendislik Makaleleri CMS)
CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    author VARCHAR(128) NOT NULL,
    read_time VARCHAR(32) DEFAULT '5 dk okuma',
    tags TEXT NOT NULL, -- JSON array (e.g. '["Flutter", "Kotlin"]')
    summary TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown content
    cover_gradient VARCHAR(128),
    views INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    published_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);

-- 4. MESSAGES TABLE (Gelen İletişim & İş Birliği Talepleri)
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    phone VARCHAR(64),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'new', -- 'new', 'read', 'archived'
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 5. SETTINGS TABLE (Dinamik Sistem, SEO & GEO Parametreleri)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(32) DEFAULT 'general',
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADMIN USERS TABLE (Yönetim Paneli Güvenliği)
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    passcode_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'superadmin',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- KeskinDev Real Seed Data (No Fake Data / Zero Placeholder Fluff)
-- ============================================================

-- 1. REAL APPS
INSERT OR REPLACE INTO apps (
    id, name, slug, tagline, category, platforms, status,
    short_description, full_description, features, tech_stack,
    play_store_url, app_store_url, web_demo_url, is_active
) VALUES 
(
    'mumin-pusulasi',
    'Mümin Pusulası',
    'mumin-pusulasi',
    'Ezan Vakitleri, Kıble Pusulası & 8 Masaüstü Widget''ı',
    'Mobil Uygulama',
    '["Android", "iOS"]',
    'Yayında',
    'Diyanet uyumlu milisaniyelik ezan vakitleri, manyetik sensör destekli Kıble pusulası ve 8 adet özelleştirilebilir masaüstü widget''ı sunan kapsamlı İslami mobil asistan.',
    'Mümin Pusulası; Diyanet İşleri Başkanlığı takvimi ile tam uyumlu vakit hesaplama motoru, internetsiz çalışma desteği, kilit ekranı ve masaüstü widget''ları, zikirmatik ve kaza namazı takip modülleri içeren modern mobil uygulamadır.',
    '["Diyanet uyumlu 81 il ve tüm dünya ilçeleri için vakit hesabı", "Manyetik sensör filtreleme ile sapmasız Kıble pusulası", "8 farklı boyutta özelleştirilebilir masaüstü ve kilit ekranı widget''ı", "Vakit öncesi ve anı için özelleştirilebilir ezan bildirimleri", "Günün Ayeti, Hadis-i Şerifler ve Günlük Dualar kütüphanesi", "Hafızalı Dijital Zikirmatik & Kaza Namazı takipçisi"]',
    '["Flutter", "Kotlin", "Swift", "SQLite"]',
    'https://play.google.com/store/apps/details?id=com.muminpusulasi.app',
    '',
    '',
    1
),
(
    'site-yonetimi',
    'Site Yönetimi',
    'site-yonetimi',
    'Dijital Apartman, Rezidans ve Site Yönetim Otomasyonu',
    'Yönetim Yazılımı',
    '["Web", "Android", "iOS"]',
    'Geliştirildi / Aktif',
    'Apartman ve site yöneticileri ile kat sakinlerini buluşturan bulut tabanlı modern yönetim sistemi. Aidat, online ödeme, kasa ve arıza takip platformu.',
    'Site Yönetimi; toplu konut ve rezidansların finansal, operasyonel ve idari süreçlerini tek çatı altında toplayan web ve mobil yönetim çözümüdür.',
    '["Otomatik aidat tahakkuku ve gecikme faizi hesaplama", "Sanal POS ile kredi kartı veya havale ile tahsilat entegrasyonu", "Kasa defteri, gelir-gider ve şeffaf bilanço raporları", "Sakin arıza ve talep bildirim takip akışı", "SMS ve e-posta ile toplu duyuru altyapısı", "Karar defteri ve genel kurul dijital arşivi"]',
    '["Node.js", "React", "Flutter", "PostgreSQL"]',
    '',
    '',
    '',
    1
),
(
    'ticko',
    'Ticko',
    'ticko',
    'Çevik Görev, Biletleme (Ticket) & Ekip Üretkenlik Platformu',
    'Üretkenlik & Biletleme',
    '["Web", "Masaüstü", "Mobil"]',
    'Geliştirildi / Aktif',
    'Geliştirici ekipleri ve işletmeler için tasarlanmış minimalist iş ve destek biletleme (ticket) yönetim aracı. Kanban panoları, görev atama ve iş akışı takibi.',
    'Ticko; modern çalışma ekiplerinin görevlerini, müşteri destek biletlerini ve sprint süreçlerini karmaşadan uzak şekilde yönetmesini sağlayan çevik yazılım aracıdır.',
    '["Kanban ve liste tabanlı görev ve sprint panoları", "Müşteri ve dahili destek biletleme altyapısı", "Görev önceliklendirme ve otomatik SLA atamaları", "Zaman ve iş eforu takip kayıtları", "Webhook ve REST API entegrasyonu", "Klavye kısayolları ve odaklanma modu"]',
    '["TypeScript", "Next.js", "Node.js", "PostgreSQL"]',
    '',
    '',
    '',
    1
);

-- 2. REAL TECHNICAL BLOGS
INSERT OR REPLACE INTO blogs (
    id, slug, title, category, author, read_time, tags,
    summary, content, cover_gradient, views, is_featured, published_at
) VALUES 
(
    'blog-01',
    'mumin-pusulasi-ezan-vakitleri-mimari',
    'Mümin Pusulası: Diyanet Uyumlu Milisaniyelik Vakit Hesaplama ve Arka Plan Servis Mimarisi',
    'Mobil Geliştirme',
    'Mustafa Keskin & KeskinDev Çekirdek Ekibi',
    '6 dk okuma',
    '["Flutter", "Kotlin", "Background Services", "Android WorkManager", "Diyanet API"]',
    'Bir İslami yaşam uygulamasında en kritik faktör güvenilirlik ve tam vaktinde alarm tetiklemektir. Mümin Pusulası''nda Android 14+ pil optimizasyonlarını nasıl aştığımızı ve Diyanet algoritmalarını nasıl modellediğimizi paylaşıyoruz.',
    'İslami mobil uygulamaların en büyük teknik zorluğu, modern mobil işletim sistemlerinin pil tasarrufu algoritmaları altında arka plan servislerini durdurması veya geciktirmesidir. Mümin Pusulası mimarisinde Exact Alarms API''si ve native Receiver köprüsü ile sıfır gecikmeli vakit alarmları sağlanmıştır.',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    0,
    1,
    '2026-10-18'
),
(
    'blog-02',
    'modern-site-yonetimi-otomasyonu',
    'Modern Site ve Apartman Yönetiminde Dijitalleşme: Aidat Takibi ve Şeffaf Bilanço',
    'SaaS & Mimari',
    'KeskinDev Ürün Ekibi',
    '5 dk okuma',
    '["SaaS", "Fintech", "PostgreSQL", "React", "Node.js"]',
    'Geleneksel apartman yöneticiliği yerini şeffaf, bulut tabanlı otomasyona bırakıyor. Site Yönetimi projemizde geliştirdiğimiz sanal POS entegrasyonu ve otomatik aidat tahakkuk motoru.',
    'Site Yönetimi projesi, toplu konutların finansal ve operasyonel süreçlerini tek merkezde toplayan modern bir otomasyon mimarisidir. Sanal POS ve anlık kasa defteri mutabakatı ile aidat takibi şeffaflaştırılmıştır.',
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    0,
    0,
    '2026-10-15'
),
(
    'blog-03',
    'ticko-cevik-biletleme-ve-gorev-mimarisi',
    'Ticko: Geliştirici ve Destek Ekipleri İçin Yüksek Performanslı Biletleme (Ticket) Mimarisi',
    'Üretkenlik & Biletleme',
    'KeskinDev Mühendislik',
    '4 dk okuma',
    '["TypeScript", "Next.js", "Webhooks", "REST API", "DevOps"]',
    'Karmaşık kurumsal araçların hantallığından uzak, klavye odaklı ve anlık bildirim sağlayan biletleme aracımız Ticko''nun teknik mimarisi.',
    'Yazılım ekipleri için hız esastır. Ticko; optimistic UI, klavye kısayolları ve anlık bildirim altyapısıyla geliştirici ekiplerinin destek ve sprint yönetimini optimize eder.',
    'linear-gradient(135deg, #3730a3 0%, #6366f1 100%)',
    0,
    0,
    '2026-10-12'
);

-- 3. DYNAMIC SETTINGS & METADATA
INSERT OR REPLACE INTO settings (key, value, category, description) VALUES
('company_name', 'KeskinDev', 'general', 'Şirket Resmi Marka Adı'),
('founder', 'Mustafa Keskin', 'general', 'Kurucu Geliştirici'),
('admin_passcode', 'keskin2026', 'security', 'Yönetim Paneli Giriş Anahtarı'),
('contact_email', 'iletisim@keskindev.com', 'contact', 'Doğrudan İletişim E-Postası'),
('geo_region', 'TR-38', 'geo', 'Bölgesel GEO Kodu (Kayseri)'),
('geo_placename', 'Kayseri, Türkiye', 'geo', 'Bölgesel GEO Şehir Adı'),
('geo_latitude', '38.7205', 'geo', 'Bölgesel Enlem'),
('geo_longitude', '35.4826', 'geo', 'Bölgesel Boylam'),
('seo_title', 'KeskinDev | Modern Mobil, SaaS & Kurumsal Yazılım Teknolojileri', 'seo', 'Arama Motoru Başlığı'),
('seo_keywords', 'keskindev, mümin pusulası, site yönetimi, ticko, mobil yazılım, flutter, kayseri', 'seo', 'SEO Anahtar Kelimeler');

-- 4. DEFAULT ADMIN USER
INSERT OR REPLACE INTO admin_users (id, username, passcode_hash, role) VALUES
('admin-01', 'admin', 'keskin2026', 'superadmin');
