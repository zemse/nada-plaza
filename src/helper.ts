import ky from "ky";
import * as cheerio from "cheerio";
import { log } from "console";

// Define the API URL, cookie, and origin
const apiUrl =
    "https://nfc.ethglobal.com/?av=A02.03.000001.D1D87DFE&v=01.G1.000005.2BD427BC&pk1=044ED0F162E5DC246EC44B42BAEBD96C9C4D4A99852B43EE683CC404C2816BA82365C38A13F372A24CB7E336D7348485DB8A99C230B0F330F55022A698A7AA137C&latch1=3E374CEE4D02DC860A0AD1DBA1DA80AEFBB06D46FF92E5ACCE5FD22FC5773FAF&cmd=0000&res=00";

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
        console.log({myRes});
        if (myRes) {
                result = myRes;
            }
        } catch (e) {
            console.error(e);
            
        }

    }


/*
    $("script").each((i, el) => {
        try {
            const debug = extractSubstring($(el).html())
            const myRes = extractJson(debug);

            // console.log({myRes});

            if (myRes) {
                result = myRes;
            }
        } catch (e) {
            return false
        }
        });
        */
    // const jsonString = extractSubstring($(el).html());
        // const json = JSON.parse(jsonString);
        // console.log({ content: el , debug: json });
        // scriptTags.push($(el).html()); // Push the script content (can also push the src attribute if needed)

    // console.log(
    //   scriptTags[scriptTags.length - 4].replace("self.__next_f.push", "")
    // );


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