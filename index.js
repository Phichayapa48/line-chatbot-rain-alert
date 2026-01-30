require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const cron = require("node-cron"); 
const { getRainForecast } = require("./weather");

const app = express();

const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(lineConfig);

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

async function handleEvent(event) {
  // บรรทัดนี้สำคัญ! เอาไว้หารหัสไปใส่ใน .env ตอนรันบน Render ให้ดูที่หน้า Logs
  console.log("=== USER ID ของคุณคือ: " + event.source.userId + " ===");

  if (event.type !== "message") return null;

  const messageType = event.message.type;

  if (messageType === "text") {
    const text = event.message.text;
    if (text.includes("ฝน") || text.includes("อากาศ") || text.includes("ตกไหม")) {
      const result = await getRainForecast(); 
      return client.replyMessage(event.replyToken, { type: "text", text: result });
    }
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ถามเรื่องฝนได้นะเคิ้ป เช่น 'วันนี้ฝนตกมั้ย' หรือจะ 'ส่งตำแหน่งที่ตั้ง' มาให้บอทเช็คแถวนั้นก็ได้น้า ☔️☀️",
    });
  }

  if (messageType === "location") {
    const lat = event.message.latitude;
    const lon = event.message.longitude;
    const result = await getRainForecast(lat, lon);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `เช็คอากาศจากพิกัดที่คุณส่งมาให้แล้วเคิ้ป:\n\n${result}`,
    });
  }

  if (messageType === "sticker") {
    return client.replyMessage(event.replyToken, { type: "text", text: "สติกเกอร์น่ารักจัง! ส่งบ่อยๆ บอทเขินนะเนี่ย 😆" });
  }

  if (messageType === "image") {
    return client.replyMessage(event.replyToken, { type: "text", text: "รับรูปไว้แล้วนะคะ 📷 แต่ตอนนี้ยังดูรูปไม่เป็นน้า" });
  }

  if (messageType === "audio") {
    return client.replyMessage(event.replyToken, { type: "text", text: "ได้ยินเสียงแล้วค่า 🎧 แต่ยังแปลงเสียงไม่ได้น้า" });
  }

  return client.replyMessage(event.replyToken, { type: "text", text: "ตอนนี้รองรับแค่ข้อความ พิกัด รูป เสียง และสติกเกอร์นะคะ 💬" });
}

// ===== 1. ตัวกระตุ้น (เด้งทันทีเมื่อเข้า Link นี้) =====
app.get("/test-push", async (req, res) => {
  try {
    const userId = process.env.MY_USER_ID;
    if (!userId) return res.status(400).send("อย่าลืมใส่ MY_USER_ID ใน Environment Variable นะครับ");

    const weatherData = await getRainForecast();
    await client.pushMessage(userId, [
      { type: "text", text: "📢 [Manual Trigger] แจ้งเตือนอากาศปัจจุบันมาแล้วเคิ้ป!" },
      { type: "text", text: weatherData }
    ]);
    res.send("เด้งเข้า LINE เรียบร้อยแล้วลูกพี่!");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ===== 2. ตั้งเวลาเด้งอัตโนมัติ (17:40) =====
cron.schedule('40 17 * * *', async () => {
  try {
    const userId = process.env.MY_USER_ID;
    if (userId) {
      const weatherData = await getRainForecast();
      await client.pushMessage(userId, [
        { type: "text", text: "🔔 [Auto Alert] 17:40 น. รายงานสภาพอากาศเย็นนี้ครับ" },
        { type: "text", text: weatherData }
      ]);
      console.log("เด้งแจ้งเตือนตอน 17:40 สำเร็จ!");
    }
  } catch (err) {
    console.error("Cron Error:", err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Bangkok"
});

app.get("/", (req, res) => {
  res.send("LINE Rain Alert Bot (UP Edition) is running ☔️🌲");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});