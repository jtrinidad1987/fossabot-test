import { Router } from "express";
import multer from "multer";

// Public, unauthenticated multipart endpoint with no limits. multer <2.5.0
// has multiple DoS issues triggered by crafted multipart requests.
const upload = multer({ dest: "uploads/" });

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), (req, res) => {
  res.json({ received: req.file?.originalname ?? null, size: req.file?.size ?? 0 });
});
