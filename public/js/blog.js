// KeskinDev Technical Blog Portal Logic - 100% Dynamic SQL Engine

let allBlogs = [];
let activeCategory = 'all';
let searchQuery = '';

const BlogIcons = {
  calendar: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clock: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  eye: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  user: '<svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  arrowRight: '<svg class="svg-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  star: '<svg class="svg-icon" style="width: 12px; height: 12px; color: #fbbf24;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
  initBlogPortal();
  initModalListeners();
});

async function initBlogPortal() {
  await fetchBlogs();
}

async function fetchBlogs() {
  const container = document.getElementById('blog-grid');
  try {
    const res = await fetch('/api/public/blogs');
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Yazılar alınamadı');

    allBlogs = json.data;
    renderDynamicCategoryPills();
    renderBlogList();
  } catch (err) {
    console.error('Blog fetch error:', err);
    if (container) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Yazılar veritabanından yüklenirken bir sorun oluştu.</p>';
    }
  }
}

// Generate category filter pills dynamically from existing categories in SQL
function renderDynamicCategoryPills() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const categories = Array.from(new Set(allBlogs.map(b => b.category).filter(Boolean)));
  container.innerHTML = `
    <button class="filter-pill active" data-cat="all">Tüm Yazılar (${allBlogs.length})</button>
    ${categories.map(cat => {
      const count = allBlogs.filter(b => b.category === cat).length;
      return '<button class="filter-pill" data-cat="' + cat + '">' + cat + ' (' + count + ')</button>';
    }).join('')}
  `;

  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat') || 'all';
      renderBlogList();
    });
  });
}

function renderBlogList() {
  const container = document.getElementById('blog-grid');
  const featuredContainer = document.getElementById('featured-blog-wrap');
  if (!container) return;

  let filtered = allBlogs;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(b => b.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // Render Featured Blog
  if (featuredContainer) {
    if (activeCategory === 'all' && filtered.length > 0) {
      const feat = filtered[0];
      featuredContainer.style.display = 'block';
      featuredContainer.innerHTML = `
        <div class="featured-card" onclick="openBlogReader('${feat.slug}')" style="cursor: pointer;">
          <div class="featured-cover">
            <span class="featured-pill">
              ${BlogIcons.star}
              <span>Öne Çıkan Makale</span>
            </span>
            <span class="category-pill" style="align-self: flex-start; margin-top: auto;">${feat.category}</span>
          </div>
          <div class="featured-body">
            <div class="blog-card-meta">
              <span>${BlogIcons.calendar} ${feat.date}</span>
              <span>${BlogIcons.clock} ${feat.readTime}</span>
              <span>${BlogIcons.user} ${feat.author}</span>
            </div>
            <h2 class="featured-title">${feat.title}</h2>
            <p class="featured-desc">${feat.summary}</p>
            <div class="blog-card-footer">
              <span class="btn btn-primary btn-card-action">
                <span>Makaleyi Oku</span>
                ${BlogIcons.arrowRight}
              </span>
              <span>${BlogIcons.eye} ${feat.views || 0} okuma</span>
            </div>
          </div>
        </div>
      `;
    } else {
      featuredContainer.style.display = 'none';
    }
  }

  const displayList = (activeCategory === 'all' && filtered.length > 0) 
    ? filtered.slice(1) 
    : filtered;

  if (displayList.length === 0 && activeCategory !== 'all') {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px;">
        <h3 style="margin-bottom: 8px; font-size: 1.2rem;">Bu kategoride henüz makale bulunmuyor</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList.map(blog => `
    <div class="blog-card" onclick="openBlogReader('${blog.slug}')" style="cursor: pointer;">
      <div class="blog-card-cover">
        <span class="blog-card-category">${blog.category}</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <span>${BlogIcons.calendar} ${blog.date}</span>
          <span>${BlogIcons.clock} ${blog.readTime}</span>
          <span>${BlogIcons.eye} ${blog.views || 0}</span>
        </div>
        <h4 class="blog-card-title">${blog.title}</h4>
        <p class="blog-card-summary">${blog.summary}</p>
        <div class="blog-card-footer">
          <span>Yazıyı İncele</span>
          ${BlogIcons.arrowRight}
        </div>
      </div>
    </div>
  `).join('');
}

// Open Blog Reader Modal & Fetch Single Blog from SQL
async function openBlogReader(slug) {
  const modal = document.getElementById('blog-reader-modal');
  const titleEl = document.getElementById('reader-title');
  const metaEl = document.getElementById('reader-meta');
  const bodyEl = document.getElementById('reader-body');
  const tagsEl = document.getElementById('reader-tags');

  if (!modal) return;

  try {
    const res = await fetch('/api/public/blogs/' + slug);
    const json = await res.json();
    if (!json.success || !json.data) return;

    const post = json.data;
    titleEl.textContent = post.title;
    metaEl.innerHTML = `
      <span>${BlogIcons.user} <strong>${post.author}</strong></span>
      <span> &bull; </span>
      <span>${BlogIcons.calendar} ${post.date}</span>
      <span> &bull; </span>
      <span>${BlogIcons.clock} ${post.readTime}</span>
      <span> &bull; </span>
      <span>${BlogIcons.eye} ${post.views || 0} görüntüleme</span>
    `;

    bodyEl.innerHTML = formatMarkdown(post.content);

    tagsEl.innerHTML = (post.tags || []).map(t => `
      <span class="tech-tag">#${t}</span>
    `).join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const cached = allBlogs.find(b => b.slug === slug);
    if (cached) cached.views = (cached.views || 0) + 1;
  } catch (err) {
    console.error('Yazı yüklenemedi:', err);
  }
}

function formatMarkdown(content) {
  if (!content) return '';
  let html = content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/([0-9]+\.) (.*$)/gim, '<li><strong>$1</strong> $2</li>');

  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  html = html.split('\n\n').map(p => {
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) return p;
    return '<p>' + p.trim() + '</p>';
  }).join('');

  return html;
}

function initModalListeners() {
  const modal = document.getElementById('blog-reader-modal');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
