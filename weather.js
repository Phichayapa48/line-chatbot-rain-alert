const axios = require("axios");

async function getRainForecast() {
  try {
    // ตัวอย่างใช้ OpenWeather (เดี๋ยวใส่ key จริงทีหลัง)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Bangkok&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=th`;

    const res = await axios.get(url);
    const weather = res.data.weather[0].main;

    if (weather.toLowerCase().includes("rain")) {
      return "☔️ วันนี้มีฝนตกนะคะ เตรียมร่มด้วยน้า";
    }

    return "🌤️ วันนี้ฝนไม่น่าตก อากาศโอเคเลย";
  } catch (err) {
    console.error(err);
    return "ขออภัย ระบบพยากรณ์อากาศมีปัญหานิดหน่อย 🥲";
  }
}

module.exports = { getRainForecast };