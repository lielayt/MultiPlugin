// src/aniplus/extractor.js

function toStream(episode) {

    return {
        name: "Aniplus",
        title: episode.title || `Episode ${episode.number || 1}`,
        url: "https://drive.usercontent.google.com/download?id=17Fk2mcT7hTRieKaMUkKmarrScUpECu8L&export=download&authuser=0&confirm=t&uuid=b82a8684-0482-4ed9-b89c-34d06f3d2ddc" || episode.link || episode.episodeLink || "empty",
        quality: episode.link ||episode.quality || "Testing",
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