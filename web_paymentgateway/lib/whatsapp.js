import axios from 'axios';

export async function sendFonnteNotification(phone, message) {
  try {
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    console.log('📱 Mengirim WhatsApp ke:', formattedPhone);
    console.log('🔑 API Key:', process.env.FONNTE_API_KEY ? 'Ada' : 'Tidak Ada');

    const response = await axios.post(
      'https://api.fonnte.com/send',
      {
        target: formattedPhone,
        message: message,
        delay: '2',
        countryCode: '62',
      },
      {
        headers: {
          'Authorization': process.env.FONNTE_API_KEY, // ⬅️ GUNAKAN API_KEY
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response dari Fonnte:', response.data);
    
    if (response.data.status === true) {
      console.log('🎉 Notifikasi WhatsApp BERHASIL dikirim');
      return { success: true, data: response.data };
    } else {
      console.error('❌ Fonnte error:', response.data);
      return { 
        success: false, 
        error: response.data.reason || 'Unknown Fonnte error' 
      };
    }
  } catch (error) {
    console.error('❌ Error sending Fonnte notification:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// ... (fungsi sendCheckoutNotification dan sendPaymentSuccessNotification tetap sama)
export async function sendCheckoutNotification(phone, checkoutData) {
  const { checkoutId, items, total } = checkoutData;
  
  const message = `🚀 *CHECKOUT BERHASIL* 🚀

Hai! Terima kasih telah berbelanja di PudinginAja.

📦 *Detail Pesanan:*
ID Checkout: ${checkoutId}
Total Items: ${items.length}
Total Pembayaran: Rp ${total.toLocaleString('id-ID')}

📋 *Items:*
${items.map(item => `• ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`).join('\n')}

Silakan lanjutkan ke pembayaran untuk menyelesaikan pesanan Anda.

Terima kasih! 🍮`;

  return await sendFonnteNotification(phone, message);
}

export async function sendPaymentSuccessNotification(phone, paymentData) {
  const { paymentId, amount, paidAt, items } = paymentData;
  
  const message = `🎉 *PEMBAYARAN BERHASIL* 🎉

Selamat! Pembayaran Anda telah berhasil diverifikasi.

💰 *Detail Pembayaran:*
ID Transaksi: ${paymentId}
Amount: Rp ${amount.toLocaleString('id-ID')}
Tanggal Bayar: ${new Date(paidAt).toLocaleDateString('id-ID')}

📦 *Pesanan Anda:*
${items.map(item => `• ${item.name} (${item.quantity}x)`).join('\n')}

Pesanan Anda sedang diproses dan akan segera dikirim.

Terima kasih telah berbelanja di PudinginAja! 🍮`;

  return await sendFonnteNotification(phone, message);
}