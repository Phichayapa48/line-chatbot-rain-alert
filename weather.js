const axios = require("axios");

async function getRainForecast() {
  try {
    // ดึงข้อมูลอากาศของกรุงเทพฯ (หรือเปลี่ยน q=Bangkok เป็นจังหวัดอื่นได้)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=th`;

    const res = await axios.get(url);
    const data = res.data;

    // สกัดข้อมูลที่สำคัญ
    const weatherMain = data.weather[0].main.toLowerCase();
    const description = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;

    let message = `รายงานสภาพอากาศกรุงเทพฯ ตอนนี้ค่ะ 🌡️\n`;
    message += `--------------------------\n`;
    message += `🌡️ อุณหภูมิ: ${temp}°C\n`;
    message += `☁️ สภาพอากาศ: ${description}\n`;
    message += `💧 ความชื้น: ${humidity}%\n`;
    message += `--------------------------\n`;

    // เช็คเงื่อนไขฝนตก
    if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
      message += `\n☔️ ตอนนี้มีฝนตกนะคะ อย่าลืมพกร่มก่อนออกจากบ้านน้า เป็นห่วงค่ะ!`;
    } else {
      message += `\n🌤️ วันนี้ยังไม่มีวี่แววฝนตกค่ะ อากาศโอเคเลย ออกไปเที่ยวได้สบาย!`;
    }

    return message;
  } catch (err) {
    console.error("Weather API Error:", err.response ? err.response.data : err.message);
    return "ขออภัยค่า บอทไปสืบสภาพอากาศมาให้ไม่ได้จริงๆ 🥲";
  }
}

module.exports = { getRainForecast };