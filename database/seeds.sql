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
