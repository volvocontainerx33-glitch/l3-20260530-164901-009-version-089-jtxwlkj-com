import { H as Hls } from './hls-dru42stk.js';

const root = document.body ? document.body.dataset.root || '' : '';
const movieData = Array.isArray(window.__MOVIES__) ? window.__MOVIES__ : [];

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function text(value) {
  return String(value || '').toLowerCase();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function initMenu() {
  const button = qs('[data-menu-toggle]');
  const nav = qs('[data-mobile-nav]');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function renderSearchResults(items, box) {
  const list = items.slice(0, 14).map(item => `
    <a class="search-result" href="${root}${item.url}">
      <img src="${root}${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
      <span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.genre)}</p>
        <p>${escapeHtml(item.oneLine)}</p>
      </span>
    </a>
  `).join('');
  box.innerHTML = list || '<p class="empty-result">没有找到匹配内容</p>';
}

function initSearchPanel() {
  const panel = qs('[data-search-panel]');
  const input = qs('[data-search-input]', panel || document);
  const results = qs('[data-search-results]', panel || document);
  if (!panel || !input || !results) return;
  const open = () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-lock');
    renderSearchResults(movieData.slice(0, 8), results);
    window.setTimeout(() => input.focus(), 50);
  };
  const close = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-lock');
  };
  qsa('[data-search-open]').forEach(button => button.addEventListener('click', open));
  qsa('[data-search-close]').forEach(button => button.addEventListener('click', close));
  input.addEventListener('input', () => {
    const term = text(input.value.trim());
    const pool = term ? movieData.filter(item => text([item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ')).includes(term)) : movieData.slice(0, 8);
    renderSearchResults(pool, results);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}

function initHero() {
  const slider = qs('[data-hero-slider]');
  if (!slider) return;
  const slides = qsa('[data-hero-slide]', slider);
  const dots = qsa('[data-hero-dot]', slider);
  if (!slides.length) return;
  let index = 0;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  window.setInterval(() => show(index + 1), 5200);
}

function initRails() {
  qsa('[data-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.scroll;
      const rail = qs(`[data-rail="${id}"]`);
      if (!rail) return;
      const direction = button.dataset.direction === 'left' ? -1 : 1;
      rail.scrollBy({ left: direction * Math.round(rail.clientWidth * 0.86), behavior: 'smooth' });
    });
  });
}

function initFilters() {
  qsa('[data-filter-box]').forEach(box => {
    const input = qs('[data-filter-input]', box);
    const cards = qsa('[data-filter-card]');
    const buttons = qsa('[data-filter-value]', box);
    const apply = value => {
      const query = text(input ? input.value : '');
      const chosen = text(value || '');
      cards.forEach(card => {
        const content = text([card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.type].join(' '));
        const visible = (!query || content.includes(query)) && (!chosen || content.includes(chosen));
        card.classList.toggle('is-hidden', !visible);
      });
    };
    if (input) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && input.hasAttribute('data-autofill-query')) input.value = q;
      input.addEventListener('input', () => {
        const active = qs('[data-filter-value].is-active', box);
        apply(active ? active.dataset.filterValue : '');
      });
    }
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
        apply(button.dataset.filterValue);
      });
    });
    const active = qs('[data-filter-value].is-active', box);
    apply(active ? active.dataset.filterValue : '');
  });
}

function initPlayers() {
  qsa('.player-shell').forEach(shell => {
    const video = qs('video[data-hls]', shell);
    const overlay = qs('[data-player-play]', shell);
    if (!video || !overlay) return;
    let started = false;
    let hls = null;
    const start = () => {
      if (started) {
        video.play().catch(() => {});
        return;
      }
      started = true;
      overlay.classList.add('is-hidden');
      video.controls = true;
      const url = video.getAttribute('data-hls');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(() => {});
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else {
        video.src = url;
        video.play().catch(() => {});
      }
    };
    overlay.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (!started) start();
    });
    window.addEventListener('pagehide', () => {
      if (hls) hls.destroy();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSearchPanel();
  initHero();
  initRails();
  initFilters();
  initPlayers();
});
