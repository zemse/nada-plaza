import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { callApi } from "./helper.js";
import { cors } from "hono/cors";
import { PersistentMap } from "./store.js";

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

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
