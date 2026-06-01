const express = require("express");
const originalUse = express.application.use;

express.application.use = function(path, ...args) {
  const app = this;
  if (!app._testRouteInjected) {
    app._testRouteInjected = true;
    app.get("/api/test-monkey", (req, res) => {
      res.send("Monkey patch success!");
    });
    console.log("Successfully injected test route!");
  }
  return originalUse.apply(this, arguments);
};

const app = express();
app.use(express.json());

const server = app.listen(0, () => {
  const port = server.address().port;
  console.log("Server listening on port:", port);
  
  // Make a request to verify the route works
  const http = require("http");
  http.get(`http://localhost:${port}/api/test-monkey`, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      console.log("Response:", data);
      server.close();
      process.exit(data === "Monkey patch success!" ? 0 : 1);
    });
  });
});
