// KeskinDev Admin Dashboard & Tam Site CMS Logic
// 100% Dynamic Cloudflare D1 SQL & SQLite Engine

let adminToken = localStorage.getItem('kd_admin_token') || null;
let currentApps = [];
let currentServices = [];
let currentAdKeys = [];
let currentBlogs = [];
let currentMessages = [];
let currentSettings = {};

const AdminIcons = {
  copy: '<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  trash: '<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  edit: '<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  check: '<svg style="width: 14px; height: 14px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoginHandler();
  initTabNavigation();
  initModals();
  setupAdKeyFilters();
  initHeroForm();
  initBrandingForm();
  initSettingsForm();
  initBackupDownload();
});

// Toast notification helper
function alertToast(msg, isError = false) {
  const container = document.getElementById('admin-toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast-notice' + (isError ? ' error' : '');
  toast.innerHTML = (isError ? '⚠️ ' : '✅ ') + msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Global Tab & Navigation Helpers
window.switchToTab = function(tabName) {
  const btn = document.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.click();
};

// ==========================================
// 1. AUTH & LOCKSCREEN VERIFICATION
// ==========================================
async function checkAuth() {
  const lockScreen = document.getElementById('lock-screen');
  const adminLayout = document.getElementById('admin-layout');

  if (!adminToken) {
    showLockScreen();
    return;
  }

  try {
    const res = await fetch('/api/admin/auth/verify', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      lockScreen.style.display = 'none';
      adminLayout.style.display = 'flex';
      loadAllAdminData();
    } else {
      showLockScreen();
    }
  } catch (err) {
    showLockScreen();
  }
}

function showLockScreen() {
  document.getElementById('lock-screen').style.display = 'flex';
  document.getElementById('admin-layout').style.display = 'none';
  localStorage.removeItem('kd_admin_token');
  adminToken = null;
}

function initLoginHandler() {
  const form = document.getElementById('admin-login-form');
  const errorEl = document.getElementById('login-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = document.getElementById('admin-pin-input').value.trim();
    if (errorEl) errorEl.style.display = 'none';

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: pin })
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        adminToken = data.token;
        localStorage.setItem('kd_admin_token', adminToken);
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('admin-layout').style.display = 'flex';
        loadAllAdminData();
        alertToast('Yönetici girişi başarılı.');
      } else {
        if (errorEl) {
          errorEl.textContent = data.error || 'Geçersiz şifre!';
          errorEl.style.display = 'flex';
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Sunucuya bağlanılamadı.';
        errorEl.style.display = 'flex';
      }
    }
  });

  // Logout
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
      } catch (e) {}
      showLockScreen();
      alertToast('Oturum kapatıldı.');
    });
  }
}

// ==========================================
// 2. TAB NAVIGATION
// ==========================================
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const currentTabTitle = document.getElementById('admin-page-title');

  const titleMap = {
    overview: 'Genel Bakış & İstatistikler',
    hero: 'Hero & Ana Sayfa İçerik Yönetimi',
    apps: 'Uygulamalar & Yazılım Ürünleri CMS',
    services: 'Hizmetlerimiz & Çözümler CMS',
    blogs: 'Teknik Blog Yazıları Yönetimi',
    branding: 'Görseller, Medya & Marka Yönetimi',
    vault: 'Gizli Reklam Kimlikleri Kasası',
    messages: 'Gelen İletişim Mesajları',
    settings: 'SEO, GEO & İletişim Ayarları',
    backup: 'Veri Tabanı Dışa Aktarımı'
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');

      if (currentTabTitle) {
        currentTabTitle.textContent = titleMap[target] || 'Yönetim Konsolu';
      }
    });
  });
}

// ==========================================
// 3. LOAD ALL ADMIN DATA
// ==========================================
async function loadAllAdminData() {
  await Promise.all([
    loadStats(),
    loadHeroSettings(),
    loadApps(),
    loadServices(),
    loadBlogs(),
    loadBrandingSettings(),
    loadAdKeys(),
    loadMessages(),
    loadSettings()
  ]);
}

// ==========================================
// 4. STATS COUNTERS
// ==========================================
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    const s = json.data;
    const elApps = document.getElementById('count-apps') || document.getElementById('stat-total-apps');
    const elBlogs = document.getElementById('count-blogs') || document.getElementById('stat-total-blogs');
    const elAdKeys = document.getElementById('count-adkeys') || document.getElementById('stat-total-adkeys');
    const elMsg = document.getElementById('count-messages') || document.getElementById('stat-unread-msg');

    if (elApps) elApps.textContent = s.totalApps;
    if (elBlogs) elBlogs.textContent = s.totalBlogs;
    if (elAdKeys) elAdKeys.textContent = s.activeAdKeys !== undefined ? `${s.activeAdKeys} / ${s.totalAdKeys}` : s.totalAdKeys;
    if (elMsg) elMsg.textContent = s.unreadMessages;
  } catch (e) {
    console.error('Stats error:', e);
  }
}

