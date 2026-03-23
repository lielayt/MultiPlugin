// src/embyworker/extractor.js

import { workerFetch, WORKER_URL } from './http.js';

const EMBY_SERVER = "https://play.embyil.tv:443";
const TM = "36fb162e5c4e8f206515ddf92070d434";

function toStream(item) {
    return {
        name: "Emby",
        title: item.Name || "Emby Stream",
        url: item.streamUrl,
        quality: item.quality || "Auto",
        provider: "embyworker",
        logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/emby_edited.png",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    };
}

async function findMovieByTmdb(credentials, tmdbId) {
    return workerFetch(`/find/movie/${tmdbId}`, credentials);
}

async function findSeriesByTmdb(credentials, tmdbId) {
    return workerFetch(`/find/series/${tmdbId}`, credentials);
}

async function findEpisode(credentials, seriesId, seasonNum, episodeNum) {
    return workerFetch(`/episode/${seriesId}/${seasonNum}/${episodeNum}`, credentials);
}

async function searchByName(credentials, name) {
    return workerFetch(`/search/${encodeURIComponent(name)}`, credentials);
}

async function getTmdbTitle(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    try {
        const data = await fetch(
            `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TM}&language=he-IL`
        ).then(res => res.json());
        return type === "movie" ? data.title : data.name;
    } catch {
        return null;
    }
}

export { findMovieByTmdb, findSeriesByTmdb, findEpisode, toStream, searchByName, getTmdbTitle };