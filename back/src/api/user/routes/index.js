const express = require('express');
const router = express.Router();

const npcRoutes = require('./npcRoutes');
const profileRoutes = require('./profileRoutes');

router.use('/npc', npcRoutes);          // → /api/user/npc/...
router.use('/profile', profileRoutes);  // → /api/user/profile/...

module.exports = router;
