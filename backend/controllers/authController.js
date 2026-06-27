import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UserModel from "../models/user.js";
import { access, read } from "fs";
import path from "path";
import { validationResult } from "express-validator";
import 'dotenv/config';
import { token } from "morgan";

const UserRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All Data is Required" });
    }

    const existingEmail = await UserModel.findOne({ email });
    const existingUsername = await UserModel.findOne({ username });

    if (existingEmail) return res.status(409).json({ msg: "Email Used" });
    if (existingUsername) return res.status(409).json({ msg: "Username Used" });

    const newUser = await UserModel.create({ username, email, password });

    if (!newUser) return res.status(500).json({ msg: "Failed to Register" });

    return res.status(201).json({ msg: "Registered" });

  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All Data is Required" });
    }

    const target = await UserModel.findOne({ email });
    if (!target) return res.status(404).json({ msg: "Email Do Not Exist" });

    const isMatch = await bcrypt.compare(password, target.password);
    if (!isMatch) return res.status(403).json({ msg: "Wrong Password" });

    const accessToken = jwt.sign(
      {
        id: target._id,
        username: target.username,
        email: target.email
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "40m" }
    );

    const refreshToken = jwt.sign(
      {
        id: target._id,
        username: target.username,
        email: target.email
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "14d" }
    );

    target.refreshToken = refreshToken;
    await target.save();

    return res.status(200).json({
      msg: "Login Success",
      token: accessToken,
      user: {
        id: target._id,
        username: target.username,
        email: target.email
      }
    });

  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const RefreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: "Refresh Token Not Provided" });

    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decode) return res.status(401).json({ msg: "Refresh Token Ignored" });

    const user = await UserModel.findOne({ refreshToken });
    if (!user) return res.status(401).json({ msg: "Refresh Token Invalid" });

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({ msg: "Token mismatch" });
    }
    
    const newToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "40m" }
    );

    return res.status(200).json({ 
      msg: "New Token Generated",
      token: newToken,        
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(400).json({ msg: "Something Went Wrong" });
  }
}

const UserLogout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict"
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict"
  });

  return res.status(200).json({ msg: "Logout Successful" });
}

const getUserData = async (req, res) => {
  try {
    console.log(req.user)
    const id = req.user.id;
    if (!id) return res.status(400).json({ msg: "ID Not Provided" });

    const user = await UserModel.findById(id);
    if (!user) return res.status(400).json({ msg: "User Not Found" });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
}

export {
  UserRegister,
  UserLogin,
  RefreshAccessToken,
  UserLogout,
  getUserData
}