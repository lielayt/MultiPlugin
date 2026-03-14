// src/aniplus/extractor.js

function toStream(episode) {
    return {
        name: "Aniplus",
        title: episode.title || `Episode ${episode.number || 1}`,
        url: "https://sskt.seawindphotography.space/v4/pq/6y6v3/cf-master.1738747989.txt" || episode.link || episode.episodeLink || "empty",
        quality: episode.quality || "Auto",
        provider: "aniplus",
        logo: "https://raw.githubusercontent.com/lielayt/plugin/main/Assets/aniplus.png",
        headers: {
                      "User-Agent": "Mozilla/5.0",
                      "Referer" : "https://anipluspro.upn.one/",
                      "Origin" : "https://anipluspro.upn.one"
                 }
    };
}

module.exports = { toStream };