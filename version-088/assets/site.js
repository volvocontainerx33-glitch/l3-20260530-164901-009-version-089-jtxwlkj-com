(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var search = document.querySelector('[data-page-search]');
    var year = document.querySelector('[data-year-filter]');
    var region = document.querySelector('[data-region-filter]');
    var clear = document.querySelector('[data-clear-filter]');
    var cards = selectAll('[data-movie-card]');
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (search && query) {
      search.value = query;
    }
    function apply() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;
        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }
        if (y && cardYear !== y) {
          matched = false;
        }
        if (r && cardRegion !== r) {
          matched = false;
        }
        card.classList.toggle('hidden-by-filter', !matched);
      });
    }
    [search, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-player-play]');
      if (!video || !button) {
        return;
      }
      var hlsUrl = video.getAttribute('data-hls');
      var mp4Url = video.getAttribute('data-mp4');
      var initialized = false;
      var hls = null;
      function fallbackToMp4() {
        if (!mp4Url) {
          return;
        }
        if (hls) {
          hls.destroy();
          hls = null;
        }
        video.src = mp4Url;
        video.load();
      }
      function init() {
        if (initialized) {
          return;
        }
        initialized = true;
        video.controls = true;
        if (hlsUrl && window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              fallbackToMp4();
            }
          });
        } else if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl;
        } else {
          fallbackToMp4();
        }
      }
      function play() {
        init();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            fallbackToMp4();
            video.play().catch(function () {});
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
