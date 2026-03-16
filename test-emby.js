const { getStreams: getAniPlus } = require('./providers/aniplus.js');
const { getStreams: getEmby } = require('./providers/emby.js');

async function testAniPlus() {
    console.log("Fetching AniPlus streams...");
    try {
        const streams = await getAniPlus('46298', 'tv', '1', '58'); // example: hunter
        console.log("AniPlus:", streams);
    } catch (e) {
        console.error("AniPlus Error:", e);
    }
}

async function testEmby() {
    console.log("Fetching Emby streams...");
    try {
        const streams = await getEmby('1429', 'tv', '2', '3'); // example: hunter
        console.log("Emby:", streams);
    } catch (e) {
        console.error("Emby Error:", e);
    }
}

// Run both tests sequentially
async function runAll() {
    await testAniPlus();
    await testEmby();
}

runAll();