// ==========================================
// 5. HERO & HOMEPAGE CMS
// ==========================================
async function loadHeroSettings() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success || !json.data) return;

    const h = json.data.hero || {};
    const badgeInp = document.getElementById('hero-inp-badge');
    const titleInp = document.getElementById('hero-inp-title');
    const highlightInp = document.getElementById('hero-inp-highlight');
    const subtitleInp = document.getElementById('hero-inp-subtitle');
    const btn1Text = document.getElementById('hero-inp-btn1-text');
    const btn1Link = document.getElementById('hero-inp-btn1-link');
    const btn2Text = document.getElementById('hero-inp-btn2-text');
    const btn2Link = document.getElementById('hero-inp-btn2-link');

    if (badgeInp) badgeInp.value = h.badge || 'Yazılım & Dijital Ürün Stüdyosu';
    if (titleInp) titleInp.value = h.title || 'Geleceğe yön veren, güvenilir ve yüksek performanslı yazılımlar';
    if (highlightInp) highlightInp.value = h.titleHighlight || 'yüksek performanslı';
    if (subtitleInp) subtitleInp.value = h.subtitle || 'Yenilikçi mobil uygulamalar, SaaS ve kurumsal yönetim yazılımları geliştiriyoruz.';
    if (btn1Text) btn1Text.value = h.btnPrimaryText || 'Ürünleri İncele';
    if (btn1Link) btn1Link.value = h.btnPrimaryLink || '#products';
    if (btn2Text) btn2Text.value = h.btnSecondaryText || 'Mühendislik Notları';
    if (btn2Link) btn2Link.value = h.btnSecondaryLink || '/blog';

    updateHeroLivePreview();
  } catch (e) {
    console.error('Hero settings load error:', e);
  }
}

function updateHeroLivePreview() {
  const badgeInp = document.getElementById('hero-inp-badge');
  const titleInp = document.getElementById('hero-inp-title');
  const highlightInp = document.getElementById('hero-inp-highlight');
  const subtitleInp = document.getElementById('hero-inp-subtitle');
  const btn1Text = document.getElementById('hero-inp-btn1-text');
  const btn2Text = document.getElementById('hero-inp-btn2-text');

  const prevBadge = document.getElementById('prev-badge');
  const prevTitle = document.getElementById('prev-title');
  const prevSubtitle = document.getElementById('prev-subtitle');
  const prevBtn1 = document.getElementById('prev-btn1');
  const prevBtn2 = document.getElementById('prev-btn2');

  if (prevBadge && badgeInp) {
    prevBadge.textContent = badgeInp.value || 'Yazılım & Dijital Ürün Stüdyosu';
  }

  if (prevTitle && titleInp) {
    const rawTitle = titleInp.value || 'Geleceğe yön veren, güvenilir ve yüksek performanslı yazılımlar';
    const hl = highlightInp ? highlightInp.value.trim() : '';
    if (hl && rawTitle.includes(hl)) {
      prevTitle.innerHTML = rawTitle.replace(hl, `<span style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${hl}</span>`);
    } else if (hl) {
      prevTitle.innerHTML = rawTitle + ` <span style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${hl}</span>`;
    } else {
      prevTitle.textContent = rawTitle;
    }
  }

  if (prevSubtitle && subtitleInp) {
    prevSubtitle.textContent = subtitleInp.value || '';
  }

  if (prevBtn1 && btn1Text) {
    prevBtn1.textContent = btn1Text.value || 'Ürünleri İncele';
  }

  if (prevBtn2 && btn2Text) {
    prevBtn2.textContent = btn2Text.value || 'Mühendislik Notları';
  }
}

function initHeroForm() {
  const form = document.getElementById('form-hero-settings');
  if (!form) return;

  // Real-time live preview event listeners
  const watchedInputs = [
    'hero-inp-badge', 'hero-inp-title', 'hero-inp-highlight',
    'hero-inp-subtitle', 'hero-inp-btn1-text', 'hero-inp-btn2-text'
  ];
  watchedInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateHeroLivePreview);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      hero_badge: document.getElementById('hero-inp-badge')?.value || '',
      hero_title: document.getElementById('hero-inp-title')?.value || '',
      hero_title_highlight: document.getElementById('hero-inp-highlight')?.value || '',
      hero_subtitle: document.getElementById('hero-inp-subtitle')?.value || '',
      hero_btn_primary_text: document.getElementById('hero-inp-btn1-text')?.value || '',
      hero_btn_primary_link: document.getElementById('hero-inp-btn1-link')?.value || '',
      hero_btn_secondary_text: document.getElementById('hero-inp-btn2-text')?.value || '',
      hero_btn_secondary_link: document.getElementById('hero-inp-btn2-link')?.value || ''
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alertToast('Hero ve ana sayfa içerikleri başarıyla kaydedildi.');
      } else {
        alertToast('Hero içerikleri kaydedilemedi.', true);
      }
    } catch (err) {
      alertToast('Sunucu hatası oluştu.', true);
    }
  });
}

