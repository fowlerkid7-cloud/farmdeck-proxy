const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/commodity-price", async (req, res) => {
  const { name } = req.query;
  const apiKey = req.headers["api-key"];

  if (!name || !apiKey) {
    return res.status(400).json({ error: "Missing name or API-Key" });
  }

  try {
    const response = await axios.get(
      "https://commodity-price-api.omkar.cloud/commodity-price",
      {
        params: { name },
        headers: { "API-Key": apiKey },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Proxy error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
