import express from "express";
import { getStockLogs, getStockLogsByProduct, searchStockLog } from "../controllers/stockLogController.js";
import { protect } from "../middleware/protectMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/get", getStockLogs);
router.post("/getByProduct", getStockLogsByProduct);
router.post("/search", searchStockLog);

export default router;