// ==========================================
// 6. APPS & PRODUCTS FULL CRUD
// ==========================================
async function loadApps() {
  const container = document.getElementById('admin-apps-list');
  const adAppFilter = document.getElementById('filter-ad-app');
  const modalAdSelect = document.getElementById('modal-ad-app-select');

  try {
    const res = await fetch('/api/admin/apps', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    currentApps = json.data || [];

    // Populate selects
    if (adAppFilter) {
      adAppFilter.innerHTML = '<option value="all">Tümü (Hepsi)</option>' +
        currentApps.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    }
    if (modalAdSelect) {
      modalAdSelect.innerHTML = currentApps.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    }

    if (!container) return;

    if (currentApps.length === 0) {
      container.innerHTML = `
        <div class="admin-table-card" style="padding: 40px; text-align: center; grid-column: 1/-1;">
          <h4 style="color: #ffffff; margin: 0 0 6px 0;">Henüz kayıtlı yazılım ürünü yok</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0 0 16px 0;">
            Yeni bir ürün ekleyerek ana sayfada yayınlayabilirsiniz.
          </p>
          <button class="btn btn-primary" onclick="openAppModal()">+ Yeni Uygulama Ekle</button>
        </div>
      `;
      return;
    }

    container.innerHTML = currentApps.map(a => `
      <div class="admin-app-card">
        <div class="admin-app-header">
          <h4 class="admin-app-title">${a.name}</h4>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="badge-status ${a.isActive ? 'active' : 'paused'}">${a.status || (a.isActive ? 'Yayında' : 'Pasif')}</span>
            <span class="badge-platform">${a.category}</span>
          </div>
        </div>
        <div class="admin-app-tagline">${a.tagline || ''}</div>
        <p class="admin-app-desc">${a.shortDescription || ''}</p>
        <div class="admin-app-meta">
          <strong>Platformlar:</strong> ${(a.platforms || []).join(', ') || '-'}<br/>
          <strong>Teknoloji:</strong> ${(a.techStack || []).join(', ') || '-'}
          ${(a.links?.webDemo || a.web_demo_url) ? `<br/><strong>Web Sitesi:</strong> <a href="${a.links?.webDemo || a.web_demo_url}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${a.links?.webDemo || a.web_demo_url}</a>` : ''}
          ${(a.links?.playStore || a.play_store_url) ? `<br/><strong>Google Play:</strong> <a href="${a.links?.playStore || a.play_store_url}" target="_blank" style="color: #34d399; text-decoration: underline;">Play Store</a>` : ''}
          ${(a.links?.appStore || a.app_store_url) ? `<br/><strong>App Store:</strong> <a href="${a.links?.appStore || a.app_store_url}" target="_blank" style="color: #a78bfa; text-decoration: underline;">App Store</a>` : ''}
        </div>
        <div class="card-actions-bar">
          <button class="btn-card-edit" onclick="editApp('${a.id}')">
            ${AdminIcons.edit}
            <span>Düzenle</span>
          </button>
          <button class="btn-card-delete" onclick="deleteApp('${a.id}')">
            ${AdminIcons.trash}
            <span>Sil</span>
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Apps load error:', e);
  }
}

window.openAppModal = function() {
  const form = document.getElementById('form-app');
  const modal = document.getElementById('modal-app');
  const titleText = document.getElementById('modal-app-title-text');
  const saveBtn = document.getElementById('btn-save-app');

  if (form) form.reset();
  if (document.getElementById('app-edit-id')) document.getElementById('app-edit-id').value = '';
  if (document.getElementById('app-inp-webdemo')) document.getElementById('app-inp-webdemo').value = '';
  if (titleText) titleText.textContent = 'Yeni Uygulama Ekle';
  if (saveBtn) saveBtn.textContent = 'Uygulamayı Kaydet';
  if (modal) modal.classList.add('active');
};

window.editApp = function(id) {
  const app = currentApps.find(a => a.id === id);
  if (!app) return;

  const form = document.getElementById('form-app');
  const modal = document.getElementById('modal-app');
  const titleText = document.getElementById('modal-app-title-text');
  const saveBtn = document.getElementById('btn-save-app');

  if (titleText) titleText.textContent = 'Uygulamayı Düzenle: ' + app.name;
  if (saveBtn) saveBtn.textContent = 'Değişiklikleri Kaydet';

  document.getElementById('app-edit-id').value = app.id;
  document.getElementById('app-inp-name').value = app.name || '';
  document.getElementById('app-inp-category').value = app.category || '';
  document.getElementById('app-inp-slug').value = app.slug || '';
  document.getElementById('app-inp-status').value = app.status || 'Yayında';
  document.getElementById('app-inp-tagline').value = app.tagline || '';
  document.getElementById('app-inp-platforms').value = (app.platforms || []).join(', ');
  document.getElementById('app-inp-tech').value = (app.techStack || []).join(', ');
  document.getElementById('app-inp-short-desc').value = app.shortDescription || '';
  document.getElementById('app-inp-features').value = (app.features || []).join('\n');
  document.getElementById('app-inp-playstore').value = app.links?.playStore || app.play_store_url || '';
  document.getElementById('app-inp-appstore').value = app.links?.appStore || app.app_store_url || '';
  if (document.getElementById('app-inp-webdemo')) {
    document.getElementById('app-inp-webdemo').value = app.links?.webDemo || app.web_demo_url || '';
  }
  document.getElementById('app-inp-is-active').checked = app.isActive !== false;

  if (modal) modal.classList.add('active');
};

window.deleteApp = async function(id) {
  if (!confirm('Bu yazılım ürününü silmek istediğinize emin misiniz? Ana sayfadaki kart ve bağlı veriler silinecektir.')) return;

  try {
    const res = await fetch(`/api/admin/apps/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      alertToast('Uygulama başarıyla silindi.');
      loadApps();
      loadStats();
    } else {
      alertToast('Uygulama silinemedi.', true);
    }
  } catch (e) {
    alertToast('Sunucu hatası.', true);
  }
};

// ==========================================
// 7. SERVICES & CAPABILITIES FULL CRUD
// ==========================================
async function loadServices() {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success || !json.data) return;

    currentServices = json.data.services || [];

    if (currentServices.length === 0) {
      container.innerHTML = `
        <div class="admin-table-card" style="padding: 40px; text-align: center; grid-column: 1/-1;">
          <h4 style="color: #ffffff; margin: 0 0 6px 0;">Henüz tanımlı bir hizmet bulunmuyor</h4>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0 0 16px 0;">
            Hizmet kartı ekleyerek ana sayfada sunduğunuz yetenekleri sergileyin.
          </p>
          <button class="btn btn-primary" onclick="openServiceModal()">+ Yeni Hizmet Ekle</button>
        </div>
      `;
      return;
    }

    container.innerHTML = currentServices.map((s, idx) => `
      <div class="admin-app-card">
        <div class="admin-app-header">
          <h4 class="admin-app-title">${s.title}</h4>
          <span class="badge-status active">${s.icon || 'Hizmet'}</span>
        </div>
        <p class="admin-app-desc">${s.desc}</p>
        <div class="card-actions-bar">
          <button class="btn-card-edit" onclick="editService('${s.id || 'srv-' + idx}')">
            ${AdminIcons.edit}
            <span>Düzenle</span>
          </button>
          <button class="btn-card-delete" onclick="deleteService('${s.id || 'srv-' + idx}')">
            ${AdminIcons.trash}
            <span>Sil</span>
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Services load error:', e);
  }
}

window.openServiceModal = function() {
  const form = document.getElementById('form-service');
  const modal = document.getElementById('modal-service');
  const titleText = document.getElementById('modal-service-title-text');

  if (form) form.reset();
  if (document.getElementById('service-edit-id')) document.getElementById('service-edit-id').value = '';
  if (titleText) titleText.textContent = 'Yeni Hizmet Ekle';
  if (modal) modal.classList.add('active');
};

window.editService = function(id) {
  const srv = currentServices.find((s, idx) => (s.id === id || ('srv-' + idx) === id));
  if (!srv) return;

  const modal = document.getElementById('modal-service');
  const titleText = document.getElementById('modal-service-title-text');

  if (titleText) titleText.textContent = 'Hizmeti Düzenle: ' + srv.title;
  document.getElementById('service-edit-id').value = srv.id || id;
  document.getElementById('service-inp-title').value = srv.title || '';
  document.getElementById('service-inp-icon').value = srv.icon || 'mobile';
  document.getElementById('service-inp-desc').value = srv.desc || '';

  if (modal) modal.classList.add('active');
};

window.deleteService = async function(id) {
  if (!confirm('Bu hizmet kartını silmek istediğinize emin misiniz?')) return;

  const updatedServices = currentServices.filter((s, idx) => !(s.id === id || ('srv-' + idx) === id));

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        services_json: JSON.stringify(updatedServices)
      })
    });
    if (res.ok) {
      alertToast('Hizmet silindi.');
      loadServices();
    } else {
      alertToast('Silme işlemi başarısız.', true);
    }
  } catch (e) {
    alertToast('Sunucu hatası.', true);
  }
};

