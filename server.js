const express = require("express");
const os = require("os");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get("/server-ip", (req, res) => {
  const interfaces = os.networkInterfaces();
  let serverIp = "Not found";

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        serverIp = net.address;
        break;
      }
    }
    if (serverIp !== "Not found") break;
  }

  res.json({ serverIp });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});