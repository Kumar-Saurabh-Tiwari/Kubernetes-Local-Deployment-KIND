const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;
const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
const maxTokens = Number.parseInt(process.env.GROQ_MAX_TOKENS || "512", 10);
const timeoutMs = Number.parseInt(process.env.GROQ_TIMEOUT_MS || "15000", 10);
const maxInputChars = Number.parseInt(process.env.GROQ_MAX_INPUT_CHARS || "4000", 10);

app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  const message = req.body?.message;
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return res.status(400).json({ error: "message is required" });
  }

  if (trimmedMessage.length > maxInputChars) {
    return res.status(400).json({
      error: `message must be under ${maxInputChars} characters`
    });
  }

  if (!groqApiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set" });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
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
          { role: "user", content: trimmedMessage }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: Number.isFinite(maxTokens) ? maxTokens : 512
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!groqResponse.ok) {
      let errorText = "Groq API error";

      try {
        const errorJson = await groqResponse.json();
        errorText = errorJson?.error?.message || JSON.stringify(errorJson);
      } catch (parseError) {
        const fallbackText = await groqResponse.text();
        if (fallbackText) {
          errorText = fallbackText;
        }
      }

      return res.status(groqResponse.status).json({
        error: errorText || "Groq API error"
      });
    }

    const data = await groqResponse.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return res.json({ reply, model: groqModel });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Groq request timed out" });
    }
    return res.status(500).json({ error: "Failed to call Groq API" });
  }
});

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
