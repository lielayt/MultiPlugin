const { getStreams: getAniPlus } = require('./providers/aniplus.js');
const { getStreams: getEmby } = require('./providers/embyworker.js');
const { getStreams: getSupabase } = require('./providers/supabase.js');

// 🔹 Define test cases
const tests = [
    { id: '30984', type: 'tv', season: '1', episode: '1' },
    { id: '46298', type: 'tv', season: '1', episode: '1' },
    { id: '46298', type: 'tv', season: '2', episode: '4' },
    { id: '1429', type: 'tv', season: '1', episode: '2' },
    { id: '1429', type: 'tv', season: '3', episode: '16' },
    { id: '1429', type: 'tv', season: '4', episode: '28' },
    { id: '95479', type: 'tv', season: '1', episode: '1' },
    { id: '37854', type: 'tv', season: '21', episode: '892' },
    { id: '31910', type: 'tv', season: '22', episode: '1' },
    { id: '12971', type: 'tv', season: '1', episode: '1' }
];

const movies_test = [
    { id: '238', type: 'movie'},
    { id: '129', type: 'movie'},
    { id: '680', type: 'movie'}
]

// 🔹 AniPlus bulk test
async function testAniPlusBulk(tests) {
    console.log("===== AniPlus Tests =====");

    for (const t of tests) {
        try {
            console.log(`\n[AniPlus] Testing ${t.id} S${t.season}E${t.episode}`);
            const streams = await getAniPlus(t.id, t.type, t.season, t.episode);
            console.log("Result:", streams);
        } catch (e) {
            console.error("AniPlus Error:", t, e);
        }
    }
}

// 🔹 Emby bulk test
async function testEmbyBulk(tests) {
    console.log("\n===== Emby Tests =====");

    for (const t of tests) {
        try {
            console.log(`\n[Emby] Testing ${t.id} S${t.season}E${t.episode}`);
            const streams = await getEmby(t.id, t.type, t.season, t.episode);
            console.log("Result:", streams);
        } catch (e) {
            console.error("Emby Error:", t, e);
        }
    }
}

// 🔹 Supabase bulk test
async function testSupabaseBulk(tests) {
    console.log("\n===== Supabase Tests =====");

    for (const t of tests) {
        try {
            console.log(`\n[Supabase] Testing ${t.id} S${t.season}E${t.episode}`);
            const streams = await getSupabase(t.id, t.type, t.season, t.episode);
            console.log("Result:", streams);
        } catch (e) {
            console.error("Supabase Error:", t, e);
        }
    }
}

// 🔹 Run all tests sequentially
async function runAll() {
    //await testAniPlusBulk(tests);
    //await testEmbyBulk(tests);
    await testSupabaseBulk(tests)
}

runAll();