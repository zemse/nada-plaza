import axios from "axios";
import * as cheerio from "cheerio";

// Define the API URL, cookie, and origin
const apiUrl =
  "https://nfc.ethglobal.com/?av=A02.03.000001.D1D87DFE&v=01.G1.000005.2BD427BC&pk1=044ED0F162E5DC246EC44B42BAEBD96C9C4D4A99852B43EE683CC404C2816BA82365C38A13F372A24CB7E336D7348485DB8A99C230B0F330F55022A698A7AA137C&latch1=3E374CEE4D02DC860A0AD1DBA1DA80AEFBB06D46FF92E5ACCE5FD22FC5773FAF&cmd=0000&res=00";
const cookie =
  "ethglobal_access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NjY1MiwiZW1haWwiOiJzYXVyYXZuazMwQGdtYWlsLmNvbSIsImlhdCI6MTczMTU5NjIzMiwiZXhwIjoxNzMyODA1ODMyfQ.mKaE8j6vkSOpndhyiqleTR6PbCd57LSZI2Q3ESA8ZJY";
  
const origin = "https://ethglobal.com";
async function callApi() {
  try {
    // Send the GET request
    const response = await axios.get(apiUrl, {
      headers: {
        Cookie: cookie,
        Origin: origin,
        "Content-Type": "application/json",
      },
    });

    // Load the HTML response into cheerio
    const $ = cheerio.load(response.data);

    // Extract all <script> tags
    const scriptTags = [];
    $("script").each((i, el) => {
      scriptTags.push($(el).html()); // Push the script content (can also push the src attribute if needed)
    });
    console.log(scriptTags);
    // console.log(
    //   scriptTags[scriptTags.length - 4].replace("self.__next_f.push", "")
    // );
  } catch (error) {
    console.error("Error:", error);
  }
}

callApi();
