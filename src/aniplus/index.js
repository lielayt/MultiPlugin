// src/aniplus/index.js
const { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl } = require('./http');
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

    // Currently fixed for HxH (assuming the link is server's video)
    //const episodeNum = Number(episode) || 1;
    const episodeNum = 58 * (Number(season) - 1) + Number(episode) 
    const ep = episodes[episodeNum - 1];
    if (!ep) return [];

    const alive = await isUrlAlive(ep.link);
    if (alive) {
        const actual_link = await getGDriveDirectUrl(ep.link)
        ep.link = actual_link || ep.link
        return [toStream(ep)];
    }
    const alt = await getAlternativeEpisodeLink(ep.episode_id);
    const actLink = await getUrl(alt.episodeLink)
    alt.link = actLink
    alt.title = actLink ? alt.title : "Decrypt ERR"
    return [toStream(alt)];
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;