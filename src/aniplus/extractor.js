// src/aniplus/extractor.js

function toStream(episode) {

    return {
        name: "Aniplus",
        title: episode.title || `Episode ${episode.number || 1}`,
        url: episode.link || episode.episodeLink || "empty",
        quality: episode.link ||episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
                      "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                      "Referer" : "https://anipluspro.upn.one/",
                      "Origin" : "https://anipluspro.upn.one"
                 },
        mimeType: "video/x-matroska"
    };
}

module.exports = { toStream };