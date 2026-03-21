// src/aniplus/extractor.js

function toStream(episode) {

    episode.server = episode.link.includes("google") ? "Google Drive" : "Internal"

    return {
        name: "Aniplus",
        title: `Episode ${episode.episodeNumber || 1} | ${episode.server}`,
        url: episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Testing",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/Multiplugin/main/Assets/aniplus.png",
        headers: {
                      "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                      "Referer" : "https://anipluspro.upn.one/",
                      "Origin" : "https://anipluspro.upn.one"
                 }
    };
}

module.exports = { toStream };