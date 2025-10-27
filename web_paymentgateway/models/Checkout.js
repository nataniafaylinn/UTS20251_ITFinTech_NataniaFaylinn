// /models/Checkout.js
import mongoose from 'mongoose';

const CheckoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // make optional
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['CREATED', 'PENDING_PAYMENT', 'PAID', 'CANCELLED'], 
    default: 'CREATED' 
  },
  userEmail: { type: String },
}, { timestamps: true });

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);
