/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-04-13T21:34:10.719Z
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
    var TVDB_KEY = "aa889110-d5b9-4f6c-883d-7970de04e9c7";
    function fetchJson(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        const res = yield fetch(url, options);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        return res.json();
      });
    }
    function getTmdbData2(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const type = mediaType === "movie" ? "movie" : "tv";
        const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
        try {
          return yield fetchJson(url);
        } catch (e) {
          return null;
        }
      });
    }
    function getTmdbHebrewName2(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const type = mediaType === "movie" ? "movie" : "tv";
        const translationsUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/translations?api_key=${TMDB_KEY}`;
        try {
          const translations = yield fetchJson(translationsUrl);
          if (!translations || !translations.translations)
            return null;
          const heTranslation = translations.translations.find((t) => t.iso_639_1 === "he");
          if (!heTranslation || !heTranslation.data)
            return null;
          return mediaType === "movie" ? heTranslation.data.title : heTranslation.data.name;
        } catch (err) {
          console.error("Error fetching Hebrew name:", err);
          return null;
        }
      });
    }
    function getTmdbEpisode2(tmdbId, season) {
      return __async(this, null, function* () {
        const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${TMDB_KEY}&language=en-US`;
        try {
          const seasonData = yield fetchJson(url);
          if (!seasonData || !seasonData.episodes || !seasonData.episodes.length)
            return null;
          return seasonData.episodes[0];
        } catch (err) {
          console.log(err);
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
    function getAnimeSeasonsByName2(name) {
      return __async(this, null, function* () {
        const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
        const results = yield fetchJson(url);
        if (!results || !results.length)
          return [];
        return results.filter((a) => a.Type === "\u05D0\u05E0\u05D9\u05DE\u05D4" || a.episode > 1).sort((a, b) => new Date(a.date) - new Date(b.date));
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
    function getGDriveDirectUrl2(driveUrl) {
      return __async(this, null, function* () {
        const res = yield fetch(
          `https://aniplus.lielayt.workers.dev/gdrive?url=${encodeURIComponent(driveUrl)}`
        );
        const { directUrl } = yield res.json();
        return directUrl;
      });
    }
    function getUrl2(url) {
      return __async(this, null, function* () {
        if (url.includes("drive.google"))
          return getGDriveDirectUrl2(url);
        else if (url.includes("anipluspro")) {
          const identifier = url.split("#")[1];
          try {
            const res = yield fetch("https://aniplus.lielayt.workers.dev/aniplus?id=" + identifier);
            const text = yield res.text();
            const data = JSON.parse(text);
            return data.tiktok || data.inhouse || data.cloudflare || null;
          } catch (e) {
            return null;
          }
        }
      });
    }
    var TVDB_JWT_TOKEN = null;
    function getTVDBAbsoluteEpisode2(tmdbId, seasonNumber, episodeNumber, itemData = null) {
      return __async(this, null, function* () {
        var _a;
        try {
          const extRes = yield fetch(
            `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_KEY}`
          );
          if (!extRes.ok)
            throw new Error("TMDb external_ids request failed");
          const extData = yield extRes.json();
          const tvdbId = extData.tvdb_id;
          if (!tvdbId)
            return null;
          if (!TVDB_JWT_TOKEN) {
            const loginRes = yield fetch("https://api4.thetvdb.com/v4/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ apikey: TVDB_KEY })
            });
            if (!loginRes.ok) {
              const text = yield loginRes.text();
              throw new Error("Failed to get TVDB token: " + text);
            }
            const loginData = yield loginRes.json();
            TVDB_JWT_TOKEN = loginData.data.token;
          }
          const tvdbRes = yield fetch(`https://api4.thetvdb.com/v4/series/${tvdbId}/episodes/default`, {
            headers: { Authorization: `Bearer ${TVDB_JWT_TOKEN}` }
          });
          if (!tvdbRes.ok) {
            const text = yield tvdbRes.text();
            console.error("TVDB ERROR:", tvdbRes.status, text);
            return null;
          }
          const tvdbData = yield tvdbRes.json();
          const episodes = ((_a = tvdbData.data) == null ? void 0 : _a.episodes) || [];
          const ep = episodes.find(
            (e) => e.seasonNumber === Number(seasonNumber) && e.number === Number(episodeNumber)
          );
          return (ep == null ? void 0 : ep.absoluteNumber) || null;
        } catch (e) {
          console.error("Error in getAbsoluteTVDB:", e);
          return null;
        }
      });
    }
    function parseM3U8Qualities2(masterUrl) {
      return __async(this, null, function* () {
        var _a;
        if (masterUrl.includes("google"))
          return [];
        const res = yield fetch(masterUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://anipluspro.upn.one/",
            "Origin": "https://anipluspro.upn.one"
          }
        });
        const text = yield res.text();
        const base = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
        const qualities = [];
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
            const resMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
            const bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
            const indexUrl = (_a = lines[i + 1]) == null ? void 0 : _a.trim();
            if (indexUrl) {
              qualities.push({
                resolution: (resMatch == null ? void 0 : resMatch[1]) || "unknown",
                bandwidth: bwMatch ? parseInt(bwMatch[1]) : 0,
                url: base + indexUrl
              });
            }
          }
        }
        return qualities;
      });
    }
    function getUrlAndQualities2(url) {
      return __async(this, null, function* () {
        var _a;
        let resolvedUrl = null;
        if (url.includes("drive.google")) {
          resolvedUrl = yield getGDriveDirectUrl2(url);
          return { url: resolvedUrl, qualities: [] };
        }
        if (url.includes("aniplus")) {
          const identifier = url.split("#")[1];
          try {
            const res = yield fetch("https://aniplus.lielayt.workers.dev/aniplus?id=" + identifier);
            const data = JSON.parse(yield res.text());
            resolvedUrl = data.tiktok || data.inhouse || data.cloudflare || null;
          } catch (e) {
            return { url: null, qualities: [] };
          }
        }
        if (!resolvedUrl)
          return { url: null, qualities: [] };
        try {
          const res = yield fetch(resolvedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
              "Referer": "https://anipluspro.upn.one/",
              "Origin": "https://anipluspro.upn.one"
            }
          });
          const text = yield res.text();
          const base = resolvedUrl.substring(0, resolvedUrl.lastIndexOf("/") + 1);
          const qualities = [];
          const lines = text.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
              const resMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
              const bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
              const indexUrl = (_a = lines[i + 1]) == null ? void 0 : _a.trim();
              if (indexUrl) {
                qualities.push({
                  resolution: (resMatch == null ? void 0 : resMatch[1]) || "unknown",
                  bandwidth: bwMatch ? parseInt(bwMatch[1]) : 0,
                  url: base + indexUrl
                });
              }
            }
          }
          return { url: resolvedUrl, qualities };
        } catch (e) {
          return { url: resolvedUrl, qualities: [] };
        }
      });
    }
    module2.exports = {
      fetchJson,
      getTmdbData: getTmdbData2,
      getAnimeByName: getAnimeByName2,
      getAnimeSeasonsByName: getAnimeSeasonsByName2,
      getEpisodesByAnimeId: getEpisodesByAnimeId2,
      getAlternativeEpisodeLink: getAlternativeEpisodeLink2,
      getGDriveDirectUrl: getGDriveDirectUrl2,
      getUrl: getUrl2,
      getTmdbEpisode: getTmdbEpisode2,
      getTVDBAbsoluteEpisode: getTVDBAbsoluteEpisode2,
      getTmdbHebrewName: getTmdbHebrewName2,
      parseM3U8Qualities: parseM3U8Qualities2,
      getUrlAndQualities: getUrlAndQualities2
    };
  }
});

