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

// ฟังก์ชันหลักในการจัดการ Event ต่างๆ
async function handleEvent(event) {
  // ตรวจสอบว่าไม่ใช่ Message Event ให้ข้ามไป
  if (event.type !== "message") {
    return null;
  }

  const messageType = event.message.type;

  // ===== 1. ถ้าส่งข้อความ (TEXT) =====
  if (messageType === "text") {
    const text = event.message.text;

    // ถ้าถามเรื่อง ฝน หรือ อากาศ -> เช็คที่ มพ. เป็นค่าเริ่มต้น
    if (text.includes("ฝน") || text.includes("อากาศ")) {
      const result = await getRainForecast(); // ไม่ใส่พิกัด = ใช้พิกัด ICT มพ.
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: result,
      });
    }

    // ข้อความอื่นๆ
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ถามเรื่องฝนได้นะเคิ้ป เช่น 'วันนี้ฝนตกมั้ย' หรือจะ 'ส่งตำแหน่งที่ตั้ง' มาให้บอทเช็คแถวนั้นก็ได้น้า ☔️☀️",
    });
  }

  // ===== 2. ถ้าส่งตำแหน่งที่ตั้ง (LOCATION) =====
  if (messageType === "location") {
    const lat = event.message.latitude;
    const lon = event.message.longitude;
    
    // เรียกฟังก์ชันพยากรณ์อากาศตามพิกัดที่ส่งมา
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

// หน้าแรกสำหรับเช็คว่า Server รันอยู่ไหม
app.get("/", (req, res) => {
  res.send("LINE Rain Alert Bot (UP Edition) is running ☔️🌲");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});