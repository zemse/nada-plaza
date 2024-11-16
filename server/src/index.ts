import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { callApi } from "./helper.js";
import { cors } from "hono/cors";
import { PersistentMap } from "./store.js";
import "dotenv/config";

const app = new Hono();
app.use("/*", cors());
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/trsage", async (c) => {
  const body = await c.req.json();
  const result = await callApi(body.apiUrl);
  return c.json({ success: true, message: result });
});

// Store the UID and storeID in a persistent map
const map = new PersistentMap("data.json");

app.post("/post-uid-storeid", async (c) => {
  const body = await c.req.json();
  // TODO validate uid and storeid to be in a certain format
  if (typeof body.uid !== "string" && body.uid.length > 0) {
    return c.json({ success: false, message: "uid must be a string" });
  }
  if (typeof body.storeid !== "string" && body.storeid.length > 0) {
    return c.json({ success: false, message: "storeid must be a string" });
  }
  map.set(body.uid, body.storeid);
  return c.json({ success: true });
});

app.get("/get-storeid", async (c) => {
  const uid = c.req.query("uid");
  if (typeof uid !== "string") {
    return c.json({ success: false, message: "uid must be a string" });
  }
  const storeid = map.get(uid);
  return c.json({ success: !!storeid, storeid });
});

app.get("/get-connections", async (c) => {
  let account = c.req.query("account");
  const res = await fetch("https://api.ethglobal.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: process.env[`a_${account}`] as string,
      Origin: "https://ethglobal.com",
    },
    body: JSON.stringify({
      operationName: "getInteractionsSelfPaginated",
      variables: { pagination: { take: 1000 } },
      query:
        "query getInteractionsSelfPaginated($pagination: Pagination!, $filters: InteractionFilters) {\n  getInteractionsSelfPaginated(pagination: $pagination, filters: $filters) {\n    uuid\n    type\n    createdAt\n    verifiedAt\n    targetId\n    targetName\n    target {\n      user {\n        name\n        email\n        twitter\n        discord\n        discordId\n        farcaster\n        telegram\n        linkedin\n        github\n        website\n        title\n        bio\n        avatar {\n          fullUrl\n          __typename\n        }\n        __typename\n      }\n      schedule {\n        name\n        __typename\n      }\n      __typename\n    }\n    connectedUser {\n      name\n      title\n      bio\n      email\n      twitter\n      discord\n      discordId\n      farcaster\n      telegram\n      linkedin\n      github\n      website\n      avatar {\n        fullUrl\n        __typename\n      }\n      __typename\n    }\n    event {\n      name\n      timezone {\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
    }),
  });
  const data = await res.json();
  let result = new Set();
  data.data.getInteractionsSelfPaginated.forEach((element: any) => {
    if (element.type === "attendee_met") {
      if (element.connectedUser) {
        result.add(element.connectedUser.name);
      }
    }
  });
  return c.json(Array.from(result));
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
