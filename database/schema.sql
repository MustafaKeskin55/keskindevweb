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
