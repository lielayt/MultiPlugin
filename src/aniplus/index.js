// src/aniplus/index.js
const { getTmdbTitle, getAnimeByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink } = require('./http');
const { toStream } = require('./extractor');
const { decryptAniplus } = require("./decrypt");

async function getStreams(tmdbId, mediaType, season, episode) {
    // 1. Get TMDB title
    const tmdbTitle = await getTmdbTitle(tmdbId, mediaType);
    console.log("TMDB title:", tmdbTitle);
    if (!tmdbTitle) return [];

    // 2. Search AniPlus by name
    const anime = await getAnimeByName(tmdbTitle);
    if (!anime) return [];

    // 3. Get episodes
    const episodes = await getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length) return [];

    const episodeNum = Number(episode) || 1; // default to first episode
    const ep = episodes[episodeNum - 1];
    if (!ep) return [];
    const alive = await isUrlAlive(ep.link)
    if(alive)
        return [toStream(ep)]

    const alt = await getAlternativeEpisodeLink(ep.episode_id)
    const result = await decryptAniplus("6y6v3")
    alt.link = result.tiktok
    console.log("URL: ",stream)

    return [toStream(alt)]
}

// Export
if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;