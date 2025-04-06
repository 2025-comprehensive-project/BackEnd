const express = require('express');
const router = express.Router();

const cocktailRoutes = require('./routes/cocktailRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
//const aiRoutes = require('./routes/aiRoutes');
const metaRoutes = require('./routes/metaRoutes');

router.use('/', loginRoutes);

router.use('/cocktails', cocktailRoutes);
router.use('/users', userRoutes);

//router.use('/ai', aiRoutes);

router.use('/meta', metaRoutes); // ➤ /api/admin/ingredients 등

module.exports = router;
