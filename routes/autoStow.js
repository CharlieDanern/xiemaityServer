import express from "express";
import {
   autoStow,
   upload,
   result,
   resultFileNameIndicator,
   resultFileName,
   UpdateIndicator,
} from "../controllers/autoStow.js";

const router = express.Router();

router.get("/", autoStow);
router.post("/upload", upload);
router.post("/result", result);

router.post("/result/update/:fileName", UpdateIndicator);

router.get("/result/indicator", resultFileNameIndicator);
router.get("/result/:fileName", resultFileName);

export default router;
