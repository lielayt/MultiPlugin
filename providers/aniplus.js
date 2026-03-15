/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-03-15T11:11:48.372Z
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
        title: episode.title || `Episode ${episode.number || 1}`,
        url: episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/plugin/main/Assets/aniplus.png",
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

// src/aniplus/decrypt.js
var require_decrypt = __commonJS({
  "src/aniplus/decrypt.js"(exports2, module2) {
    var crypto = require("crypto");
    var BASE_URL = "https://anipluspro.upn.one";
    function deriveKey() {
      const m = (...g) => String.fromCharCode(...g);
      const p = (g, S) => g.codePointAt(S) || 0;
      const PROTOCOL = "https:";
      const P = "10", O = 110, q = 1;
      let F = "";
      const B = p("\u1D5F").toString().split("");
      for (let pe = 0; pe < B.length; pe++)
        F += m(P + B[pe]);
      F += m(p(PROTOCOL, P / 10));
      F += F.slice(1, 3);
      F += m(O, O - 1, O + 7);
      const ae = "3579".split("");
      F += m(ae[3] + ae[2], ae[1] + ae[2]);
      F += m(ae[0] * q + q + ae[3], ae[0] * q + q + ae[3]);
      F += m(ae[3] * P + ae[3] * q, parseInt(ae.reverse().join("").slice(0, 2)));
      return Buffer.from(F, "utf8");
    }
    function deriveIV(videoId) {
      const m = (...g) => String.fromCharCode(...g);
      const p = (g, S2) => (g.codePointAt ? g.codePointAt(S2) : 0) || 0;
      const PROTOCOL = "https:";
      const HASH = "#" + videoId;
      const S = PROTOCOL;
      const Pp = S + "//";
      const O = HASH;
      const q2 = S.length * Pp.length;
      const F = 1;
      let B = "";
      for (let ke = F; ke < 10; ke++)
        B += m(ke + q2);
      let ae = "";
      ae = F + ae + F + ae + F;
      const pe = ae.length * p(O, 0);
      const Je = ae * F + S.length;
      const k = Je + 4;
      const ne = p(S, F);
      const Ie = ne * F - 2;
      B += m(q2, ae, pe, Je, k, ne, Ie);
      return Buffer.from(B, "utf8");
    }
    function decrypt(hexData, key, iv) {
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
      const ciphertext = Buffer.from(hexData, "hex");
      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]).toString("utf8");
    }
    function decryptAniplus2(videoId) {
      return __async(this, null, function* () {
        const key = deriveKey();
        const iv = deriveIV(videoId);
        const url = `${BASE_URL}/api/v1/video?id=${videoId}&w=1920&h=1080&r=`;
        const res = yield fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Origin": BASE_URL,
            "Referer": BASE_URL + "/"
          }
        });
        const encrypted = yield res.text();
        const data = JSON.parse(decrypt(encrypted, key, iv));
        const config = JSON.parse(data.streamingConfig);
        const ttV = config.adjust.Tiktok.params.v;
        return {
          tiktok: data.hlsVideoTiktok ? BASE_URL + data.hlsVideoTiktok + "?v=" + ttV : null,
          cloudflare: data.cf || null,
          inhouse: data.source || null
        };
      });
    }
    module2.exports = {
      decryptAniplus: decryptAniplus2
    };
  }
});

// src/aniplus/index.js
var { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require_http();
var { toStream } = require_extractor();
var { decryptAniplus } = require_decrypt();
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const tmdbTitle = yield getTmdbTitle(tmdbId, mediaType);
    console.log("TMDB title:", tmdbTitle);
    if (!tmdbTitle)
      return [];
    const anime = yield getAnimeByName(tmdbTitle);
    if (!anime)
      return [];
    const episodes = yield getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length)
      return [];
    const episodeNum = Number(episode) || 1;
    const ep = episodes[episodeNum - 1];
    if (!ep)
      return [];
    const alive = yield isUrlAlive(ep.link);
    if (alive)
      return [toStream(ep)];
    const alt = yield getAlternativeEpisodeLink(ep.episode_id);
    const result = yield decryptAniplus("6y6v3");
    alt.link = result.tiktok;
    return [toStream(alt)];
  });
}
if (typeof module !== "undefined" && module.exports)
  module.exports = { getStreams };
if (typeof exports !== "undefined")
  exports.getStreams = getStreams;
if (typeof globalThis !== "undefined")
  globalThis.getStreams = getStreams;
