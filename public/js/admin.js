// KeskinDev Admin Dashboard & Reklam Kimlikleri Kasası Logic

let adminToken = localStorage.getItem('kd_admin_token') || null;
let currentApps = [];
let currentAdKeys = [];
let currentBlogs = [];
let currentMessages = [];

const AdminIcons = {
  copy: '<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  trash: '<svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg style="width: 14px; height: 14px; color: #10b981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoginHandler();
  initTabNavigation();
  initModals();
  setupAdKeyFilters();
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
  }, 2600);
}

// Global modal helpers
window.openAdKeyModal = function() {
  const modal = document.getElementById('modal-add-adkey');
  if (modal) modal.classList.add('active');
};

window.switchToTab = function(tabName) {
  const btn = document.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.click();
};

// 1. Auth & Lockscreen Verification
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
    errorEl.style.display = 'none';

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
        errorEl.textContent = data.error || 'Geçersiz şifre!';
        errorEl.style.display = 'flex';
      }
    } catch (err) {
      errorEl.textContent = 'Sunucuya bağlanılamadı.';
      errorEl.style.display = 'flex';
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

// 2. Tab Navigation
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const currentTabTitle = document.getElementById('admin-page-title');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');

      const titleMap = {
        overview: 'Genel Bakış & İstatistikler',
        vault: 'Gizli Reklam Kimlikleri Kasası',
        apps: 'Uygulamalar & Yazılım Ürünleri',
        blogs: 'Teknik Blog Yazıları Yönetimi',
        messages: 'Gelen İletişim Mesajları',
        settings: 'SEO, GEO & Sistem Ayarları',
        backup: 'Veri Tabanı Dışa Aktarımı'
      };
      if (currentTabTitle) currentTabTitle.textContent = titleMap[target] || 'Yönetim Konsolu';
    });
  });
}

// 3. Load All Data
async function loadAllAdminData() {
  await Promise.all([
    loadStats(),
    loadAdKeys(),
    loadApps(),
    loadBlogs(),
    loadMessages(),
    loadSettings()
  ]);
}

// 4. Stats
async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    const s = json.data;
    const elApps = document.getElementById('stat-total-apps');
    const elBlogs = document.getElementById('stat-total-blogs');
    const elAdKeys = document.getElementById('stat-total-adkeys');
    const elMsg = document.getElementById('stat-unread-msg');

    if (elApps) elApps.textContent = s.totalApps;
    if (elBlogs) elBlogs.textContent = s.totalBlogs;
    if (elAdKeys) elAdKeys.textContent = `${s.activeAdKeys} / ${s.totalAdKeys}`;
    if (elMsg) elMsg.textContent = s.unreadMessages;
  } catch (e) {
    console.error('Stats error:', e);
  }
}

// ==========================================
// 5. REKLAM KIMLIKLERI KASASI (VAULT)
// ==========================================
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
// 6. APPS MANAGEMENT
// ==========================================
async function loadApps() {
  const container = document.getElementById('admin-apps-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/apps', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!json.success) return;

    currentApps = json.data || [];
    container.innerHTML = currentApps.map(a => `
      <div class="admin-app-card">
        <div class="admin-app-header">
          <h4 class="admin-app-title">${a.name}</h4>
          <span class="badge-status active">${a.category}</span>
        </div>
        <div class="admin-app-tagline">${a.tagline}</div>
        <p class="admin-app-desc">${a.shortDescription}</p>
        <div class="admin-app-meta">
          Platformlar: ${(a.platforms || []).join(', ')}<br/>
          Teknoloji: ${(a.techStack || []).join(', ')}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Apps load error:', e);
  }
}

// ==========================================
// 7. BLOGS MANAGEMENT
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
    tableBody.innerHTML = currentBlogs.map(b => `
      <tr>
        <td>
          <strong style="color: #ffffff;">${b.title}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">/blog#${b.slug}</div>
        </td>
        <td><span class="badge-status active">${b.category}</span></td>
        <td style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-secondary);">${b.date}</td>
        <td style="font-family: var(--font-mono); font-weight: 600;">${b.views || 0}</td>
        <td>
          <div class="table-actions">
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
    }
  } catch (e) {
    console.error('Delete blog error:', e);
  }
};

