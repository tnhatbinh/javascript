import { useState } from "react";
import {
  Search,
  Droplets,
  Wind,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
} from "lucide-react";
import "./App.css";

const getWeatherDetails = (code) => {
  if (code === 0)
    return {
      text: "Clear Sky",
      type: "sunny",
      icon: <Sun size={84} className="anim-sun" />,
    };
  if ([1, 2, 3].includes(code))
    return {
      text: "Few Clouds",
      type: "cloudy",
      icon: <Cloud size={84} className="anim-cloud" />,
    };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return {
      text: "Rain Showers",
      type: "rainy",
      icon: <CloudRain size={84} className="anim-rain" />,
    };
  if ([71, 73, 75, 85, 86].includes(code))
    return {
      text: "Snow Fall",
      type: "snowy",
      icon: <CloudSnow size={84} className="anim-snow" />,
    };
  if ([95, 96, 99].includes(code))
    return {
      text: "Thunderstorm",
      type: "storm",
      icon: <CloudLightning size={84} className="anim-storm" />,
    };
  return {
    text: "Overcast",
    type: "cloudy",
    icon: <Cloud size={84} className="anim-cloud" />,
  };
};

function App() {
  const [city, setCity] = useState("Hanoi");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("Không tìm thấy thành phố!");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`,
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      setWeather({
        name: `${name}, ${country || ""}`,
        temp: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        ...getWeatherDetails(current.weather_code),
      });
    } catch (err) {
      console.error(err);
      alert("Lỗi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const weatherType = weather ? weather.type : "default";

  return (
    <div className={`viewport-container ${weatherType}`}>
      {/* HỆ THỐNG HIỆU ỨNG HẠT ĐỘNG (PARTICLES) */}
      {weatherType === "rainy" && (
        <div className="rain-layer">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="drop"
              style={{ left: `${i * 5}%`, animationDelay: `${(i % 5) * 0.2}s` }}
            ></span>
          ))}
        </div>
      )}

      {weatherType === "snowy" && (
        <div className="snow-layer">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="snowflake"
              style={{ left: `${i * 5}%`, animationDelay: `${(i % 7) * 0.3}s` }}
            >
              ❄
            </span>
          ))}
        </div>
      )}

      {weatherType === "sunny" && <div className="sun-ray"></div>}

      {/* THẺ DỰ BÁO TRUNG TÂM */}
      <div className="weather-card">
        <div className="search-box">
          <input
            type="text"
            placeholder="Nhập tên thành phố..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          <button onClick={fetchWeather} disabled={loading}>
            <Search size={18} />
          </button>
        </div>

        {weather && (
          <div className="weather-content">
            <div className="icon-stage">{weather.icon}</div>
            <h1 className="temperature">
              {weather.temp}°<span className="unit">C</span>
            </h1>
            <h2 className="location-name">{weather.name}</h2>
            <p className="weather-status">{weather.text}</p>

            <div className="stats-container">
              <div className="stat-card">
                <Droplets size={26} className="stat-icon cyan" />
                <div>
                  <div className="stat-value">{weather.humidity}%</div>
                  <div className="stat-name">Độ ẩm</div>
                </div>
              </div>
              <div className="stat-card">
                <Wind size={26} className="stat-icon green" />
                <div>
                  <div className="stat-value">{weather.wind} km/h</div>
                  <div className="stat-name">Tốc độ gió</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <p className="empty-hint">
            Gõ tên thành phố rồi bấm tìm kiếm để quan sát
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
