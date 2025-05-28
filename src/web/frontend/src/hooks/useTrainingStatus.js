// src/hooks/useTrainingStatus.js
import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../services/aiAPI';

export const useTrainingStatus = (version) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const isFetchingRef = useRef(false); // 요청 중인지 확인하는 플래그
  const lastFetchTimeRef = useRef(0); // 마지막 요청 시간 추적
  const MIN_FETCH_INTERVAL = 2000; // 최소 요청 간격 (2초)
  const INITIAL_POLLING_INTERVAL = 10000; // 초기 폴링 간격 (10초)
  const [pollingInterval, setPollingInterval] = useState(INITIAL_POLLING_INTERVAL);

  // 학습 상태 폴링 시작
  const startPolling = () => {
    // 기존 폴링 중지
    stopPolling();

    // 폴링 시작
    const fetchStatus = async () => {
      // 이미 요청 중인 경우 또는 마지막 요청 후 최소 시간이 지나지 않은 경우 중지
      const now = Date.now();
      if (isFetchingRef.current || (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL)) {
        console.log('이미 요청 진행 중이거나 최소 간격이 지나지 않음, 요청 스킵');
        return;
      }
      
      isFetchingRef.current = true; // 요청 시작 표시
      lastFetchTimeRef.current = now; // 마지막 요청 시간 갱신
      
      try {
        console.log(`[${version}] 학습 상태 확인 중...`);
        const data = await aiAPI.getTrainingStatus(version);
        setStatus(data);
        setLoading(false);

        // 학습 진행 상황에 따라 폴링 간격 조정
        adjustPollingInterval(data);

        // 학습 완료 또는 실패 시 폴링 중지
        if (data.status === 'completed' || data.status === 'failed') {
          console.log(`[${version}] 학습 완료 또는 실패, 폴링 중지`);
          stopPolling();
        }
      } catch (err) {
        console.error(`[${version}] 학습 상태 조회 실패:`, err);
        setError(err.message || '학습 상태 조회 실패');
        setLoading(false);
        
        // 오류 발생 시 폴링 간격 늘리기
        setPollingInterval(prev => Math.min(prev * 1.5, 30000)); // 최대 30초
      } finally {
        isFetchingRef.current = false; // 요청 완료 표시
      }
    };

    // 초기 데이터 로드
    fetchStatus();
    
    // 폴링 시작 (이미 폴링 중이면 중복 설정 방지)
    if (!pollingRef.current) {
      console.log(`[${version}] 학습 상태 폴링 시작 (${pollingInterval}ms 간격)`);
      pollingRef.current = setInterval(fetchStatus, pollingInterval);
    }
  };

  // 폴링 중지
  const stopPolling = () => {
    if (pollingRef.current) {
      console.log(`[${version}] 학습 상태 폴링 중지`);
      clearInterval(pollingRef.current);
      pollingRef.current = null; // 참조 초기화
    }
  };

  // 학습 진행 상황에 따라 폴링 간격 조정
  const adjustPollingInterval = (data) => {
    // 학습 완료나 실패 상태는 이미 폴링이 중지되므로 여기서 처리하지 않음
    if (data.status === 'running') {
      const progress = data.percent || 0;
      
      // 진행률에 따른 폴링 간격 조정
      if (progress < 10) {
        // 초기 단계는 더 자주 확인 (8초)
        setPollingInterval(8000);
      } else if (progress < 50) {
        // 중간 단계 (10초)
        setPollingInterval(10000);
      } else if (progress < 80) {
        // 후반부 (15초)
        setPollingInterval(15000);
      } else {
        // 완료 단계 접근 (20초)
        setPollingInterval(20000);
      }
    }
  };

  // 폴링 간격이 변경될 때 인터벌 재설정
  useEffect(() => {
    if (pollingRef.current) {
      console.log(`[${version}] 폴링 간격 변경: ${pollingInterval}ms`);
      clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        // 이미 요청 중인 경우 또는 마지막 요청 후 최소 시간이 지나지 않은 경우 스킵
        const now = Date.now();
        if (isFetchingRef.current || (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL)) {
          return;
        }
        
        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;
        
        try {
          const data = await aiAPI.getTrainingStatus(version);
          setStatus(data);
          
          // 학습 진행 상황에 따라 폴링 간격 조정
          adjustPollingInterval(data);
          
          // 학습 완료 또는 실패 시 폴링 중지
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
          }
        } catch (err) {
          setError(err.message || '학습 상태 조회 실패');
        } finally {
          isFetchingRef.current = false;
        }
      }, pollingInterval);
    }
  }, [pollingInterval, version]);

  // 컴포넌트 언마운트 시 폴링 중지
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    status,
    loading,
    error,
    startPolling,
    stopPolling
  };
};

export default useTrainingStatus;