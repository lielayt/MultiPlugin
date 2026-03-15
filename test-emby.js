const { getStreams } = require('./providers/aniplus.js');

async function run() {
    console.log("Fetching streams...");
    try {
        const streams = await getStreams('1429', 'tv','2','3'); // hunter
        console.log(streams);
    } catch (e) {
        console.error(e);
    }
}
run();


