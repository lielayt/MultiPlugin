// src/supabase/extractor.js

import { fetchSupabase } from './http.js';

// Convert DB data into a usable stream object
function toStream(url, title, quality = "Auto") {
    return {
        name: "Supabase",
        title: title || "Direct Stream",
        url: url,
        quality: quality,
        provider: "Supabase",
        logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/supabase_logo.png", 
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    };
}

// 1. Search items table by TMDB ID
async function findItemByTmdb(tmdbId) {
    const items = await fetchSupabase("items", {
        "tmdb_id": `eq.${String(tmdbId)}`,
        "limit": "1"
    });
    return items && items.length > 0 ? items[0] : null;
}

// 2. Find a specific season for a show using the show's ID
async function findSeason(showId, seasonNum) {
    const seasons = await fetchSupabase("seasons", {
        "show_id": `eq.${showId}`,
        "season_number": `eq.${seasonNum}`,
        "limit": "1"
    });
    return seasons && seasons.length > 0 ? seasons[0] : null;
}

// 3. Find a specific episode using the season's ID and the ep_index
async function findEpisode(seasonId, episodeNum) {
    const episodes = await fetchSupabase("episodes", {
        "season_id": `eq.${seasonId}`,
        "ep_index": `eq.${episodeNum}`, // Updated to ep_index as requested
        "limit": "1"
    });
    return episodes && episodes.length > 0 ? episodes[0] : null;
}

export { findItemByTmdb, findSeason, findEpisode, toStream };