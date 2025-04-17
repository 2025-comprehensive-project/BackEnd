// src/api/user/controllers/profileController.js

const db = require('../../../config/dbConnect');
const logger = require('../../../utils/logger'); // 로거 유틸리티
const DEMO_MODE = process.env.DEMO_MODE === 'true';

module.exports = {
  // 자신의 프로필 보기
  getOwnProfile: async (req, res, next) => {
    const user_id = DEMO_MODE ? 1 : req.user?.user_id; // JWT에서 userId 추출

    try {
      const [rows] = await db.maria.execute(
        `
        SELECT 
          user_id, google_sub, email, name, profile_image, 
          play_time, current_chapter, money, reputation_score, 
          signature_cocktail_id, registered_at 
        FROM user 
        WHERE user_id = ?
        `,
        [user_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '해당 유저를 찾을 수 없습니다.',
        });
      }

      return res.json({
        success: true,
        data: rows[0],
      });
    } catch (err) {
      next(err);
    }
  },
};
