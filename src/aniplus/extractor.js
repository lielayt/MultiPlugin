// src/aniplus/extractor.js

function toStream(episode) {
    return {
        name: "Aniplus",
        title: episode.link || episode.title || `Episode ${episode.number || 1}`,
        url: "https://anipluspro.upn.one/api/v1/video?id=rcahy5&w=1536&h=864&r=" || episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
                      "User-Agent": "Mozilla/5.0",
                      "Referer" : "https://anipluspro.upn.one/",
                      "Origin" : "https://anipluspro.upn.one"
                 }
    };
}

module.exports = { toStream };