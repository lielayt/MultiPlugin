// src/supabase/http.js

const SUPABASE_URL = "https://myhuovhvodgvqilsyvwg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15aHVvdmh2b2RndnFpbHN5dndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODQ1MDcsImV4cCI6MjA3Nzc2MDUwN30.zIVLAwMHVPj57MsN4nIGDq1XpvMMuf6YsO-kNJkdh4E";

function toNumberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// Wrapper for Supabase REST API calls
async function fetchSupabase(table, queryParams) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, String(value)); // Always convert to string
        }
    });

    if (!url.searchParams.has('select')) {
        url.searchParams.append('select', '*');
    }

    //console.log(`[Supabase] Fetch URL: ${url.toString()}`); // Debug URL

    const res = await fetch(url.toString(), {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        console.error(`Supabase HTTP Error: ${res.status} - ${await res.text()}`);
        return null;
    }
    return res.json();
}

export { fetchSupabase, toNumberOrNull };