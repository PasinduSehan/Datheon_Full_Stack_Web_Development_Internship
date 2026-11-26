// DOM Elements
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');
const errorText = document.getElementById('errorText');
const weatherDashboard = document.getElementById('weatherDashboard');

// Weather Code Interpreter (WMO Codes)
function getWeatherDetails(code, isDay = 1) {
  if (code === 0) {
    return {
      label: isDay ? 'Clear Sky' : 'Clear Night',
      icon: isDay ? 'fas fa-sun' : 'fas fa-moon',
      theme: isDay ? 'theme-sunny' : 'theme-night'
    };
  }
  if ([1, 2, 3].includes(code)) {
    return {
      label: 'Partly Cloudy',
      icon: isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon',
      theme: isDay ? 'theme-cloudy' : 'theme-night'
    };
  }
  if ([45, 48].includes(code)) {
    return { label: 'Foggy / Mist', icon: 'fas fa-smog', theme: 'theme-cloudy' };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { label: 'Rain Showers', icon: 'fas fa-cloud-showers-heavy', theme: 'theme-rainy' };
  }
  if ([71, 73, 75, 85, 86].includes(code)) {
    return { label: 'Snowfall', icon: 'fas fa-snowflake', theme: 'theme-cloudy' };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: 'Thunderstorm', icon: 'fas fa-bolt', theme: 'theme-rainy' };
  }
  return { label: 'Overcast', icon: 'fas fa-cloud', theme: 'theme-cloudy' };
}

// Fetch City Coordinates & Weather Data
async function fetchWeatherByCity(city) {
  loader.classList.remove('hidden');
  errorBox.classList.add('hidden');
  weatherDashboard.classList.add('hidden');

  try {
    // 1. Geocoding API to convert city name to lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error('Network error while searching city.');
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${city}" not found. Please enter a valid city name.`);
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, country_code } = location;

    // 2. Forecast API for Current Telemetry + 5-Day Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Failed to retrieve weather telemetry.');
    const weatherData = await weatherRes.json();

    renderDashboard(name, country_code, weatherData);
  } catch (err) {
    errorText.textContent = err.message;
    errorBox.classList.remove('hidden');
  } finally {
    loader.classList.add('hidden');
  }
}

// Update UI with Weather Metrics & 5-Day Forecast
function renderDashboard(city, country, data) {
  const current = data.current;
  const daily = data.daily;
  const weatherMeta = getWeatherDetails(current.weather_code, current.is_day);

  // Update background theme
  document.body.className = weatherMeta.theme;

  // Update Hero Info
  document.getElementById('cityName').textContent = `${city}, ${country}`;
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  document.getElementById('conditionBadge').textContent = weatherMeta.label;
  document.getElementById('weatherIcon').className = `${weatherMeta.icon} main-icon`;
  document.getElementById('currentTemp').textContent = Math.round(current.temperature_2m);

  // Update Telemetry Cards
  document.getElementById('humidityValue').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('windValue').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('pressureValue').textContent = `${Math.round(current.surface_pressure)} hPa`;
  document.getElementById('feelsLikeValue').textContent = `${Math.round(current.apparent_temperature)}°C`;

  // Render 5-Day Forecast Cards using Array.map()
  const forecastGrid = document.getElementById('forecastGrid');
  forecastGrid.innerHTML = daily.time
    .map((dateStr, idx) => {
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      const dayMeta = getWeatherDetails(daily.weather_code[idx], 1);
      const maxTemp = Math.round(daily.temperature_2m_max[idx]);
      const minTemp = Math.round(daily.temperature_2m_min[idx]);

      return `
        <div class="forecast-card">
          <div class="forecast-day">${idx === 0 ? 'Today' : dayName}</div>
          <i class="${dayMeta.icon} forecast-icon"></i>
          <div class="forecast-temps">${maxTemp}° <span>/ ${minTemp}°</span></div>
        </div>
      `;
    })
    .join('');

  weatherDashboard.classList.remove('hidden');
}

// Form Submit Listener
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
    cityInput.value = '';
  }
});

// Load Default City on Startup
fetchWeatherByCity('Colombo');