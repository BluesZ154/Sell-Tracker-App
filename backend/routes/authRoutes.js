import express from "express";
import multer from "multer";
import { UserRegister, UserLogin, UserLogout, RefreshAccessToken, getUserData } from "../controllers/authController.js";
import { body } from "express-validator";
import { protect } from "../middleware/protectMiddleware.js";

const router = express.Router();

router.post("/register", [
  body('username')
  .notEmpty().withMessage('Username is Required')
  .isLength({ min: 5, max:20 }).withMessage('Username must be 5-20 chars')
  .matches(/[a-zA-Z]/).withMessage('Username must contain alphabet'),

  body('email')
  .notEmpty().withMessage('Email is Required')
  .isLength({ min: 5, max: 30 }).withMessage('Email must be 5-15 chars')
  .isEmail().withMessage('Invalid Email Format'),

  body('password')
  .notEmpty().withMessage('Password is Required')
  .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
  .matches(/[0-9]/).withMessage('Password must contain at least one digit')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one symbol')
  .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet letter'),
], UserRegister);

router.post("/login", [
  body('email')
  .notEmpty().withMessage('Email is Required')
  .isLength({ min: 5, max: 30 }).withMessage('Email must be 11-15 chars')
  .isEmail().withMessage('Invalid Email Format'),

  body('password')
  .notEmpty().withMessage('Password is Required')
  .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
  .matches(/[0-9]/).withMessage('Password must contain at least one digit')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one symbol')
  .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet letter'),
], UserLogin);

router.post("/logout", protect, UserLogout);
router.post("/refresh", RefreshAccessToken);
router.post("/getUserData", protect, getUserData);

export default router;
