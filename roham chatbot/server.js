const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      },
      {
        headers: {
          Authorization: "Bearer Authorization: `Bearer ${process.env.OPENAI_API_KEY}`",
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ خطا در ارتباط با GPT:", err.message);
    res.status(500).json({ reply: "خطا در ارتباط با GPT" });
  }
});

app.listen(3000, () => {
  console.log("✅ سرور روی پورت 3000 فعال شد");
});