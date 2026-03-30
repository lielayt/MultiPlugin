// src/supabase/index.js

import { toNumberOrNull } from './http.js';
import { findItemByTmdb, findSeason, findEpisode, toStream } from './extractor.js';

const PROVIDER_NAME = "Supabase";

async function getStreams(tmdbId, mediaType, season, episode) {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || (seasonNum != null && episodeNum != null);

    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);

    try {
        // 1. Find in items table the row that tmdb_id = id sent from func arg
        const item = await findItemByTmdb(tmdbId);
        
        if (!item) {
            console.log(`[${PROVIDER_NAME}] No item found in DB for TMDB ID: ${tmdbId}`);
            return []; // if not found return []
        }

        const itemId = item.id; // Extracting the ID we found

        if (isTv) {
            if (seasonNum == null || episodeNum == null) return [];

            // 2. Find in seasons table the row where show_id = itemId & season_number = seasonNum
            const seasonData = await findSeason(itemId, seasonNum);
            
            if (!seasonData) {
                console.log(`[${PROVIDER_NAME}] Season ${seasonNum} not found for Show ID: ${itemId}`);
                return []; // if not found return []
            }

            const seasonId = seasonData.id; // Extracting the season ID we found

            // 3. Find in episodes table the row where season_id = seasonId & ep_index = episodeNum
            const episodeData = await findEpisode(seasonId, episodeNum);
            
            if (!episodeData || !episodeData.video_url) {
                console.log(`[${PROVIDER_NAME}] Episode ${episodeNum} or video_url not found.`);
                return []; // if not found return []
            }

            return [toStream(episodeData.video_url, `S${seasonNum}E${episodeNum} - ${item.name}`)];
        }

        // Handle Movies (Fallback if not a TV show)
        if (!item.video_url) {
            console.log(`[${PROVIDER_NAME}] No video_url found for Movie ID: ${itemId}`);
            return [];
        }

        return [toStream(item.video_url, item.name)];

    } catch (err) {
        console.error(`[${PROVIDER_NAME}] error: ${err?.message || err}`);
        return [];
    }
}

export { getStreams };