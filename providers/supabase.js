/**
 * supabase - Built from src/supabase/
 * Generated: 2026-03-31T15:12:46.445Z
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

// src/supabase/index.js
var supabase_exports = {};
__export(supabase_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(supabase_exports);

// src/supabase/http.js
var SUPABASE_URL = "https://myhuovhvodgvqilsyvwg.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15aHVvdmh2b2RndnFpbHN5dndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODQ1MDcsImV4cCI6MjA3Nzc2MDUwN30.zIVLAwMHVPj57MsN4nIGDq1XpvMMuf6YsO-kNJkdh4E";
function toNumberOrNull(value) {
  if (value === null || value === void 0 || value === "")
    return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function fetchSupabase(table, queryParams) {
  return __async(this, null, function* () {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));
    if (!url.searchParams.has("select")) {
      url.searchParams.append("select", "*");
    }
    const res = yield fetch(url.toString(), {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      console.error(`Supabase HTTP Error: ${res.status} - ${yield res.text()}`);
      return null;
    }
    return res.json();
  });
}

// src/supabase/extractor.js
function toStream(url, title, quality = "Auto") {
  return {
    name: "Supabase",
    title: title || "Direct Stream",
    url,
    quality,
    provider: "Supabase",
    logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/supabase_logo.png",
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  };
}
function findItemByTmdb(tmdbId) {
  return __async(this, null, function* () {
    const items = yield fetchSupabase("items", {
      "tmdb_id": `eq.${tmdbId}`,
      "limit": "1"
    });
    return items && items.length > 0 ? items[0] : null;
  });
}
function findSeason(showId, seasonNum) {
  return __async(this, null, function* () {
    const seasons = yield fetchSupabase("seasons", {
      "show_id": `eq.${showId}`,
      "season_number": `eq.${seasonNum}`,
      "limit": "1"
    });
    return seasons && seasons.length > 0 ? seasons[0] : null;
  });
}
function findEpisode(seasonId, episodeNum) {
  return __async(this, null, function* () {
    const episodes = yield fetchSupabase("episodes", {
      "season_id": `eq.${seasonId}`,
      "ep_index": `eq.${episodeNum}`,
      // Updated to ep_index as requested
      "limit": "1"
    });
    return episodes && episodes.length > 0 ? episodes[0] : null;
  });
}

// src/supabase/index.js
var PROVIDER_NAME = "Supabase";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || seasonNum != null && episodeNum != null;
    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);
    try {
      const item = yield findItemByTmdb(tmdbId);
      if (!item) {
        console.log(`[${PROVIDER_NAME}] No item found in DB for TMDB ID: ${tmdbId}`);
        return [];
      }
      const itemId = item.id;
      if (isTv) {
        if (seasonNum == null || episodeNum == null)
          return [];
        const seasonData = yield findSeason(itemId, seasonNum);
        if (!seasonData) {
          console.log(`[${PROVIDER_NAME}] Season ${seasonNum} not found for Show ID: ${itemId}`);
          return [];
        }
        const seasonId = seasonData.id;
        const episodeData = yield findEpisode(seasonId, episodeNum);
        if (!episodeData || !episodeData.video_url) {
          console.log(`[${PROVIDER_NAME}] Episode ${episodeNum} or video_url not found.`);
          return [];
        }
        let video_url2 = `https://play.embyil.tv/videos/${episodeData.id}/stream`;
        return [toStream(video_url2, `S${seasonNum}E${episodeNum} - ${item.name}`)];
      }
      if (!item.video_url) {
        console.log(`[${PROVIDER_NAME}] No video_url found for Movie ID: ${itemId}`);
        return [];
      }
      let video_url = `https://play.embyil.tv/videos/${item.id}/stream`;
      return [toStream(video_url, item.name)];
    } catch (err) {
      console.error(`[${PROVIDER_NAME}] error: ${(err == null ? void 0 : err.message) || err}`);
      return [];
    }
  });
}
