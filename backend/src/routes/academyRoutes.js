import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { trainTalentSchema } from "../validators/academyValidators.js";
import { trainTalent } from "../controllers/academyController.js";

const router = express.Router();

router.use(protect);

router.post("/train", validate(trainTalentSchema), trainTalent);

export default router;
