// src/components/ai/TrainingLogViewer.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faSyncAlt, 
  faDownload,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/aiAPI';
import Modal from '../common/Modal';
import { LoadingMessage, ErrorMessage } from '../common/StatusMessage';
import '../../styles/ai/TrainingLogViewer.css';

function TrainingLogViewer() {
  const [logs, setLogs] = useState({ base: [], lora: [], rola: [] });
  const [selectedLog, setSelectedLog] = useState(null);
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // 로그 목록 가져오기
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiAPI.getTrainingLogs();
      setLogs(data.files || { base: [], lora: [], rola: [] });
    } catch (err) {
      console.error('로그 목록 조회 실패:', err);
      setError('로그 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 로그 파일 선택
  const handleLogSelect = async (type, filename) => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiAPI.getTrainingLogDetail(type, filename);
      setLogContent(data.log);
      setSelectedLog({ type, filename });
      setIsModalOpen(true);
    } catch (err) {
      console.error('로그 내용 조회 실패:', err);
      setError('로그 내용을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로그 다운로드
  const handleDownload = () => {
    if (!selectedLog || !logContent) return;
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedLog.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // 로그 내용을 줄바꿈 처리하여 렌더링
  const renderLogContent = () => {
    if (!logContent) return null;
    
    return logContent.split('\n').map((line, index) => (
      <div key={index} className="log-line">
        <span className="line-number">{index + 1}</span>
        <span className="line-content">{line}</span>
      </div>
    ));
  };

  return (
    <div className="training-log-viewer">
      <div className="log-viewer-header">
        <h3>학습 로그 관리</h3>
        <button 
          className="refresh-btn" 
          onClick={fetchLogs}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSyncAlt} spin={loading} />
          새로고침
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading && !selectedLog && <LoadingMessage message="로그 목록을 불러오는 중..." />}

      <div className="log-categories">
        {Object.entries(logs).map(([type, files]) => (
          <div key={type} className="log-category">
            <h4 className="category-title">
              {type === 'base' ? '베이스 모델 학습 로그' : 
               type === 'lora' ? 'LoRA 학습 로그' : 
               'RoLA 학습 로그'}
            </h4>
            {files.length === 0 ? (
              <p className="no-logs">로그 파일이 없습니다.</p>
            ) : (
              <ul className="log-list">
                {files.map(filename => (
                  <li key={filename} className="log-item">
                    <button 
                      className="log-link"
                      onClick={() => handleLogSelect(type, filename)}
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                      {filename}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* 로그 내용 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLog ? `로그: ${selectedLog.filename}` : '로그 뷰어'}
        className={`log-viewer-modal ${fullscreen ? 'fullscreen' : ''}`}
        footer={
          <div className="log-modal-footer">
            <button 
              className="action-btn"
              onClick={handleDownload}
            >
              <FontAwesomeIcon icon={faDownload} />
              다운로드
            </button>
            <button 
              className="action-btn"
              onClick={() => setFullscreen(!fullscreen)}
            >
              <FontAwesomeIcon icon={fullscreen ? faCompress : faExpand} />
              {fullscreen ? '축소' : '전체화면'}
            </button>
            <button 
              className="close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              닫기
            </button>
          </div>
        }
      >
        {loading ? (
          <LoadingMessage message="로그 내용을 불러오는 중..." />
        ) : (
          <div className="log-content">
            <pre className="log-pre">
              {renderLogContent()}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TrainingLogViewer;