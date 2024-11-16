import ky from "ky";
import * as cheerio from "cheerio";
import { log } from "console";

// Define the API URL, cookie, and origin
async function callApi(apiUrl: string,) {
    let result = null;
    const cookie =
        "ethglobal_access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjY1MiwiZW1haWwiOiJzYXVyYXZuazMwQGdtYWlsLmNvbSIsImlhdCI6MTczMTU5NjIzMiwiZXhwIjoxNzMyODA1ODMyfQ.mKaE8j6vkSOpndhyiqleTR6PbCd57LSZI2Q3ESA8ZJY";
    const origin = "https://ethglobal.com";

    const response = await ky(apiUrl, {
        headers: {
            Cookie: cookie,
            Origin: origin,
        }
    }).text()

    // Load the HTML response into cheerio
    //@ts-ignore
    const $ = cheerio.load(response);

    // Extract all <script> tags
    // const scriptTags = [];
    var a = $("script").toArray();
   
    for (let i = 0; i < a.length; i++) {
        const element = a[i];
        try {
        const debug = extractSubstring($(element).html())
        if (!debug) {
            continue;
        }
        const myRes = extractJson(debug);
        // console.log({myRes});
        if (myRes) {
                result = myRes;
            }
        } catch (e) {
            console.error(e);
            
        }

    }

    return result;
}


function extractSubstring(str: string) {
    const firstBraceIndex = str.indexOf('{');
    const lastBraceIndex = str.lastIndexOf('}');

    if (firstBraceIndex !== -1 && lastBraceIndex !== -1 && firstBraceIndex < lastBraceIndex) {
        return str.slice(firstBraceIndex + 1, lastBraceIndex);
    } else {
        return null; // Or handle the case where braces are not found or mismatched
    }
}

function extractJson(str: string) {
    var modifiedStr = '{' + str + '}'
    const jsonData = JSON.parse(modifiedStr.replace(/\\"/g, '"'));
    return jsonData
}

export { callApi };