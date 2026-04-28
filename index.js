const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Get yesterday's date in YYYY-MM-DD, skipping weekends (markets closed)
function getLastTradingDay() {
  const d = new Date();
  // If current time is before ~9am EST, go back one more day
  d.setDate(d.getDate() - 1);
  // Skip Saturday (6) and Sunday (0)
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().split("T")[0];
}

// Live prices
app.get("/commodity-price", async (req, res) => {
  const { symbols } = req.query;
  const apiKey = req.headers["api-key"];
  if (!symbols || !apiKey) return res.status(400).json({ error: "Missing symbols or API-Key" });
  try {
    const response = await axios.get(
      "https://api.apifreaks.com/v1.0/commodity/rates/latest",
      { params: { apiKey, symbols, updates: "10m" } }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Live price error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: err.response?.data || "Proxy error" });
  }
});

// Historical prices (yesterday's close)
app.get("/commodity-price/historical", async (req, res) => {
  const { symbols } = req.query;
  const apiKey = req.headers["api-key"];
  const date = getLastTradingDay();
  if (!symbols || !apiKey) return res.status(400).json({ error: "Missing symbols or API-Key" });
  try {
    const response = await axios.get(
      "https://api.apifreaks.com/v1.0/commodity/rates/historical",
      { params: { apiKey, symbols, date } }
    );
    res.json({ ...response.data, date });
  } catch (err) {
    console.error("Historical price error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: err.response?.data || "Proxy error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
