// src/api/user/controllers/profileController.js

const db = require('../../../utils/dbConnect');

module.exports = {
  // 자신의 프로필 보기
  getOwnProfile: async (req, res, next) => {
    const userId = req.params.id;

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
        [userId]
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
