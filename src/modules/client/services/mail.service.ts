import { sendEmail } from "../../../config/mailtrap.config";
import prisma from "../../../config/prisma.config";
import {
  getEmailVerificaionOtpTemplate,
  getWelcomeEmailTemplate,
} from "../../../constants/email.templates";

class MailService {
  private async generateEmailVerificationOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private async pushOtpToDb(email: string, otp: string) {
    if (!email || !otp) return false;

    const otpExists = await prisma.otp.findUnique({
      where: {
        email,
      },
    });
    if (otpExists) {
      const ifNotExists = await prisma.otp.update({
        where: {
          email,
        },
        data: {
          email,
          otp,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      if (ifNotExists) return true;
      return false;
    }
    const response = await prisma.otp.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    if (!response) return false;
    return true;
  }

  public async sendVerificationOtp(email: string) {
    const otp = await this.generateEmailVerificationOtp();
    const html = getEmailVerificaionOtpTemplate(email, String(otp));
    try {
      const response = await this.pushOtpToDb(email, String(otp));
      if (!response) return false;
      await sendEmail({
        to: email,
        subject: "Email Verification OTP",
        html,
        category: "Email Verification",
      });

      return otp;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
  public async sendWelcomeEmail(email: string, name: string) {
    try {
      const html = getWelcomeEmailTemplate(name);
      await sendEmail({
        to: [email],
        subject: "Welcome to QuickBrainAI",
        html,
        category: "Welcome Email",
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
}

export default new MailService();
