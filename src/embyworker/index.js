// src/embyworker/index.js

import { getCredentials, toNumberOrNull } from './http.js';
import { findMovieByTmdb, findSeriesByTmdb, findEpisode, toStream, searchByName, getTmdbTitle } from './extractor.js';

const PROVIDER_NAME = "EmbyWorker";

async function getStreams(tmdbId, mediaType, season, episode) {
    const seasonNum = toNumberOrNull(season);
    const episodeNum = toNumberOrNull(episode);
    const isTv = mediaType === "tv" || mediaType === "series" || mediaType === "show" || (seasonNum != null && episodeNum != null);

    console.log(`[${PROVIDER_NAME}] request tmdb=${tmdbId} mediaType=${mediaType} season=${season} episode=${episode}`);

    try {
        const credentials = await getCredentials();

        if (isTv) {
            let series = await findSeriesByTmdb(credentials, tmdbId);
            if (!series) {
                const name = await getTmdbTitle(tmdbId, "tv");
                if (name) series = await searchByName(credentials, name);
            }
            if (!series || seasonNum == null || episodeNum == null) return [];
            const ep = await findEpisode(credentials, series.Id, seasonNum, episodeNum);
            if (!ep) return [];
            return [toStream(ep)];
        }

        let movie = await findMovieByTmdb(credentials, tmdbId);
        if (!movie) {
            const name = await getTmdbTitle(tmdbId, "movie");
            if (name) movie = await searchByName(credentials, name);
        }
        if (!movie) return [];
        return [toStream(movie)];

    } catch (err) {
        console.error(`[${PROVIDER_NAME}] error: ${err?.message || err}`);
        return [];
    }
}

export { getStreams };