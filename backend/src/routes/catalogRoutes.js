import { Router } from "express";
import {
  listProducts,
  homeData,
  productImage,
} from "../controllers/catalogController.js";
const router = Router();
router.get("/products", listProducts);
router.get("/home", homeData);
router.get(
  "/products/:slug/image",
  (req, res, next) => {
    if (!/^(\d{1,12}|[a-f\d]{24})$/i.test(req.params.slug))
      return res.status(404).json({ error: "Product image unavailable." });
    next();
  },
  productImage,
);
export default router;
