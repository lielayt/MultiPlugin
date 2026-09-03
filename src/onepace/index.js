import { extractStreams } from './extractor.js';

const SEASONS = {
    "WA": "35"
};

async function getStreams(id, mediaType, season, episode) {
    try {
        const [se, ep] = id.split('_');

        console.log(`[OnePace] Request: ${mediaType} ${id}`);

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