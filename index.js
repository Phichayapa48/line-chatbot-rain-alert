require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { getRainForecast } = require("./weather");

const app = express();

// LINE Configuration
const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(lineConfig);

// Webhook Route
app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).end();
  }
});

// Main Handler Function
async function handleEvent(event) {
  if (event.type !== "message") {
    return null;
  }

  const messageType = event.message.type;

  // 1. จัดการข้อความตัวอักษร
  if (messageType === "text") {
    const text = event.message.text;

    if (text.includes("ฝน") || text.includes("อากาศ")) {
      const result = await getRainForecast();
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: result,
      });
    }

    // กรณีพิมพ์อย่างอื่นมา
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ลองถามว่า \"วันนี้ฝนตกไหม\" หรือ \"อากาศเป็นไง\" ได้นะคะ ☔️☀️",
    });
  }

  // 2. จัดการรูปภาพ
  if (messageType === "image") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "รับรูปไว้แล้วนะคะ 📷 แต่ตอนนี้บอทยังดูรูปไม่เป็นน้า ขออภัยค่า",
    });
  }

  // 3. จัดการเสียง
  if (messageType === "audio") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ได้ยินเสียงแล้วค่า 🎧 แต่ตอนนี้ยังแปลความหมายไม่ได้น้า",
    });
  }

  // 4. จัดการสติกเกอร์
  if (messageType === "sticker") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "สติกเกอร์น่ารักจัง! ส่งบ่อยๆ บอทเขินนะเนี่ย 😆",
    });
  }

  // 5. ประเภทอื่นๆ (VDO, File, Location)
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "ตอนนี้รองรับแค่ข้อความ รูป เสียง และสติกเกอร์นะคะ 💬",
  });
}

// Health Check สำหรับการ Deploy (เช่น บน Render หรือ Heroku)
app.get("/", (req, res) => {
  res.send("LINE Weather Bot is Active! ☔️");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});