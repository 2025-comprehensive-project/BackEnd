// src/api/admin/controllers/aiController.js

const trainerClient = require('../../../ai/trainerClient');

module.exports = {
  // 11) 전이학습 요청
  requestTraining: async (req, res, next) => {
    const { npc_id } = req.params;

    try {
      const result = await trainerClient.requestTraining(npc_id);
      return res.json({ success: true, message: '전이학습 요청 완료', result });
    } catch (err) {
      next(err);
    }
  },

  // 12) 챗봇 상세조회
  getNpcAiDetails: async (req, res, next) => {
    const { npc_id } = req.params;

    try {
      const data = await trainerClient.getNpcAiInfo(npc_id);
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // 13) 유저 별 학습 상태 조회
  getUserAiStatus: async (req, res, next) => {
    const { user_id } = req.params;

    try {
      const data = await trainerClient.getUserAiStatus(user_id);
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // 14) 버전 변경
  updateAiVersion: async (req, res, next) => {
    const { npc_id } = req.params;
    const { version } = req.body;

    try {
      const result = await trainerClient.updateBaseVersion(npc_id, version);
      return res.json({ success: true, message: '버전 변경 완료', result });
    } catch (err) {
      next(err);
    }
  },

  // 15) 하이퍼파라미터 수정 후 학습
  trainWithParams: async (req, res, next) => {
    const { npc_id } = req.params;
    const { hyperParams } = req.body;

    try {
      const result = await trainerClient.trainWithHyperParams(npc_id, hyperParams);
      return res.json({ success: true, message: '하이퍼파라미터 학습 완료', result });
    } catch (err) {
      next(err);
    }
  },
};
