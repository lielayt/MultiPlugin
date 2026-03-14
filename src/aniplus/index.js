// src/aniplus/index.js
const { searchByName, getEpisodesByAnimeId, toStream } = require('./extractor');

async function getStreams(tmdbId, mediaType, season, episode) {
    // 1. Get TMDB title
    const tmdbTitle = await getTmdbTitle(tmdbId, mediaType);
    console.log("name: ",tmdbTitle)
    if (!tmdbTitle) return [];

    // 2. Search AniPlus by name
    const anime = await searchByName(tmdbTitle);
    if (!anime) return [];

    // 3. Get episodes
    const episodes = await getEpisodesByAnimeId(anime.animeId);
    if (!episodes.length) return [];

    const episodeNum = Number(episode) || 1; // default to first episode
    const ep = episodes[episodeNum - 1];
    if (!ep) return [];

    return [toStream(ep)];
}

// Optional: simple TMDB API call to get title
const TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";
async function getTmdbTitle(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return type === "movie" ? data.title : data.name;
    } catch {
        return null;
    }
}

// Export for Nuvio
if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;