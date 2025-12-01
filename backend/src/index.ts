import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import linksRouter from "./routes/links";
import path from "path";
import fs from "fs";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/url_shortener_dev";

const app = express();
app.use(cors());
app.use(express.json());

// Mount API routes first so they take precedence over static files
app.use("/", linksRouter);

// Serve frontend static build if it exists (frontend/dist)
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback: serve index.html for unknown GET routes (excluding API and redirect)
  app.get("/*", (req, res, next) => {
    // allow API and redirect routes to continue
    if (
      req.path.startsWith("/r/") ||
      req.path.startsWith("/shorten") ||
      req.path.startsWith("/links")
    )
      return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default app;
