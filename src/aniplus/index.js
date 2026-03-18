// src/aniplus/index.js
const { getTmdbData, getAnimeByName, getAnimeSeasonsByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl, getTmdbEpisode, getAbsoluteEpisode, getTmdbHebrewName} = require('./http');
const { toStream } = require('./extractor');
const CryptoJS = require('crypto-js');

const BASE_URL = "https://anipluspro.upn.one";


async function getStreams(tmdbId, mediaType, season, episode) {

    const itemData = await getTmdbData(tmdbId,mediaType)
    const tmdbTitle = mediaType === "movie" ? itemData.title : itemData.name;
    if (!tmdbTitle) return [];

    const episodeItem = await getEpisodeItem(tmdbId,tmdbTitle,mediaType,season,episode)

    if (!episodeItem)
        return []

    const alive = await isUrlAlive(episodeItem.link);
    if (alive) {
        const actual_link = await getGDriveDirectUrl(episodeItem.link)
        episodeItem.link = actual_link || episodeItem.link
        return [toStream(episodeItem)];
    }
    const alt = await getAlternativeEpisodeLink(episodeItem.episode_id);
    const actLink = await getUrl(alt.episodeLink)
    alt.link = actLink
    alt.title = actLink ? alt.title : "Decrypt ERR"
    alt.episodeNumber = episodeItem.episodeNumber
    return [toStream(alt)];
}

function findSeasonByEpisodeDate(animeList, episodeAirDate) {
  const epDate = new Date(episodeAirDate).toISOString().slice(0, 10);

  const seasons = animeList
    .filter(a => a.Type === "אנימה")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let result = null;

  for (const season of seasons) {
    const seasonDate = new Date(season.date).toISOString().slice(0, 10);

    if (seasonDate <= epDate) {
      result = season;
    } else {
      break;
    }
  }

  return result;
}


async function getEpisodeItem(tmdbId,tmdbTitle,mediaType,season,episode){

    const epData = await getTmdbEpisode(tmdbId,season,episode)

    const hebrewName = await getTmdbHebrewName(tmdbId,mediaType).then(name => name ? normalizeAnimeName(name) : null)

    const absEpisode = await getAbsoluteEpisode(tmdbId,season,episode)
    if (absEpisode === null) {
        console.error("getEpisodeItem: could not compute absolute episode number");
        return null;
    }

    const animeListByEng = await getAnimeSeasonsByName(tmdbTitle)

    let animeList = animeListByEng;

    if (hebrewName) {
        const animeListByHeb = await getAnimeSeasonsByName(hebrewName)
        const ids = new Set(animeListByHeb.map(x => x.animeId));
        const intersected = animeListByEng.filter(x => ids.has(x.animeId));
        // Only use intersection if it returns results; otherwise fall back to English-only
        if (intersected.length > 0) {
            animeList = intersected;
        }
    }

    if (animeList.length === 0)
        return null

    const result = getSeasonEpisodeFromAbsolute(animeList,absEpisode)
    if (!result) {
        console.error("getEpisodeItem: episode beyond known seasons");
        return null;
    }

    const seIndex = result.seasonIndex
    const epIndex = result.episodeIndex
    const episodes = await getEpisodesByAnimeId(animeList[seIndex].animeId)
    const episodeItem = episodes[epIndex]

    return episodeItem
}


function getSeasonEpisodeFromAbsolute(animeList, absEpisode) {
    let remaining = absEpisode;

    for (let i = 0; i < animeList.length; i++) {
        const season = animeList[i];

        if (remaining <= season.episode) {
            return {
                seasonIndex: i,
                episodeIndex: remaining - 1
            };
        }

        remaining -= season.episode;
    }

    return null; // episode beyond known seasons
}

function normalizeAnimeName(name) {
    // Keep only Hebrew letters (\u0590-\u05FF) and English letters (a-z, A-Z), plus spaces
    return name
        .replace(/[^a-zA-Z\u0590-\u05FF ]/g, '') // remove anything else
        .replace(/\s+/g, ' ')                    // collapse multiple spaces
        .trim();                                 // remove leading/trailing spaces
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;