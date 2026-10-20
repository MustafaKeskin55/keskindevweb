// KeskinDev Main Website Logic - 100% Dynamic SQL Engine Integration

const SvgIcons = {
  compass: '<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  building: '<svg class="svg-icon" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="18"/><line x1="15" y1="22" x2="15" y2="18"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/></svg>',
  ticko: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  cpu: '<svg class="svg-icon" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
  code: '<svg class="svg-icon" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  check: '<svg class="svg-icon" style="width: 14px; height: 14px; color: #10b981;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  arrowRight: '<svg class="svg-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  external: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  calendar: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clock: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  eye: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  mobile: '<svg class="svg-icon" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  cloud: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
  shield: '<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  palette: '<svg class="svg-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  trending: '<svg class="svg-icon" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  globe: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  loadDynamicSettings();
  loadRealStats();
  loadDynamicApps();
  loadRecentBlogs();
  initContactForm();
  initSmoothScroll();
});

// 1. Load Dynamic Settings & Brand Data from SQL
async function loadDynamicSettings() {
  try {
    const res = await fetch('/api/public/settings');
    const json = await res.json();
    if (!json.success || !json.data) return;

    const s = json.data;
    
    // Dynamic Hero Elements
    const heroBadge = document.getElementById('hero-badge-title');
    const heroTitle = document.getElementById('hero-main-title');
    const heroSubtitle = document.getElementById('hero-subtitle-container');
    const heroBtnPrimary = document.getElementById('hero-btn-primary');
    const heroBtnSecondary = document.getElementById('hero-btn-secondary');

    if (heroBadge && s.hero?.badge) {
      heroBadge.textContent = s.hero.badge;
    }
    if (heroTitle && s.hero?.title) {
      const hl = s.hero.titleHighlight || '';
      let titleHtml = s.hero.title;
      if (hl && titleHtml.includes(hl)) {
        titleHtml = titleHtml.replace(hl, `<span class="gradient-text-accent">${hl}</span>`);
      } else if (hl) {
        titleHtml += ` <span class="gradient-text-accent">${hl}</span>`;
      }
      heroTitle.innerHTML = titleHtml;
    }
    if (heroSubtitle && s.hero?.subtitle) {
      heroSubtitle.innerHTML = s.hero.subtitle;
      heroSubtitle.dataset.customized = "true";
    }
    if (heroBtnPrimary && s.hero?.btnPrimaryText) {
      heroBtnPrimary.querySelector('span').textContent = s.hero.btnPrimaryText;
      if (s.hero.btnPrimaryLink) heroBtnPrimary.href = s.hero.btnPrimaryLink;
    }
    if (heroBtnSecondary && s.hero?.btnSecondaryText) {
      heroBtnSecondary.textContent = s.hero.btnSecondaryText;
      if (s.hero.btnSecondaryLink) heroBtnSecondary.href = s.hero.btnSecondaryLink;
    }

    // Dynamic Branding (Logos & Favicons)
    if (s.branding?.logoUrl) {
      document.querySelectorAll('.logo-wrap img').forEach(img => {
        img.src = s.branding.logoUrl;
      });
    }
    if (s.branding?.faviconUrl) {
      const fav = document.querySelector("link[rel*='icon']");
      if (fav) fav.href = s.branding.faviconUrl;
    }

    // Dynamic Services Grid
    if (s.services && Array.isArray(s.services) && s.services.length > 0) {
      renderDynamicServices(s.services);
    }

    // Footer & Contact Data
    const directEmail = document.getElementById('contact-direct-email');
    const footerEmail = document.getElementById('footer-email-link');
    const geoBadge = document.getElementById('footer-geo-badge');
    const copyright = document.getElementById('footer-copyright-text');
    const companyDesc = document.getElementById('footer-company-desc');

    if (directEmail && s.contact?.email) {
      directEmail.textContent = s.contact.email;
      directEmail.href = 'mailto:' + s.contact.email;
    }
    if (footerEmail && s.contact?.email) {
      footerEmail.textContent = s.contact.email;
      footerEmail.href = 'mailto:' + s.contact.email;
    }
    if (geoBadge && s.geo?.placename) {
      geoBadge.textContent = s.geo.placename + ' (' + (s.geo.region || 'TR-38') + ')';
    }
    if (copyright) {
      copyright.innerHTML = s.footer?.copyright || ('&copy; ' + new Date().getFullYear() + ' ' + (s.companyName || 'KeskinDev') + '. Tüm hakları saklıdır.');
    }
    if (companyDesc && s.footer?.desc) {
      companyDesc.textContent = s.footer.desc;
    }
  } catch (e) {
    console.error('Settings load error:', e);
  }
}

