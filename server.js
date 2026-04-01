const express = require("express");
const os = require("os");
const path = require("path");
const https = require("https");

const app = express();
const PORT = 80;

app.use(express.static(__dirname));

function getPrivateIPv4() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "Not found";
}

function getPublicIPFromService() {
  return new Promise((resolve, reject) => {
    https.get("https://api.ipify.org?format=json", (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.ip);
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

app.get("/server-ip", (req, res) => {
  res.json({ serverIp: getPrivateIPv4() });
});

app.get("/client-ip", (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket.remoteAddress;

  res.json({ clientIp });
});

app.get("/public-ip", async (req, res) => {
  try {
    const publicIp = await getPublicIPFromService();
    res.json({ publicIp });
  } catch (err) {
    res.status(500).json({ publicIp: "Unable to fetch public IP" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
