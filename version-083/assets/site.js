(function () {
  const body = document.body;

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setActiveNav() {
    const page = body.dataset.page;
    qsa('.nav-link').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `${page}.html` ||
        (page === 'home' && a.getAttribute('href') === 'index.html') ||
        (page === 'categories' && a.getAttribute('href') === 'categories.html') ||
        (page === 'ranking' && a.getAttribute('href') === 'ranking.html') ||
        (page === 'search' && a.getAttribute('href') === 'search.html'));
    });
  }

  function setupMobileNav() {
    const toggle = qs('.nav-toggle');
    const nav = qs('.main-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function buildPoster(seed) {
    const title = seed.title || '';
    const region = seed.region || '';
    const year = seed.year || '';
    const genre = seed.genre || '';
    const h = [...title].reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 0);
    const colors = [
      ['#d96840', '#b88d55', '#7d8e61'],
      ['#c65d3a', '#dd9a5c', '#6e8761'],
      ['#be6a55', '#9c7752', '#677d54'],
      ['#d35f2d', '#b49566', '#5f7561'],
      ['#b85d3c', '#b78a50', '#6e8d6a'],
      ['#e06f4b', '#b67c45', '#5f7a63'],
    ];
    const [c1, c2, c3] = colors[h % colors.length];
    const line1 = title.length <= 4 ? title : title.slice(0, 4);
    const line2 = title.length <= 4 ? '' : title.slice(4, 10);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1080">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c1}"/>
            <stop offset="54%" stop-color="${c2}"/>
            <stop offset="100%" stop-color="${c3}"/>
          </linearGradient>
          <radialGradient id="r" cx="70%" cy="18%" r="82%">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="720" height="1080" fill="url(#g)"/>
        <rect width="720" height="1080" fill="url(#r)"/>
        <rect x="38" y="38" width="644" height="1004" rx="38" fill="#111814" fill-opacity="0.22" stroke="#fff" stroke-opacity="0.16"/>
        <circle cx="605" cy="230" r="180" fill="#fff" fill-opacity="0.08"/>
        <circle cx="130" cy="860" r="230" fill="#000" fill-opacity="0.12"/>
        <text x="60" y="170" fill="#f8f6f2" font-size="34" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" opacity="0.9">最新日韩视频</text>
        <text x="60" y="310" fill="#fff" font-size="72" font-weight="700" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">${escapeHtml(line1)}</text>
        <text x="60" y="408" fill="#fff" font-size="72" font-weight="700" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">${escapeHtml(line2)}</text>
        <text x="60" y="522" fill="#fff" font-size="34" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" opacity="0.92">${escapeHtml([region, year, genre].filter(Boolean).join(' · '))}</text>
        <rect x="60" y="812" width="220" height="60" rx="30" fill="#fff" fill-opacity="0.16"/>
        <text x="94" y="852" fill="#fff" font-size="24" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif">在线播放</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function normalizeMovie(m) {
    return {
      id: m.id,
      title: m.title,
      region: m.region,
      type: m.type,
      year: m.year,
      genre: m.genre,
      tags: m.tags,
      oneLine: m.oneLine,
      summary: m.summary,
      review: m.review,
      category: m.category,
      relatedIds: m.relatedIds || [],
    };
  }

  function renderMovieCard(movie, compact = false) {
    const href = `movies/movie-${String(movie.id).padStart(4, '0')}.html`;
    const poster = buildPoster(movie);
    const meta = [movie.region, movie.year, movie.type].filter(Boolean).join(' · ');
    const tags = (movie.tags || []).slice(0, 4).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join('');
    const summary = compact ? (movie.oneLine || movie.summary || '').slice(0, 88) : (movie.oneLine || movie.summary || '').slice(0, 120);
    return `
      <article class="movie-card ${compact ? 'compact' : ''}">
        <a class="movie-link" href="${href}">
          <div class="movie-poster-wrap">
            <img class="poster poster-card" src="${poster}" alt="${escapeHtml(movie.title)}" loading="lazy" decoding="async">
            <span class="movie-year">${escapeHtml(String(movie.year || ''))}</span>
          </div>
          <div class="movie-body">
            <h3>${escapeHtml(movie.title)}</h3>
            <p class="movie-meta">${escapeHtml(meta)}</p>
            <p class="movie-summary">${escapeHtml(summary)}${summary.length >= (compact ? 88 : 120) ? '…' : ''}</p>
            <div class="chip-row">${tags}</div>
          </div>
        </a>
      </article>
    `;
  }

  function initSearchPage() {
    if (!window.MOVIES) return;
    const page = qs('[data-search-page]');
    if (!page) return;

    const movies = window.MOVIES.map(normalizeMovie);
    const input = qs('#search-input');
    const category = qs('#search-category');
    const year = qs('#search-year');
    const region = qs('#search-region');
    const resultBar = qs('#result-count');
    const results = qs('#search-results');

    const categorySet = [...new Set(movies.map((m) => m.category))].sort();
    if (category && category.options.length <= 1) {
      categorySet.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        category.appendChild(opt);
      });
    }

    const years = [...new Set(movies.map((m) => String(m.year)))].sort((a, b) => Number(b) - Number(a));
    if (year && year.options.length <= 1) {
      years.slice(0, 15).forEach((y) => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        year.appendChild(opt);
      });
    }

    const regions = [...new Set(movies.map((m) => m.region))].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    if (region && region.options.length <= 1) {
      regions.slice(0, 20).forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        region.appendChild(opt);
      });
    }

    function run() {
      const q = (input?.value || '').trim().toLowerCase();
      const cat = category?.value || '';
      const yr = year?.value || '';
      const reg = region?.value || '';

      const filtered = movies.filter((m) => {
        const hay = [m.title, m.region, m.type, m.genre, (m.tags || []).join(' '), m.oneLine, m.summary, m.review, String(m.year)].join(' ').toLowerCase();
        if (q && !hay.includes(q)) return false;
        if (cat && m.category !== cat) return false;
        if (yr && String(m.year) !== yr) return false;
        if (reg && m.region !== reg) return false;
        return true;
      });

      if (resultBar) resultBar.textContent = `共找到 ${filtered.length} 条结果`;
      if (!results) return;
      if (!filtered.length) {
        results.innerHTML = '<div class="search-empty">没有匹配到结果，尝试换一个关键词或筛选条件。</div>';
        return;
      }
      results.innerHTML = filtered.slice(0, 120).map((m) => renderMovieCard(m)).join('');
    }

    [input, category, year, region].forEach((el) => el && el.addEventListener('input', run));
    [category, year, region].forEach((el) => el && el.addEventListener('change', run));
    run();
  }

  function setupVideoPlayer() {
    qsa('video[data-stream]').forEach((video) => {
      const stream = video.dataset.stream;
      const fallback = video.dataset.fallback || '';
      const wrap = video.closest('.player-wrap');
      const overlay = wrap ? qs('.player-overlay', wrap) : null;
      const btn = overlay ? qs('.play-btn', overlay) : null;
      const preferHls = video.canPlayType('application/vnd.apple.mpegurl');
      const hasHls = !!window.Hls;

      if (stream && (preferHls || hasHls)) {
        if (hasHls) {
          try {
            const hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } catch (_) {
            video.src = fallback || stream;
          }
        } else {
          video.src = stream;
        }
      } else if (fallback) {
        video.src = fallback;
      } else if (stream) {
        video.src = stream;
      }

      const toggle = async () => {
        try {
          if (video.paused) {
            await video.play();
            if (overlay) overlay.style.opacity = '0';
          } else {
            video.pause();
            if (overlay) overlay.style.opacity = '1';
          }
        } catch (err) {
          console.warn(err);
        }
      };
      if (btn) btn.addEventListener('click', toggle);
      video.addEventListener('play', () => { if (overlay) overlay.style.opacity = '0'; });
      video.addEventListener('pause', () => { if (overlay) overlay.style.opacity = '1'; });
    });
  }

  function setupHeroCards() {
    const feature = qs('[data-hero-feature]');
    if (!feature || !window.MOVIES) return;
    const movies = window.MOVIES.map(normalizeMovie);
    const chosen = movies.slice(0, 8);
    const main = chosen[0];
    const side = chosen.slice(1, 5);
    const rail = qs('[data-hero-rail]');
    if (main) {
      feature.innerHTML = `
        <div class="poster-wrap">${renderPosterOnly(main)}</div>
        <div class="overlay">
          <div>
            <span class="eyebrow">首屏焦点推荐</span>
            <h2>${escapeHtml(main.title)}</h2>
            <p>${escapeHtml(main.oneLine || main.summary || '')}</p>
            <div class="hero-actions">
              <a class="btn primary" href="movies/movie-${String(main.id).padStart(4, '0')}.html">立即观看</a>
              <a class="btn" href="ranking.html">查看榜单</a>
            </div>
          </div>
        </div>
      `;
    }
    if (rail) {
      rail.innerHTML = side.map((m) => `
        <a class="hero-mini-card" href="movies/movie-${String(m.id).padStart(4, '0')}.html">
          ${renderPosterOnly(m)}
          <div class="mini-overlay"><div><strong>${escapeHtml(m.title)}</strong><span>${escapeHtml([m.region, m.year].filter(Boolean).join(' · '))}</span></div></div>
        </a>
      `).join('');
    }
  }

  function renderPosterOnly(movie) {
    return `<img src="${buildPoster(movie)}" alt="${escapeHtml(movie.title)}" loading="lazy" decoding="async">`;
  }

  function autoFillCategoryCounts() {
    qsa('[data-category-count]').forEach((el) => {
      const name = el.dataset.categoryCount;
      if (!window.MOVIES) return;
      const count = window.MOVIES.filter((m) => m.category === name).length;
      el.textContent = `${count} 部影片`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    setupMobileNav();
    setupHeroCards();
    setupVideoPlayer();
    initSearchPage();
    autoFillCategoryCounts();
  });
})();
