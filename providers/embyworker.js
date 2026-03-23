/**
 * embyworker - Built from src/embyworker/
 * Generated: 2026-03-23T07:21:23.351Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/embyworker/index.js
var embyworker_exports = {};
__export(embyworker_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(embyworker_exports);

// src/embyworker/http.js
var CREDENTIALS_GIST_RAW_URL = "https://gist.githubusercontent.com/lielayt/01e8aec73350f3d7b35469d69eb15dc6/raw";
var CREDENTIALS_OWNER_LABEL = "Liel";
var WORKER_URL = "https://emby.lielayt.workers.dev";
var cachedCredentialsPromise = null;
function readText(res) {
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  return res.text();
}
function toNumberOrNull(value) {
  if (value === null || value === void 0 || value === "")
    return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function getCredentials() {
  if (!cachedCredentialsPromise) {
    cachedCredentialsPromise = fetch(CREDENTIALS_GIST_RAW_URL).then(readText).then(parseCredentialsFromGistText);
  }
  return cachedCredentialsPromise;
}
function parseCredentialsFromGistText(text) {
  const cleaned = String(text || "").replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  const lines = cleaned.split(/\r?\n/).map((line) => String(line || "").trim()).filter(Boolean);
  const ownerIndex = lines.findIndex((line) => line.toLowerCase() === CREDENTIALS_OWNER_LABEL.toLowerCase());
  if (ownerIndex === -1 || !lines[ownerIndex + 1] || !lines[ownerIndex + 2]) {
    throw new Error(`Credentials for "${CREDENTIALS_OWNER_LABEL}" not found in gist`);
  }
  return {
    username: lines[ownerIndex + 1],
    password: lines[ownerIndex + 2]
  };
}
function workerFetch(_0, _1) {
  return __async(this, arguments, function* (path, credentials, options = {}) {
    const url = `${WORKER_URL}${path}`;
    const res = yield fetch(url, __spreadProps(__spreadValues({}, options), {
      headers: __spreadValues({
        "Content-Type": "application/json",
        "X-Emby-Username": credentials.username,
        "X-Emby-Password": credentials.password
      }, options.headers || {})
    }));
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

// src/embyworker/extractor.js
var TM = "36fb162e5c4e8f206515ddf92070d434";
function toStream(item) {
  return {
    name: "Emby",
    title: item.Name || "Emby Stream",
    url: item.streamUrl,
    quality: item.quality || "Auto",
    provider: "embyworker",
    logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/emby_edited.png",
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  };
}
function findMovieByTmdb(credentials, tmdbId) {
  return __async(this, null, function* () {
    return workerFetch(`/find/movie/${tmdbId}`, credentials);
  });
}
function findSeriesByTmdb(credentials, tmdbId) {
  return __async(this, null, function* () {
    return workerFetch(`/find/series/${tmdbId}`, credentials);
  });
}
function findEpisode(credentials, seriesId, seasonNum, episodeNum) {
  return __async(this, null, function* () {
    return workerFetch(`/episode/${seriesId}/${seasonNum}/${episodeNum}`, credentials);
  });
}
function searchByName(credentials, name) {
  return __async(this, null, function* () {
    return workerFetch(`/search/${encodeURIComponent(name)}`, credentials);
  });
}
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "movie" ? "movie" : "tv";
    try {
      const data = yield fetch(
        `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TM}&language=he-IL`
      ).then((res) => res.json());
      return type === "movie" ? data.title : data.name;
    } catch (e) {
      return null;
    }
  });
}

// src/embyworker/index.js
var PROVIDER_NAME = "EmbyWorker";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || seasonNum != null && episodeNum != null;
    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);
    try {
      const credentials = yield getCredentials();
      if (isTv) {
        let series = yield findSeriesByTmdb(credentials, tmdbId);
        if (!series) {
          const name = yield getTmdbTitle(tmdbId, "tv");
          if (name)
            series = yield searchByName(credentials, name);
        }
        if (!series || seasonNum == null || episodeNum == null)
          return [];
        const ep = yield findEpisode(credentials, series.Id, seasonNum, episodeNum);
        if (!ep)
          return [];
        return [toStream(ep)];
      }
      let movie = yield findMovieByTmdb(credentials, tmdbId);
      if (!movie) {
        const name = yield getTmdbTitle(tmdbId, "movie");
        if (name)
          movie = yield searchByName(credentials, name);
      }
      if (!movie)
        return [];
      return [toStream(movie)];
    } catch (err) {
      console.error(`[${PROVIDER_NAME}] error: ${(err == null ? void 0 : err.message) || err}`);
      return [];
    }
  });
}
