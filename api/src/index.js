const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  const message = req.body?.message;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  if (!groqApiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set" });
  }

  try {
    const groqResponse = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        temperature: 0.2
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return res.status(groqResponse.status).json({
        error: errorText || "Groq API error"
      });
    }

    const data = await groqResponse.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return res.json({ reply, model: groqModel });
  } catch (error) {
    return res.status(500).json({ error: "Failed to call Groq API" });
  }
});

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
