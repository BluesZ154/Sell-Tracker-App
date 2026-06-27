import mongoose from "mongoose";
import bcrypt from "bcrypt";
import slugify from "slugify";
import { type } from "os";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true, 
      unique: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    refreshToken: {
      type: String,
      default: null
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = 13;
  this.password = await bcrypt.hash(this.password, salt);
})

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;