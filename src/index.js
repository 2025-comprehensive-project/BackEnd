require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const cocktailRoutes = require('./routes/cocktailRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
app.use(express.json());
app.use(cors());  // CORS 설정

// 라우트 등록
app.use('/api/users', userRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/admin', loginRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
