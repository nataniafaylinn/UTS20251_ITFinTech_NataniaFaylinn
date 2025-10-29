/// pages/api/payment/webhook.js

import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import User from "@/models/User";
import { sendPaymentSuccessNotification } from "@/lib/whatsapp";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { event, data } = req.body;
    
    console.log("📥 Webhook received:", event, data);

    if (event === "invoice.paid") {
      const { id: invoiceId, status, paid_at, amount } = data;
      
      // Update payment status
      const payment = await Payment.findOne({ xenditInvoiceId: invoiceId });
      if (!payment) {
        console.error("❌ Payment not found for invoice:", invoiceId);
        return res.status(404).json({ success: false, error: "Payment not found" });
      }

      payment.status = "PAID";
      payment.updatedAt = new Date();
      payment.meta = { ...payment.meta, webhook_data: data };
      await payment.save();

      // Update checkout status
      const checkout = await Checkout.findById(payment.checkout).populate('items.product');
      if (checkout) {
        checkout.status = "PAID";
        await checkout.save();

        console.log("✅ Payment dan Checkout updated untuk:", checkout._id);

        // 🔥 KIRIM NOTIFIKASI WHATSAPP JIKA USER LOGIN
        if (checkout.user) {
          try {
            const user = await User.findById(checkout.user);
            if (user && user.phone) {
              const paymentData = {
                paymentId: payment._id.toString(),
                amount: amount,
                paidAt: paid_at,
                items: checkout.items
              };

              const result = await sendPaymentSuccessNotification(user.phone, paymentData);
              
              if (result.success) {
                console.log('✅ Notifikasi WhatsApp pembayaran terkirim ke:', user.phone);
              } else {
                console.warn('⚠️ Gagal mengirim notifikasi WhatsApp pembayaran');
              }
            }
          } catch (whatsappError) {
            console.error('❌ Error sending payment WhatsApp notification:', whatsappError);
            // Jangan gagalkan proses webhook jika notifikasi gagal
          }
        }
      }
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}