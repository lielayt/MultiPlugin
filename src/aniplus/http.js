// src/aniplus/http.js
const TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";
const TVDB_KEY = "aa889110-d5b9-4f6c-883d-7970de04e9c7"

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

async function getTmdbEpisode(tmdbId, season) {
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        const seasonData = await fetchJson(url);
        if (!seasonData || !seasonData.episodes || !seasonData.episodes.length) {
            return null; // no episodes found
        }

        // TMDB guarantees episodes array is ordered by episode_number
        const firstEpisode = seasonData.episodes[0];
        return firstEpisode;
    } catch (err) {
        console.log(err);
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
        const fetchPromise = fetch(url, { method: 'HEAD' })
            .then(res => res.ok || (res.status >= 300 && res.status < 400))
            .catch(() => false);

        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => resolve(false), timeout)
        );

        return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err) {
        return false;
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

async function getTMDBAbsoluteEpisode(tmdbId, seasonNumber, episodeNumber) {
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

        // disabling for now as nuvio seemed to normalize seasons starting with ep 1
        //absolute += (1 - firstEpNumber); // adjust if season doesn’t start at 1

        return absolute;

    } catch (e) {
        console.error("Error in getAbsoluteEpisode:", e);
        return null;
    }
}

let TVDB_JWT_TOKEN = null; // cached JWT


async function getTVDBAbsoluteEpisode(tmdbId, seasonNumber, episodeNumber) {
    try {
        // 1️⃣ Get TVDB ID from TMDb
        const extRes = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_KEY}`
        );
        if (!extRes.ok) throw new Error("TMDb external_ids request failed");
        const extData = await extRes.json();
        const tvdbId = extData.tvdb_id;
        if (!tvdbId) return null;

        // 2️⃣ Ensure TVDB JWT token
        if (!TVDB_JWT_TOKEN) {
            const loginRes = await fetch("https://api4.thetvdb.com/v4/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apikey: TVDB_KEY })
            });
            if (!loginRes.ok) {
                const text = await loginRes.text();
                throw new Error("Failed to get TVDB token: " + text);
            }
            const loginData = await loginRes.json();
            TVDB_JWT_TOKEN = loginData.data.token;
        }

        // 3️⃣ Fetch episodes from TVDB
        const tvdbRes = await fetch(`https://api4.thetvdb.com/v4/series/${tvdbId}/episodes/default`, {
            headers: { Authorization: `Bearer ${TVDB_JWT_TOKEN}` }
        });
        if (!tvdbRes.ok) {
            const text = await tvdbRes.text();
            console.error("TVDB ERROR:", tvdbRes.status, text);
            return null;
        }

        const tvdbData = await tvdbRes.json();
        const episodes = tvdbData.data?.episodes || [];

        // 4️⃣ Find the correct episode
        const ep = episodes.find(
            e => e.seasonNumber === Number(seasonNumber) && e.number === Number(episodeNumber)
        );

        return ep?.absoluteNumber || null;

    } catch (e) {
        console.error("Error in getAbsoluteTVDB:", e);
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
    getTMDBAbsoluteEpisode,
    getTVDBAbsoluteEpisode,
    getTmdbHebrewName
};