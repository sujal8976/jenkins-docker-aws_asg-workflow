import { Router } from "express";
import Link from "../models/Link";
import { generateCode } from "../utils/code";

const router = Router();

function normalizeUrl(raw: string) {
  // If URL already has a scheme, return as-is. Otherwise, prepend https://
  try {
    // will throw if invalid
    // eslint-disable-next-line no-new
    new URL(raw);
    return raw;
  } catch (err) {
    // try with https://
    try {
      // eslint-disable-next-line no-new
      new URL(`https://${raw}`);
      return `https://${raw}`;
    } catch (err2) {
      return null;
    }
  }
}

router.post("/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  const normalized = normalizeUrl(url);
  if (!normalized) return res.status(400).json({ error: "invalid url" });

  const code = generateCode();
  const link = new Link({ originalUrl: normalized, code });
  await link.save();

  const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  const short = `${base.replace(/\/$/, "")}/r/${code}`;

  res.json({ short, code, originalUrl: normalized });
});

router.get("/r/:code", async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ code }).exec();
  if (!link) return res.status(404).json({ error: "Not found" });
  res.redirect(link.originalUrl);
});

router.get("/links", async (req, res) => {
  const items = await Link.find().sort({ createdAt: -1 }).limit(100).exec();
  const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  res.json(
    items.map((i) => ({
      code: i.code,
      originalUrl: i.originalUrl,
      createdAt: i.createdAt,
      short: `${base.replace(/\/$/, "")}/r/${i.code}`,
    }))
  );
});

export default router;
