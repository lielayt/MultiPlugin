const { getStreams: getAniPlus } = require('./providers/aniplus.js');
const { getStreams: getEmby } = require('./providers/emby.js');

async function testAniPlus() {
    console.log("Fetching AniPlus streams...");
    try {
        const streams = await getAniPlus('1429', 'tv', '1', '1'); // example: hunter
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

async function resolveFinalUrl(url) {
  let currentUrl = url;
  let redirectCount = 0;
  const maxRedirects = 10;

  while (redirectCount < maxRedirects) {
    console.log(`[${redirectCount}] Fetching: ${currentUrl}`);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual", // Don't auto-follow, we handle it manually
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log(`     Status: ${response.status}`);

    if (response.status >= 301 && response.status <= 308) {
      const location = response.headers.get("location");
      console.log(`     ↳ Redirect to: ${location}`);
      currentUrl = location;
      redirectCount++;
    } else if (response.status === 200) {
      const contentType = response.headers.get("content-type");
      console.log(`     ✅ Final URL reached!`);
      console.log(`     Content-Type: ${contentType}`);
      console.log(`     Final URL: ${currentUrl}`);
      return currentUrl;
    } else {
      console.log(`     ❌ Unexpected status: ${response.status}`);
      return currentUrl;
    }
  }

  console.log("❌ Too many redirects");
  return currentUrl;
}

// Run it
const driveUrl =
  "https://drive.usercontent.google.com/download?id=17Fk2mcT7hTRieKaMUkKmarrScUpECu8L&export=download&authuser=0&confirm=t&uuid=b82a8684-0482-4ed9-b89c-34d06f3d2ddc";

resolveFinalUrl(driveUrl).then((finalUrl) => {
  console.log("\n>>> Feed this to ExoPlayer:\n" + finalUrl);
});


