(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var searchToggle = document.querySelector(".search-toggle");
    var searchPanel = document.querySelector(".search-panel");
    var searchInput = document.querySelector(".global-search-input");
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener("click", function () {
        searchPanel.hidden = !searchPanel.hidden;
        if (!searchPanel.hidden && searchInput) {
          searchInput.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.hidden = !mobileNav.hidden;
      });
    }
  }

  function initGlobalSearch() {
    var input = document.querySelector(".global-search-input");
    var results = document.querySelector(".search-results");
    var data = window.SEARCH_INDEX || [];

    if (!input || !results || !data.length) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!query) {
        return;
      }

      var matches = data.filter(function (item) {
        return item.text.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 12);

      matches.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = item.url;
        link.innerHTML = "<strong>" + item.title + "</strong><span>" + item.meta + "</span>";
        results.appendChild(link);
      });
    });
  }

  function initPageFilter() {
    var input = document.querySelector(".page-filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

    if (!input || !cards.length) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-target") || "").toLowerCase();
        card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function initPlayer() {
    var video = document.querySelector(".video-player");
    var overlay = document.querySelector(".player-overlay");

    if (!video) {
      return;
    }

    var sourceElement = video.querySelector("source");
    var sourceUrl = sourceElement ? sourceElement.getAttribute("src") : "";
    var loaded = false;
    var hlsInstance = null;

    function startVideo() {
      if (!loaded && sourceUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        startVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initGlobalSearch();
    initPageFilter();
    initHero();
    initPlayer();
  });
})();
