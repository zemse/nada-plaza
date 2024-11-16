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
        const data = $(element).html();
        if (data?.includes("bio")) {
          // Step 1: Extract the JSON part from the string
          const jsonStart = data.indexOf("{"); // Find the start of the JSON object
          const jsonEnd = data.lastIndexOf("}"); // Find the end of the JSON object

          if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("JSON object not found in the string.");
          }

          const jsonString = data.slice(jsonStart, jsonEnd + 1);
          // Step 2: Parse the JSON object
          let parsedData: any;
          try {
            parsedData = JSON.parse(JSON.parse(`"${jsonString}"`));
          } catch (error) {
            throw new Error("Failed to parse JSON: ");
          }
          return parsedData["user"];
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return {};
}

export { callApi };