// ==========================================
// 8. BLOGS MANAGEMENT FULL CRUD
// ==========================================
async function loadBlogs() {
  const tableBody = document.getElementById('admin-blogs-table-body');
  if (!tableBody) return;

  try {
    const res = await fetch('/api/admin/blogs', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    currentBlogs = json.data || [];

    if (currentBlogs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 36px; color: var(--text-secondary);">
            Henüz blog makalesi eklenmemiş. "+ Yeni Makale Yaz" butonuna basarak ilk makalenizi yayınlayabilirsiniz.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = currentBlogs.map(b => `
      <tr>
        <td>
          <strong style="color: #ffffff;">${b.title}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">/blog#${b.slug}</div>
        </td>
        <td><span class="badge-status active">${b.category}</span></td>
        <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-secondary);">${b.date || '-'}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon-action" title="Makaleyi Düzenle" onclick="editBlog('${b.id}')">
              ${AdminIcons.edit}
            </button>
            <button class="btn-icon-action delete" title="Yazıyı Sil" onclick="deleteBlog('${b.id}')">
              ${AdminIcons.trash}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Blogs error:', e);
  }
}

window.openBlogModal = function() {
  const form = document.getElementById('form-add-blog');
  const modal = document.getElementById('modal-add-blog');
  const titleText = document.getElementById('modal-blog-title-text');
  const saveBtn = document.getElementById('btn-save-blog');

  if (form) form.reset();
  if (document.getElementById('blog-edit-id')) document.getElementById('blog-edit-id').value = '';
  if (titleText) titleText.textContent = 'Yeni Blog Makalesi Yayınla';
  if (saveBtn) saveBtn.textContent = 'Makaleyi Yayınla';
  if (modal) modal.classList.add('active');
};

window.editBlog = function(id) {
  const blog = currentBlogs.find(b => b.id === id);
  if (!blog) return;

  const modal = document.getElementById('modal-add-blog');
  const titleText = document.getElementById('modal-blog-title-text');
  const saveBtn = document.getElementById('btn-save-blog');

  if (titleText) titleText.textContent = 'Makaleyi Düzenle: ' + blog.title;
  if (saveBtn) saveBtn.textContent = 'Değişiklikleri Kaydet';

  document.getElementById('blog-edit-id').value = blog.id;
  document.getElementById('blog-inp-title').value = blog.title || '';
  document.getElementById('blog-inp-slug').value = blog.slug || '';
  document.getElementById('blog-inp-category').value = blog.category || 'Mobil Geliştirme';
  document.getElementById('blog-inp-author').value = blog.author || 'Mustafa Keskin & KeskinDev';
  document.getElementById('blog-inp-readtime').value = blog.readTime || '5 dk okuma';
  document.getElementById('blog-inp-tags').value = (blog.tags || []).join(', ');
  document.getElementById('blog-inp-gradient').value = blog.coverGradient || '';
  document.getElementById('blog-inp-summary').value = blog.summary || '';
  document.getElementById('blog-inp-content').value = blog.content || '';
  document.getElementById('blog-inp-featured').checked = Boolean(blog.featured);

  if (modal) modal.classList.add('active');
};

window.deleteBlog = async function(id) {
  if (!confirm('Bu blog makalesini silmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch(`/api/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      alertToast('Blog yazısı silindi.');
      loadBlogs();
      loadStats();
    } else {
      alertToast('Silme işlemi başarısız.', true);
    }
  } catch (e) {
    console.error('Delete blog error:', e);
  }
};

// ==========================================
// 9. BRANDING & MEDIA (GÖRSELLER) CMS
// ==========================================
async function loadBrandingSettings() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success || !json.data) return;

    const b = json.data.branding || {};
    const logoInp = document.getElementById('inp-logo-url');
    const favInp = document.getElementById('inp-favicon-url');
    const ogInp = document.getElementById('inp-og-image');

    const prevLogo = document.getElementById('prev-logo-img');
    const prevFav = document.getElementById('prev-favicon-img');
    const prevOg = document.getElementById('prev-og-img');

    if (logoInp) logoInp.value = b.logoUrl || '/assets/logo.svg';
    if (favInp) favInp.value = b.faviconUrl || '/assets/favicon.svg';
    if (ogInp) ogInp.value = b.ogImage || '/assets/logo.svg';

    if (prevLogo) prevLogo.src = b.logoUrl || '/assets/logo.svg';
    if (prevFav) prevFav.src = b.faviconUrl || '/assets/favicon.svg';
    if (prevOg) prevOg.src = b.ogImage || '/assets/logo.svg';
  } catch (e) {
    console.error('Branding load error:', e);
  }
}

