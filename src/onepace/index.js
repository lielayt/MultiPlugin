import { extractStreams } from './extractor.js';

const SEASONS = {
    "WA": "35"
};

async function getStreams(tmdbId, mediaType, season=null, episode=null) {
    try {
        const [se, ep] = tmdbId.split('_');

        console.log(`[OnePace] Request: ${mediaType} ${tmdbId}`);

        const onePaceSeason = SEASONS[se];

        if (!onePaceSeason) {
            console.log(`[OnePace] Season not found: ${se}`);
            return [];
        }

        console.log(`[OnePace] One Pace season: ${onePaceSeason}`);
        console.log(`[OnePace] Episode: ${ep}`);

        return await extractStreams(onePaceSeason, ep);

    } catch (error) {
        console.error(`[OnePace] Error: ${error.message}`);
        return [];
    }
}

module.exports = { getStreams };