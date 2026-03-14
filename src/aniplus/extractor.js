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
                      "Referer" : "https://anipluspro.upn.one/",
                      "Origin" : "https://anipluspro.upn.one"
                 }
    };
}

module.exports = { toStream };