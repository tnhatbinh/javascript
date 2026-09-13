import { useState } from "react";
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "./App.css";

function App() {
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const searchWeather = async () => {
    if (!cityName.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setWeatherData(null);

    try {
      // 1. Geocoding API: Tên -> Tọa độ
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=vi&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setErrorMsg("Không tìm thấy địa điểm. Vui lòng kiểm tra lại chính tả.");
        setLoading(false);
        return;
      }

      const place = geoData.results[0];
      const { latitude, longitude, name, country } = place;

      // 2. Weather API: Tọa độ -> Số liệu
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
      const weatherRes = await fetch(weatherUrl);
      const weatherDataRes = await weatherRes.json();

      setWeatherData({
        location: `${name}${country ? `, ${country}` : ""}`,
        temp: Math.round(weatherDataRes.current.temperature_2m),
        humidity: weatherDataRes.current.relative_humidity_2m,
        wind: weatherDataRes.current.wind_speed_10m,
      });
    } catch (error) {
      console.error(error);
      setErrorMsg("Lỗi mạng kết nối đến máy chủ thời tiết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="weather-card">
        <header className="card-header">
          <h2>Hệ Thống Quan Trắc</h2>
          <span className="badge">Trực Tuyến</span>
        </header>

        {/* Thanh tìm kiếm tiêu chuẩn */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Nhập tên thành phố..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchWeather()}
          />
          <button onClick={searchWeather} disabled={loading} title="Tìm kiếm">
            <Search size={18} />
          </button>
        </div>

        {/* Khu vực hiển thị thông tin & Trạng thái */}
        <div className="display-area">
          {loading && (
            <div className="state-message">
              <Loader2 className="spinner" size={28} />
              <p>Đang truy vấn vệ tinh...</p>
            </div>
          )}

          {errorMsg && (
            <div className="state-message error">
              <AlertCircle size={24} />
              <p>{errorMsg}</p>
            </div>
          )}

          {!loading && weatherData && (
            <div className="weather-info">
              <div className="location-tag">
                <MapPin size={16} />
                <span>{weatherData.location}</span>
              </div>

              <div className="main-temp">
                <h1>
                  {weatherData.temp}°<span>C</span>
                </h1>
              </div>

              <div className="metrics-grid">
                <div className="metric-box">
                  <Thermometer size={18} className="metric-icon" />
                  <div>
                    <span className="label">Nhiệt độ</span>
                    <span className="val">{weatherData.temp}°C</span>
                  </div>
                </div>

                <div className="metric-box">
                  <Droplets size={18} className="metric-icon" />
                  <div>
                    <span className="label">Độ ẩm</span>
                    <span className="val">{weatherData.humidity}%</span>
                  </div>
                </div>

                <div className="metric-box">
                  <Wind size={18} className="metric-icon" />
                  <div>
                    <span className="label">Sức gió</span>
                    <span className="val">{weatherData.wind} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !weatherData && !errorMsg && (
            <div className="state-message empty">
              <p>Chưa có dữ liệu. Vui lòng nhập địa danh để bắt đầu tra cứu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
