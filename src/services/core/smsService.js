const { Infobip, AuthType } = require('@infobip-api/sdk');
const httpStatus = require('http-status');

class SmsService {
  constructor() {

    this.infobip = new Infobip({
      baseUrl: process.env.INFOBIP_BASE_URL,
      apiKey: process.env.INFOBIP_API_Key,
      authType: AuthType.ApiKey,
    });
  }

  async sendOtp(phone, otp) {
    try {
      // Send the OTP SMS
      const response = await this.infobip.channels.sms.send({
        messages: [
          {
            from: '447491163443',
            destinations: [{ to: phone }],
            text: `Your OTP is ${otp}`,
          },
        ],
      });

      console.log('SMS sent successfully:', response);
      return {
        status: httpStatus.OK,
        message: 'OTP sent successfully via SMS',
      };
    } catch (error) {

      console.error('Error sending SMS:', error.response?.data || error.message);


      const statusCode = error.response?.status || httpStatus.INTERNAL_SERVER_ERROR;
      throw {
        status: statusCode,
        message: error.response?.data?.messages?.[0]?.text || 'Failed to send OTP via SMS',
      };
    }
  }
}

module.exports = SmsService;
