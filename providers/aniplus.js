/**
 * aniplus - Built from src/aniplus/
 * Generated: 2026-03-15T13:29:55.291Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

// src/aniplus/decrypt.js
var decrypt_exports = {};
__export(decrypt_exports, {
  decryptAniplus: () => decryptAniplus
});
function deriveKey() {
  const m = (...g) => String.fromCharCode(...g);
  const p = (g, S) => g.codePointAt(S) || 0;
  const PROTOCOL = "https:";
  const P = "10", O = 110, q = 1;
  let F = "";
  const B = p("\u1D5F").toString().split("");
  for (let pe = 0; pe < B.length; pe++) {
    F += m(P + B[pe]);
  }
  F += m(p(PROTOCOL, P / 10));
  F += F.slice(1, 3);
  F += m(O, O - 1, O + 7);
  const ae = "3579".split("");
  F += m(ae[3] + ae[2], ae[1] + ae[2]);
  F += m(ae[0] * q + q + ae[3], ae[0] * q + q + ae[3]);
  F += m(ae[3] * P + ae[3] * q, parseInt(ae.reverse().join("").slice(0, 2)));
  return import_crypto_js.default.enc.Utf8.parse(F);
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
  for (let ke = F; ke < 10; ke++) {
    B += m(ke + q2);
  }
  let ae = "";
  ae = F + ae + F + ae + F;
  const pe = ae.length * p(O, 0);
  const Je = ae * F + S.length;
  const k = Je + 4;
  const ne = p(S, F);
  const Ie = ne * F - 2;
  B += m(q2, ae, pe, Je, k, ne, Ie);
  return import_crypto_js.default.enc.Utf8.parse(B);
}
function aesCbcDecrypt(hexData, key, iv) {
  const ciphertext = import_crypto_js.default.enc.Hex.parse(hexData);
  const cipherParams = import_crypto_js.default.lib.CipherParams.create({ ciphertext });
  const decrypted = import_crypto_js.default.AES.decrypt(
    cipherParams,
    key,
    {
      iv,
      mode: import_crypto_js.default.mode.CBC,
      padding: import_crypto_js.default.pad.Pkcs7
    }
  );
  return decrypted.toString(import_crypto_js.default.enc.Utf8);
}
function decryptAniplus(videoId) {
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
    let decryptedText = aesCbcDecrypt(encrypted, key, iv);
    const lastBraceIndex = decryptedText.lastIndexOf("}");
    if (lastBraceIndex !== -1) {
      decryptedText = decryptedText.substring(0, lastBraceIndex + 1);
    }
    const data = JSON.parse(decryptedText);
    const config = JSON.parse(data.streamingConfig);
    const ttV = config.adjust.Tiktok.params.v;
    return {
      tiktok: data.hlsVideoTiktok ? BASE_URL + data.hlsVideoTiktok + "?v=" + ttV : null,
      cloudflare: data.cf || null,
      inhouse: data.source || null
    };
  });
}
var import_crypto_js, BASE_URL;
var init_decrypt = __esm({
  "src/aniplus/decrypt.js"() {
    import_crypto_js = __toESM(require("crypto-js"));
    BASE_URL = "https://anipluspro.upn.one";
  }
});

// src/aniplus/index.js
var { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require_http();
var { toStream } = require_extractor();
var { decryptAniplus: decryptAniplus2 } = (init_decrypt(), __toCommonJS(decrypt_exports));
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
    const identifier = alt.episodeLink.split("#")[1];
    const result = yield decryptAniplus2(identifier);
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
