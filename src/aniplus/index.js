// src/aniplus/index.js
const { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require('./http');
const { toStream } = require('./extractor');
const CryptoJS = require('crypto-js');

const BASE_URL = "https://anipluspro.upn.one";


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