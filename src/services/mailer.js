const mailerModel = require("../models/mailer");

class MailderService {
  static async createOTP({ otp, email }) {
    return await mailerModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        OTP: otp,
      },
      {
        upsert: true,
        new: true,
      }
    );
  }
}

module.exports = MailderService;
