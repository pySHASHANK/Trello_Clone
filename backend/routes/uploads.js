import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../prisma/client.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST /api/uploads/cards/:cardId
router.post("/cards/:cardId", upload.single("file"), async (req, res) => {
  try {
    const { cardId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newAttachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        cardId: cardId
      }
    });

    res.status(201).json(newAttachment);
  } catch (error) {
    console.error("Error managing upload attach:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
