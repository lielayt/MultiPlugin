const { getStreams } = require('./providers/aniplus.js');

async function run() {
    console.log("Fetching streams...");
    try {
        const streams = await getStreams('550', 'movie'); // Fight Club
        console.log(streams);
    } catch (e) {
        console.error(e);
    }
}
run();


