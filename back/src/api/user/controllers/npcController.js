// // src/api/user/controllers/npcController.js

// const chatService = require('../../../services/chatService');
// const aiService = require('../../../ai/serviceClient');

// module.exports = {
//     talkToNpc: async (req, res, next) => {
//       try {
//         const { user_id, npc_id, message, session_id: clientSessionId } = req.body;
  
//         const session_id =
//           clientSessionId || (await chatService.createSession(user_id, npc_id));
  
//         await chatService.logUserMessage(session_id, user_id, npc_id, message);
  
//         const aiResponse = await aiService.sendMessageToNpc({ user_id, npc_id, message });
  
//         const { reply, emotion, version } = aiResponse;
  
//         await chatService.logNpcReply(
//           session_id,
//           user_id,
//           npc_id,
//           reply,
//           version,
//           emotion
//         );
  
//         res.json({
//           success: true,
//           session_id,
//           reply,
//           emotion,
//         });
//       } catch (err) {
//         next(err);
//       }
//     },
//   };

// module.exports = {
//   // NPC와 대화 (유저가 게임 중 NPC를 만났을 때 자동 호출됨)
//   talkToNpc: async (req, res, next) => {
//     try {
//       const { user_id, npc_id, message } = req.body;

//       if (!user_id || !npc_id || !message) {
//         return res.status(400).json({
//           success: false,
//           message: 'user_id, npc_id, message는 모두 필요합니다.',
//         });
//       }

//       // AI 서비스 서버로 요청
//       const aiResponse = await aiService.sendMessageToNpc({
//         user_id,
//         npc_id,
//         message,
//       });

//       return res.json({
//         success: true,
//         reply: aiResponse.reply,
//       });
//     } catch (err) {
//       next(err);
//     }
//   },
// };
