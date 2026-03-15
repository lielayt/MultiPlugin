// src/aniplus/extractor.js

function toStream(episode) {
    return {
        name: "Aniplus",
        title: "https://anipluspro.upn.one/hls/8_gvjImIC2qMnFBWONtwow/6hf/6spnib6f/iuthbu/tt/master.m3u8?v=1766826492" || episode.title || `Episode ${episode.number || 1}`,
        url: episode.link || episode.episodeLink || "empty",
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