// ==========================================
// 8. MESSAGES INBOX
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
            <div style="font-size: 0.84rem; color: var(--accent-blue); font-weight: 600;">Konu: ${m.subject}</div>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
            ${new Date(m.date).toLocaleString('tr-TR')}
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
// 9. SETTINGS & SEO/GEO
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

    const s = json.data;
    if (form.companyName) form.companyName.value = s.companyName || '';
    if (form.slogan) form.slogan.value = s.slogan || '';
    if (form.metaTitle) form.metaTitle.value = s.seo?.title || '';
    if (form.metaKeywords) form.metaKeywords.value = s.seo?.metaKeywords || '';
    if (form.geoRegion) form.geoRegion.value = s.geo?.region || '';
    if (form.geoPlacename) form.geoPlacename.value = s.geo?.placename || '';
    if (form.geoLatitude) form.geoLatitude.value = s.geo?.latitude || '';
    if (form.geoLongitude) form.geoLongitude.value = s.geo?.longitude || '';
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
      companyName: form.companyName.value,
      slogan: form.slogan.value,
      adminPasscode: form.adminPasscode.value,
      seo: {
        title: form.metaTitle.value,
        metaKeywords: form.metaKeywords.value
      },
      geo: {
        region: form.geoRegion.value,
        placename: form.geoPlacename.value,
        latitude: parseFloat(form.geoLatitude.value),
        longitude: parseFloat(form.geoLongitude.value),
        position: `${form.geoLatitude.value};${form.geoLongitude.value}`,
        icbm: `${form.geoLatitude.value}, ${form.geoLongitude.value}`
      }
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
        alertToast('Sistem ve SEO ayarları başarıyla kaydedildi.');
      }
    } catch (e) {
      alertToast('Ayarlar kaydedilemedi.', true);
    }
  });
}

// ==========================================
// 10. BACKUP DOWNLOAD
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
      a.download = `keskindev_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alertToast('Yedek dosyası indirildi.');
    } catch (e) {
      alertToast('Yedek indirilemedi.', true);
    }
  });
}

// ==========================================
// 11. MODALS & FORMS
// ==========================================
function initModals() {
  const addAdKeyBtn = document.getElementById('btn-add-adkey');
  const adKeyModal = document.getElementById('modal-add-adkey');
  const adKeyForm = document.getElementById('form-add-adkey');

  const addBlogBtn = document.getElementById('btn-add-blog');
  const blogModal = document.getElementById('modal-add-blog');
  const blogForm = document.getElementById('form-add-blog');

  // Open Ad Key Modal
  if (addAdKeyBtn && adKeyModal) {
    addAdKeyBtn.addEventListener('click', () => {
      adKeyModal.classList.add('active');
    });
  }

  // Submit Ad Key
  if (adKeyForm && adKeyModal) {
    adKeyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        appId: adKeyForm.appId.value,
        appName: adKeyForm.appId.options[adKeyForm.appId.selectedIndex].text,
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

  // Open Blog Modal
  if (addBlogBtn && blogModal) {
    addBlogBtn.addEventListener('click', () => {
      blogModal.classList.add('active');
    });
  }

  // Submit Blog
  if (blogForm && blogModal) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: blogForm.title.value.trim(),
        slug: blogForm.slug.value.trim(),
        category: blogForm.category.value,
        author: blogForm.author.value.trim(),
        readTime: blogForm.readTime.value.trim(),
        tags: blogForm.tags.value.trim(),
        summary: blogForm.summary.value.trim(),
        content: blogForm.content.value.trim()
      };

      try {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alertToast('Yeni blog makalesi yayınlandı.');
          blogForm.reset();
          blogModal.classList.remove('active');
          loadBlogs();
          loadStats();
        } else {
          alertToast('Blog kaydedilemedi.', true);
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
