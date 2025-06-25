import express from "express";
import { AuthController } from "../controllers/AuthController";

const router = express.Router();
const authController = new AuthController();
// router.post("/register", authController.reigister);
router.post("/register", (req, res) => authController.reigister(req, res)); // done in this way to solve binding issue
export default router;