function renderDynamicServices(services) {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.innerHTML = services.map(srv => {
    let iconSvg = SvgIcons[srv.icon] || SvgIcons.cpu;
    return `
      <div class="service-card">
        <div class="service-icon">
          ${iconSvg}
        </div>
        <h3 class="service-title">${srv.title}</h3>
        <p class="service-desc">${srv.desc}</p>
      </div>
    `;
  }).join('');
}

// 2. Load Live Real Statistics from SQL Database
async function loadRealStats() {
  try {
    const res = await fetch('/api/public/stats');
    const json = await res.json();
    if (!json.success || !json.data) return;

    const s = json.data;
    const appsEl = document.getElementById('stat-apps-count');
    const platformsEl = document.getElementById('stat-platforms-text');
    const blogsEl = document.getElementById('stat-blogs-count');
    const statusEl = document.getElementById('stat-system-status');

    if (appsEl) appsEl.textContent = s.totalApps;
    if (platformsEl) platformsEl.textContent = s.platformCount + ' Ortam';
    if (blogsEl) blogsEl.textContent = s.totalBlogs;
    if (statusEl) statusEl.textContent = s.systemStatus || 'Aktif & Canlı';

    // Populate dynamic tech stack grid if provided
    if (s.techList && s.techList.length > 0) {
      renderDynamicTechStack(s.techList);
    }
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

function renderDynamicTechStack(techList) {
  const container = document.getElementById('tech-grid');
  if (!container) return;

  container.innerHTML = techList.map(tech => `
    <div class="tech-item">
      <div class="tech-icon-wrap">
        ${SvgIcons.code}
      </div>
      <span class="tech-name">${tech}</span>
    </div>
  `).join('');
}

// 3. Load Real Dynamic Apps from SQL Database
async function loadDynamicApps() {
  const container = document.getElementById('products-grid');
  const heroSubtitle = document.getElementById('hero-subtitle-container');
  const footerAppsList = document.getElementById('footer-apps-list');

  try {
    const res = await fetch('/api/public/apps');
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('API Hatası');

    const apps = json.data;

    // Dynamically update hero subtitle with real app names from database if not customized in CMS
    if (heroSubtitle && !heroSubtitle.dataset.customized && apps.length > 0) {
      const appNames = apps.map(a => '<strong>' + a.name + '</strong>').join(', ');
      heroSubtitle.innerHTML = appNames + ' gibi mobil uygulamalar, SaaS ve kurumsal yönetim yazılımları geliştiriyoruz.';
    }

    // Dynamically update footer app links
    if (footerAppsList && apps.length > 0) {
      footerAppsList.innerHTML = apps.map(a => `
        <li><a href="#products" class="footer-link">${a.name}</a></li>
      `).join('');
    }

    if (!container) return;

    container.innerHTML = apps.map(app => {
      let iconSvg = SvgIcons.cpu;
      if (app.id === 'mumin-pusulasi') iconSvg = SvgIcons.compass;
      else if (app.id === 'site-yonetimi') iconSvg = SvgIcons.building;
      else if (app.id === 'ticko') iconSvg = SvgIcons.ticko;

      const featuresHtml = (app.features || []).slice(0, 5).map(f => `
        <li>
          ${SvgIcons.check}
          <span>${f}</span>
        </li>
      `).join('');

      const tagsHtml = (app.techStack || []).map(t => `
        <span class="tech-tag">${t}</span>
      `).join('');

      const actionButtons = [];

      if (app.links?.webDemo && app.links.webDemo.trim()) {
        actionButtons.push(`
          <a href="${app.links.webDemo}" target="_blank" rel="noopener" class="btn btn-primary btn-card-action">
            ${SvgIcons.globe}
            <span>Web Sitesi</span>
          </a>
        `);
      }

      if (app.links?.playStore && app.links.playStore.trim()) {
        actionButtons.push(`
          <a href="${app.links.playStore}" target="_blank" rel="noopener" class="btn ${actionButtons.length === 0 ? 'btn-primary' : 'btn-secondary'} btn-card-action">
            <span>Play Store</span>
            ${SvgIcons.external}
          </a>
        `);
      }

      if (app.links?.appStore && app.links.appStore.trim()) {
        actionButtons.push(`
          <a href="${app.links.appStore}" target="_blank" rel="noopener" class="btn btn-secondary btn-card-action">
            <span>App Store</span>
            ${SvgIcons.external}
          </a>
        `);
      }

      if (actionButtons.length === 0) {
        actionButtons.push(`
          <a href="#contact" class="btn btn-secondary btn-card-action">
            <span>Bilgi &amp; İletişim</span>
            ${SvgIcons.arrowRight}
          </a>
        `);
      }

      return `
        <div class="product-card">
          <div class="product-card-top">
            <div class="product-icon-wrap">${iconSvg}</div>
            <span class="product-badge">${app.status || 'Aktif'}</span>
          </div>

          <h3 class="product-title">${app.name}</h3>
          <div class="product-tagline">${app.tagline}</div>
          <p class="product-desc">${app.shortDescription}</p>

          <ul class="product-features-list">
            ${featuresHtml}
          </ul>

          <div class="product-tags">
            ${tagsHtml}
          </div>

          <div class="product-card-bottom">
            <div class="product-meta">
              <span>Platformlar: <strong>${(app.platforms || []).join(', ')}</strong></span>
            </div>
            <div class="product-links" style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${actionButtons.join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Uygulamalar yüklenirken hata:', err);
    if (container) {
      container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Uygulamalar veritabanından yüklenirken bağlantı sorunu oluştu.</p>';
    }
  }
}

// 4. Load Recent Blog Posts from SQL Database
async function loadRecentBlogs() {
  const container = document.getElementById('recent-blogs-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/public/blogs');
    const json = await res.json();
    if (!json.success || !json.data) return;

    const blogs = json.data.slice(0, 3);
    container.innerHTML = blogs.map(blog => `
      <a href="/blog" class="blog-card">
        <div class="blog-card-cover">
          <span class="blog-card-category">${blog.category}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${SvgIcons.calendar} ${blog.date}</span>
            <span>${SvgIcons.clock} ${blog.readTime}</span>
            <span>${SvgIcons.eye} ${blog.views || 0} görüntüleme</span>
          </div>
          <h4 class="blog-card-title">${blog.title}</h4>
          <p class="blog-card-summary">${blog.summary}</p>
          <div class="blog-card-footer">
            <span>Makaleyi İncele</span>
            ${SvgIcons.arrowRight}
          </div>
        </div>
      </a>
    `).join('');
  } catch (err) {
    console.error('Blog yazıları yüklenirken hata:', err);
  }
}

// 5. Contact Form Submission (Saves into SQL messages table)
function initContactForm() {
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('contact-notice');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'İletiliyor...';

    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      subject: form.subject.value,
      message: form.message.value
    };

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        notice.style.display = 'block';
        notice.className = 'toast-notice success';
        notice.textContent = data.message || 'Talebiniz başarıyla kaydedildi!';
        form.reset();
      } else {
        throw new Error(data.error || 'Gönderim başarısız.');
      }
    } catch (err) {
      notice.style.display = 'block';
      notice.className = 'toast-notice error';
      notice.textContent = err.message || 'Bir hata oluştu, lütfen tekrar deneyin.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
      setTimeout(() => {
        notice.style.display = 'none';
      }, 7000);
    }
  });
}

// 6. Smooth Scroll & Mobile Menu Toggle
function initSmoothScroll() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '72px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = '#0e121a';
        navMenu.style.padding = '20px';
        navMenu.style.borderBottom = '1px solid var(--border-subtle)';
      }
    });
  }
}
