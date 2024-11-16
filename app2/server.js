const https = require("https");
const express = require("express");
const next = require("next");
const fs = require("fs");
const cors = require("cors");

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./localhost-key.pem"),
  cert: fs.readFileSync("./localhost.pem"),
};

// Initialize Express
const server = express();

// Add CORS middleware
server.use(
  cors({
    origin: "*",
  }),
);

// Handle all Next.js routes
app.prepare().then(() => {
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // Custom headers middleware
  server.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  https.createServer(httpsOptions, server).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${port}`);
  });
});
