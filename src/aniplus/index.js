// src/aniplus/index.js
const { getTmdbData, getAnimeByName, getAnimeSeasonsByName, getEpisodesByAnimeId, getAlternativeEpisodeLink, getGDriveDirectUrl, getUrl, getTmdbEpisode, getTVDBAbsoluteEpisode, getTmdbHebrewName} = require('./http');
const { toStream } = require('./extractor');
const CryptoJS = require('crypto-js');

const BASE_URL = "https://anipluspro.upn.one";


async function getStreams(tmdbId, mediaType, season, episode) {

    const episodeItem = await getEpisodeItem(tmdbId, mediaType, season, episode);

    if (!episodeItem)
        return [];

    const actual_link = episodeItem.server === "googleDrive"
        ? await getGDriveDirectUrl(episodeItem.link)
        : await getUrl(episodeItem.link);

    if (actual_link) {
        episodeItem.link = actual_link;
        return [toStream(episodeItem)];
    }

    const alt = await getAlternativeEpisodeLink(episodeItem.episode_id);
    const actLink = await getUrl(alt.episodeLink);
    alt.link = actLink;
    alt.title = actLink ? alt.title : "Decrypt ERR";
    alt.episodeNumber = episodeItem.episodeNumber;
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


async function getEpisodeItem(tmdbId, mediaType, season, episode) {

    const itemData = await getTmdbData(tmdbId, mediaType);
    const tmdbTitle = normalizeAnimeName(mediaType === "movie" ? itemData.title : itemData.name);
    if (!tmdbTitle) return [];

    console.log("Title: ", tmdbTitle);

    const [hebrewName, absEpisode] = await Promise.all([
        getTmdbHebrewName(tmdbId, mediaType).then(n => normalizeAnimeName(n)),
        getTVDBAbsoluteEpisode(tmdbId, season, episode, itemData)
    ]);

    const [animeListByHeb, animeListByEng] = await Promise.all([
        getAnimeSeasonsByName(hebrewName),
        getAnimeSeasonsByName(tmdbTitle)
    ]);

    const ids = new Set(animeListByHeb.map(x => x.animeId));
    const animeList = animeListByHeb.length > 0 ? animeListByEng.filter(x => ids.has(x.animeId)) : animeListByEng;

    if (animeList.length === 0)
        return null;

    const result = getSeasonEpisodeFromAbsolute(animeList, absEpisode);
    const seIndex = result.seasonIndex;
    const epIndex = result.episodeIndex;
    const episodes = await getEpisodesByAnimeId(animeList[seIndex].animeId);
    const episodeItem = episodes[epIndex];

    return episodeItem;
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

    return null;
}

function normalizeAnimeName(name) {
    return name ? name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z\u0590-\u05FF ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        : " ";
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams };
if (typeof exports !== "undefined") exports.getStreams = getStreams;
if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;