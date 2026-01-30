// ... (ส่วน require และ config เดิม)

// ฟังก์ชันหลักในการจัดการ Event (ตอบกลับอัตโนมัติ)
async function handleEvent(event) {
  if (event.type !== "message") return null;

  const messageType = event.message.type;

  // 1. ถ้าส่งข้อความ (TEXT)
  if (messageType === "text") {
    const text = event.message.text;
    // ปรับ: ให้เช็คเรื่องฝน/อากาศ ได้กว้างขึ้น
    if (text.includes("ฝน") || text.includes("อากาศ") || text.includes("ตกไหม")) {
      const result = await getRainForecast(); 
      return client.replyMessage(event.replyToken, { type: "text", text: result });
    }
    // ข้อความทั่วไป
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ถามเรื่องฝนได้นะเคิ้ป เช่น 'วันนี้ฝนตกมั้ย' หรือจะ 'ส่งตำแหน่งที่ตั้ง' มาให้บอทเช็คแถวนั้นก็ได้น้า ☔️☀️",
    });
  }

  // 2. ถ้าส่งตำแหน่ง (LOCATION)
  if (messageType === "location") {
    const lat = event.message.latitude;
    const lon = event.message.longitude;
    const result = await getRainForecast(lat, lon);
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `เช็คอากาศจากพิกัดที่คุณส่งมาให้แล้วเคิ้ป:\n\n${result}`,
    });
  }

  // 3. ถ้าส่งสติกเกอร์ (STICKER)
  if (messageType === "sticker") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "สติกเกอร์น่ารักจัง! ส่งบ่อยๆ บอทเขินนะเนี่ย 😆",
    });
  }

  // 4. ถ้าส่งรูปภาพ (IMAGE)
  if (messageType === "image") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "รับรูปไว้แล้วนะคะ 📷 แต่ตอนนี้ยังดูรูปไม่เป็นน้า",
    });
  }

  // 5. ถ้าส่งเสียง (AUDIO)
  if (messageType === "audio") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ได้ยินเสียงแล้วค่า 🎧 แต่ยังแปลงเสียงไม่ได้น้า",
    });
  }

  // ประเภทอื่นๆ
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "ตอนนี้รองรับแค่ข้อความ พิกัด รูป เสียง และสติกเกอร์นะคะ 💬",
  });
}

// ===== ส่วนที่ทำให้เด้งแจ้งเตือน (เรียกผ่าน Browser) =====
app.get("/test-push", async (req, res) => {
  try {
    const userId = process.env.MY_USER_ID;
    const weatherData = await getRainForecast(); // ดึงรายงานอากาศ มพ.

    await client.pushMessage(userId, [
      { type: "text", text: "📢 แจ้งเตือนด่วนจาก Rain Bot! ☔️" },
      { type: "text", text: weatherData }
    ]);

    res.send("ส่งแจ้งเตือนเข้า LINE แล้วครับ!");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// ... (app.listen เดิม)