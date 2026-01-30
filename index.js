require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const cron = require("node-cron"); // เพิ่ม Library ตั้งเวลา
const { getRainForecast } = require("./weather");

const app = express();

// LINE Configuration
const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(lineConfig);

// Webhook สำหรับรับ Data จาก LINE
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

// ฟังก์ชันหลักในการจัดการ Event ต่างๆ (ความสามารถเดิมครบถ้วน)
async function handleEvent(event) {
  if (event.type !== "message") {
    return null;
  }

  const messageType = event.message.type;

  // ===== 1. ถ้าส่งข้อความ (TEXT) =====
  if (messageType === "text") {
    const text = event.message.text;

    if (text.includes("ฝน") || text.includes("อากาศ") || text.includes("ตกไหม")) {
      const result = await getRainForecast(); 
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: result,
      });
    }

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ถามเรื่องฝนได้นะเคิ้ป เช่น 'วันนี้ฝนตกมั้ย' หรือจะ 'ส่งตำแหน่งที่ตั้ง' มาให้บอทเช็คแถวนั้นก็ได้น้า ☔️☀️",
    });
  }

  // ===== 2. ถ้าส่งตำแหน่งที่ตั้ง (LOCATION) =====
  if (messageType === "location") {
    const lat = event.message.latitude;
    const lon = event.message.longitude;
    const result = await getRainForecast(lat, lon);
    
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `เช็คอากาศจากพิกัดที่คุณส่งมาให้แล้วเคิ้ป:\n\n${result}`,
    });
  }

  // ===== 3. ถ้าส่งรูปภาพ (IMAGE) =====
  if (messageType === "image") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "รับรูปไว้แล้วนะคะ 📷 แต่ตอนนี้ยังดูรูปไม่เป็นน้า",
    });
  }

  // ===== 4. ถ้าส่งเสียง (AUDIO) =====
  if (messageType === "audio") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ได้ยินเสียงแล้วค่า 🎧 แต่ยังแปลงเสียงไม่ได้น้า",
    });
  }

  // ===== 5. ถ้าส่งสติกเกอร์ (STICKER) =====
  if (messageType === "sticker") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "สติกเกอร์น่ารักจัง! ส่งบ่อยๆ บอทเขินนะเนี่ย 😆",
    });
  }

  // ===== 6. ประเภทอื่นๆ =====
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "ตอนนี้รองรับแค่ข้อความ พิกัด รูป เสียง และสติกเกอร์นะคะ 💬",
  });
}

// ===== ส่วนที่ 1: ยิงแจ้งเตือนผ่าน Browser (Manual Push) =====
app.get("/test-push", async (req, res) => {
  try {
    const userId = process.env.MY_USER_ID;
    if (!userId) return res.status(400).send("อย่าลืมใส่ MY_USER_ID ใน .env นะครับ");

    const weatherData = await getRainForecast();

    await client.pushMessage(userId, [
      { type: "text", text: "📢 แจ้งเตือนด่วนจาก Rain Bot! ☔️" },
      { type: "text", text: weatherData }
    ]);

    res.send("ยิงแจ้งเตือนสำเร็จแล้วเคิ้ป!");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ===== ส่วนที่ 2: ตั้งเวลาให้เด้งอัตโนมัติ 17:35 (Auto Push) =====
cron.schedule('40 17 * * *', async () => {
  try {
    const userId = process.env.MY_USER_ID;
    if (userId) {
      const weatherData = await getRainForecast();
      await client.pushMessage(userId, [
        { type: "text", text: "🔔 [แจ้งเตือนอัตโนมัติ] 17:35 น. รายงานสภาพอากาศเย็นนี้ครับ" },
        { type: "text", text: weatherData }
      ]);
      console.log("Auto Alert at 17:40 Sent!");
    }
  } catch (err) {
    console.error("Cron Error:", err);
  }
}, {
  scheduled: true,
  timezone: "Asia/Bangkok"
});

// หน้าแรกเช็คสถานะ
app.get("/", (req, res) => {
  res.send("LINE Rain Alert Bot (UP Edition) is running ☔️🌲");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});