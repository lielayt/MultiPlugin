// src/aniplus/index.js
const { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require('./http');
const { toStream } = require('./extractor');
const CryptoJS = require('crypto-js');

const BASE_URL = "https://anipluspro.upn.one";

function deriveKey() {
    const m = (...g) => String.fromCharCode(...g);
    const p = (g, S) => g.codePointAt(S) || 0;
    const PROTOCOL = "https:";
    const P = "10", O = 110, q = 1;
    let F = "";
    const B = p("ᵟ").toString().split("");
    for (let pe = 0; pe < B.length; pe++) F += m(P + B[pe]);
    F += m(p(PROTOCOL, P / 10));
    F += F.slice(1, 3);
    F += m(O, O - 1, O + 7);
    const ae = "3579".split("");
    F += m(ae[3] + ae[2], ae[1] + ae[2]);
    F += m(ae[0] * q + q + ae[3], ae[0] * q + q + ae[3]);
    F += m(ae[3] * P + ae[3] * q, parseInt(ae.reverse().join("").slice(0, 2)));
    return CryptoJS.enc.Utf8.parse(F);
}

function deriveIV(videoId) {
    const m = (...g) => String.fromCharCode(...g);
    const p = (g, S) => (g.codePointAt ? g.codePointAt(S) : 0) || 0;
    const PROTOCOL = "https:";
    const HASH = "#" + videoId;
    const S = PROTOCOL;
    const Pp = S + "//";
    const O = HASH;
    const q2 = S.length * Pp.length;
    const F = 1;
    let B = "";
    for (let ke = F; ke < 10; ke++) B += m(ke + q2);
    let ae = "";
    ae = F + ae + F + ae + F;
    const pe = ae.length * p(O, 0);
    const Je = ae * F + S.length;
    const k = Je + 4;
    const ne = p(S, F);
    const Ie = ne * F - 2;
    B += m(q2, ae, pe, Je, k, ne, Ie);
    return CryptoJS.enc.Utf8.parse(B);
}

async function decryptAniplus(videoId) {
    const key = deriveKey();
    const iv = deriveIV(videoId);
    const url = `${BASE_URL}/api/v1/video?id=${videoId}&w=1920&h=1080&r=`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Origin": BASE_URL,
            "Referer": BASE_URL + "/"
        }
    });
    const encrypted = await res.text();
    const ciphertext = CryptoJS.enc.Hex.parse(encrypted);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    const lastBraceIndex = decryptedText.lastIndexOf('}');
    if (lastBraceIndex !== -1) decryptedText = decryptedText.substring(0, lastBraceIndex + 1);
    const data = JSON.parse(decryptedText);
    const config = JSON.parse(data.streamingConfig);
    const ttV = config.adjust.Tiktok.params.v;
    return {
        tiktok: data.hlsVideoTiktok ? BASE_URL + data.hlsVideoTiktok + "?v=" + ttV : null,
        cloudflare: data.cf || null,
        inhouse: data.source || null
    };
}

async function getStreams(tmdbId, mediaType, season, episode) {
    const tmdbTitle = await getTmdbTitle(tmdbId, mediaType);
    if (!tmdbTitle) return [];

    const anime = await getAnimeByName(tmdbTitle);
    if (!anime) return [];

    const episodes = await getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length) return [];

    const episodeNum = Number(episode) || 1;
    const ep = episodes[episodeNum - 1];
    if (!ep) return [];

    const alive = await isUrlAlive(ep.link);
    if (alive) return [toStream(ep)];

    const alt = await getAlternativeEpisodeLink(ep.episode_id);
    const identifier = alt.episodeLink.split("#")[1];

    try {
        //const result = await decryptAniplus(identifier);
        const res = await fetch("https://aniplus.lielayt.workers.dev/?id="+identifier)
        const text = await res.text()
        const data = JSON.parse(text)
        console.log("data: ",data)
        alt.link = data.tiktok;
    } catch(e) {
        alt.title = "Decrypt ERR:" + e.message;
        alt.link = null;
    }
    return [toStream(alt)];
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;