const axios = require("axios");

async function getRainForecast(lat = 19.0287, lon = 99.8954) { 
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=th`;

    const res = await axios.get(url);
    const data = res.data;

    const weatherMain = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const placeName = data.name;

    // เช็คว่าถ้าเป็นพิกัดแถว มพ. ให้โชว์ความสนิทสนมเป็นพิเศษ
    const isUP = (lat > 19.02 && lat < 19.04); 
    const locationSuffix = isUP ? " (แถว มพ. 🌲)" : ` (แถว ${placeName})`;

    let message = `รายงานสภาพอากาศ${locationSuffix}\n`;
    message += `--------------------------\n`;
    message += `🌡️ อุณหภูมิ: ${temp}°C\n`;
    message += `☁️ สภาพ: ${description}\n`;
    message += `--------------------------\n`;

    // เช็คคำที่เกี่ยวกับฝน
    const rainKeywords = ["rain", "drizzle", "thunderstorm", "squall"];
    const isRaining = rainKeywords.some(keyword => weatherMain.includes(keyword));

    if (isRaining) {
      message += `\n☔️ ฝนกำลังมา/ตกอยู่ค่ะ! อย่าลืมพกร่มด้วยนะคะ`;
      if (isUP) message += ` จะขึ้นรถเมล์ม่วงต้องระวังลื่นน้า 💜`;
    } else {
      message += `\n🌤️ ท้องฟ้าโอเคค่ะ ยังไม่มีสัญญาณฝน`;
      if (isUP) message += ` เดินไปเรียน ICT ได้สบายเลย!`;
    }

    return message;
  } catch (err) {
    console.error("Weather API Error:", err.message);
    return "ขออภัยค่ะ เช็คสภาพอากาศให้ไม่ได้ในขณะนี้ 🥲";
  }
}

module.exports = { getRainForecast };