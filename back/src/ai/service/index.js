const express = require("express");
const app = express();

app.use(express.json());
app.use("/api", require("./routes/chat"));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ ai-service-server is running on port ${PORT}`);
});
