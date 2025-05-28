// src/services/aiAPI.js
import api from './api';

export const aiAPI = {
  // 서버 제어 API
  startFlaskServer: async () => {
    try {
      const response = await api.post('/api/admin/ai/start');
      return response.data;
    } catch (error) {
      console.error('Flask 서버 시작 실패:', error);
      throw error;
    }
  },

  stopFlaskServer: async () => {
    try {
      const response = await api.post('/api/admin/ai/stop');
      return response.data;
    } catch (error) {
      console.error('Flask 서버 종료 실패:', error);
      throw error;
    }
  },

  getFlaskStatus: async () => {
    try {
      const response = await api.get('/api/admin/ai/status');
      return response.data;
    } catch (error) {
      console.error('Flask 상태 조회 실패:', error);
      throw error;
    }
  },

  // 챗봇 테스트 API
  testChat: async (npcId, prompt) => {
    try {
      if (!npcId || typeof npcId !== 'string') {
        throw new Error('올바른 NPC ID가 필요합니다.');
      }
      
      if (!prompt || !prompt.trim()) {
        throw new Error('메시지를 입력해주세요.');
      }
      
      console.log(`[챗봇 테스트] NPC ID: ${npcId}, 메시지: ${prompt}`);
      
      const response = await api.post(
        `/api/admin/ai/chat-test/${npcId}`, 
        { prompt },
        { timeout: 30000 }
      );
      
      return response.data;
    } catch (error) {
      console.error('챗봇 테스트 실패:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('인증에 실패했습니다.');
        } else if (error.response.status === 403) {
          throw new Error('접근 권한이 없습니다.');
        } else {
          throw new Error(`서버 오류: ${error.response.status} - ${error.response.data?.message || '알 수 없는 오류'}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('응답 시간이 초과되었습니다.');
      } else {
        throw error;
      }
    }
  },

  // 모델 버전 목록 조회 (새로 추가)
  getModelVersions: async () => {
    try {
      const response = await api.get('/api/admin/ai/version');
      return response.data;
    } catch (error) {
      console.error('모델 버전 목록 조회 실패:', error);
      throw error;
    }
  },

  // 모델 버전 변경 (새로 추가)
  changeModelVersion: async (versionData) => {
    try {
      const response = await api.patch('/api/admin/ai/version', versionData);
      return response.data;
    } catch (error) {
      console.error('모델 버전 변경 실패:', error);
      throw error;
    }
  },

  // 모델 버전 삭제 (새로 추가)
  deleteModelVersion: async (type, version) => {
    try {
      const response = await api.delete('/api/admin/ai/version', { 
        data: { type, version } 
      });
      return response.data;
    } catch (error) {
      console.error('모델 버전 삭제 실패:', error);
      throw error;
    }
  },

  // 베이스 모델 학습 API (수정됨)
  trainBase: async (trainingData) => {
    try {
      if (!trainingData.version) {
        throw new Error('버전은 필수 항목입니다.');
      }
      
      if (!trainingData.base_model) {
        throw new Error('베이스 모델은 필수 항목입니다.');
      }
      
      // 커스텀 소스인 경우 추가 필드 확인
      if (trainingData.source === 'custom') {
        if (!trainingData.train_path) {
          throw new Error('커스텀 소스 사용 시 학습 데이터 경로는 필수입니다.');
        }
        if (!trainingData.val_path) {
          throw new Error('커스텀 소스 사용 시 검증 데이터 경로는 필수입니다.');
        }
      }
      
      // resume 필드 기본값 설정
      const data = {
        ...trainingData,
        resume: trainingData.resume !== undefined ? trainingData.resume : false
      };
      
      const response = await api.post('/api/admin/ai/train/base', data);
      return response.data;
    } catch (error) {
      console.error('베이스 모델 학습 실패:', error);
      throw error;
    }
  },

  // LoRA 학습 API
  trainLora: async (trainingData) => {
    try {
      if (!trainingData.version) {
        throw new Error('버전은 필수 항목입니다.');
      }
      
      if (!trainingData.npc) {
        throw new Error('NPC ID는 필수 항목입니다.');
      }
      
      if (!trainingData.base_version) {
        throw new Error('베이스 모델 버전은 필수 항목입니다.');
      }
      
      if (!trainingData.target) {
        throw new Error('학습 대상 ID는 필수 항목입니다.');
      }
      
      const data = {
        ...trainingData,
        merge: false, // 현재 비활성화됨
        resume: trainingData.resume !== undefined ? trainingData.resume : false
      };
      
      const response = await api.post('/api/admin/ai/train/lora', data);
      return response.data;
    } catch (error) {
      console.error('LoRA 학습 실패:', error);
      throw error;
    }
  },

  // 현재 활성화된 학습 세션 정보 조회 API
  getActiveTrainings: async () => {
    try {
      const response = await api.get('/api/admin/ai/train/active');
      return response.data;
    } catch (error) {
      console.error('활성 학습 세션 조회 실패:', error);
      throw error;
    }
  },

  // 학습 상태 조회 API
  getTrainingStatus: async (version) => {
    try {
      const response = await api.get(`/api/admin/ai/train/status/${version}`);
      return response.data;
    } catch (error) {
      console.error('학습 상태 조회 실패:', error);
      throw error;
    }
  },
  
  // 학습 취소 API
  cancelTraining: async (version) => {
    try {
      const response = await api.post('/api/admin/ai/train/cancel', { version });
      return response.data;
    } catch (error) {
      console.error('학습 취소 실패:', error);
      throw error;
    }
  },

  // 학습 로그 목록 조회 (새로 추가)
  getTrainingLogs: async () => {
    try {
      const response = await api.get('/api/admin/ai/train/logs');
      return response.data;
    } catch (error) {
      console.error('학습 로그 목록 조회 실패:', error);
      throw error;
    }
  },

  // 학습 로그 상세 조회 (새로 추가)
  getTrainingLogDetail: async (type, filename) => {
    try {
      const response = await api.get(`/api/admin/ai/train/logs/${type}/${filename}`);
      return response.data;
    } catch (error) {
      console.error('학습 로그 상세 조회 실패:', error);
      throw error;
    }
  },

  // 모델 성능 평가 API (타임아웃 수정됨: 10초 -> 5분)
  evaluateModel: async (evaluationData) => {
    try {
      if (!evaluationData.model_type) {
        throw new Error('model_type은 필수 항목입니다.');
      }
      
      if (evaluationData.model_type !== 'base' && !evaluationData.dataset_path) {
        throw new Error('dataset_path는 base 모델 외에는 필수입니다.');
      }
      
      const response = await api.post('/api/admin/ai/evaluate', evaluationData, {
        timeout: 300000 // 5분 (300,000ms)로 타임아웃 설정
      });
      return response.data;
    } catch (error) {
      console.error('모델 평가 실패:', error);
      
      // 타임아웃 에러 처리 추가
      if (error.code === 'ECONNABORTED') {
        throw new Error('평가 작업 시간이 초과되었습니다 (5분). 서버 부하가 높거나 데이터셋이 큰 경우 발생할 수 있습니다.');
      }
      
      throw error;
    }
  }
};

export default aiAPI;