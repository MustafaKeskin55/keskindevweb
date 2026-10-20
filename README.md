# 🚀 KeskinDev - Kurumsal Yazılım, Teknoloji & Blog Platformu

**KeskinDev**, *Mümin Pusulası*, *Site Yönetimi* ve *Ticko* gibi on binlerce aktif kullanıcıya ulaşan yüksek performanslı mobil uygulamalar, SaaS ve kurumsal yazılımlar geliştiren yenilikçi teknoloji şirketinin resmi web platformudur.

---

## 🌟 Temel Özellikler

1. **Ultra Modern & Şık Tasarım (Dark Tech Theme)**:
   - Deep cybernetic renk paleti (#06080e), elektrik camgöbeği (#00f2fe), mor (#7f00ff) ve zümrüt (#10b981) vurgular.
   - HTML5 Canvas tabanlı etkileşimli ağ/partikül arka planı.
   - Glassmorphism (buzlu cam) kartlar ve yumuşak geçiş efektleri.
   - %100 Duyarlı (Mobil, Tablet, Masaüstü uyumlu).

2. **Dinamik Ürün Ekosistemi**:
   - Statik sabit kod içermez. Tüm ürünler (`apps.json`) API üzerinden dinamik yüklenir:
     - 🧭 **Mümin Pusulası**: Ezan Vakitleri, Manyetik Kıble Pusulası & 8 Masaüstü Widget'ı.
     - 🏢 **Site Yönetimi**: Dijital Apartman, Rezidans ve Site Yönetim Otomasyonu, Aidat & Kasa Takibi.
     - ⚡ **Ticko**: Çevik Görev, Biletleme (Ticket) & Ekip Üretkenlik Platformu.
     - ⚙️ **KeskinDev Enterprise Suite**: Özel bulut ve mobil mimariler.

3. **Gelişmiş SEO & Coğrafi (GEO) Optimizasyon**:
   - JSON-LD Structured Data: `Organization`, `WebSite`, `SoftwareApplication` (Mümin Pusulası, Site Yönetimi, Ticko), `LocalBusiness`, `BlogPosting`.
   - Coğrafi Meta Etiketleri:
     - `geo.region`: `TR-38`
     - `geo.placename`: `Kayseri, Melikgazi, Türkiye`
     - `geo.position`: `38.7205;35.4826`
     - `ICBM`: `38.7205, 35.4826`
   - Otomatik `robots.txt` ve `sitemap.xml`.

4. **Entegre Blog Portalı (`/blog`)**:
   - Anlık arama (canlı filtreleme).
   - Kategori filtreleme: *Tümü*, *Mobil Geliştirme*, *SaaS & Mimari*, *Üretkenlik*, *Rehberler & ASO*.
   - Öne çıkan makale kartı.
   - İnteraktif modal okuyucu (Markdown formatlı teknik makaleler, okuma süreleri, etiketler).

5. **Güvenli Yönetim Paneli (`/admin`)**:
   - Master PIN koruması (Varsayılan şifre: `keskin2026`).
   - Canlı İstatistikler: Toplam uygulamalar, blog yazıları, kayıtlı reklam kimlikleri, okunmamış gelen mesajlar.
   - **🔒 Reklam Kimlikleri Kasası (Ad Keys Vault - ÖZEL ALAN)**:
     - **Önemli Güvenlik Prensibi**: Reklam kimlikleri halka açık API'de veya genel web sitesinde **asla listelenmez**. Sadece yetkilendirilmiş yönetici paneline özeldir.
     - Google AdMob App ID, Banner, Geçiş (Interstitial), Ödüllü (Rewarded), Açılış (App Open), Yerel (Native) birimleri.
     - Tek tıkla kopyalama, durum değiştirme (Aktif / Duraklatıldı), düzenleme ve silme.
   - Uygulama, Blog ve İletişim Mesajları yönetimi.
   - SEO & GEO ayarları düzenleyicisi.
   - Tek tıkla JSON veritabanı yedekleme.

---

## 📁 Proje Dizin Yapısı

```
C:\KeskinDev\
├── server.js               # Express API backend sunucusu
├── package.json            # Bağımlılıklar ve scriptler
├── README.md               # Proje dökümantasyonu
├── data/                   # JSON tabanlı dinamik veritabanı
│   ├── apps.json           # Halka açık ürün ve uygulama verileri
│   ├── ad_keys.json        # 🔒 GİZLİ reklam kimlikleri kasası
│   ├── blogs.json          # Blog makaleleri ve içerikleri
│   ├── messages.json       # Ziyaretçi iletişim ve teklif talepleri
│   └── settings.json       # Firma, SEO, GEO ve güvenlik ayarları
└── public/                 # İstemci tarafı web arayüzü
    ├── index.html          # Ana kurumsal web sitesi
    ├── blog.html           # Blog portalı
    ├── admin.html          # Yönetim paneli & Reklam kasası
    ├── robots.txt          # Arama motoru robot direktifleri
    ├── sitemap.xml         # Site haritası
    ├── assets/
    │   ├── logo.svg        # KeskinDev vektörel logo
    │   └── favicon.svg     # Modern sekme simgesi
    ├── css/
    │   ├── main.css        # Genel stil ve tema sistemi
    │   ├── blog.css        # Blog ve okuyucu stilleri
    │   └── admin.css       # Yönetim paneli ve kasa stilleri
    └── js/
        ├── main.js         # Ana sayfa dinamik yükleyicisi ve partikül canvas
        ├── blog.js         # Blog arama, filtre ve modal okuyucu
        └── admin.js        # Yönetici oturumu, reklam kasası CRUD ve ayarlar
```

---

## ⚡ Çalıştırma ve Kullanım

```bash
cd C:\KeskinDev
npm install
npm start
```

Tarayıcınızda açın:
- 🌐 **Ana Web Sitesi**: `http://localhost:3000`
- 📰 **Blog Portalı**: `http://localhost:3000/blog`
- 🛡️ **Yönetim Paneli**: `http://localhost:3000/admin` (Şifre: `keskin2026`)
