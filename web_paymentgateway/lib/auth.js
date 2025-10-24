// /lib/auth.js
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function getUserFromToken(req) {
  const auth = req.headers.authorization || req.cookies?.token || null;
  if (!auth) return null;

  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId)
      .select("-password -otp -otpExpires");
    return user;
  } catch (err) {
    return null;
  }
}