function initBrandingForm() {
  const form = document.getElementById('form-branding-settings');
  if (!form) return;

  const logoInp = document.getElementById('inp-logo-url');
  const favInp = document.getElementById('inp-favicon-url');
  const ogInp = document.getElementById('inp-og-image');

  const prevLogo = document.getElementById('prev-logo-img');
  const prevFav = document.getElementById('prev-favicon-img');
  const prevOg = document.getElementById('prev-og-img');

  if (logoInp && prevLogo) {
    logoInp.addEventListener('input', () => { prevLogo.src = logoInp.value.trim(); });
  }
  if (favInp && prevFav) {
    favInp.addEventListener('input', () => { prevFav.src = favInp.value.trim(); });
  }
  if (ogInp && prevOg) {
    ogInp.addEventListener('input', () => { prevOg.src = ogInp.value.trim(); });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      branding_logo_url: logoInp?.value.trim() || '/assets/logo.svg',
      branding_favicon_url: favInp?.value.trim() || '/assets/favicon.svg',
      branding_og_image: ogInp?.value.trim() || '/assets/logo.svg'
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alertToast('Görsel ve marka ayarları başarıyla kaydedildi.');
      } else {
        alertToast('Kayıt başarısız.', true);
      }
    } catch (err) {
      alertToast('Sunucu hatası oluştu.', true);
    }
  });
}

// ==========================================
// 10. REKLAM KIMLIKLERI KASASI (VAULT)
// ==========================================
window.openAdKeyModal = function() {
  const modal = document.getElementById('modal-add-adkey');
  if (modal) modal.classList.add('active');
};

