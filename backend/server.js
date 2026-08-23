require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a reverse proxy / tunnel (Cloudflare, nginx), so req.ip reflects the
// real client via X-Forwarded-For instead of the proxy's own address.
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: "60mb" }));

// Generous cap on the whole API so one client can't hammer the server.
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/daily-reports", require("./routes/dailyReports"));
app.use("/api/notifications", require("./routes/notifications"));

// Serve the built frontend (meditrans-app/dist) if it's present, so a single
// process can host both the API and the app in production. In local dev the
// frontend runs separately under Vite, so this is skipped when dist is missing.
const frontendDist = path.join(__dirname, "../meditrans-app/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  console.log("Serving frontend from", frontendDist);
}

app.listen(PORT, () => {
  console.log(`MediTrans backend running on http://localhost:${PORT}`);
});
