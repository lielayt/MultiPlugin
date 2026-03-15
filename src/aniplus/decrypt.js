// src/aniplus/decrypt.js

const BASE_URL = "https://anipluspro.upn.one";

// Helpers to derive key/iv (same logic as before)
function deriveKey() {
    const m = (...g) => String.fromCharCode(...g);
    const p = (g, S) => g.codePointAt(S) || 0;

    const PROTOCOL = "https:";
    const P = "10", O = 110, q = 1;

    let F = "";
    const B = p("ᵟ").toString().split("");

    for (let pe = 0; pe < B.length; pe++)
        F += m(P + B[pe]);

    F += m(p(PROTOCOL, P / 10));
    F += F.slice(1, 3);
    F += m(O, O - 1, O + 7);

    const ae = "3579".split("");

    F += m(ae[3] + ae[2], ae[1] + ae[2]);
    F += m(ae[0] * q + q + ae[3], ae[0] * q + q + ae[3]);
    F += m(ae[3] * P + ae[3] * q, parseInt(ae.reverse().join("").slice(0, 2)));

    return new TextEncoder().encode(F);
}

function deriveIV(videoId) {
    const m = (...g) => String.fromCharCode(...g);
    const p = (g, S) => (g.codePointAt ? g.codePointAt(S) : 0) || 0;

    const PROTOCOL = "https:";
    const HASH = "#" + videoId;

    const S = PROTOCOL;
    const Pp = S + "//";
    const O = HASH;

    const q2 = S.length * Pp.length;
    const F = 1;

    let B = "";

    for (let ke = F; ke < 10; ke++)
        B += m(ke + q2);

    let ae = "";
    ae = F + ae + F + ae + F;

    const pe = ae.length * p(O, 0);
    const Je = ae * F + S.length;
    const k = Je + 4;
    const ne = p(S, F);
    const Ie = ne * F - 2;

    B += m(q2, ae, pe, Je, k, ne, Ie);

    return new TextEncoder().encode(B);
}

// Hermes-compatible AES-CBC decrypt
async function aesCbcDecrypt(hexData, key, iv) {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
    );

    // Convert hex string to Uint8Array
    const data = new Uint8Array(hexData.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        data
    );

    return new TextDecoder().decode(decrypted);
}

// Main decrypt function
async function decryptAniplus(videoId) {
    const key = deriveKey();
    const iv = deriveIV(videoId);

    const url = `${BASE_URL}/api/v1/video?id=${videoId}&w=1920&h=1080&r=`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Origin": BASE_URL,
            "Referer": BASE_URL + "/"
        }
    });

    const encrypted = await res.text();
    const data = JSON.parse(await aesCbcDecrypt(encrypted, key, iv));

    const config = JSON.parse(data.streamingConfig);
    const ttV = config.adjust.Tiktok.params.v;

    return {
        tiktok: data.hlsVideoTiktok ? BASE_URL + data.hlsVideoTiktok + "?v=" + ttV : null,
        cloudflare: data.cf || null,
        inhouse: data.source || null
    };
}

module.exports = {
    decryptAniplus
};