async function loadAdKeys() {
  try {
    const res = await fetch('/api/admin/ad-keys', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    currentAdKeys = json.data || [];
    renderAdKeysTable(currentAdKeys);
  } catch (e) {
    console.error('Ad keys error:', e);
  }
}

function renderAdKeysTable(keys) {
  const tableBody = document.getElementById('ad-keys-table-body');
  const emptyState = document.getElementById('ad-keys-empty');
  const tableEl = tableBody ? tableBody.closest('table') : null;

  if (!tableBody) return;

  if (!keys || keys.length === 0) {
    tableBody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (tableEl) tableEl.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (tableEl) tableEl.style.display = 'table';

  tableBody.innerHTML = keys.map(k => `
    <tr>
      <td>
        <strong style="color: #ffffff;">${k.appName}</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">${k.network}</div>
      </td>
      <td>
        <span class="badge-platform">${k.platform}</span>
      </td>
      <td>
        <strong>${k.unitType}</strong>
        ${k.testMode ? '<span class="badge-test">TEST</span>' : ''}
      </td>
      <td>
        <span class="ad-unit-code">
          <code>${k.adUnitId}</code>
          <button class="btn-copy-code" title="Kimliği Kopyala" onclick="copyToClipboard('${k.adUnitId}')">
            ${AdminIcons.copy}
          </button>
        </span>
      </td>
      <td>
        <button class="badge-status ${k.status}" style="cursor: pointer; border: none; font-family: inherit;" onclick="toggleAdKeyStatus('${k.id}')">
          ${k.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
        </button>
      </td>
      <td style="max-width: 220px; font-size: 0.84rem; color: var(--text-secondary);">
        ${k.notes || '-'}
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-icon-action delete" title="Kasadan Sil" onclick="deleteAdKey('${k.id}')">
            ${AdminIcons.trash}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupAdKeyFilters() {
  const appFilter = document.getElementById('filter-ad-app');
  const platformFilter = document.getElementById('filter-ad-platform');

  function applyFilter() {
    let list = currentAdKeys;
    const selectedApp = appFilter?.value || 'all';
    const selectedPlatform = platformFilter?.value || 'all';

    if (selectedApp !== 'all') {
      list = list.filter(k => k.appId === selectedApp);
    }
    if (selectedPlatform !== 'all') {
      list = list.filter(k => k.platform.toLowerCase() === selectedPlatform.toLowerCase());
    }
    renderAdKeysTable(list);
  }

  if (appFilter) appFilter.onchange = applyFilter;
  if (platformFilter) platformFilter.onchange = applyFilter;
}

window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alertToast('Reklam birim kimliği panoya kopyalandı.');
    }).catch(() => {
      prompt('Reklam Kimliği:', text);
    });
  } else {
    prompt('Reklam Kimliği:', text);
  }
};

window.toggleAdKeyStatus = async function(id) {
  try {
    const res = await fetch(`/api/admin/ad-keys/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      loadAdKeys();
      loadStats();
      alertToast('Reklam durumu güncellendi.');
    }
  } catch (e) {
    console.error('Toggle error:', e);
  }
};

window.deleteAdKey = async function(id) {
  if (!confirm('Bu reklam birim kimliğini kasadan silmek istediğinize emin misiniz?')) return;

  try {
    const res = await fetch(`/api/admin/ad-keys/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.ok) {
      alertToast('Reklam kimliği kasadan silindi.');
      loadAdKeys();
      loadStats();
    }
  } catch (e) {
    console.error('Delete error:', e);
  }
};

// ==========================================
// 11. MESSAGES INBOX
// ==========================================
async function loadMessages() {
  const container = document.getElementById('admin-messages-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/messages', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    currentMessages = json.data || [];
    if (currentMessages.length === 0) {
      container.innerHTML = `
        <div class="admin-table-card" style="padding: 48px; text-align: center;">
          <div class="empty-icon-wrap" style="margin: 0 auto 12px auto;">
            <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h4 style="color: #ffffff; margin: 0 0 6px 0;">Henüz yeni bir mesaj bulunmuyor</h4>
          <p style="color: var(--text-secondary); font-size: 0.86rem; margin: 0;">
            Web sitesi iletişim formunu dolduran ziyaretçilerin iletileri burada listelenir.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = currentMessages.map(m => `
      <div class="admin-table-card" style="padding: 22px; margin-bottom: 14px; border-left: 3px solid ${m.status === 'new' ? 'var(--accent-blue)' : 'var(--admin-card-border)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h4 style="font-size: 1.05rem; margin: 0 0 4px 0; color: #ffffff;">${m.name} <span style="font-size: 0.82rem; font-weight: normal; color: var(--text-muted);">(${m.email} / ${m.phone || 'Tel yok'})</span></h4>
            <div style="font-size: 0.84rem; color: var(--accent-blue); font-weight: 600;">Konu: ${m.subject || 'Genel İletişim'}</div>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
            ${new Date(m.created_at || m.date || Date.now()).toLocaleString('tr-TR')}
          </div>
        </div>
        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; background: rgba(0,0,0,0.3); padding: 14px; border-radius: 8px; margin: 0 0 14px 0;">
          ${m.message}
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          ${m.status === 'new' ? `<button class="btn btn-secondary" style="font-size: 0.78rem;" onclick="markMessageRead('${m.id}')">Okundu İşaretle</button>` : ''}
          <button class="btn btn-danger" style="font-size: 0.78rem;" onclick="deleteMessage('${m.id}')">Sil</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Messages error:', e);
  }
}

window.markMessageRead = async function(id) {
  try {
    await fetch(`/api/admin/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadMessages();
    loadStats();
    alertToast('Mesaj okundu olarak işaretlendi.');
  } catch (e) {}
};

window.deleteMessage = async function(id) {
  if (!confirm('Bu iletişim iletisini silmek istediğinize emin misiniz?')) return;
  try {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    loadMessages();
    loadStats();
    alertToast('Mesaj silindi.');
  } catch (e) {}
};

// ==========================================
// 12. GENERAL SETTINGS, SEO & GEO
// ==========================================
async function loadSettings() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success || !json.data) return;

    currentSettings = json.data;
    const s = json.data;

    if (form.companyName) form.companyName.value = s.companyName || '';
    if (form.founder) form.founder.value = s.founder || '';
    if (form.contactEmail) form.contactEmail.value = s.contact?.email || '';
    if (form.contactPhone) form.contactPhone.value = s.contact?.phone || '';
    if (form.contactAddress) form.contactAddress.value = s.contact?.address || '';

    if (form.socialGithub) form.socialGithub.value = s.social?.github || '';
    if (form.socialPlaystore) form.socialPlaystore.value = s.social?.playStore || '';
    if (form.socialTwitter) form.socialTwitter.value = s.social?.twitter || '';
    if (form.socialLinkedin) form.socialLinkedin.value = s.social?.linkedin || '';

    if (form.geoRegion) form.geoRegion.value = s.geo?.region || 'TR-38';
    if (form.geoPlacename) form.geoPlacename.value = s.geo?.placename || 'Kayseri, Melikgazi, Türkiye';
    if (form.geoLatitude) form.geoLatitude.value = s.geo?.latitude || '38.7205';
    if (form.geoLongitude) form.geoLongitude.value = s.geo?.longitude || '35.4826';

    if (form.metaTitle) form.metaTitle.value = s.seo?.title || '';
    if (form.metaKeywords) form.metaKeywords.value = s.seo?.metaKeywords || '';
    if (form.footerDesc) form.footerDesc.value = s.footer?.desc || '';
    if (form.footerCopyright) form.footerCopyright.value = s.footer?.copyright || '';
    if (form.adminPasscode) form.adminPasscode.value = s.adminPasscode || '';
  } catch (e) {
    console.error('Settings error:', e);
  }
}

