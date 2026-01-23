import express from "express";
import fetch from "node-fetch"; // npm install node-fetch

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Example: call OpenAI API (replace with Copilot API if available)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error connecting to AI service." });
  }
});

export default router;
