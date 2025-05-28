// src/components/ai/NPCSelector.js
import React from 'react';
import '../../styles/ai/NPCSelector.css';

function NPCSelector({ selectedNpc, onNpcChange }) {
  // NPC 목록 (실제로는 API에서 가져올 수 있음)
  const npcList = [
    { id: 'base', name: '베이스 모델' },
    { id: 'silvia', name: '실비아' },
    { id: 'sol', name: '솔' }
  ];

  return (
    <div className="npc-selector">
      <label htmlFor="npc-select">NPC 선택:</label>
      <select
        id="npc-select"
        value={selectedNpc}
        onChange={(e) => onNpcChange(e.target.value)}
      >
        {npcList.map((npc) => (
          <option key={npc.id} value={npc.id}>
            {npc.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default NPCSelector;