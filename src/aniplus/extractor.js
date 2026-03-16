// src/aniplus/extractor.js

function toStream(episode) {
    return {
        name: "Aniplus",
        title: episode.link || episode.title || `Episode ${episode.number || 1}`,
        url: "https://drive.usercontent.google.com/download?id=1SxyPBmFHbmrOlBmr75KF8gVyA1NKT-jM&export=download&authuser=0&confirm=t&uuid=1e12d1b4-15de-4c2f-b80a-13708eea4bde" || episode.link || episode.episodeLink || "empty",
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