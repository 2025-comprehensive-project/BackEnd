import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faStop, 
  faRedoAlt,
  faCircle, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/aiAPI';
import { LoadingMessage, ErrorMessage, SuccessMessage } from '../common/StatusMessage';
import '../../styles/ai/ServerControl.css';

function ServerControl({ serverStatus, onRefreshStatus, isRefreshing }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 서버 시작
  const handleStartServer = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await aiAPI.startFlaskServer();
      setSuccess('Flask 서버가 성공적으로 시작되었습니다.');
      
      // 서버 시작 후 잠시 대기 후 상태 새로고침
      setTimeout(() => {
        onRefreshStatus();
      }, 1000);
      
    } catch (err) {
      setError('Flask 서버 시작 실패');
      console.error('서버 시작 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 서버 종료
  const handleStopServer = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await aiAPI.stopFlaskServer();
      setSuccess('Flask 서버가 성공적으로 종료되었습니다.');
      
      // 서버 종료 후 즉시 상태 새로고침
      setTimeout(() => {
        onRefreshStatus();
      }, 500);
      
    } catch (err) {
      setError('Flask 서버 종료 실패');
      console.error('서버 종료 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    console.log('새로고침 버튼 클릭');
    await onRefreshStatus();
  };

  // 서버 상태 표시
  const renderServerStatus = () => {
    if (!serverStatus) {
      return <div className="server-status unknown">상태 정보 없음</div>;
    }

    const isRunning = serverStatus.status === 'running';
    const isStopped = serverStatus.status === 'stopped';
    
    return (
      <div className={`server-status ${isRunning ? 'running' : isStopped ? 'stopped' : 'unknown'}`}>
        <FontAwesomeIcon icon={faCircle} className="status-icon" />
        <span className="status-text">
          {isRunning && '실행 중'}
          {isStopped && '종료됨'}
          {!isRunning && !isStopped && '알 수 없음'}
        </span>
      </div>
    );
  };

  // 현재 활성화된 모델 정보 표시
  const renderActiveModelInfo = () => {
    if (!serverStatus || serverStatus.status !== 'running') {
      return null;
    }

    return (
      <div className="active-model-info">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
        <div className="model-info-content">
          <p><strong>현재 활성 베이스 모델:</strong> {serverStatus.active_base || '정보 없음'}</p>
          {serverStatus.active_npcs && serverStatus.active_npcs.length > 0 && (
            <p><strong>활성 NPC:</strong> {serverStatus.active_npcs.join(', ')}</p>
          )}
          {serverStatus.model && (
            <p><strong>기본 모델:</strong> {serverStatus.model}</p>
          )}
          {serverStatus.cuda && (
            <p><strong>GPU:</strong> {serverStatus.device} (CUDA 활성화)</p>
          )}
          {serverStatus.port && (
            <p><strong>포트:</strong> {serverStatus.port}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="server-control-container">
      {loading && <LoadingMessage message="서버 작업 처리 중..." />}
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      <div className="server-control-layout">
        <div className="server-status-section">
          <div className="status-header">
            <h3>Flask 서버 상태</h3>
            <button 
              className="refresh-btn" 
              onClick={handleRefresh} 
              disabled={loading || isRefreshing}
            >
              <FontAwesomeIcon icon={faRedoAlt} spin={isRefreshing} />
              {isRefreshing ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
          
          {renderServerStatus()}
          
          <div className="server-actions">
            <button 
              className="start-btn" 
              onClick={handleStartServer} 
              disabled={loading || (serverStatus && serverStatus.status === 'running')}
            >
              <FontAwesomeIcon icon={faPlay} />
              서버 시작
            </button>
            
            <button 
              className="stop-btn" 
              onClick={handleStopServer} 
              disabled={loading || (serverStatus && serverStatus.status !== 'running')}
            >
              <FontAwesomeIcon icon={faStop} />
              서버 종료
            </button>
          </div>
        </div>
        
        {renderActiveModelInfo()}
      </div>
    </div>
  );
}

export default ServerControl;