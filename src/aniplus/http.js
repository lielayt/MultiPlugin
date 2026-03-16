// src/aniplus/http.js
const TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return res.json();
}

// Get TMDB title by TMDB ID
async function getTmdbTitle(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        const data = await fetchJson(url);
        return type === "movie" ? data.title : data.name;
    } catch {
        return null;
    }
}

// Search AniPlus anime by name
async function getAnimeByName(name) {
    const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
    const results = await fetchJson(url);
    if (!results || !results.length) return null;
    return results[0]; // return first result
}

// Get episodes of an anime by its ID
async function getEpisodesByAnimeId(animeId) {
    const url = `https://server.chataniplus.com/anime/getEpisodesByAnimeId/${animeId}`;
    const episodes = await fetchJson(url);
    return episodes || [];
}

async function getAlternativeEpisodeLink(EpisodeId){
    const url = `https://server.chataniplus.com/episode/getAnotherLinkEpisode/${EpisodeId}`;
    const res = await fetchJson(url)
    return res[0] || []
}

async function isUrlAlive(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(id);

        // Consider 2xx and 3xx responses as alive
        return res.ok || (res.status >= 300 && res.status < 400);
    } catch (err) {
        return false; // fetch failed or timed out
    }
}

async function getGDriveDirectUrl(driveUrl) {
  const res = await fetch(
    `https://aniplus.lielayt.workers.dev/gdrive?url=${encodeURIComponent(driveUrl)}`
  );
  const { directUrl } = await res.json();
  return directUrl;
}

module.exports = {
    fetchJson,
    getTmdbTitle,
    getAnimeByName,
    getEpisodesByAnimeId,
    getAlternativeEpisodeLink,
    isUrlAlive,
    getGDriveDirectUrl
};