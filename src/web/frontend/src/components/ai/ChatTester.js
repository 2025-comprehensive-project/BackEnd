// src/components/ai/ChatTester.js
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser } from '@fortawesome/free-solid-svg-icons';
import { aiAPI } from '../../services/aiAPI';
import { ErrorMessage } from '../common/StatusMessage';
import '../../styles/ai/ChatTester.css';

function ChatTester() {
  const [npcId, setNpcId] = useState('base');
  const [customNpcId, setCustomNpcId] = useState('');
  const [useCustomNpcId, setUseCustomNpcId] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableVersions, setAvailableVersions] = useState({
    baseModelVersions: [],
    loraAdapterVersions: []
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    isInitialMount.current = false;
    return () => {
      isInitialMount.current = true;
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingForResponse]);

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      setMessages([]);
      setError(null);
    }
  }, [npcId, customNpcId, useCustomNpcId]);

  useEffect(() => {
    const fetchNpcsAndVersions = async () => {
      try {
        const versionData = await aiAPI.getModelVersions();
        setAvailableVersions(versionData);
        setNpcId('base');
      } catch (err) {
        console.error('NPC 버전 불러오기 실패:', err);
        setError('버전 정보를 불러오는데 실패했습니다.');
      }
    };
    fetchNpcsAndVersions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('메시지를 입력해주세요.');
      return;
    }

    const selectedNpcId = useCustomNpcId ? customNpcId : npcId;
    if (!selectedNpcId) {
      setError('NPC를 선택하거나 입력해주세요.');
      return;
    }

    const userMessage = {
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsWaitingForResponse(true);
    setPrompt('');

    try {
      setLoading(true);
      setError(null);
      const result = await aiAPI.testChat(selectedNpcId, prompt);

      const npcMessage = {
        type: 'npc',
        content: result.response,
        npcId: selectedNpcId,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, npcMessage]);
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      setError(`전송 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
      setIsWaitingForResponse(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNpcChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setUseCustomNpcId(true);
    } else {
      setUseCustomNpcId(false);
      setNpcId(value);
    }
  };

  const handleCustomNpcIdChange = (e) => {
    setCustomNpcId(e.target.value);
  };

  const formatNpcName = (id) => {
    if (!id) return '';
    if (id === 'base') return 'base [최신]';
    return id.includes('-') ? id : `${id} [최신]`;
  };

  const renderNpcSelector = () => {
    const groupedLoraVersions = (availableVersions.loraAdapterVersions || []).reduce((acc, version) => {
      const npc = version.split('-')[0] || 'unknown';
      if (!acc[npc]) acc[npc] = [];
      acc[npc].push(version);
      return acc;
    }, {});

    return (
      <div className="npc-selector">
        <select value={useCustomNpcId ? 'custom' : npcId} onChange={handleNpcChange}>
          <optgroup label="베이스 모델">
            <option value="base">base [최신]</option>
            {(availableVersions.baseModelVersions || []).map(version => (
              <option key={`base-${version}`} value={`base-${version}`}>
                base-{version}
              </option>
            ))}
          </optgroup>

          {Object.entries(groupedLoraVersions).map(([npc, versions]) => (
            <optgroup key={npc} label={npc}>
              <option value={npc}>{npc} [최신]</option>
              {versions.map(version => (
                <option key={version} value={version}>{version}</option>
              ))}
            </optgroup>
          ))}

          <optgroup label="기타">
            <option value="custom">직접 입력</option>
          </optgroup>
        </select>

        {useCustomNpcId && (
          <input
            type="text"
            placeholder="예: silvia-v1.5.2"
            value={customNpcId}
            onChange={handleCustomNpcIdChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="chat-tester">
      <div className="chat-header">{renderNpcSelector()}</div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {error && <ErrorMessage message={error} />}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type === 'user' ? 'user-message' : 'npc-message'}`}>
            {message.type === 'npc' && (
              <div className="message-avatar"><FontAwesomeIcon icon={faRobot} /></div>
            )}
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-name">
                {message.type === 'user' ? '사용자' : formatNpcName(message.npcId)}
              </div>
            </div>
            {message.type === 'user' && (
              <div className="message-avatar"><FontAwesomeIcon icon={faUser} /></div>
            )}
          </div>
        ))}

        {isWaitingForResponse && (
          <div className="message npc-message">
            <div className="message-avatar"><FontAwesomeIcon icon={faRobot} /></div>
            <div className="message-content">
              <div className="message-text typing-indicator"><span></span><span></span><span></span></div>
              <div className="message-name">{formatNpcName(useCustomNpcId ? customNpcId : npcId)}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="메시지 입력..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}

export default ChatTester;