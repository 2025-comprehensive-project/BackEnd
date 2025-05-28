import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminUserAPI } from '../services/adminUserAPI';
import '../styles/pages/UserDetail.css';

function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSlot, setActiveSlot] = useState(1);
  const [activeTab, setActiveTab] = useState('general');
  const [saveData, setSaveData] = useState(null);
  const [dialogData, setDialogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogFilter, setDialogFilter] = useState('all');
  const [selectedDialogs, setSelectedDialogs] = useState([]);
  const [availableNpcs, setAvailableNpcs] = useState([]);
  const [formData, setFormData] = useState({
    reputation_score: 0,
    money: 0
  });

  // NPC 목록 추출 함수
  const extractNpcsFromDialogs = (dialogs) => {
    const npcSet = new Set();
    dialogs.forEach(dialog => {
      if (dialog.npc_id) {
        npcSet.add(dialog.npc_id);
      }
    });
    return Array.from(npcSet);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === 'general' || activeTab === 'inventory') {
          const data = await adminUserAPI.getUserSaveSlot(userId, activeSlot);
          setSaveData(data);
          setFormData({
            reputation_score: data.reputation_score,
            money: data.money
          });
        } else if (activeTab === 'dialogs') {
          const allDialogs = await adminUserAPI.getUserDialogs(userId, activeSlot);
          const npcs = extractNpcsFromDialogs(allDialogs);
          setAvailableNpcs(npcs);
          
          const npcId = dialogFilter !== 'all' ? dialogFilter : null;
          const data = await adminUserAPI.getUserDialogs(userId, activeSlot, npcId);
          setDialogData(data);
        }
        setError(null);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        if (err.response?.status === 404) {
          setError('데이터가 없습니다.');
          setSaveData(null);
          setDialogData([]);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, activeSlot, activeTab, dialogFilter]);

  const handleSlotChange = (slotNumber) => {
    setActiveSlot(slotNumber);
    setSelectedDialogs([]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedDialogs([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSave = async () => {
    try {
      await adminUserAPI.updateUserSave(userId, activeSlot, formData);
      const data = await adminUserAPI.getUserSaveSlot(userId, activeSlot);
      setSaveData(data);
      setIsEditing(false);
      alert('저장되었습니다.');
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  };

  const cancelEdit = () => {
    if (saveData) {
      setFormData({
        reputation_score: saveData.reputation_score,
        money: saveData.money
      });
    }
    setIsEditing(false);
  };

  const handleDialogSelect = (logId) => {
    setSelectedDialogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      } else {
        return [...prev, logId];
      }
    });
  };

  const handleDeleteDialogs = async () => {
    try {
      const logPairs = [];
      const sortedLogs = [...selectedDialogs].sort((a, b) => a - b);
      
      for (let i = 0; i < sortedLogs.length; i += 2) {
        if (sortedLogs[i + 1]) {
          logPairs.push([sortedLogs[i], sortedLogs[i + 1]]);
        }
      }
      
      if (logPairs.length === 0) {
        alert('삭제할 대화 쌍을 선택해주세요.');
        return;
      }
      
      if (window.confirm(`${logPairs.length}개의 대화 쌍을 삭제하시겠습니까?`)) {
        const result = await adminUserAPI.deleteDialogPairs(userId, logPairs);
        alert(result.message);
        
        const npcId = dialogFilter !== 'all' ? dialogFilter : null;
        const data = await adminUserAPI.getUserDialogs(userId, activeSlot, npcId);
        setDialogData(data);
        setSelectedDialogs([]);
      }
    } catch (error) {
      console.error('대화 삭제 실패:', error);
      alert('대화 삭제에 실패했습니다.');
    }
  };

  const handleFilterChange = (filter) => {
    setDialogFilter(filter);
    setSelectedDialogs([]);
  };

  if (loading) {
    return <div className="user-detail-loading">데이터를 불러오는 중...</div>;
  }

  const getNoDataMessage = () => {
    switch (activeTab) {
      case 'general':
        return '일반 정보 데이터가 없습니다.';
      case 'inventory':
        return '인벤토리 데이터가 없습니다.';
      case 'dialogs':
        return '대화 로그 데이터가 없습니다.';
      default:
        return '데이터가 없습니다.';
    }
  };

  const formatNpcName = (npcId) => {
    return npcId.charAt(0).toUpperCase() + npcId.slice(1);
  };

  return (
    <div className="user-detail-container">
      <div className="back-navigation">
        <button 
          onClick={() => navigate('/users', { state: { from: 'userDetail' } })} 
          className="back-button"
        >
          ← 유저 목록으로 돌아가기
        </button>
      </div>

      <div className="user-detail-header">
        <div className="user-detail-title">
          <h1>{saveData?.user_name || '유저'} 상세 정보</h1>
        </div>
        
        <div className="slot-selector">
          {[1, 2, 3].map(slot => (
            <button
              key={slot}
              className={`slot-button ${activeSlot === slot ? 'active' : ''}`}
              onClick={() => handleSlotChange(slot)}
            >
              슬롯 {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => handleTabChange('general')}
        >
          일반 정보
        </button>
        <button 
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabChange('inventory')}
        >
          인벤토리
        </button>
        <button 
          className={`tab-button ${activeTab === 'dialogs' ? 'active' : ''}`}
          onClick={() => handleTabChange('dialogs')}
        >
          대화 로그
        </button>
      </div>

      <div className="user-detail-content">
        {activeTab === 'general' && (
          <div className="general-info-section">
            {saveData ? (
              <>
                <div className="section-header">
                  <h2>세이브 데이터</h2>
                  {!isEditing ? (
                    <button className="edit-button" onClick={() => setIsEditing(true)}>
                      수정
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="save-button" onClick={handleSave}>저장</button>
                      <button className="cancel-button" onClick={cancelEdit}>취소</button>
                    </div>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">👤</span> 유저 ID
                    </div>
                    <div className="info-value">{saveData.user_id}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">💾</span> 슬롯 번호
                    </div>
                    <div className="info-value">{saveData.slot_id}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">📖</span> 챕터
                    </div>
                    <div className="info-value">{saveData.chapter}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">📅</span> 게임 내 일수
                    </div>
                    <div className="info-value">{saveData.in_game_day}일</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">⏱️</span> 플레이 시간
                    </div>
                    <div className="info-value">
                      {Math.floor(saveData.play_time / 60)}시간 {saveData.play_time % 60}분
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <span className="info-icon">💾</span> 저장 시간
                    </div>
                    <div className="info-value">
                      {new Date(saveData.saved_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="info-item editable">
                    <div className="info-label">
                      <span className="info-icon">⭐</span> 평판 점수
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        name="reputation_score"
                        value={formData.reputation_score}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <div className="info-value highlight">{saveData.reputation_score}</div>
                    )}
                  </div>
                  <div className="info-item editable">
                    <div className="info-label">
                      <span className="info-icon">💰</span> 돈
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        name="money"
                        value={formData.money}
                        onChange={handleInputChange}
                        className="edit-input"
                      />
                    ) : (
                      <div className="info-value highlight">${saveData.money}</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data-message">
                {getNoDataMessage()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="section-header">
              <h2>인벤토리</h2>
            </div>
            
            {saveData ? (
              <div className="inventory-container">
                <div className="inventory-group">
                  <h3 className="inventory-title">
                    <span className="inventory-icon furniture-icon">🪑</span>
                    보유 가구
                  </h3>
                  <div className="inventory-items">
                    {saveData.furniture_list ? (
                      <div className="inventory-item">
                        {saveData.furniture_list}
                      </div>
                    ) : (
                      <div className="empty-inventory">보유한 가구가 없습니다.</div>
                    )}
                  </div>
                </div>

                <div className="inventory-group">
                  <h3 className="inventory-title">
                    <span className="inventory-icon lp-icon">💿</span>
                    보유 LP
                  </h3>
                  <div className="inventory-items">
                    {saveData.lp_list ? (
                      <div className="inventory-item">
                        {saveData.lp_list}
                      </div>
                    ) : (
                      <div className="empty-inventory">보유한 LP가 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data-message">
                {getNoDataMessage()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dialogs' && (
          <div className="dialogs-section">
            <div className="section-header">
              <h2>대화 로그</h2>
              <div className="dialog-actions">
                <div className="dialog-filter-buttons">
                  <button 
                    className={`filter-button ${dialogFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                  >
                    전체 보기
                  </button>
                  {availableNpcs.map(npc => (
                    <button 
                      key={npc}
                      className={`filter-button ${dialogFilter === npc ? 'active' : ''}`}
                      onClick={() => handleFilterChange(npc)}
                    >
                      {formatNpcName(npc)}
                    </button>
                  ))}
                </div>
                {selectedDialogs.length > 0 && (
                  <button 
                    className="delete-button"
                    onClick={handleDeleteDialogs}
                  >
                    선택 삭제 ({Math.floor(selectedDialogs.length / 2)}쌍)
                  </button>
                )}
              </div>
            </div>

            {dialogData.length > 0 ? (
              <div className="dialog-list">
                {dialogData.map((dialog) => (
                  <div key={dialog.log_id} className="dialog-item">
                    <input
                      type="checkbox"
                      checked={selectedDialogs.includes(dialog.log_id)}
                      onChange={() => handleDialogSelect(dialog.log_id)}
                      className="dialog-checkbox"
                    />
                    <div className="dialog-meta">
                      <span className="dialog-time">
                        {new Date(dialog.created_at).toLocaleString()}
                      </span>
                      <span className="dialog-session">
                        {dialog.session_id}
                      </span>
                      <span className="dialog-npc">
                        NPC: {formatNpcName(dialog.npc_id)}
                      </span>
                    </div>
                    <div className={`dialog-content ${dialog.speaker === 'user' ? 'user' : 'npc'}`}>
                      <div className="dialog-speaker">
                        {dialog.speaker === 'user' ? '유저' : formatNpcName(dialog.npc_id)}:
                      </div>
                      <div className="dialog-message">
                        {dialog.message}
                      </div>
                      {dialog.emotion_tag && (
                        <div className="dialog-emotion">
                          감정: {dialog.emotion_tag}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data-message">
                {getNoDataMessage()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetail;