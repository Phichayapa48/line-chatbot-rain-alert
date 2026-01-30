const axios = require("axios");

async function getRainForecast(lat = 19.0287, lon = 99.8954) { // ค่าเริ่มต้นคือ คณะ ICT มพ.
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=th`;

    const res = await axios.get(url);
    const data = res.data;

    const weatherMain = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const placeName = data.name; // ชื่อสถานที่ที่ API ตรวจพบ

    let message = `รายงานอากาศบริเวณ: ${placeName} (มพ.) 🌲\n`;
    message += `--------------------------\n`;
    message += `🌡️ อุณหภูมิ: ${temp}°C\n`;
    message += `☁️ สภาพ: ${description}\n`;
    message += `--------------------------\n`;

    if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
      message += `\n☔️ แถวหน้า มพ. ฝนกำลังจะตก/ตกอยู่ค่ะ! อย่าลืมพกร่มขึ้นรถเมล์ม่วงน้า 💜`;
    } else {
      message += `\n🌤️ แถว ICT อากาศโอเคค่ะ ยังไม่มีฝน เดินไปเรียนได้สบาย!`;
    }

    return message;
  } catch (err) {
    console.error("Weather API Error:", err.message);
    return "สืบสภาพอากาศแถว มพ. ไม่สำเร็จค่ะ 🥲";
  }
}

module.exports = { getRainForecast };