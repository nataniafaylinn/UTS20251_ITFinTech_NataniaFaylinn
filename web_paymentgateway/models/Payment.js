import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  checkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkout' },
  amount: Number,
  currency: { type: String, default: 'IDR' },
  status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED', 'FAILED'], default: 'PENDING' },
  xenditInvoiceId: String,   // id dari Xendit
  paymentUrl: String,        // invoice_url dari Xendit
  meta: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
})

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
