const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/chat", async (req, res) => {
    const { userId, message } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: "userId 또는 message 누락" });
    }

    try {
        const response = await axios.post("http://localhost:5001/chat", {
            user_id: userId,
            message: message
        });

        return res.json(response.data);
    } catch (err) {
        console.error("Flask API 호출 오류:", err.message);
        return res.status(500).json({ error: "챗봇 응답 실패" });
    }
});

module.exports = router;
