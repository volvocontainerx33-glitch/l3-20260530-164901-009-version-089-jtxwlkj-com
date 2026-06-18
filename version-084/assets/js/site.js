(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var backTop = document.querySelector("[data-back-top]");
        if (backTop) {
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        setupHero();
        setupFilters();
        applyQueryToSearch();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var libraries = Array.prototype.slice.call(document.querySelectorAll("[data-filter-library]"));
        libraries.forEach(function (library) {
            var input = library.querySelector("[data-filter-input]");
            var type = library.querySelector("[data-filter-type]");
            var region = library.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(library.querySelectorAll("[data-card]"));
            var empty = library.querySelector("[data-empty-state]");

            function apply() {
                var keyword = text(input && input.value);
                var typeValue = text(type && type.value);
                var regionValue = text(region && region.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = text(card.getAttribute("data-search"));
                    var cardType = text(card.getAttribute("data-type"));
                    var cardRegion = text(card.getAttribute("data-region"));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        matched = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, type, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function applyQueryToSearch() {
        var input = document.querySelector("[data-filter-input]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    window.setupPlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("player-start");
        if (!video || !streamUrl) {
            return;
        }
        var connected = false;
        var hls = null;

        function connect() {
            if (connected) {
                return;
            }
            connected = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            connect();
            if (button) {
                button.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (!video.ended && button) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
