const API_URL = "https://leg3ndary.pythonanywhere.com/v2/process/";

export function decodeTagScript(tagscript) {
    return tagscript
        .replace(/Ꜳ/g, "\\")
        .replace(/ꜳ/g, "<")
        .replace(/₩/g, "/")
        .replace(/ꜵ/g, ">")
        .replace(/Ꜷ/g, ".");
}

export function encodeTagScript(tagscript) {
    return tagscript
        .replace(/\\/g, "Ꜳ")
        .replace(/\//g, "₩")
        .replace(/</g, "ꜳ")
        .replace(/>/g, "ꜵ")
        .replace(/\./g, "Ꜷ");
}

export async function processTagScriptRemote({ tagscript, seed }) {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    body.set("tagscript", tagscript);
    body.append("seeds", encodeTagScript(JSON.stringify(seed)));

    const resp = await fetch(API_URL, {
        method: "POST",
        headers,
        body,
    });
    if (!resp.ok) throw new Error(`Process failed: ${resp.status}`);
    return await resp.json();
}
