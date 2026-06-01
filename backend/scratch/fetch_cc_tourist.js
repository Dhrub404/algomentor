const axios = require("axios");
const fs = require("fs");
const path = require("path");

const downloadProfile = async (username) => {
  const url = `https://www.codechef.com/users/${username}`;
  try {
    console.log(`Downloading: ${url}`);
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 10000
    });
    const filePath = path.join(__dirname, "codechef_tourist.html");
    fs.writeFileSync(filePath, res.data);
    console.log(`Downloaded successfully to ${filePath}. Size: ${res.data.length} bytes.`);
  } catch (err) {
    console.log("Download failed:", err.message);
  }
};

downloadProfile("tourist");
