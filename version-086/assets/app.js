(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-header-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var q = input ? input.value.trim() : '';
      if (q) {
        window.location.href = './categories.html?q=' + encodeURIComponent(q);
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;
    var showSlide = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty]');
  var applyFilter = function () {
    if (!cards.length) return;
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var typeValue = card.getAttribute('data-type') || '';
      var ok = (!query || haystack.indexOf(query) !== -1) && (!type || typeValue.indexOf(type) !== -1);
      card.classList.toggle('is-hidden', !ok);
      if (ok) visible += 1;
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  };
  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) filterInput.value = q;
    filterInput.addEventListener('input', applyFilter);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilter);
  }
  applyFilter();

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var play = player.querySelector('[data-play]');
    var src = player.getAttribute('data-m3u8');
    var attached = false;
    var connect = function () {
      if (attached || !video || !src) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    var startPlay = function () {
      connect();
      if (cover) cover.classList.add('is-hidden');
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) promise.catch(function () {});
      }
    };
    if (play) {
      play.addEventListener('click', startPlay);
    }
    if (cover) {
      cover.addEventListener('click', startPlay);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          startPlay();
        } else {
          video.pause();
        }
      });
    }
  });
})();
