const { getStreams: getAniPlus } = require('./providers/aniplus.js');
const { getStreams: getEmby } = require('./providers/emby.js');

async function testAniPlus() {
    console.log("Fetching AniPlus streams...");
    try {
        const streams = await getAniPlus('1429', 'tv', '1', '4'); // example: hunter
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

async function getGDriveDirectUrl(fileId) {
  const initialUrl = `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;

  // Step 1: Get the virus warning page
  const res1 = await fetch(initialUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const cookies = res1.headers.get('set-cookie') || '';
  const html = await res1.text();

  // Extract uuid from the form
  const uuidMatch = html.match(/name="uuid"\s+value="([^"]+)"/);
  const uuid = uuidMatch ? uuidMatch[1] : '';
  console.log('UUID:', uuid);

  // Step 2: Submit the form (click "Download anyway")
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t&uuid=${uuid}`;

  const res2 = await fetch(downloadUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Cookie': cookies
    }
  });

  console.log('Final URL:', res2.url);
  console.log('Content-Type:', res2.headers.get('content-type'));
  console.log('Accept-Ranges:', res2.headers.get('accept-ranges'));
  console.log('Status:', res2.status);

  return res2.url;
}

getGDriveDirectUrl('1SxyPBmFHbmrOlBmr75KF8gVyA1NKT-jM');


