// src/pages/AIManager.js
import React, { useState, useEffect } from 'react';
import { useServerStatus } from '../hooks/useServerStatus';
import ServerControl from '../components/ai/ServerControl';
import ModelSelector from '../components/ai/ModelSelector';
import TrainingForm from '../components/ai/TrainingForm';
import TrainingProgress from '../components/ai/TrainingProgress';
import ChatTester from '../components/ai/ChatTester';
import TrainingLogViewer from '../components/ai/TrainingLogViewer';
import ModelEvaluator from '../components/ai/ModelEvaluator'; // 새로 추가
import { aiAPI } from '../services/aiAPI';
import { ErrorMessage } from '../components/common/StatusMessage';
import '../styles/ai/AIManager.css';

// 로컬 스토리지 키
const ACTIVE_TRAINING_KEY = 'activeTraining';

function AIManager() {
  const { 
    status: serverStatus, 
    fetchStatus, 
    refreshStatusImmediate,
    startPolling,
    loading: isRefreshing  // loading 상태를 isRefreshing으로 가져옴
  } = useServerStatus();
  const [activeTraining, setActiveTraining] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [trainingError, setTrainingError] = useState(null);

  // 페이지 로드 시 로컬 스토리지에서 활성 학습 정보 불러오기
  useEffect(() => {
    console.log('페이지 로드: 로컬 스토리지에서 학습 정보 확인');
    const savedTraining = localStorage.getItem(ACTIVE_TRAINING_KEY);
    if (savedTraining) {
      try {
        const trainingData = JSON.parse(savedTraining);
        console.log('로컬 스토리지에서 학습 정보 발견:', trainingData);
        setActiveTraining(trainingData);
      } catch (error) {
        console.error('활성 학습 정보 파싱 실패:', error);
        localStorage.removeItem(ACTIVE_TRAINING_KEY);
      }
    } else {
      console.log('로컬 스토리지에 저장된 학습 정보 없음');
    }

    startPolling();
  }, [startPolling]);

  // 활성 학습 상태 변경 시 로컬 스토리지 업데이트
  useEffect(() => {
    if (activeTraining) {
      console.log('로컬 스토리지에 학습 정보 저장:', activeTraining);
      localStorage.setItem(ACTIVE_TRAINING_KEY, JSON.stringify(activeTraining));
    } else {
      console.log('로컬 스토리지에서 학습 정보 제거');
      localStorage.removeItem(ACTIVE_TRAINING_KEY);
    }
  }, [activeTraining]);

  // 페이지 로드 직후 즉시 백엔드 상태 확인
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        console.log('페이지 로드 시 백엔드 학습 상태 확인');
        const response = await aiAPI.getActiveTrainings();
        if (response && response.activeTrainings && response.activeTrainings.length > 0) {
          const latestTraining = response.activeTrainings[0];
          console.log('백엔드에서 활성 학습 발견, 상태 업데이트:', latestTraining);
          setActiveTraining(latestTraining);
        } else {
          console.log('백엔드에 활성 학습 없음');
        }
      } catch (error) {
        console.error('백엔드 학습 상태 확인 실패:', error);
      }
    };
    
    checkBackendStatus();
  }, []);

  // 백엔드에서 진행 중인 학습 확인
  const checkForActiveTrainings = async () => {
    try {
      console.log('백엔드에서 활성 학습 정보 확인 중...');
      const response = await aiAPI.getActiveTrainings();
      
      if (response && response.activeTrainings && response.activeTrainings.length > 0) {
        // 가장 최근 학습을 선택 (여러 개가 있을 경우)
        const latestTraining = response.activeTrainings[0];
        console.log('백엔드에서 활성 학습 정보 발견:', latestTraining);
        setActiveTraining(latestTraining);
      } else if (activeTraining) {
        console.log('로컬에 학습 정보가 있지만 백엔드에 없음, 상태 확인 중...');
        try {
          const status = await aiAPI.getTrainingStatus(activeTraining.version);
          console.log('학습 상태 확인 결과:', status);
          if (status && (status.status === 'completed' || status.status === 'failed')) {
            console.log('학습이 이미 완료되었거나 실패함, 로컬 정보 초기화');
            setActiveTraining(null);
          } else if (status && status.status === 'running') {
            console.log('학습이 여전히 진행 중');
          }
        } catch (statusError) {
          console.error('학습 상태 확인 실패:', statusError);
        }
      }
    } catch (error) {
      console.error('활성 학습 상태 확인 실패:', error);
    }
  };

  // 페이지 로드 시 및 주기적으로 백엔드에서 진행 중인 학습 확인
  useEffect(() => {
    console.log('주기적 백엔드 학습 상태 확인 설정');
    const checkInterval = setInterval(checkForActiveTrainings, 30000);
    
    return () => clearInterval(checkInterval);
  }, []);

  // 베이스 모델 학습 시작
  const handleBaseTraining = async (trainingData) => {
    try {
      setTrainingError(null);
      const result = await aiAPI.trainBase(trainingData);
      
      const newTraining = {
        type: 'base',
        version: trainingData.version,
        startTime: new Date().toISOString()
      };
      
      console.log('베이스 모델 학습 시작:', newTraining);
      setActiveTraining(newTraining);
      return result;
    } catch (error) {
      console.error('베이스 모델 학습 시작 실패:', error);
      setTrainingError(`학습 시작 실패: ${error.message}`);
      throw error;
    }
  };

  // LoRA 학습 시작
  const handleLoraTraining = async (trainingData) => {
    try {
      setTrainingError(null);
      const result = await aiAPI.trainLora(trainingData);
      
      const fullVersion = `${trainingData.npc}-${trainingData.base_version}.${trainingData.version}`;
      
      const newTraining = {
        type: 'lora',
        version: fullVersion,
        npc: trainingData.npc,
        base_version: trainingData.base_version,
        startTime: new Date().toISOString()
      };
      
      console.log('LoRA 학습 시작:', newTraining);
      setActiveTraining(newTraining);
      return result;
    } catch (error) {
      console.error('LoRA 학습 시작 실패:', error);
      setTrainingError(`학습 시작 실패: ${error.message}`);
      throw error;
    }
  };

  // 모델 버전 변경 - 수정된 부분
  const handleVersionChange = async (versionData) => {
    try {
      await aiAPI.changeModelVersion(versionData);
      
      if (versionData.type === 'base') {
        setSelectedVersion(versionData.version);
      } else if (versionData.type === 'lora') {
        setSelectedVersion(versionData.version);
      }
      
      fetchStatus();
    } catch (error) {
      console.error('모델 버전 변경 실패:', error);
    }
  };

  // 에러 메시지 닫기
  const handleCloseError = () => {
    setTrainingError(null);
  };

  // 학습 완료 처리
  const handleTrainingComplete = () => {
    console.log('학습 완료 처리');
    setActiveTraining(null);
  };

  // 학습 상태 확인 및 업데이트
  const checkTrainingStatus = async () => {
    if (!activeTraining || !activeTraining.version) return;
    
    try {
      const status = await aiAPI.getTrainingStatus(activeTraining.version);
      
      if (status && (status.status === 'completed' || status.status === 'failed')) {
        const startTime = new Date(activeTraining.startTime);
        const currentTime = new Date();
        const timeDiff = (currentTime - startTime) / (1000 * 60);
        
        if (timeDiff > 10) {
          console.log('학습 완료 후 10분 경과, 자동 정보 제거');
          setActiveTraining(null);
        }
      }
    } catch (error) {
      console.error('학습 상태 확인 실패:', error);
    }
  };

  // 주기적으로 학습 상태 확인 (5분마다)
  useEffect(() => {
    const checkInterval = setInterval(checkTrainingStatus, 5 * 60 * 1000);
    
    return () => clearInterval(checkInterval);
  }, [activeTraining]);

  // 학습 상태 대시보드 렌더링 함수
  const renderTrainingDashboard = () => {
    return (
      <div className="training-status-dashboard">
        <h2>학습 상태 대시보드</h2>
        <div className="dashboard-content">
          {activeTraining ? (
            <TrainingProgress 
              version={activeTraining.version}
              type={activeTraining.type}
              onComplete={handleTrainingComplete}
            />
          ) : (
            <div className="no-active-training">
              <p>현재 진행 중인 학습이 없습니다.</p>
              <p>베이스 모델 학습 또는 LoRA 학습을 시작하면 이곳에 진행 상황이 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-manager-container">
      <header className="content-header">
        <h1>AI 관리</h1>
      </header>

      {/* 학습 상태 대시보드 */}
      {renderTrainingDashboard()}

      <div className="ai-control-section">
        <h2>서버 컨트롤</h2>
        <ServerControl 
          serverStatus={serverStatus}
          onRefreshStatus={fetchStatus}  // 새로고침 버튼용
          isRefreshing={isRefreshing}    // 로딩 상태 전달
        />
        
        <div className="model-selector-container">
          <h3>모델 버전 선택</h3>
          <ModelSelector 
            selectedVersion={selectedVersion}
            onVersionChange={handleVersionChange}
            serverStatus={serverStatus}
          />
        </div>
      </div>

      {/* 모델 성능 평가 섹션 추가 */}
      <div className="ai-evaluate-section">
        <h2>모델 성능 평가</h2>
        <ModelEvaluator serverStatus={serverStatus} />
      </div>

      <div className="ai-test-section">
        <h2>챗봇 테스트</h2>
        <ChatTester />
      </div>

      <div className="ai-training-section">
        <h2>AI 모델 학습</h2>
        
        {trainingError && (
          <div className="training-error-message">
            <ErrorMessage 
              message={trainingError} 
              className="training-error"
              onClose={handleCloseError}
            />
          </div>
        )}
        
        <div className="training-forms">
          <div className="base-training">
            <h3>베이스 모델 학습 (Full SFT)</h3>
            <TrainingForm 
              type="base"
              onSubmit={handleBaseTraining}
              serverRunning={serverStatus?.status === 'running'}
            />
          </div>
          
          <div className="lora-training">
            <h3>LoRA 학습</h3>
            <TrainingForm 
              type="lora"
              onSubmit={handleLoraTraining}
              serverRunning={serverStatus?.status === 'running'}
            />
          </div>
        </div>
        
        {activeTraining && (
          <div className="reset-training-info">
            <button 
              className="reset-btn" 
              onClick={() => setActiveTraining(null)}
            >
              학습 정보 초기화
            </button>
            <small className="form-hint">
              학습 정보가 계속 표시되는 경우, 수동으로 초기화할 수 있습니다.
            </small>
          </div>
        )}
      </div>

      {/* 학습 로그 뷰어 추가 */}
      <div className="ai-log-section">
        <h2>학습 로그 관리</h2>
        <TrainingLogViewer />
      </div>
    </div>
  );
}

export default AIManager;