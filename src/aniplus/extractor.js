// src/aniplus/extractor.js

function toStream(episode) {
    return {
        name: "Aniplus",
        title: episode.title || `Episode ${episode.number || 1}`,
        url: "https://s6p9.seawindphotography.space/v4/pq/6y6v3/index-f1-v1-a1.m3u8" || episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Auto",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/plugin/main/Assets/aniplus.png",
        headers: {
            "accept": "*/*",
            "accept-language": "en-IL,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
            "origin": "https://anipluspro.upn.one",
            "referer": "https://anipluspro.upn.one/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
        }
    };
}

module.exports = { toStream };