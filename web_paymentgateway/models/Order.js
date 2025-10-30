// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
