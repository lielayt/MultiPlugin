// src/emby/index.js

import { getCredentials, login, toNumberOrNull } from './http.js';
import { findMovieByTmdb, findSeriesByTmdb, findEpisode, toStream, searchByName, getTmdbTitle } from './extractor.js';

const PROVIDER_NAME = "Emby";

async function getStreams(tmdbId, mediaType, season, episode) {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || (seasonNum != null && episodeNum != null);

    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);

    try {
        const credentials = await getCredentials();
        const auth = await login(credentials);
        const token = auth.accessToken;
        const userId = auth.userId;

        if (isTv) {
            let series = await findSeriesByTmdb(token, userId, tmdbId);
            if (!series) {
                const name = await getTmdbTitle(tmdbId, "tv");
                if (name) series = await searchByName(token, name);
            }
            if (!series || seasonNum == null || episodeNum == null) return [];
            const ep = await findEpisode(token, userId, series.Id, seasonNum, episodeNum);
            if (!ep) return [];
            return [await toStream(ep, token, userId)];
        }

        let movie = await findMovieByTmdb(token, userId, tmdbId);
        if (!movie) {
            const name = await getTmdbTitle(tmdbId, "movie");
            if (name) movie = await searchByName(token, name);
        }
        if (!movie) return [];
        return [await toStream(movie, token, userId)];

    } catch (err) {
        console.error(`[${PROVIDER_NAME}] error: ${err?.message || err}`);
        return [];
    }
}

export { getStreams };