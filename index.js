require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { getRainForecast } = require("./weather");

const app = express();

// LINE config
const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(lineConfig);

// webhook
app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// handle message
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  const text = event.message.text;

  if (text.includes("ฝน")) {
    const result = await getRainForecast();
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: result,
    });
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "พิมพ์ถามได้เลยนะคะ เช่น “วันนี้ฝนตกไหม” ☔️",
  });
}

// health check (สำคัญตอน deploy)
app.get("/", (req, res) => {
  res.send("LINE Rain Alert Bot is running ☔️");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});