import "dotenv/config";
import express from "express";
import { Mistral } from "@mistralai/mistralai";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const SYSTEM_PROMPT = `You are "Nova", the customer support assistant for Brightline Coffee Gear,
a small online retailer of coffee brewing equipment.

Your job:
- Answer questions about products, shipping, returns, and order issues.
- Shipping: standard 3-5 business days (free over $50), express 1-2 business days ($9.99).
- Returns: 30 days, unused items, free return label; refunds in 3-5 business days after receipt.
- Be friendly, concise, and professional. If you don't know something (e.g. a specific order status),
  say so and tell the customer to email support@brightlinecoffee.example with their order number.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  const history = messages
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return res.status(400).json({ error: "last message must be from the user" });
  }

  try {
    const result = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    });

    const reply = result.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "Empty response from Mistral API" });
    }
    res.json({ reply });
  } catch (err) {
    console.error("Mistral API error:", err.statusCode ?? err.message);
    res.status(502).json({ error: "Failed to get a response from the Mistral API" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Support chat running at http://localhost:${port}`);
});
