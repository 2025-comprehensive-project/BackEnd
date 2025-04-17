// src/components/Weather.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSun, 
  faCloud, 
  faCloudRain, 
  faSnowflake, 
  faCloudBolt, 
  faCloudSun,
  faWind,
  faQuestion
} from '@fortawesome/free-solid-svg-icons';
import './Weather.css';

function Weather() {
  const [weather, setWeather] = useState({
    temperature: null,
    description: '',
    city: '서울',
    condition: '',
    loading: true,
    error: false
  });

  useEffect(() => {
    // 날씨 정보를 가져오는 함수
    const fetchWeather = async () => {
      try {
        // 실제 API를 사용할 때는 아래 주석을 해제하고 사용하세요
        // const API_KEY = 'your_api_key_here';
        // const response = await fetch(
        //   `https://api.openweathermap.org/data/2.5/weather?q=${weather.city}&appid=${API_KEY}&units=metric`
        // );
        // const data = await response.json();
        
        // API 호출 대신 임시 데이터 사용 (데모용)
        const demoData = {
          main: { temp: 22 },
          weather: [{ main: 'Clear', description: '맑음' }]
        };
        
        // 날씨 상태 업데이트
        setWeather({
          temperature: demoData.main.temp,
          description: demoData.weather[0].description,
          city: weather.city,
          condition: demoData.weather[0].main,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('날씨 정보를 가져오는 중 오류 발생:', error);
        setWeather({
          ...weather,
          loading: false,
          error: true
        });
      }
    };

    fetchWeather();
    
    // 30분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [weather.city]);

  // 날씨 상태에 따른 아이콘 선택
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <FontAwesomeIcon icon={faSun} />;
      case 'clouds':
        return <FontAwesomeIcon icon={faCloud} />;
      case 'rain':
      case 'drizzle':
        return <FontAwesomeIcon icon={faCloudRain} />;
      case 'snow':
        return <FontAwesomeIcon icon={faSnowflake} />;
      case 'thunderstorm':
        return <FontAwesomeIcon icon={faCloudBolt} />;
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
        return <FontAwesomeIcon icon={faWind} />;
      case 'few clouds':
      case 'scattered clouds':
        return <FontAwesomeIcon icon={faCloudSun} />;
      default:
        return <FontAwesomeIcon icon={faQuestion} />;
    }
  };

  if (weather.loading) {
    return <div className="weather-widget">날씨 정보를 불러오는 중...</div>;
  }

  if (weather.error) {
    return <div className="weather-widget">날씨 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="weather-widget">
      <div className="weather-icon">
        {getWeatherIcon(weather.condition)}
      </div>
      <div className="weather-info">
        <div className="weather-location">{weather.city}</div>
        <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
        <div className="weather-desc">{weather.description}</div>
      </div>
    </div>
  );
}

export default Weather;