/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-03-19T17:14:53.656Z
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
          const data = yield fetchJson(url);
          return data;
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
          if (!seasonData || !seasonData.episodes || !seasonData.episodes.length) {
            return null;
          }
          const firstEpisode = seasonData.episodes[0];
          return firstEpisode;
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
        return results.filter((a) => a.Type === "\u05D0\u05E0\u05D9\u05DE\u05D4").sort((a, b) => new Date(a.date) - new Date(b.date));
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
          const fetchPromise = fetch(url, { method: "HEAD" }).then((res) => res.ok || res.status >= 300 && res.status < 400).catch(() => false);
          const timeoutPromise = new Promise(
            (resolve) => setTimeout(() => resolve(false), timeout)
          );
          return yield Promise.race([fetchPromise, timeoutPromise]);
        } catch (err) {
          return false;
        }
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
          let actUrl = "";
          try {
            const res = yield fetch("https://aniplus.lielayt.workers.dev/aniplus?id=" + identifier);
            const text = yield res.text();
            const data = JSON.parse(text);
            actUrl = data.tiktok || data.inhouse || data.cloudflare || null;
          } catch (e) {
            actUrl = null;
          }
          return actUrl;
        }
      });
    }
    function getTMDBAbsoluteEpisode2(tmdbId, seasonNumber, episodeNumber) {
      return __async(this, null, function* () {
        try {
          const showUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
          const showRes = yield fetch(showUrl);
          if (!showRes.ok)
            throw new Error("TMDB request failed for show");
          const showData = yield showRes.json();
          let absolute = Number(episodeNumber);
          for (const s of showData.seasons) {
            if (s.season_number > 0 && s.season_number < seasonNumber) {
              absolute += s.episode_count;
            }
          }
          const seasonUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_KEY}&language=en-US`;
          const seasonRes = yield fetch(seasonUrl);
          if (!seasonRes.ok)
            throw new Error("TMDB request failed for season");
          const seasonData = yield seasonRes.json();
          const firstEpNumber = seasonData.episodes[0].episode_number;
          return absolute;
        } catch (e) {
          console.error("Error in getAbsoluteEpisode:", e);
          return null;
        }
      });
    }
    var TVDB_JWT_TOKEN = null;
    function getTVDBAbsoluteEpisode2(tmdbId, seasonNumber, episodeNumber) {
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
    module2.exports = {
      fetchJson,
      getTmdbData: getTmdbData2,
      getAnimeByName: getAnimeByName2,
      getAnimeSeasonsByName: getAnimeSeasonsByName2,
      getEpisodesByAnimeId: getEpisodesByAnimeId2,
      getAlternativeEpisodeLink: getAlternativeEpisodeLink2,
      isUrlAlive: isUrlAlive2,
      getGDriveDirectUrl: getGDriveDirectUrl2,
      getUrl: getUrl2,
      getTmdbEpisode: getTmdbEpisode2,
      getTMDBAbsoluteEpisode: getTMDBAbsoluteEpisode2,
      getTVDBAbsoluteEpisode: getTVDBAbsoluteEpisode2,
      getTmdbHebrewName: getTmdbHebrewName2
    };
  }
});

// src/aniplus/extractor.js
var require_extractor = __commonJS({
  "src/aniplus/extractor.js"(exports2, module2) {
    function toStream2(episode) {
      return {
        name: "Aniplus",
        title: episode.title || `Episode ${episode.episodeNumber || 1}`,
        url: episode.link || episode.episodeLink || "empty",
        quality: episode.link || episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
          "Referer": "https://anipluspro.upn.one/",
          "Origin": "https://anipluspro.upn.one"
        }
      };
    }
    module2.exports = { toStream: toStream2 };
  }
});

// src/aniplus/index.js
var { getTmdbData, getAnimeByName, getAnimeSeasonsByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl, getTmdbEpisode, getTMDBAbsoluteEpisode, getTVDBAbsoluteEpisode, getTmdbHebrewName } = require_http();
var { toStream } = require_extractor();
var CryptoJS = require("crypto-js");
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const episodeItem = yield getEpisodeItem(tmdbId, mediaType, season, episode);
    if (!episodeItem)
      return [];
    const alive = yield isUrlAlive(episodeItem.link);
    if (alive) {
      const actual_link = episodeItem.server === "googleDrive" ? yield getGDriveDirectUrl(episodeItem.link) : yield getUrl(episodeItem.link);
      episodeItem.link = actual_link || episodeItem.link;
      return [toStream(episodeItem)];
    }
    const alt = yield getAlternativeEpisodeLink(episodeItem.episode_id);
    const actLink = yield getUrl(alt.episodeLink);
    alt.link = actLink;
    alt.title = actLink ? alt.title : "Decrypt ERR";
    alt.episodeNumber = episodeItem.episodeNumber;
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
    const hebrewName = yield getTmdbHebrewName(tmdbId, mediaType).then((name) => normalizeAnimeName(name));
    const absEpisode = yield getTVDBAbsoluteEpisode(tmdbId, season, episode);
    const animeListByHeb = yield getAnimeSeasonsByName(hebrewName);
    const animeListByEng = yield getAnimeSeasonsByName(tmdbTitle);
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
