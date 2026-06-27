import express from "express";
import { getProduct, addProduct, deleteProduct, restockProduct, updateProduct, searchProduct, searchProducForCashier } from "../controllers/productController.js";
import { protect } from "../middleware/protectMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/get", getProduct);
router.post("/add", addProduct);
router.post("/delete", deleteProduct);
router.post("/restock", restockProduct);
router.post("/update", updateProduct);
router.post("/search", searchProduct);
router.post("/search-cashier", searchProducForCashier);

export default router;