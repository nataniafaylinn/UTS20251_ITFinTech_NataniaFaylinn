// pages/api/xendit-webhook.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export const config = {
  api: {
    bodyParser: true, // we rely on header token not signature; if need raw body, set to false and parse manually
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).end();

  const token = req.headers['x-callback-token'] || req.headers['x-callback-token'.toLowerCase()];
  if (!token || token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(401).json({ success: false, error: 'Invalid webhook token' });
  }

  const event = req.body;
  // event may have shape: { id, event, data: { id, status, ... } } or older variants
  const invoiceId = event.data?.id || event.id || event.data?.invoice_id;
  const status = event.data?.status || event.status || null;

  if (!invoiceId) {
    return res.status(400).json({ success: false, error: 'No invoice id in webhook' });
  }

  try {
    const payment = await Payment.findOne({ xenditInvoiceId: invoiceId });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment record not found' });

    // Map statuses
    const s = (status || '').toUpperCase();
    if (['PAID', 'SETTLED', 'ACTIVE'].includes(s)) {
      payment.status = 'PAID';
      payment.updatedAt = new Date();
      await payment.save();
      if (payment.checkout) await Checkout.findByIdAndUpdate(payment.checkout, { status: 'PAID' });
    } else if (['EXPIRED', 'FAILED', 'VOID'].includes(s)) {
      payment.status = 'FAILED';
      payment.updatedAt = new Date();
      await payment.save();
      if (payment.checkout) await Checkout.findByIdAndUpdate(payment.checkout, { status: 'CANCELLED' });
    } else {
      // store raw status
      payment.status = s || payment.status;
      payment.updatedAt = new Date();
      await payment.save();
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
