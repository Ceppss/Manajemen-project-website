const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/daily-reports", require("./routes/dailyReports"));

app.listen(PORT, () => {
  console.log(`MediTrans backend running on http://localhost:${PORT}`);
});
