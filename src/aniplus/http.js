// src/aniplus/http.js
const TMDB_KEY = "36fb162e5c4e8f206515ddf92070d434";
const TVDB_KEY = "aa889110-d5b9-4f6c-883d-7970de04e9c7";

async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return res.json();
}

async function getTmdbData(tmdbId, mediaType) {
    const type = mediaType === "movie" ? "movie" : "tv";
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    try {
        return await fetchJson(url);
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

        const heTranslation = translations.translations.find(t => t.iso_639_1 === "he");
        if (!heTranslation || !heTranslation.data) return null;

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
        if (!seasonData || !seasonData.episodes || !seasonData.episodes.length) return null;
        return seasonData.episodes[0];
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getAnimeByName(name) {
    const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
    const results = await fetchJson(url);
    if (!results || !results.length) return null;
    return results[0];
}

async function getAnimeSeasonsByName(name) {
    const url = `https://server.chataniplus.com/anime/animesearch/${encodeURIComponent(name)}`;
    const results = await fetchJson(url);
    if (!results || !results.length) return [];

    return results
        .filter(a => a.Type === "אנימה" || a.episode > 1)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function getEpisodesByAnimeId(animeId) {
    const url = `https://server.chataniplus.com/anime/getEpisodesByAnimeId/${animeId}`;
    const episodes = await fetchJson(url);
    return episodes || [];
}

async function getAlternativeEpisodeLink(EpisodeId) {
    const url = `https://server.chataniplus.com/episode/getAnotherLinkEpisode/${EpisodeId}`;
    const res = await fetchJson(url);
    return res[0] || [];
}

async function getGDriveDirectUrl(driveUrl) {
    const res = await fetch(
        `https://aniplus.lielayt.workers.dev/gdrive?url=${encodeURIComponent(driveUrl)}`
    );
    const { directUrl } = await res.json();
    return directUrl;
}

async function getUrl(url) {
    if (url.includes("drive.google")) return getGDriveDirectUrl(url);
    else if (url.includes("anipluspro")) {
        const identifier = url.split("#")[1];
        try {
            const res = await fetch("https://aniplus.lielayt.workers.dev/aniplus?id=" + identifier);
            const text = await res.text();
            const data = JSON.parse(text);
            return data.tiktok || data.inhouse || data.cloudflare || null;
        } catch (e) {
            return null;
        }
    }
}

let TVDB_JWT_TOKEN = null;

async function getTVDBAbsoluteEpisode(tmdbId, seasonNumber, episodeNumber) {
    try {
        // 1️⃣ Get TVDB ID from TMDb
        const extRes = await fetch(
            `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_KEY}`
        );

        if (!extRes.ok) {
            console.error("TMDb external_ids failed:", extRes.status);
            return null;
        }

        const extData = await extRes.json();
        const tvdbId = extData.tvdb_id;
        if (!tvdbId) return null;

        // 2️⃣ Ensure TVDB JWT token
        async function ensureToken() {
            if (TVDB_JWT_TOKEN) return;

            const loginRes = await fetch("https://api4.thetvdb.com/v4/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apikey: TVDB_KEY })
            });

            if (!loginRes.ok) {
                const text = await loginRes.text();
                throw new Error("TVDB login failed: " + text);
            }

            const loginData = await loginRes.json();
            TVDB_JWT_TOKEN = loginData?.data?.token;

            if (!TVDB_JWT_TOKEN) {
                throw new Error("TVDB token missing");
            }
        }

        await ensureToken();

        // 3️⃣ Fetch absolute episodes
        let res = await fetch(
            `https://api4.thetvdb.com/v4/series/${tvdbId}/episodes/absolute`,
            {
                headers: {
                    Authorization: `Bearer ${TVDB_JWT_TOKEN}`
                }
            }
        );

        // 🔁 Retry if token expired
        if (res.status === 401) {
            TVDB_JWT_TOKEN = null;
            await ensureToken();

            res = await fetch(
                `https://api4.thetvdb.com/v4/series/${tvdbId}/episodes/absolute`,
                {
                    headers: {
                        Authorization: `Bearer ${TVDB_JWT_TOKEN}`
                    }
                }
            );
        }

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`TVDB fetch failed: ${res.status} ${text}`);
        }

        const data = await res.json();
        const episodes = data?.data?.episodes || [];

        // 4️⃣ Match episode

        // ✅ Absolute match (preferred)
        let ep = episodes.find(
            e => Number(e.number) === Number(episodeNumber)
        );

        // 🔁 Fallback: season + episode
        if (!ep) {
            ep = episodes.find(
                e =>
                    Number(e.seasonNumber) === Number(seasonNumber) &&
                    Number(e.number) === Number(episodeNumber)
            );
        }

        // 5️⃣ Return
        return ep?.number || ep?.absoluteNumber || null;

    } catch (err) {
        console.error("getTVDBAbsoluteEpisode error:", err);
        return null;
    }
}
async function parseM3U8Qualities(masterUrl) {

    if (masterUrl.includes("google"))
        return [] 

    const res = await fetch(masterUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://anipluspro.upn.one/",
            "Origin": "https://anipluspro.upn.one"
        }
    });
    const text = await res.text();
    const base = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);

    const qualities = [];
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
            const resMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
            const bwMatch  = lines[i].match(/BANDWIDTH=(\d+)/);
            const indexUrl = lines[i + 1]?.trim();

            if (indexUrl) {
                qualities.push({
                    resolution: resMatch?.[1] || "unknown",
                    bandwidth:  bwMatch  ? parseInt(bwMatch[1]) : 0,
                    url: base + indexUrl
                });
            }
        }
    }

    return qualities; 
    // [{ resolution: "1280x720", bandwidth: 1169698, url: "https://...index-f1-v1-a1.m3u8?v=..." }]
}


