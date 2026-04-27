const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/commodity-price", async (req, res) => {
  const { symbols } = req.query;
  const apiKey = req.headers["api-key"];

  if (!symbols || !apiKey) {
    return res.status(400).json({ error: "Missing symbols or API-Key" });
  }

  try {
    const response = await axios.get(
      "https://api.apifreaks.com/v1.0/commodity/rates/latest",
      {
        params: { apikey: apiKey, symbols, updates: "10m" },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("APIFreaks error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Proxy error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
