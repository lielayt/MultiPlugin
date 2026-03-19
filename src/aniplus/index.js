// src/aniplus/index.js
const { getTmdbData, getAnimeByName, getAnimeSeasonsByName, getEpisodesByAnimeId, isUrlAlive, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl, getTmdbEpisode, getTMDBAbsoluteEpisode, getTVDBAbsoluteEpisode, getTmdbHebrewName} = require('./http');
const { toStream } = require('./extractor');
const CryptoJS = require('crypto-js');

const BASE_URL = "https://anipluspro.upn.one";


async function getStreams(tmdbId, mediaType, season, episode) {

    
    //console.log(itemData.original_name)
    

    const episodeItem = await getEpisodeItem(tmdbId,mediaType,season,episode)

    if (!episodeItem)
        return []
    // const anime = await getAnimeByName(tmdbTitle);
    // if (!anime) return [];

    // const episodes = await getEpisodesByAnimeId(anime.animeId);
    // if (!episodes.length) return [];

    // // Currently fixed for HxH (assuming the link is server's video)
    // //const episodeNum = Number(episode) || 1;
    // const episodeNum = 58 * (Number(season) - 1) + Number(episode) 
    // const ep = episodes[episodeNum - 1];
    // if (!ep) return [];



    const alive = await isUrlAlive(episodeItem.link);
    if (alive) {
        const actual_link = episodeItem.server === "googleDrive" ? await getGDriveDirectUrl(episodeItem.link) : await getUrl(episodeItem.link)
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


async function getEpisodeItem(tmdbId,mediaType,season,episode){
    // test

    // const epData = await getTmdbEpisode(tmdbId,season)
    // const firstEpIndex = epData.episode_number || null
    //console.log(airDate)
    const itemData = await getTmdbData(tmdbId,mediaType)
    const tmdbTitle = normalizeAnimeName(mediaType === "movie" ? itemData.title : itemData.name);
    if (!tmdbTitle) return [];
    
    console.log("Title: ",tmdbTitle)

    const hebrewName = await getTmdbHebrewName(tmdbId,mediaType).then(name => normalizeAnimeName(name))
    //console.log("hebrew: ",hebrewName)

    const absEpisode = await getTVDBAbsoluteEpisode(tmdbId,season,episode)

    const animeListByHeb = await getAnimeSeasonsByName(hebrewName)
    const animeListByEng = await getAnimeSeasonsByName(tmdbTitle)
    //console.log("Heb:", animeListByHeb.length, "Eng:", animeListByEng.length);
    const ids = new Set(animeListByHeb.map(x => x.animeId));
    const animeList = animeListByEng.filter(x => ids.has(x.animeId));
    
    if (animeList.length === 0)
        return null

    //console.log("list: ",animeList)
    // const matchingSeason = findSeasonByEpisodeDate(animeList,airDate)
    // console.log("matching object ",matchingSeason)

    const result = getSeasonEpisodeFromAbsolute(animeList,absEpisode)
    const seIndex = result.seasonIndex
    const epIndex = result.episodeIndex
    const episodes = await getEpisodesByAnimeId(animeList[seIndex].animeId)
    const episodeItem = episodes[epIndex]
    // console.log("Seasons: ",animeList)
    // console.log("Absolute: ",absEpisode)
    // console.log("Season and episode: ",result)
    // console.log("Result array name: ",animeList[seIndex].englishName)
    // console.log("Episode item: ",episodeItem)
    return episodeItem

    //////
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
    return name
        // Normalize accented letters to base letters: "NFD" splits accents
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')         // Remove diacritics (accents)
        // Keep only English letters, Hebrew letters, and spaces
        .replace(/[^a-zA-Z\u0590-\u05FF ]/g, '') 
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        .trim();
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;