function initSettingsForm() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      company_name: form.companyName.value.trim(),
      founder: form.founder?.value.trim() || 'Mustafa Keskin',
      contact_email: form.contactEmail.value.trim(),
      contact_phone: form.contactPhone.value.trim(),
      contact_address: form.contactAddress.value.trim(),
      social_github: form.socialGithub.value.trim(),
      social_playstore: form.socialPlaystore.value.trim(),
      social_twitter: form.socialTwitter.value.trim(),
      social_linkedin: form.socialLinkedin.value.trim(),
      geo_region: form.geoRegion.value.trim(),
      geo_placename: form.geoPlacename.value.trim(),
      geo_latitude: form.geoLatitude.value.trim(),
      geo_longitude: form.geoLongitude.value.trim(),
      seo_title: form.metaTitle.value.trim(),
      seo_keywords: form.metaKeywords.value.trim(),
      footer_desc: form.footerDesc.value.trim(),
      footer_copyright: form.footerCopyright.value.trim(),
      admin_passcode: form.adminPasscode.value.trim()
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alertToast('Sistem, SEO ve iletişim ayarları başarıyla kaydedildi.');
      } else {
        alertToast('Ayarlar kaydedilemedi.', true);
      }
    } catch (e) {
      alertToast('Ayarlar kaydedilemedi: Sunucu hatası.', true);
    }
  });
}

// ==========================================
// 13. BACKUP & EXPORT
// ==========================================
function initBackupDownload() {
  const btn = document.getElementById('btn-download-backup');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keskindev_d1_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alertToast('Veritabanı yedeği başarıyla indirildi.');
    } catch (e) {
      alertToast('Yedek indirilemedi.', true);
    }
  });
}

