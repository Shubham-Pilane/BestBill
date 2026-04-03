const axios = require('axios');

/**
 * BestBill Notification Engine
 * Supports multiple providers. Configure your keys in .env
 */
const sendSMS = async (phoneNumber, message) => {
  const apiKey = process.env.SMS_API_KEY;
  const provider = process.env.SMS_PROVIDER || 'fast2sms'; // fast2sms or twilio

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    console.log('--- [MOCK SMS MODE] ---');
    console.log(`To: ${phoneNumber}`);
    console.log(`Msg: ${message}`);
    console.log('-----------------------');
    return { success: true, message: 'Mock sent' };
  }

  try {
    if (provider === 'fast2sms') {
      // Fast2SMS India API (Standard POST method with header auth)
      // Note: 'q' is the most compatible Quick SMS route for new accounts
      console.log(`[Fast2SMS] Transmitting to ${phoneNumber}...`);
      
      // Clean message for maximum compatibility
      const cleanMsg = message.replace(/[\[\]]/g, ''); 

      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'q',
        message: cleanMsg,
        language: 'english',
        flash: 0,
        numbers: phoneNumber,
      }, {
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
          'cache-control': 'no-cache'
        }
      });
      console.log('[Fast2SMS Response]:', response.data);
      return response.data;
    } else if (provider === 'twilio') {
      // Twilio Global API
      const accountSid = process.env.TWILIO_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);
      
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      });
      return response;
    } else if (provider === 'textbelt') {
      // TextBelt Zero-Config Free API (1/day)
      const response = await axios.post('https://textbelt.com/text', {
        phone: phoneNumber,
        message: message,
        key: apiKey
      });
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      console.error('SMS Provider Error Body:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('SMS Transmission Error:', error.message);
    throw new Error(error.response?.data?.message || 'Failed to dispatch SMS');
  }
};

module.exports = { sendSMS };