// src/aniplus/extractor.js
var require_extractor = __commonJS({
  "src/aniplus/extractor.js"(exports2, module2) {
    function toStream2(episode) {
      episode.server = getServer(episode);
      return {
        name: "Aniplus",
        title: `Episode ${episode.episodeNumber || 1} | ${episode.server}`,
        url: episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          "Referer": "https://anipluspro.upn.one/",
          "Origin": "https://anipluspro.upn.one"
        }
      };
    }
    function getServer(ep) {
      const url = ep.link || ep.episodeLink;
      return url.includes("google") ? "Google Drive" : "Internal";
    }
    module2.exports = { toStream: toStream2 };
  }
});

// src/aniplus/index.js
var { getTmdbData, getAnimeByName, getAnimeSeasonsByName, getEpisodesByAnimeId, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl, getTmdbEpisode, getTVDBAbsoluteEpisode, getTmdbHebrewName, parseM3U8Qualities, getUrlAndQualities } = require_http();
var { toStream } = require_extractor();
var CryptoJS = require("crypto-js");
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const episodeItem = yield getEpisodeItem(tmdbId, mediaType, season, episode);
    if (!episodeItem)
      return [];
    const { url: actual_link, qualities } = episodeItem.link.includes("drive.google") ? { url: yield getGDriveDirectUrl(episodeItem.link), qualities: [] } : yield getUrlAndQualities(episodeItem.link);
    if (actual_link) {
      episodeItem.link = actual_link;
      episodeItem.quality = qualities.length > 0 ? qualities[0].resolution.split("x")[1] + "p" : "Unknown quality";
      return [toStream(episodeItem)];
    }
    const alt = yield getAlternativeEpisodeLink(episodeItem.episode_id);
    const { url: actLink, qualities: altQualities } = yield getUrlAndQualities(alt.episodeLink);
    alt.link = actLink;
    alt.title = actLink ? alt.title : "Decrypt ERR";
    alt.episodeNumber = episodeItem.episodeNumber;
    alt.quality = altQualities.length > 0 ? altQualities[0].resolution.split("x")[1] + "p" : "Unknown quality";
    return [toStream(alt)];
  });
}
function getEpisodeItem(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const itemData = yield getTmdbData(tmdbId, mediaType);
    const tmdbTitle = normalizeAnimeName(mediaType === "movie" ? itemData.title : itemData.name);
    if (!tmdbTitle)
      return [];
    console.log("Title: ", tmdbTitle);
    const [hebrewName, absEpisode] = yield Promise.all([
      getTmdbHebrewName(tmdbId, mediaType).then((n) => normalizeAnimeName(n)),
      getTVDBAbsoluteEpisode(tmdbId, season, episode, itemData)
    ]);
    const [animeListByHeb, animeListByEng] = yield Promise.all([
      getAnimeSeasonsByName(hebrewName),
      getAnimeSeasonsByName(tmdbTitle)
    ]);
    const ids = new Set(animeListByHeb.map((x) => x.animeId));
    const animeList = animeListByHeb.length > 0 ? animeListByEng.filter((x) => ids.has(x.animeId)) : animeListByEng;
    if (animeList.length === 0)
      return null;
    const result = getSeasonEpisodeFromAbsolute(animeList, absEpisode);
    const seIndex = result.seasonIndex;
    const epIndex = result.episodeIndex;
    const episodes = yield getEpisodesByAnimeId(animeList[seIndex].animeId);
    const episodeItem = episodes[epIndex];
    return episodeItem;
  });
}
function getSeasonEpisodeFromAbsolute(animeList, absEpisode) {
  let remaining = absEpisode;
  for (let i = 0; i < animeList.length; i++) {
    const season = animeList[i];
    if (remaining <= season.episode) {
      return {
        seasonIndex: i,
        episodeIndex: remaining - 1
      };
    }
    remaining -= season.episode;
  }
  return null;
}
function normalizeAnimeName(name) {
  return name ? name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z\u0590-\u05FF ]/g, "").replace(/\s+/g, " ").trim() : " ";
}
if (typeof module !== "undefined" && module.exports)
  module.exports = { getStreams };
if (typeof exports !== "undefined")
  exports.getStreams = getStreams;
if (typeof globalThis !== "undefined")
  globalThis.getStreams = getStreams;
