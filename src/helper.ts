import axios from "axios";
import * as cheerio from "cheerio";

const cookie =
  "ethglobal_access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjY1MiwiZW1haWwiOiJzYXVyYXZuazMwQGdtYWlsLmNvbSIsImlhdCI6MTczMTU5NjIzMiwiZXhwIjoxNzMyODA1ODMyfQ.mKaE8j6vkSOpndhyiqleTR6PbCd57LSZI2Q3ESA8ZJY";
const origin = "https://ethglobal.com";
// Define the API URL, cookie, and origin
async function callApi(apiUrl: string) {
  let result = null;

  const response = await axios.get(apiUrl, {
    headers: {
      Cookie: cookie,
      Origin: origin,
    },
  });

  // Load the HTML response into cheerio
  const $ = cheerio.load(response.data);

  // Extract all <script> tags
  // const scriptTags = [];
  var a = $("script").toArray();
  console.log("length", a.length);
  for (let i = 0; i < a.length; i++) {
    const element = a[i];
    try {
      const data = $(element).html();
      if (data?.includes("uuid")) {
        return await extractJson(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return result;
}

async function extractJson(str: string) {
  const regex = /\/connect\/([\w-]+)/;
  let str2 = str.replaceAll(/\\\\"/g, '"').replaceAll(/\\\\/g, "\\");
  let match = str2.match(regex);
  if (match && match[1]) {
    let res = await axios.get(`https://ethglobal.com/connect/${match[1]}`, {
      headers: {
        Cookie: cookie,
        Origin: origin,
      },
    });
    let $ = cheerio.load(res.data);
    let script = $("script").toArray();
    for (let i = 0; i < script.length; i++) {
      const element = script[i];
      try {
        const data = $(element).html()?.replaceAll("\\", "");
        if (data?.includes("bio")) {
          const regex = /"user":({.*?}})/;

          // Use regex to find matches
          const match = data.match(regex);

          // If a match is found, parse it as JSON
          if (match && match[1]) {
            try {
              return JSON.parse(match[1]);
            } catch (error) {
              console.error("Error parsing user data:", error);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return {};
}

export { callApi };
