// /lib/mongoose.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI environment variable inside .env.local");
}

// Gunakan cache global agar tidak reconnect setiap request API di Next.js
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    // sudah terkoneksi, langsung pakai
    return cached.conn;
  }

  if (!cached.promise) {
    // koneksi pertama kali
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "uts_payment",
    }).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