async function getUrlAndQualities(url) {
    let resolvedUrl = null;

    if (url.includes("drive.google")) {
        resolvedUrl = await getGDriveDirectUrl(url);
        return { url: resolvedUrl, qualities: [] };
    }

    if (url.includes("aniplus")) {
        const identifier = url.split("#")[1];
        try {
            const res = await fetch("https://aniplus.lielayt.workers.dev/aniplus?id=" + identifier);
            const data = JSON.parse(await res.text());
            resolvedUrl = data.tiktok || data.inhouse || data.cloudflare || null;
        } catch (e) {
            return { url: null, qualities: [] };
        }
    }

    if (!resolvedUrl) return { url: null, qualities: [] };

    // Fetch once, reuse for both the URL and quality parsing
    try {
        const res = await fetch(resolvedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Referer": "https://anipluspro.upn.one/",
                "Origin": "https://anipluspro.upn.one"
            }
        });
        const text = await res.text();
        const base = resolvedUrl.substring(0, resolvedUrl.lastIndexOf("/") + 1);

        const qualities = [];
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
                const resMatch = lines[i].match(/RESOLUTION=(\d+x\d+)/);
                const bwMatch  = lines[i].match(/BANDWIDTH=(\d+)/);
                const indexUrl = lines[i + 1]?.trim();
                if (indexUrl) {
                    qualities.push({
                        resolution: resMatch?.[1] || "unknown",
                        bandwidth:  bwMatch ? parseInt(bwMatch[1]) : 0,
                        url: base + indexUrl
                    });
                }
            }
        }

        return { url: resolvedUrl, qualities };
    } catch (e) {
        return { url: resolvedUrl, qualities: [] };
    }
}

module.exports = {
    fetchJson,
    getTmdbData,
    getAnimeByName,
    getAnimeSeasonsByName,
    getEpisodesByAnimeId,
    getAlternativeEpisodeLink,
    getGDriveDirectUrl,
    getUrl,
    getTmdbEpisode,
    getTVDBAbsoluteEpisode,
    getTmdbHebrewName,
    parseM3U8Qualities,
    getUrlAndQualities
};