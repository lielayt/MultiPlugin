// src/emby/extractor.js

const EMBY_SERVER = "https://play.embyil.tv:443";

// Convert API responses into usable streams
async function toStream(item, token, userId) {
    const info = await getPlaybackInfo(item.Id, token, userId);
    const quality = info?.width && info?.height ? info.DisplayTitle : "Auto";

    return {
        name: "Emby",
        title: item.Name || "Emby Stream",
        url: `${EMBY_SERVER}/Videos/${item.Id}/stream`,
        quality,
        provider: "emby",
        logo: "https://raw.githubusercontent.com/lielayt/MultiPlugin/main/Assets/emby_edited.png",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    };
}

// Search and find items by TMDb or name
async function findMovieByTmdb(token, userId, tmdbId) {
    const url = `${EMBY_SERVER}/Users/${userId}/Items?AnyProviderIdEquals=Tmdb.${encodeURIComponent(tmdbId)}&IncludeItemTypes=Movie&Recursive=true&Limit=1&api_key=${token}`;
    const data = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    }).then(res => res.json());
    return data.Items && data.Items[0];
}

async function findSeriesByTmdb(token, userId, tmdbId) {
    const url = `${EMBY_SERVER}/Users/${userId}/Items?AnyProviderIdEquals=Tmdb.${encodeURIComponent(tmdbId)}&IncludeItemTypes=Series&Recursive=true&Limit=1&api_key=${token}`;
    const data = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    }).then(res => res.json());
    return data.Items && data.Items[0];
}

async function findEpisode(token, userId, seriesId, seasonNum, episodeNum) {
    const url = `${EMBY_SERVER}/Shows/${seriesId}/Episodes?UserId=${userId}&Season=${seasonNum}&api_key=${token}`;
    const data = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    }).then(res => res.json());
    return (data.Items || []).find(item => Number(item.IndexNumber) === episodeNum) || null;
}

async function searchByName(token, name) {
    const url = `${EMBY_SERVER}/emby/Items?SearchTerm=${encodeURIComponent(name)}&IncludeItemTypes=Movie,Series&Recursive=true&Limit=20&api_key=${token}`;
    const data = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    }).then(res => res.json());
    return data.Items && data.Items[0];
}

async function getTmdbTitle(tmdbId, mediaType) {
    const TM = "36fb162e5c4e8f206515ddf92070d434";
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TM}&language=he-IL`;
    try {
        const data = await fetch(url).then(res => res.json());
        return type === "movie" ? data.title : data.name;
    } catch {
        return null;
    }
}

// Get playback info for quality/stream
async function getPlaybackInfo(itemId, token, userId) {
    const url = `${EMBY_SERVER}/emby/Items/${itemId}/PlaybackInfo?UserId=${userId}&StartTimeTicks=0&IsPlayback=false&AutoOpenLiveStream=false&X-Emby-Client=Emby%20for%20Android%20TV&X-Emby-Device-Name=Amazon%20Fire%20TV&X-Emby-Device-Id=f47ac10b-58cc-4372-a567-0e02b2c3d479&X-Emby-Client-Version=2.0.1&X-Emby-Token=${token}&reqformat=json`;
    try {
        const data = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        }).then(res => res.json());
        const source = data?.MediaSources?.[0];
        if (!source) return null;
        return {
            width: source.MediaStreams?.[0]?.Width || 0,
            height: source.MediaStreams?.[0]?.Height || 0,
            bitrate: source.Bitrate || 0,
            DisplayTitle: source.MediaStreams?.[0]?.DisplayTitle?.split(" ")[0] || ""
        };
    } catch {
        return null;
    }
}

export { findMovieByTmdb, findSeriesByTmdb, findEpisode, toStream, searchByName, getTmdbTitle, getPlaybackInfo };