// ==========================================
// 14. MODALS & SUBMIT EVENT WIRING
// ==========================================
function initModals() {
  const addAdKeyBtn = document.getElementById('btn-add-adkey');
  const adKeyModal = document.getElementById('modal-add-adkey');
  const adKeyForm = document.getElementById('form-add-adkey');

  const appModal = document.getElementById('modal-app');
  const appForm = document.getElementById('form-app');

  const serviceModal = document.getElementById('modal-service');
  const serviceForm = document.getElementById('form-service');

  const blogModal = document.getElementById('modal-add-blog');
  const blogForm = document.getElementById('form-add-blog');

  // Ad Key Submit
  if (adKeyForm && adKeyModal) {
    adKeyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        appId: adKeyForm.appId.value,
        appName: adKeyForm.appId.options[adKeyForm.appId.selectedIndex]?.text || adKeyForm.appId.value,
        network: adKeyForm.network.value,
        platform: adKeyForm.platform.value,
        unitType: adKeyForm.unitType.value,
        adUnitId: adKeyForm.adUnitId.value.trim(),
        testMode: adKeyForm.testMode.checked,
        status: adKeyForm.status.value,
        notes: adKeyForm.notes.value.trim()
      };

      try {
        const res = await fetch('/api/admin/ad-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          alertToast('Yeni reklam birim kimliği kasaya kaydedildi.');
          adKeyForm.reset();
          adKeyModal.classList.remove('active');
          loadAdKeys();
          loadStats();
        } else {
          alertToast(data.error || 'Hata oluştu.', true);
        }
      } catch (err) {
        alertToast('Sunucu hatası oluştu.', true);
      }
    });
  }

  // App Form Submit (Create & Edit)
  if (appForm && appModal) {
    appForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('app-edit-id')?.value.trim();
      const payload = {
        name: document.getElementById('app-inp-name').value.trim(),
        category: document.getElementById('app-inp-category').value.trim(),
        slug: document.getElementById('app-inp-slug').value.trim(),
        status: document.getElementById('app-inp-status').value.trim(),
        tagline: document.getElementById('app-inp-tagline').value.trim(),
        platforms: document.getElementById('app-inp-platforms').value.split(',').map(s => s.trim()).filter(Boolean),
        techStack: document.getElementById('app-inp-tech').value.split(',').map(s => s.trim()).filter(Boolean),
        shortDescription: document.getElementById('app-inp-short-desc').value.trim(),
        features: document.getElementById('app-inp-features').value.split('\n').map(s => s.trim()).filter(Boolean),
        links: {
          playStore: document.getElementById('app-inp-playstore')?.value.trim() || '',
          appStore: document.getElementById('app-inp-appstore')?.value.trim() || '',
          webDemo: document.getElementById('app-inp-webdemo')?.value.trim() || ''
        },
        isActive: document.getElementById('app-inp-is-active').checked
      };

      try {
        const url = editId ? `/api/admin/apps/${editId}` : '/api/admin/apps';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          alertToast(editId ? 'Uygulama başarıyla güncellendi.' : 'Yeni uygulama kaydedildi.');
          appForm.reset();
          appModal.classList.remove('active');
          loadApps();
          loadStats();
        } else {
          alertToast(data.error || 'İşlem başarısız.', true);
        }
      } catch (err) {
        alertToast('Sunucu hatası oluştu.', true);
      }
    });
  }

  // Service Form Submit (Create & Edit)
  if (serviceForm && serviceModal) {
    serviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('service-edit-id')?.value.trim();
      const title = document.getElementById('service-inp-title').value.trim();
      const icon = document.getElementById('service-inp-icon').value;
      const desc = document.getElementById('service-inp-desc').value.trim();

      let updatedList = [...currentServices];

      if (editId) {
        const idx = updatedList.findIndex((s, i) => (s.id === editId || ('srv-' + i) === editId));
        if (idx !== -1) {
          updatedList[idx] = { ...updatedList[idx], title, icon, desc };
        } else {
          updatedList.push({ id: editId, title, icon, desc });
        }
      } else {
        updatedList.push({
          id: 'srv-' + Date.now(),
          title,
          icon,
          desc
        });
      }

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            services_json: JSON.stringify(updatedList)
          })
        });

        if (res.ok) {
          alertToast(editId ? 'Hizmet güncellendi.' : 'Yeni hizmet eklendi.');
          serviceForm.reset();
          serviceModal.classList.remove('active');
          loadServices();
        } else {
          alertToast('Hizmet kaydedilemedi.', true);
        }
      } catch (err) {
        alertToast('Sunucu hatası oluştu.', true);
      }
    });
  }

  // Blog Form Submit (Create & Edit)
  if (blogForm && blogModal) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const editId = document.getElementById('blog-edit-id')?.value.trim();
      const payload = {
        title: document.getElementById('blog-inp-title').value.trim(),
        slug: document.getElementById('blog-inp-slug').value.trim(),
        category: document.getElementById('blog-inp-category').value,
        author: document.getElementById('blog-inp-author').value.trim(),
        readTime: document.getElementById('blog-inp-readtime').value.trim(),
        tags: document.getElementById('blog-inp-tags').value.split(',').map(t => t.trim()).filter(Boolean),
        coverGradient: document.getElementById('blog-inp-gradient').value.trim(),
        summary: document.getElementById('blog-inp-summary').value.trim(),
        content: document.getElementById('blog-inp-content').value.trim(),
        featured: document.getElementById('blog-inp-featured').checked
      };

      try {
        const url = editId ? `/api/admin/blogs/${editId}` : '/api/admin/blogs';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alertToast(editId ? 'Makale güncellendi.' : 'Yeni makale yayınlandı.');
          blogForm.reset();
          blogModal.classList.remove('active');
          loadBlogs();
          loadStats();
        } else {
          alertToast('Makale kaydedilemedi.', true);
        }
      } catch (e) {
        alertToast('Sunucu hatası oluştu.', true);
      }
    });
  }

  // Close modals on close-trigger (X or Cancel button)
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // Close on backdrop click (click outside card)
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
  });
}
