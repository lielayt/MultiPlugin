/**
 * emby - Built from src/emby/
 * Generated: 2026-03-21T09:50:18.998Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/emby/index.js
var emby_exports = {};
__export(emby_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(emby_exports);

// src/emby/http.js
var CREDENTIALS_GIST_RAW_URL = "https://gist.githubusercontent.com/lielayt/01e8aec73350f3d7b35469d69eb15dc6/raw";
var CREDENTIALS_OWNER_LABEL = "Liel";
var cachedCredentialsPromise = null;
function readJson(res) {
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  return res.json();
}
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
function login(credentials) {
  return __async(this, null, function* () {
    const EMBY_SERVER2 = "https://play.embyil.tv:443";
    const headers = {
      "Content-Type": "application/json",
      "X-Emby-Authorization": 'Emby Client="EmbyWeb", Device="Android TV", DeviceId="androidtv-1234", Version="1.0.0"'
    };
    const res = yield fetch(`${EMBY_SERVER2}/Users/AuthenticateByName`, {
      method: "POST",
      headers,
      body: JSON.stringify({ Username: credentials.username, Pw: credentials.password })
    });
    const data = yield readJson(res);
    if (!data.AccessToken)
      throw new Error("No AccessToken returned");
    const userId = data.User && data.User.Id || data.UserId || data.SessionInfo && data.SessionInfo.UserId;
    if (!userId)
      throw new Error("No UserId returned");
    return { accessToken: data.AccessToken, userId };
  });
}

// src/emby/extractor.js
var EMBY_SERVER = "https://play.embyil.tv:443";
function toStream(item, token, userId) {
  return __async(this, null, function* () {
    const info = yield getPlaybackInfo(item.Id, token, userId);
    const quality = (info == null ? void 0 : info.width) && (info == null ? void 0 : info.height) ? info.DisplayTitle : "Auto";
    return {
      name: "Emby",
      title: item.Name || "Emby Stream",
      url: `${EMBY_SERVER}/Videos/${item.Id}/stream`,
      quality,
      provider: "emby",
      logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/emby_edited.png",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
      }
    };
  });
}
function findMovieByTmdb(token, userId, tmdbId) {
  return __async(this, null, function* () {
    const url = `${EMBY_SERVER}/Users/${userId}/Items?AnyProviderIdEquals=Tmdb.${encodeURIComponent(tmdbId)}&IncludeItemTypes=Movie&Recursive=true&Limit=1&api_key=${token}`;
    const data = yield fetch(url).then((res) => res.json());
    return data.Items && data.Items[0];
  });
}
function findSeriesByTmdb(token, userId, tmdbId) {
  return __async(this, null, function* () {
    const url = `${EMBY_SERVER}/Users/${userId}/Items?AnyProviderIdEquals=Tmdb.${encodeURIComponent(tmdbId)}&IncludeItemTypes=Series&Recursive=true&Limit=1&api_key=${token}`;
    const data = yield fetch(url).then((res) => res.json());
    return data.Items && data.Items[0];
  });
}
function findEpisode(token, userId, seriesId, seasonNum, episodeNum) {
  return __async(this, null, function* () {
    const url = `${EMBY_SERVER}/Shows/${seriesId}/Episodes?UserId=${userId}&Season=${seasonNum}&api_key=${token}`;
    const data = yield fetch(url).then((res) => res.json());
    return (data.Items || []).find((item) => Number(item.IndexNumber) === episodeNum) || null;
  });
}
function searchByName(token, name) {
  return __async(this, null, function* () {
    const url = `${EMBY_SERVER}/emby/Items?SearchTerm=${encodeURIComponent(name)}&IncludeItemTypes=Movie,Series&Recursive=true&Limit=20&api_key=${token}`;
    const data = yield fetch(url).then((res) => res.json());
    return data.Items && data.Items[0];
  });
}
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const TM = "36fb162e5c4e8f206515ddf92070d434";
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TM}&language=he-IL`;
    try {
      const data = yield fetch(url).then((res) => res.json());
      return type === "movie" ? data.title : data.name;
    } catch (e) {
      return null;
    }
  });
}
function getPlaybackInfo(itemId, token, userId) {
  return __async(this, null, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const url = `${EMBY_SERVER}/emby/Items/${itemId}/PlaybackInfo?UserId=${userId}&StartTimeTicks=0&IsPlayback=false&AutoOpenLiveStream=false&X-Emby-Client=EmbyWeb&X-Emby-Device-Name=NodeJS&X-Emby-Device-Id=nodejs-1234&X-Emby-Client-Version=1.0.0&X-Emby-Token=${token}&reqformat=json`;
    try {
      const data = yield fetch(url).then((res) => res.json());
      const source = (_a = data == null ? void 0 : data.MediaSources) == null ? void 0 : _a[0];
      if (!source)
        return null;
      return {
        width: ((_c = (_b = source.MediaStreams) == null ? void 0 : _b[0]) == null ? void 0 : _c.Width) || 0,
        height: ((_e = (_d = source.MediaStreams) == null ? void 0 : _d[0]) == null ? void 0 : _e.Height) || 0,
        bitrate: source.Bitrate || 0,
        DisplayTitle: ((_h = (_g = (_f = source.MediaStreams) == null ? void 0 : _f[0]) == null ? void 0 : _g.DisplayTitle) == null ? void 0 : _h.split(" ")[0]) || ""
      };
    } catch (e) {
      return null;
    }
  });
}

// src/emby/index.js
var PROVIDER_NAME = "Emby";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || seasonNum != null && episodeNum != null;
    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);
    try {
      const credentials = yield getCredentials();
      const auth = yield login(credentials);
      const token = auth.accessToken;
      const userId = auth.userId;
      if (isTv) {
        let series = yield findSeriesByTmdb(token, userId, tmdbId);
        if (!series) {
          const name = yield getTmdbTitle(tmdbId, "tv");
          if (name)
            series = yield searchByName(token, name);
        }
        if (!series || seasonNum == null || episodeNum == null)
          return [];
        const ep = yield findEpisode(token, userId, series.Id, seasonNum, episodeNum);
        if (!ep)
          return [];
        return [yield toStream(ep, token, userId)];
      }
      let movie = yield findMovieByTmdb(token, userId, tmdbId);
      if (!movie) {
        const name = yield getTmdbTitle(tmdbId, "movie");
        if (name)
          movie = yield searchByName(token, name);
      }
      if (!movie)
        return [];
      return [yield toStream(movie, token, userId)];
    } catch (err) {
      console.error(`[${PROVIDER_NAME}] error: ${(err == null ? void 0 : err.message) || err}`);
      return [];
    }
  });
}
