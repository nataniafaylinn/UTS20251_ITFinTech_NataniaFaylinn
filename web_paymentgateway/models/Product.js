// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  stock: { type: Number, default: 0 },
  image: String
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
