// src/aniplus/http.js
const TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return res.json();
}

// Get TMDB title by TMDB ID
async function getTmdbData(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        const data = await fetchJson(url);
        return data
    } catch {
        return null;
    }
}

async function getTmdbHebrewName(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    const translationsUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/translations?api_key=${TMDB_KEY}`;
    
    try {
        const translations = await fetchJson(translationsUrl);
        if (!translations || !translations.translations) return null;

        // Look for Hebrew translation
        const heTranslation = translations.translations.find(t => t.iso_639_1 === "he");
        if (!heTranslation || !heTranslation.data) return null;

        // Return Hebrew title / name depending on media type
        return mediaType === "movie" ? heTranslation.data.title : heTranslation.data.name;
    } catch (err) {
        console.error("Error fetching Hebrew name:", err);
        return null;
    }
}

async function getTmdbEpisode(tmdbId, season, episode) {
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        const data = await fetchJson(url);
        return data;
    } catch (err){
        console.log(err)
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

// Search for all anime seasons for a show and return it sorted
async function getAnimeSeasonsByName(name) {
    const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
    const results = await fetchJson(url);
    if (!results || !results.length) return [];

    return results
        .filter(a => a.Type === "אנימה")
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // oldest → newest
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

async function getUrl(url){

    if (url.includes("drive.google")) return getGDriveDirectUrl(url)
    else if (url.includes("anipluspro")){
        const identifier = url.split("#")[1];
        let actUrl = ""
        try {
            const res = await fetch("https://aniplus.lielayt.workers.dev/aniplus?id="+identifier)
            const text = await res.text()
            const data = JSON.parse(text)
            actUrl = data.tiktok || data.inhouse || data.cloudflare || null;
        } catch(e) {
            actUrl = null;
        }
        return actUrl
    }

}

async function getAbsoluteEpisode(tmdbId, seasonNumber, episodeNumber) {
    try {
        // Fetch show info
        const showUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
        const showRes = await fetch(showUrl);
        if (!showRes.ok) throw new Error("TMDB request failed for show");
        const showData = await showRes.json();

        let absolute = Number(episodeNumber);

        // Sum episodes from all previous seasons
        for (const s of showData.seasons) {
            if (s.season_number > 0 && s.season_number < seasonNumber) {
                absolute += s.episode_count;
            }
        }

        // Fetch the actual season to get first episode number
        const seasonUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_KEY}&language=en-US`;
        const seasonRes = await fetch(seasonUrl);
        if (!seasonRes.ok) throw new Error("TMDB request failed for season");
        const seasonData = await seasonRes.json();

        const firstEpNumber = seasonData.episodes[0].episode_number; // could be > 1
        absolute += (1 - firstEpNumber); // adjust if season doesn’t start at 1

        return absolute;

    } catch (e) {
        console.error("Error in getAbsoluteEpisode:", e);
        return null;
    }
}

module.exports = {
    fetchJson,
    getTmdbData,
    getAnimeByName,
    getAnimeSeasonsByName,
    getEpisodesByAnimeId,
    getAlternativeEpisodeLink,
    isUrlAlive,
    getGDriveDirectUrl,
    getUrl,
    getTmdbEpisode,
    getAbsoluteEpisode,
    getTmdbHebrewName
};