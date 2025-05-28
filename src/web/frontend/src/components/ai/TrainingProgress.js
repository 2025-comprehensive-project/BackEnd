// src/components/ai/TrainingProgress.js
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faStop // 추가: 취소 아이콘
} from '@fortawesome/free-solid-svg-icons';
import { useTrainingStatus } from '../../hooks/useTrainingStatus';
import { formatRelativeTime, formatDateTime } from '../../utils/dateUtils';
import { aiAPI } from '../../services/aiAPI'; // aiAPI import 추가
import '../../styles/ai/TrainingProgress.css';

function TrainingProgress({ version, type, onComplete }) {
  const { status, loading, error, startPolling, stopPolling } = useTrainingStatus(version);
  const [cancelLoading, setCancelLoading] = useState(false); // 취소 로딩 상태 추가
  const [cancelError, setCancelError] = useState(null); // 취소 오류 상태 추가
  const [completionChecked, setCompletionChecked] = useState(false);

  // 컴포넌트 마운트 시 폴링 시작
  useEffect(() => {
    startPolling();
    
    // 컴포넌트 언마운트 시 폴링 중지
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // 학습 완료 시 콜백 호출
  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed') && !completionChecked) {
      setCompletionChecked(true);
      
      // 직접 종료하지 않고 상태만 업데이트 (사용자가 확인할 수 있도록)
      // 자동 종료는 AIManager에서 시간 기반으로 처리
    }
  }, [status, onComplete, completionChecked]);

  // 학습 취소 처리
  const handleCancelTraining = async () => {
    if (!version) return;
    
    try {
      setCancelLoading(true);
      setCancelError(null);
      await aiAPI.cancelTraining(version);
      // 취소 성공 시 폴링을 계속해서 상태 변화 확인
    } catch (error) {
      console.error('학습 취소 실패:', error);
      setCancelError('학습 취소 실패: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setCancelLoading(false);
    }
  };

  // 학습 상태에 따른 아이콘 및 메시지
  const renderStatusIcon = () => {
    if (!status) {
      return <FontAwesomeIcon icon={faSpinner} spin />;
    }
    
    switch (status.status) {
      case 'running':
        return <FontAwesomeIcon icon={faSpinner} spin className="status-icon running" />;
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon completed" />;
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon failed" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon unknown" />;
    }
  };

  if (loading && !status) {
    return (
      <div className="training-progress loading">
        <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
        <p>학습 상태 확인 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="training-progress error">
        <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
        <p>학습 상태 확인 실패: {error}</p>
        <button onClick={startPolling}>재시도</button>
      </div>
    );
  }

  return (
    <div className="training-progress">
      <div className="progress-header">
        <div className="progress-title">
          <h3>
            {type === 'base' ? '베이스 모델 학습' : 'LoRA 학습'} - {version}
          </h3>
          <div className="status-badge">
            {renderStatusIcon()}
            <span>
              {status?.status === 'running' && '학습 중'}
              {status?.status === 'completed' && '완료됨'}
              {status?.status === 'failed' && '실패'}
              {!status?.status && '상태 확인 중'}
            </span>
          </div>
        </div>
        
        {status?.startedAt && (
          <div className="training-time">
            <div>시작: {formatDateTime(status.startedAt)}</div>
            {status?.eta && <div>예상 완료: {formatDateTime(status.eta)}</div>}
          </div>
        )}
        
        {/* 학습 취소 버튼 추가 */}
        {status?.status === 'running' && (
          <div className="cancel-training-button">
            <button 
              onClick={handleCancelTraining} 
              disabled={cancelLoading}
              className="cancel-btn"
            >
              <FontAwesomeIcon icon={faStop} />
              {cancelLoading ? '취소 중...' : '학습 취소'}
            </button>
          </div>
        )}
      </div>
      
      {/* 취소 오류 메시지 표시 */}
      {cancelError && (
        <div className="cancel-error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{cancelError}</span>
        </div>
      )}
      
      {status && (
        <div className="progress-details">
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${status.percent || 0}%` }}
            />
            <span className="progress-value">{status.percent || 0}%</span>
          </div>
          
          <div className="training-stats">
            <div className="stat-item">
              <span className="stat-label">현재 에폭:</span>
              <span className="stat-value">
                {status.currentEpoch || 0} / {status.totalEpochs || 0}
              </span>
            </div>
            
            {status.loss !== undefined && status.loss !== null && (
              <div className="stat-item">
                <span className="stat-label">Loss:</span>
                <span className="stat-value">{status.loss.toFixed(4)}</span>
              </div>
            )}
            
            {status.eta && (
              <div className="stat-item">
                <span className="stat-label">남은 시간:</span>
                <span className="stat-value">
                  {formatRelativeTime(status.eta)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="log-container">
        <h4>최근 로그</h4>
        <pre className="log-output">
          {status?.lastLog || '로그가 아직 없습니다.'}
        </pre>
      </div>
      
      {/* 완료 또는 실패 상태일 때 종료 버튼 표시 */}
      {status?.status && (status.status === 'completed' || status.status === 'failed') && (
        <div className="training-complete-actions">
          <button 
            className="complete-btn" 
            onClick={onComplete}
          >
            {status.status === 'completed' ? '학습 완료 확인' : '학습 실패 확인'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TrainingProgress;