/**
 * 관리자 전용 유저 관리 API
 * 모든 함수는 /api/admin/users/ 엔드포인트를 사용하며 JWT 인증이 필요합니다.
 * 유저 목록 조회, 세이브 데이터 관리, 대화 로그 조회 등의 관리자 기능을 제공합니다.
 */

import api from './api';

export const adminUserAPI = {
  /**
   * 전체 유저 목록 조회
   * - Method: GET
   * - Endpoint: /api/admin/users
   * - 등록된 모든 유저 기본 정보를 최신 가입 순으로 조회합니다.
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('유저 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 특정 유저 세이브 슬롯 정보 조회
   * - Method: GET
   * - Endpoint: /api/admin/users/:user_id/saves/:slot_id
   * - 특정 유저의 세이브 슬롯 상세 정보와 보유 아이템(Furniture, LP) 정보를 조회합니다.
   *
   * @param {number} userId - 조회할 유저의 ID
   * @param {number} slotId - 조회할 세이브 슬롯 번호 (1, 2, 3)
   * @returns {Promise<Object>} - 세이브 슬롯 데이터
   */
  getUserSaveSlot: async (userId, slotId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}/saves/${slotId}`);
      return response.data;
    } catch (error) {
      console.error(`유저 ID ${userId}, 슬롯 ${slotId} 세이브 데이터 조회 실패:`, error);
      throw error;
    }
  },

  /**
   * 특정 유저 대화 로그 조회
   * - Method: GET
   * - Endpoint: /api/admin/users/:user_id/dialogs
   * - 특정 유저의 대화 로그를 조회합니다.
   * - slot_id는 필수이며, npc_id가 있으면 해당 NPC 대화만 조회합니다.
   * 
   * @param {number} userId - 조회할 유저의 ID
   * @param {number} slotId - 조회할 세이브 슬롯 번호 (필수)
   * @param {string} npcId - 특정 NPC ID (선택)
   * @returns {Promise<Array>} - 대화 로그 배열
   */
  getUserDialogs: async (userId, slotId, npcId = null) => {
    try {
      if (!slotId) {
        throw new Error('slot_id는 필수 파라미터입니다.');
      }
      
      let url = `/api/admin/users/${userId}/dialogs?slot_id=${slotId}`;
      if (npcId) {
        url += `&npc_id=${npcId}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`유저 ID ${userId}, 슬롯 ${slotId} 대화 로그 조회 실패:`, error);
      throw error;
    }
  },

  /**
   * 특정 유저 대화 로그 삭제
   * - Method: DELETE
   * - Endpoint: /api/admin/users/:user_id/dialogs
   * - 특정 유저의 대화 로그 중 쌍 단위로 선택하여 삭제합니다.
   * 
   * @param {number} userId - 대상 유저의 ID
   * @param {Array<Array>} logPairs - 삭제할 로그 ID 쌍 배열 [[101, 102], [105, 106]]
   * @returns {Promise<Object>} - 삭제 결과
   */
  deleteDialogPairs: async (userId, logPairs) => {
    try {
      if (!logPairs || !Array.isArray(logPairs)) {
        throw new Error('log_pairs는 필수 파라미터입니다.');
      }
      
      const response = await api.delete(`/api/admin/users/${userId}/dialogs`, {
        data: { log_pairs: logPairs }
      });
      return response.data;
    } catch (error) {
      console.error(`유저 ID ${userId} 대화 로그 삭제 실패:`, error);
      throw error;
    }
  },

  /**
   * 특정 유저 정보 수정
   * - Method: PATCH
   * - Endpoint: /api/admin/users/:user_id/saves/:slot_id
   * - 특정 유저의 세이브 슬롯 정보(돈, 평판 점수 등)를 수정합니다.
   * - reputation_score와 money 필드는 필수입니다.
   * 
   * @param {number} userId - 수정할 유저의 ID
   * @param {number} slotId - 수정할 세이브 슬롯 번호
   * @param {Object} saveData - 수정할 데이터 객체 (reputation_score, money 필수)
   * @returns {Promise<Object>} - 수정 결과 메시지
   */
  updateUserSave: async (userId, slotId, saveData) => {
    try {
      // 필수 필드 검증
      if (saveData.reputation_score === undefined || saveData.money === undefined) {
        throw new Error('reputation_score와 money는 필수 필드입니다.');
      }

      const response = await api.patch(`/api/admin/users/${userId}/saves/${slotId}`, saveData);
      return response.data;
    } catch (error) {
      console.error(`유저 ID ${userId}, 슬롯 ${slotId} 세이브 데이터 수정 실패:`, error);
      throw error;
    }
  }
};

export default adminUserAPI;