import express from "express";
import { autoStow, upload, result } from "../controllers/autoStow.js";

const router = express.Router();

router.get("/", autoStow);
router.post("/upload", upload);
router.post("/result", result);

export default router;
