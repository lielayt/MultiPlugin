/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-03-16T09:09:04.545Z
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
    var TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";
    function fetchJson(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield fetch(url, options);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        return res.json();
      });
    }
    function getTmdbTitle2(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const type = mediaType === "movie" ? "movie" : "tv";
        const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
        try {
          const data = yield fetchJson(url);
          return type === "movie" ? data.title : data.name;
        } catch (e) {
          return null;
        }
      });
    }
    function getAnimeByName2(name) {
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
    function getAlternativeEpisodeLink2(EpisodeId) {
      return __async(this, null, function* () {
        const url = `https://server.chataniplus.com/episode/getAnotherLinkEpisode/${EpisodeId}`;
        const res = yield fetchJson(url);
        return res[0] || [];
      });
    }
    function isUrlAlive2(url, timeout = 5e3) {
      return __async(this, null, function* () {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          const res = yield fetch(url, { method: "HEAD", signal: controller.signal });
          clearTimeout(id);
          return res.ok || res.status >= 300 && res.status < 400;
        } catch (err) {
          return false;
        }
      });
    }
    module2.exports = {
      fetchJson,
      getTmdbTitle: getTmdbTitle2,
      getAnimeByName: getAnimeByName2,
      getEpisodesByAnimeId: getEpisodesByAnimeId2,
      getAlternativeEpisodeLink: getAlternativeEpisodeLink2,
      isUrlAlive: isUrlAlive2
    };
  }
});

// src/aniplus/extractor.js
var require_extractor = __commonJS({
  "src/aniplus/extractor.js"(exports2, module2) {
    function toStream2(episode) {
      return {
        name: "Aniplus",
        title: episode.link || episode.title || `Episode ${episode.number || 1}`,
        url: "https://drive.google.com/u/1/uc?id=1SxyPBmFHbmrOlBmr75KF8gVyA1NKT-jM&export=download",
        quality: episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://anipluspro.upn.one/",
          "Origin": "https://anipluspro.upn.one"
        }
      };
    }
    module2.exports = { toStream: toStream2 };
  }
});

// src/aniplus/index.js
var { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require_http();
var { toStream } = require_extractor();
var CryptoJS = require("crypto-js");
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const tmdbTitle = yield getTmdbTitle(tmdbId, mediaType);
    if (!tmdbTitle)
      return [];
    const anime = yield getAnimeByName(tmdbTitle);
    if (!anime)
      return [];
    const episodes = yield getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length)
      return [];
    const episodeNum = 58 * (Number(season) - 1) + Number(episode);
    const ep = episodes[episodeNum - 1];
    if (!ep)
      return [];
    const alive = yield isUrlAlive(ep.link);
    if (alive)
      return [toStream(ep)];
    const alt = yield getAlternativeEpisodeLink(ep.episode_id);
    const identifier = alt.episodeLink.split("#")[1];
    try {
      const res = yield fetch("https://aniplus.lielayt.workers.dev/?id=" + identifier);
      const text = yield res.text();
      const data = JSON.parse(text);
      alt.link = data.tiktok;
    } catch (e) {
      alt.title = "Decrypt ERR:" + e.message;
      alt.link = null;
    }
    return [toStream(alt)];
  });
}
if (typeof module !== "undefined" && module.exports)
  module.exports = { getStreams };
if (typeof exports !== "undefined")
  exports.getStreams = getStreams;
if (typeof globalThis !== "undefined")
  globalThis.getStreams = getStreams;
