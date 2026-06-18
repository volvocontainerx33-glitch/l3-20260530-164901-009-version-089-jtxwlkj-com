(function () {
  var nav = document.querySelector('.js-nav');
  var toggle = document.querySelector('.js-nav-toggle');
  var menu = document.querySelector('.js-nav-menu');

  function updateNav() {
    if (!nav || nav.classList.contains('nav-fixed-light')) {
      return;
    }
    if (window.scrollY > 22) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  function initHero() {
    var hero = document.querySelector('.js-hero');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initCategoryFilter() {
    var grid = document.querySelector('.js-filter-grid');
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = document.querySelector('.js-filter-input');
    var year = document.querySelector('.js-filter-year');
    var region = document.querySelector('.js-filter-region');
    var empty = document.querySelector('.js-filter-empty');

    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchRegion = !r || normalize(card.getAttribute('data-region')) === r;
        var matched = matchText && matchYear && matchRegion;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-link">',
      '    <div class="movie-cover">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="play-badge">▶</span>',
      '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="movie-info">',
      '      <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.category) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearch() {
    var grid = document.querySelector('[data-search-grid]');
    if (!grid || !window.VIDEO_INDEX) {
      return;
    }

    var form = document.querySelector('.js-search-form');
    var queryInput = document.querySelector('.js-search-query');
    var typeSelect = document.querySelector('.js-search-type');
    var regionSelect = document.querySelector('.js-search-region');
    var reset = document.querySelector('.js-search-reset');
    var empty = document.querySelector('.js-search-empty');
    var params = new URLSearchParams(window.location.search);

    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function render() {
      var q = normalize(queryInput && queryInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var results = window.VIDEO_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' '));
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchType = !type || normalize(movie.type).indexOf(type) !== -1;
        var matchRegion = !region || normalize(movie.region).indexOf(region) !== -1;
        return matchText && matchType && matchRegion;
      }).slice(0, 160);

      grid.innerHTML = results.map(movieCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', results.length === 0);
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        var q = queryInput ? queryInput.value.trim() : '';
        if (q) {
          url.searchParams.set('q', q);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        render();
      });
    }

    [queryInput, typeSelect, regionSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', render);
        field.addEventListener('change', render);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        window.history.replaceState({}, '', window.location.pathname);
        render();
      });
    }

    render();
  }

  function initPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.js-player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('.js-player');
      var start = shell.querySelector('.js-player-start');
      var message = shell.querySelector('.js-player-message');
      if (!video) {
        return;
      }

      var url = video.getAttribute('data-video-url');
      var ready = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function prepare() {
        if (ready || !url) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          ready = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载遇到问题，请稍后重试。');
            }
          });
          ready = true;
          return;
        }

        video.src = url;
        ready = true;
      }

      function playVideo() {
        prepare();
        setMessage('');
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (start) {
        start.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });

      video.addEventListener('error', function () {
        setMessage('视频加载遇到问题，请稍后重试。');
      });

      prepare();
    });
  }

  initHero();
  initCategoryFilter();
  initSearch();
  initPlayer();
})();
