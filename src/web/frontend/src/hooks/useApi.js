// src/hooks/useApi.js
import { useState, useCallback } from 'react';

export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (error) {
      console.error('API 호출 오류:', error);
      
      // 오류 메시지 처리
      let errorMessage = '요청 처리 중 오류가 발생했습니다.';
      
      if (error.response) {
        const { status } = error.response;
        
        if (status === 400) {
          errorMessage = '잘못된 요청입니다.';
        } else if (status === 401) {
          errorMessage = '인증이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '접근 권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = '요청한 리소스를 찾을 수 없습니다.';
        } else if (status === 500) {
          errorMessage = '서버 오류가 발생했습니다.';
        }
        
        // 서버에서 보낸 메시지가 있으면 사용
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
}