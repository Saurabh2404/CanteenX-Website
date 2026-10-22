import { Router } from "express";
import { listReviews } from "../controllers/reviewController.js";
const router = Router();
router.get("/reviews", listReviews);
export default router;
