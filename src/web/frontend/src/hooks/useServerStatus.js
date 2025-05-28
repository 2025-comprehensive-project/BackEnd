import { useState, useEffect, useRef, useCallback } from 'react';
import { aiAPI } from '../services/aiAPI';

export const useServerStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  // 서버 상태 조회 (로딩 표시 포함)
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getFlaskStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('서버 상태 조회 실패');
      console.error('서버 상태 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 즉시 상태 새로고침 (로딩 표시 없이)
  const refreshStatusImmediate = useCallback(async () => {
    try {
      const data = await aiAPI.getFlaskStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('서버 상태 조회 실패');
      console.error('서버 상태 조회 실패:', err);
    }
  }, []);

  // 서버 상태 폴링 시작 (30초 간격)
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    // 초기 데이터 로드
    fetchStatus();
    
    // 30초마다 폴링
    pollingRef.current = setInterval(refreshStatusImmediate, 30000);
  }, [fetchStatus, refreshStatusImmediate]);

  // 폴링 중지
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, []);

  // 컴포넌트 언마운트 시 폴링 중지
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    status,
    loading,
    error,
    fetchStatus,  // 새로고침 버튼용 (로딩 표시 있음)
    refreshStatusImmediate,  // 서버 시작/종료 후 즉시 업데이트용
    startPolling,
    stopPolling
  };
};

export default useServerStatus;