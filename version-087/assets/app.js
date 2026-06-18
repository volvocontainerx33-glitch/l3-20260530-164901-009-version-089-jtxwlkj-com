(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('.menu-toggle');
  var mobile = qs('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-target]');
  if (slides.length > 1) {
    var current = 0;
    var show = function (next) {
      current = next;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-target')) || 0);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(root) {
    var search = qs('.site-search', root);
    var year = qs('.year-filter', root);
    var type = qs('.type-filter', root);
    var cards = qsa('.movie-card', root);
    if (!cards.length || (!search && !year && !type)) {
      return;
    }
    var empty = document.createElement('div');
    empty.className = 'empty-result';
    empty.textContent = '没有找到匹配的影片';
    var grid = qs('.searchable-grid', root);
    if (grid && !qs('.empty-result', root)) {
      grid.parentNode.insertBefore(empty, grid.nextSibling);
    }
    var run = function () {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchType = !t || normalize(card.getAttribute('data-type')).indexOf(t) !== -1;
        var ok = matchQuery && matchYear && matchType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && search) {
      search.value = query;
    }
    run();
  }

  applyFilters(document);
})();

function setupMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var shell = video.closest('.player-shell');
  var overlay = shell ? shell.querySelector('.player-overlay') : null;
  var hls = null;
  var ready = false;

  function attach() {
    if (ready) {
      return;
    }
    ready = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    attach();
    video.controls = true;
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
