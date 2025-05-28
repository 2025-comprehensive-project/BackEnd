// src/components/ai/ModelSelector.js - 수정된 버전
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faChevronDown, 
  faChevronRight,
  faRobot,
  faUser,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/aiAPI';
import DeleteModelModal from '../modals/DeleteModelModal';
import { SuccessMessage, ErrorMessage } from '../common/StatusMessage';
import '../../styles/ai/ModelSelector.css';

function ModelSelector({ selectedVersion, onVersionChange, serverStatus }) {
  const [expanded, setExpanded] = useState({
    baseModels: true,
    characterModels: false
  });
  
  const [baseVersions, setBaseVersions] = useState([]);
  const [loraVersions, setLoraVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 삭제 관련 상태 추가
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, version: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  
  // 모델 버전 목록 가져오기
  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getModelVersions();
      setBaseVersions(data.baseModelVersions || []);
      setLoraVersions(data.loraAdapterVersions || []);
    } catch (error) {
      console.error('버전 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVersions();
  }, []);
  
  // 카테고리 토글 핸들러
  const toggleCategory = (category) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // 베이스 모델 선택 핸들러 - 서버 실행 여부 체크 제거
  const handleBaseModelSelect = (version) => {
    onVersionChange({
      type: 'base',
      version: version
    });
  };
  
  // LoRA 모델 선택 핸들러 - 서버 실행 여부 체크 제거
  const handleLoraModelSelect = (version) => {
    const [npcId] = version.split('-');
    onVersionChange({
      type: 'lora',
      npc_id: npcId,
      version: version
    });
  };
  
  // 삭제 클릭 핸들러
  const handleDeleteClick = (e, type, version) => {
    e.stopPropagation(); // 선택 이벤트 전파 방지
    
    if (serverStatus?.status === 'running') {
      setMessage('서버가 실행 중입니다. 모델을 삭제하려면 서버를 먼저 종료해주세요.');
      setMessageType('error');
      return;
    }
    
    setDeleteTarget({ type, version });
    setShowDeleteModal(true);
  };
  
  // 삭제 확인 핸들러
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      setMessage(null);
      
      await aiAPI.deleteModelVersion(deleteTarget.type, deleteTarget.version);
      
      setMessage(`모델 ${deleteTarget.version}이(가) 삭제되었습니다.`);
      setMessageType('success');
      
      // 목록 새로고침
      await fetchVersions();
      
      // 삭제된 모델이 현재 선택된 모델인 경우 선택 해제
      if (selectedVersion === deleteTarget.version) {
        onVersionChange(null);
      }
    } catch (error) {
      console.error('모델 삭제 실패:', error);
      setMessage('모델 삭제에 실패했습니다.');
      setMessageType('error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };
  
  // NPC별로 LoRA 버전 그룹화
  const groupLoraVersionsByNpc = () => {
    const grouped = {};
    loraVersions.forEach(version => {
      const [npcId] = version.split('-');
      if (!grouped[npcId]) {
        grouped[npcId] = [];
      }
      grouped[npcId].push(version);
    });
    return grouped;
  };
  
  if (loading) {
    return <div className="model-selector-loading">버전 목록을 불러오는 중...</div>;
  }
  
  const groupedLoraVersions = groupLoraVersionsByNpc();
  
  return (
    <div className="model-selector">
      {message && (
        messageType === 'success' 
          ? <SuccessMessage message={message} onClose={() => setMessage(null)} />
          : <ErrorMessage message={message} onClose={() => setMessage(null)} />
      )}
      
      {/* 베이스 모델 카테고리 */}
      <div className="model-category">
        <div 
          className="category-header"
          onClick={() => toggleCategory('baseModels')}
        >
          <FontAwesomeIcon 
            icon={expanded.baseModels ? faChevronDown : faChevronRight} 
            className="expand-icon"
          />
          <FontAwesomeIcon icon={faRobot} className="category-icon" />
          <span className="category-title">베이스 모델</span>
        </div>
        
        {expanded.baseModels && (
          <div className="model-list">
            {baseVersions.map(version => (
              <div 
                key={version}
                className={`model-item ${selectedVersion === version ? 'selected' : ''}`}
                onClick={() => handleBaseModelSelect(version)}
              >
                <div className="model-info">
                  <span className="model-name">베이스 모델 {version}</span>
                </div>
                
                <div className="model-actions">
                  {selectedVersion === version && (
                    <div className="selected-indicator">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={(e) => handleDeleteClick(e, 'base', version)}
                    title="모델 삭제"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 캐릭터 모델 카테고리 */}
      <div className="model-category">
        <div 
          className="category-header"
          onClick={() => toggleCategory('characterModels')}
        >
          <FontAwesomeIcon 
            icon={expanded.characterModels ? faChevronDown : faChevronRight} 
            className="expand-icon"
          />
          <FontAwesomeIcon icon={faUser} className="category-icon" />
          <span className="category-title">캐릭터 모델 (LoRA)</span>
        </div>
        
        {expanded.characterModels && (
          <div className="character-categories">
            {Object.entries(groupedLoraVersions).map(([npcId, versions]) => (
              <div key={npcId} className="character-category">
                <div className="character-header">
                  <span className="character-name">{npcId}</span>
                </div>
                
                <div className="model-list indented">
                  {versions.map(version => (
                    <div 
                      key={version}
                      className={`model-item ${selectedVersion === version ? 'selected' : ''}`}
                      onClick={() => handleLoraModelSelect(version)}
                    >
                      <div className="model-info">
                        <span className="model-name">{version}</span>
                      </div>
                      
                      <div className="model-actions">
                        {selectedVersion === version && (
                          <div className="selected-indicator">
                            <FontAwesomeIcon icon={faCheck} />
                          </div>
                        )}
                        <button 
                          className="delete-btn"
                          onClick={(e) => handleDeleteClick(e, 'lora', version)}
                          title="모델 삭제"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 삭제 확인 모달 */}
      <DeleteModelModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        modelType={deleteTarget.type}
        version={deleteTarget.version}
      />
    </div>
  );
}

export default ModelSelector;