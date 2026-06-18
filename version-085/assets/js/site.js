(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initNav() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function activate(next) {
            slides[index].classList.remove("is-active");
            if (dots[index]) {
                dots[index].classList.remove("is-active");
            }
            index = next;
            slides[index].classList.add("is-active");
            if (dots[index]) {
                dots[index].classList.add("is-active");
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
            });
        });
        window.setInterval(function () {
            activate((index + 1) % slides.length);
        }, 5200);
    }

    function initCatalogFilter() {
        var input = document.querySelector(".filter-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card"));
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            var term = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                card.classList.toggle("hidden-card", term && haystack.indexOf(term) === -1);
            });
        });
    }

    function renderSearchResults(list, container) {
        container.innerHTML = list.map(function (item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag">' + escapeHTML(tag) + '</span>';
            }).join("");
            return '' +
                '<a class="movie-card" href="' + escapeHTML(item.href) + '">' +
                    '<div class="movie-poster">' +
                        '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '">' +
                        '<span class="year-badge">' + escapeHTML(item.year) + '</span>' +
                        '<span class="play-hover"><span>▶</span></span>' +
                    '</div>' +
                    '<div class="movie-body">' +
                        '<h3 class="movie-title">' + escapeHTML(item.title) + '</h3>' +
                        '<p class="movie-desc">' + escapeHTML(item.oneLine) + '</p>' +
                        '<div class="tag-list">' + tags + '</div>' +
                        '<div class="movie-meta"><span>' + escapeHTML(item.region) + '</span><span>' + escapeHTML(item.type) + '</span></div>' +
                    '</div>' +
                '</a>';
        }).join("");
    }

    function initSearchPage() {
        var form = document.querySelector("#globalSearchForm");
        var input = document.querySelector("#globalSearchInput");
        var results = document.querySelector("#searchResults");
        var status = document.querySelector("#searchStatus");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        function doSearch() {
            var term = input.value.trim().toLowerCase();
            var list = window.SEARCH_MOVIES.filter(function (item) {
                var haystack = [item.title, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
                return !term || haystack.indexOf(term) !== -1;
            }).slice(0, 120);
            renderSearchResults(list, results);
            if (status) {
                status.textContent = term ? "已找到 " + list.length + " 部相关影片" : "输入片名、地区、年份或题材快速检索";
            }
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            doSearch();
        });
        input.addEventListener("input", doSearch);
        doSearch();
    }

    window.initMoviePlayer = function (url) {
        var video = document.querySelector("#moviePlayer");
        var start = document.querySelector("#playerStart");
        var shell = document.querySelector(".player-shell");
        if (!video || !start || !shell || !url) {
            return;
        }
        var loaded = false;
        var hls = null;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            load();
            shell.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }
        start.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNav();
        initHero();
        initCatalogFilter();
        initSearchPage();
    });
})();
