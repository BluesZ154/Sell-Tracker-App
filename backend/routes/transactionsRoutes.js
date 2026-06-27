import express from "express";
import { createTransaction, getTransactions, deleteTransaction, searchTransaction } from "../controllers/transactionsController.js";
import { protect } from "../middleware/protectMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/get", getTransactions);
router.post("/create", createTransaction);
router.post("/delete", deleteTransaction);
router.post("/search", searchTransaction);

export default router;