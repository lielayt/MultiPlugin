/**
 * onepace - Built from src/onepace/
 * Generated: 2026-09-03T12:25:27.643Z
 */
var __defProp = Object.defineProperty;
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

// src/onepace/http.js
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
  // Add other common headers like 'Referer' if needed
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    console.log(`[OnePace] Fetching: ${url}`);
    const response = yield fetch(url, __spreadValues({
      headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
    }, options));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${url}`);
    }
    return yield response.text();
  });
}

// src/onepace/extractor.js
function extractStreams(season, episode) {
  return __async(this, null, function* () {
    const url = `https://onepace.co/episode/one-pace-english-sub-${season}x${episode}/`;
    const html = yield fetchText(url);
    const match = html.match(
      /anidek\.src\s*=\s*decodeURIComponent\("([^"]+)"/
    );
    if (!match) {
      console.log("[OnePace] Router URL not found");
      return [];
    }
    const routerUrl = decodeURIComponent(match[1]);
    console.log(`[OnePace] Router URL: ${routerUrl}`);
    const routerHtml = yield fetchText(routerUrl);
    const embedMatch = routerHtml.match(
      /https:\/\/animedekho\.app\/embed\/video\.php\?id=([a-f0-9]+)/
    );
    if (!embedMatch) {
      console.log("[OnePace] AnimeDekho embed not found");
      return [];
    }
    const videoId = embedMatch[1];
    console.log(`[OnePace] Video ID: ${videoId}`);
    const playerUrl = `https://as-cdn26.top/player/index.php?data=${videoId}&do=getVideo`;
    const response = yield fetch(playerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://as-cdn26.top"
      },
      body: `hash=${encodeURIComponent(videoId)}&r=${encodeURIComponent("https://animedekho.app/")}`
    });
    const result = yield response.json();
    if (!result.videoSource) {
      console.log("[OnePace] No video source found");
      return [];
    }
    const masterUrl = result.videoSource;
    const playlistResponse = yield fetch(masterUrl, {
      headers: {
        Referer: "https://animedekho.app/"
      }
    });
    if (!playlistResponse.ok) {
      console.log(
        `[OnePace] Failed to fetch playlist: ${playlistResponse.status}`
      );
      return [];
    }
    const playlist = yield playlistResponse.text();
    const lines = playlist.split(/\r?\n/);
    const streams = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.startsWith("#EXT-X-STREAM-INF:")) {
        continue;
      }
      const qualityMatch = line.match(/NAME="([^"]+)"/);
      const resolutionMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
      const streamUrl = lines[i + 1];
      if (!streamUrl || streamUrl.startsWith("#")) {
        continue;
      }
      const quality = qualityMatch ? qualityMatch[1] : resolutionMatch ? `${resolutionMatch[2]}p` : "Unknown";
      const url2 = new URL(streamUrl, masterUrl).href;
      streams.push({
        name: "OnePace",
        title: quality,
        url: url2,
        quality,
        headers: {
          Referer: "https://animedekho.app/"
        }
      });
    }
    console.log(`[OnePace] Found ${streams.length} quality streams`);
    return streams;
  });
}

// src/onepace/index.js
var SEASONS = {
  "WA": "35"
};
function getStreams(tmdbId, mediaType, season = null, episode = null) {
  return __async(this, null, function* () {
    try {
      const [se, ep] = tmdbId.split("_");
      console.log(`[OnePace] Request: ${mediaType} ${tmdbId}`);
      const onePaceSeason = SEASONS[se];
      if (!onePaceSeason) {
        console.log(`[OnePace] Season not found: ${se}`);
        return [];
      }
      console.log(`[OnePace] One Pace season: ${onePaceSeason}`);
      console.log(`[OnePace] Episode: ${ep}`);
      return yield extractStreams(onePaceSeason, ep);
    } catch (error) {
      console.error(`[OnePace] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
