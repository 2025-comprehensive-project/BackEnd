// src/components/layout/Weather.js
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
  faQuestion,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/layout/Weather.css';

function Weather() {
  const [weather, setWeather] = useState({
    temperature: null,
    description: '',
    city: '지역 불러오는 중...',
    condition: '',
    weatherCode: '',
    loading: true,
    error: false
  });

  // 위치 정보 캐싱
  const getCachedLocation = () => {
    const cachedLocation = localStorage.getItem('weatherLocation');
    const cacheTimestamp = localStorage.getItem('weatherLocationTimestamp');
    const now = Date.now();
    
    // 6시간 캐시 (21600000 밀리초)
    if (cachedLocation && cacheTimestamp && (now - parseInt(cacheTimestamp) < 21600000)) {
      return JSON.parse(cachedLocation);
    }
    
    return null;
  };
  
  // 위치 정보 저장
  const setCachedLocation = (latitude, longitude) => {
    const locationData = { latitude, longitude };
    localStorage.setItem('weatherLocation', JSON.stringify(locationData));
    localStorage.setItem('weatherLocationTimestamp', Date.now().toString());
  };
  
  // API 호출 제한을 위한 쓰로틀링
  const throttle = (func, limit) => {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        return func.apply(this, args);
      }
    }
  };

  // 영어 날씨 설명을 한국어로 번역
  const translateWeatherDescription = (englishDesc) => {
    const translations = {
      // 맑음
      'sunny': '맑음',
      'clear': '맑음',
      'fine': '맑음',
      
      // 구름/흐림
      'partly cloudy': '구름 조금',
      'cloudy': '구름 많음',
      'overcast': '흐림',
      'fog': '안개',
      'mist': '연무',
      'haze': '연무',
      
      // 비
      'light rain': '약한 비',
      'moderate rain': '비',
      'heavy rain': '강한 비',
      'rain': '비',
      'light drizzle': '이슬비',
      'drizzle': '이슬비',
      'patchy rain': '간헐적 비',
      'showers': '소나기',
      
      // 눈
      'snow': '눈',
      'light snow': '약한 눈',
      'heavy snow': '폭설',
      'sleet': '진눈깨비',
      
      // 뇌우
      'thunderstorm': '뇌우',
      'thundery outbreaks': '천둥번개',
      'thunder': '천둥'
    };
    
    // 영어 설명을 소문자로 변환
    const lowerDesc = englishDesc.toLowerCase();
    
    // 정확한 번역이 있는지 확인
    for (const [eng, kor] of Object.entries(translations)) {
      if (lowerDesc === eng) {
        return kor;
      }
    }
    
    // 부분 일치 검색
    for (const [eng, kor] of Object.entries(translations)) {
      if (lowerDesc.includes(eng)) {
        return kor;
      }
    }
    
    // 번역이 없으면 원본 반환
    return englishDesc;
  };

  useEffect(() => {
    // 날씨 정보를 가져오는 함수
    const fetchWeather = async () => {
      try {
        setWeather(prev => ({ ...prev, loading: true }));
        
        // 캐시된 위치 정보 확인
        const cachedLocation = getCachedLocation();
        
        if (cachedLocation) {
          // 캐시된 위치 정보 사용
          await fetchWeatherByCoords(cachedLocation.latitude, cachedLocation.longitude);
        } else {
          // 새로운 위치 정보 가져오기
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // 위치 정보 캐싱
              setCachedLocation(latitude, longitude);
              
              // 위치 기반으로 날씨 가져오기
              await fetchWeatherByCoords(latitude, longitude);
            },
            (err) => {
              console.error('위치 정보를 가져오는데 실패했습니다:', err);
              // 위치 정보를 가져오는데 실패하면 기본 위치(서울)로 요청
              fetchWeatherByCity('서울');
            },
            {
              enableHighAccuracy: false, // 높은 정확도 비활성화
              maximumAge: 21600000,      // 6시간 캐시 허용
              timeout: 10000             // 10초 타임아웃
            }
          );
        }
      } catch (error) {
        console.error('날씨 정보를 가져오는 중 오류 발생:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    };

    // 위도, 경도로 날씨 정보 가져오기
    const fetchWeatherByCoords = throttle(async (latitude, longitude) => {
      try {
        // 위치 정보를 기반으로 도시 이름 가져오기
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=ko`
        );
        
        if (!cityResponse.ok) {
          throw new Error('위치 정보를 불러올 수 없습니다.');
        }
        
        const locationData = await cityResponse.json();
        
        // 주소 정보에서 시/구 추출
        const city = locationData.address.city || 
                     locationData.address.town || 
                     locationData.address.village || 
                     '알 수 없음';
        const district = locationData.address.suburb || 
                         locationData.address.county || 
                         locationData.address.state_district || 
                         '';
        
        // 날씨 정보 가져오기 (wttr.in API 사용 - API 키 필요 없음)
        const weatherResponse = await fetch(
          `https://wttr.in/${latitude},${longitude}?format=j1`
        );
        
        if (!weatherResponse.ok) {
          throw new Error('날씨 정보를 불러올 수 없습니다.');
        }
        
        const weatherData = await weatherResponse.json();
        const current = weatherData.current_condition[0];
        
        // 영어 날씨 설명을 한국어로 번역
        const koreanDescription = translateWeatherDescription(current.weatherDesc[0].value);
        
        // 날씨 상태 업데이트
        setWeather({
          temperature: current.temp_C,
          description: koreanDescription,
          city: district ? `${city} ${district}` : city,
          condition: koreanDescription,
          weatherCode: current.weatherCode,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('위치 기반 날씨 정보를 가져오는 중 오류 발생:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    }, 1000);

    // 도시 이름으로 날씨 정보 가져오기
    const fetchWeatherByCity = throttle(async (city) => {
      try {
        // wttr.in API 사용 (API 키 필요 없음)
        const response = await fetch(
          `https://wttr.in/${city}?format=j1`
        );
        
        if (!response.ok) {
          throw new Error('날씨 정보를 불러올 수 없습니다.');
        }
        
        const data = await response.json();
        const current = data.current_condition[0];
        
        // 영어 날씨 설명을 한국어로 번역
        const koreanDescription = translateWeatherDescription(current.weatherDesc[0].value);
        
        setWeather({
          temperature: current.temp_C,
          description: koreanDescription,
          city: city,
          condition: koreanDescription,
          weatherCode: current.weatherCode,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('도시 날씨 정보를 가져오는 중 오류 발생:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    }, 1000);

    fetchWeather();
    
    // 30분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 날씨 상태에 따른 아이콘과 색상 선택
  const getWeatherIconWithColor = () => {
    const { condition, weatherCode } = weather;
    
    // 날씨 상태에 따른 아이콘 색상 및 아이콘 결정
    let icon = null;
    let color = "#ffeb3b"; // 기본 색상 (노란색)
    
    // 날씨 상태 텍스트 기반 아이콘 결정
    const conditionLower = condition.toLowerCase();
    
    // 흐림/구름 관련 상태
    if (
      conditionLower.includes('흐림') || 
      conditionLower.includes('구름') || 
      conditionLower.includes('overcast') || 
      conditionLower.includes('cloudy')
    ) {
      // 완전 흐림
      if (
        conditionLower.includes('흐림') || 
        conditionLower.includes('overcast') || 
        conditionLower.includes('구름 많음')
      ) {
        icon = faCloud;
        color = "#78909c"; // 회색
      }
      // 구름 조금
      else {
        icon = faCloudSun;
        color = "#90a4ae"; // 연한 회색
      }
    }
    
    // 비 관련 상태
    else if (
      conditionLower.includes('비') || 
      conditionLower.includes('소나기') || 
      conditionLower.includes('rain') || 
      conditionLower.includes('shower') || 
      conditionLower.includes('drizzle')
    ) {
      icon = faCloudRain;
      color = "#4fc3f7"; // 파란색
    }
    
    // 눈 관련 상태
    else if (
      conditionLower.includes('눈') || 
      conditionLower.includes('눈송이') || 
      conditionLower.includes('snow') || 
      conditionLower.includes('blizzard')
    ) {
      icon = faSnowflake;
      color = "#e1f5fe"; // 밝은 파란색
    }
    
    // 번개 관련 상태
    else if (
      conditionLower.includes('번개') || 
      conditionLower.includes('뇌우') || 
      conditionLower.includes('천둥') || 
      conditionLower.includes('thunder') || 
      conditionLower.includes('lightning')
    ) {
      icon = faCloudBolt;
      color = "#ffca28"; // 노란색
    }
    
    // 안개 관련 상태
    else if (
      conditionLower.includes('안개') || 
      conditionLower.includes('연무') || 
      conditionLower.includes('fog') || 
      conditionLower.includes('mist') || 
      conditionLower.includes('haze')
    ) {
      icon = faWind;
      color = "#b0bec5"; // 연한 회색
    }
    
    // 맑은 날씨
    else if (
      conditionLower.includes('맑음') || 
      conditionLower.includes('청명') || 
      conditionLower.includes('sunny') || 
      conditionLower.includes('clear')
    ) {
      icon = faSun;
      color = "#ffeb3b"; // 노란색
    }
    
    // 위 조건에 해당하지 않으면 날씨 코드로 판단
    else {
      const code = parseInt(weatherCode);
      
      // wttr.in 날씨 코드 기반으로
      if ([113].includes(code)) { // 맑음
        icon = faSun;
        color = "#ffeb3b"; // 노란색
      }
      else if ([116].includes(code)) { // 구름 조금
        icon = faCloudSun;
        color = "#90a4ae"; // 연한 회색
      }
      else if ([119].includes(code)) { // 구름 많음
        icon = faCloud;
        color = "#78909c"; // 회색
      }
      else if ([122, 143].includes(code)) { // 흐림
        icon = faCloud;
        color = "#78909c"; // 회색
      }
      else if ([176, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code)) { // 비
        icon = faCloudRain;
        color = "#4fc3f7"; // 파란색
      }
      else if ([179, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371].includes(code)) { // 눈
        icon = faSnowflake;
        color = "#e1f5fe"; // 밝은 파란색
      }
      else if ([200, 386, 389, 392, 395].includes(code)) { // 천둥번개
        icon = faCloudBolt;
        color = "#ffca28"; // 노란색
      }
      else if ([143, 248, 260].includes(code)) { // 안개
        icon = faWind;
        color = "#b0bec5"; // 연한 회색
      }
      else { // 기타 또는 알 수 없음
        icon = faQuestion;
        color = "#9e9e9e"; // 중간 회색
      }
    }
    
    return { icon, color };
  };

  if (weather.loading) {
    return (
      <div className="weather-widget">
        <FontAwesomeIcon icon={faSpinner} spin className="weather-icon" />
        <div className="weather-info">
          <div className="weather-location">날씨 정보 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="weather-widget">
        <div className="weather-icon">
          <FontAwesomeIcon icon={faQuestion} />
        </div>
        <div className="weather-info">
          <div className="weather-location">날씨 정보 없음</div>
          <div className="weather-desc">정보를 불러올 수 없습니다.</div>
        </div>
      </div>
    );
  }

  const { icon, color } = getWeatherIconWithColor();

  return (
    <div className="weather-widget">
      <div className="weather-icon" style={{ color }}>
        <FontAwesomeIcon icon={icon} />
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