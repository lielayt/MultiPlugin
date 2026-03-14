// src/aniplus/extractor.js
const { fetchJson } = require('./http');

async function searchByName(name) {
    const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
    const results = await fetchJson(url);
    if (!results || !results.length) return null;
    return results[0]; // Take first result
}

async function getEpisodesByAnimeId(animeId) {
    const url = `https://server.chataniplus.com/anime/getEpisodesByAnimeId/${animeId}`;
    const episodes = await fetchJson(url);
    return episodes || [];
}

function toStream(episode) {
    return {
        title: episode.title || `Episode ${episode.index}`,
        url: episode.streamUrl, // assuming API returns a streamUrl field
        quality: episode.quality || "Auto",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/plugin/main/Assets/aniplus.png",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    };
}

module.exports = { searchByName, getEpisodesByAnimeId, toStream };