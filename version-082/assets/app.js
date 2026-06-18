(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      };
      var run = function () {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          run();
        });
      });
      if (slides.length > 1) {
        run();
      }
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    var filterList = document.querySelector("[data-filter-list]");
    if (filterPanel && filterList) {
      var input = filterPanel.querySelector("[data-filter-input]");
      var category = filterPanel.querySelector("[data-filter-category]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (initial && input) {
        input.value = initial;
      }
      var normalize = function (value) {
        return String(value || "").trim().toLowerCase();
      };
      var apply = function () {
        var q = normalize(input && input.value);
        var cat = normalize(category && category.value);
        var y = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (cat && normalize(card.getAttribute("data-category")) !== cat) {
            ok = false;
          }
          if (y && normalize(card.getAttribute("data-year")).indexOf(y) === -1) {
            ok = false;
          }
          card.setAttribute("data-filter-hidden", ok ? "false" : "true");
        });
      };
      [input, category, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      apply();
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      var stream = shell.getAttribute("data-stream");
      var hls = null;
      var loaded = false;
      var loading = false;
      var start = function () {
        if (!video || !stream) {
          return;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        if (loaded) {
          video.play().catch(function () {});
          return;
        }
        if (loading) {
          return;
        }
        loading = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          loaded = true;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function () {
            if (!loaded) {
              video.src = stream;
              loaded = true;
              video.play().catch(function () {});
            }
          });
          return;
        }
        video.src = stream;
        loaded = true;
        video.play().catch(function () {});
      };
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
