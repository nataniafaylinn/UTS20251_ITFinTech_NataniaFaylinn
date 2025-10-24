// /models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // otomatis tambahkan createdAt & updatedAt
  }
);

// Hindari recompile error di Next.js (Hot Reload)
export default mongoose.models.User || mongoose.model("User", UserSchema);
