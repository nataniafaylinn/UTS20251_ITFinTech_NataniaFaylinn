// File: /utils/twilioClient.js
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

const client = twilio(accountSid, authToken);

export const sendWhatsApp = async (to, message) => {
  try {
    // Normalisasi nomor: pastikan format +62xxx
    let formattedTo = to;
    const cleaned = to.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      formattedTo = '+62' + cleaned.slice(1);
    } else if (cleaned.startsWith('62')) {
      formattedTo = '+' + cleaned;
    } else {
      formattedTo = '+62' + cleaned;
    }
    
    console.log(`📞 Sending WhatsApp: ${to} → ${formattedTo}`);

    const result = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${formattedTo}`,
      body: message,
    });

    console.log(`✅ WhatsApp sent: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`❌ WhatsApp error:`, error.message);
    throw error;
  }
};