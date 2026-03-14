/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-03-14T11:19:43.021Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/aniplus/http.js
var require_http = __commonJS({
  "src/aniplus/http.js"(exports2, module2) {
    function fetchJson(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield fetch(url, options);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        return res.json();
      });
    }
    function fetchText(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield fetch(url, options);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        return res.text();
      });
    }
    module2.exports = { fetchJson, fetchText };
  }
});

// src/aniplus/extractor.js
var require_extractor = __commonJS({
  "src/aniplus/extractor.js"(exports2, module2) {
    var { fetchJson } = require_http();
    function searchByName2(name) {
      return __async(this, null, function* () {
        const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
        const results = yield fetchJson(url);
        if (!results || !results.length)
          return null;
        return results[0];
      });
    }
    function getEpisodesByAnimeId2(animeId) {
      return __async(this, null, function* () {
        const url = `https://server.chataniplus.com/anime/getEpisodesByAnimeId/${animeId}`;
        const episodes = yield fetchJson(url);
        return episodes || [];
      });
    }
    function toStream2(episode) {
      return {
        title: episode.title || `Episode ${episode.index}`,
        url: episode.streamUrl,
        // assuming API returns a streamUrl field
        quality: episode.quality || "Auto",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/plugin/main/Assets/aniplus.png",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      };
    }
    module2.exports = { searchByName: searchByName2, getEpisodesByAnimeId: getEpisodesByAnimeId2, toStream: toStream2 };
  }
});

// src/aniplus/index.js
var { searchByName, getEpisodesByAnimeId, toStream } = require_extractor();
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const tmdbTitle = yield getTmdbTitle(tmdbId, mediaType);
    if (!tmdbTitle)
      return [];
    const anime = yield searchByName(tmdbTitle);
    if (!anime)
      return [];
    const episodes = yield getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length)
      return [];
    const episodeNum = Number(episode) || 1;
    const ep = episodes[episodeNum - 1];
    if (!ep)
      return [];
    return [toStream(ep)];
  });
}
var TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    try {
      const res = yield fetch(url);
      if (!res.ok)
        return null;
      const data = yield res.json();
      return type === "movie" ? data.title : data.name;
    } catch (e) {
      return null;
    }
  });
}
if (typeof module !== "undefined" && module.exports)
  module.exports = { getStreams };
if (typeof exports !== "undefined")
  exports.getStreams = getStreams;
if (typeof globalThis !== "undefined")
  globalThis.getStreams = getStreams;
