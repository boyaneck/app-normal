import express from "express";

const router = express.Router();

router.post("/", sanctionController.createSanction);

export default router;
