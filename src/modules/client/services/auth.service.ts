import jwt from "jsonwebtoken";
import _env from "../../../config/envConfig";
import prisma from "../../../config/prisma.config";
import createHttpError, { HttpError } from "http-errors";

class AuthService {
  private async generateAccessToken({
    id,
    email,
  }: {
    id: string;
    email: string;
  }) {
    return jwt.sign({ id, email }, _env.JWT_SECRET as string, {
      expiresIn: "15m",
    });
  }
  private async generateRefreshToken({
    id,
    email,
  }: {
    id: string;
    email: string;
  }): Promise<string | false> {
    const token = jwt.sign({ id, email }, _env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
    console.log("token", token);
    console.log("id", id);
    console.log("email", email);
    const pushdb = await prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: token,
        isVerified: true,
      },
    });

    if (!pushdb) return false;
    return pushdb.refreshToken as string;
  }

  // Public methods
  public async validateOtp(
    email: string,
    otp: string
  ): Promise<
    | {
        success: boolean;
        tempToken: string;
      }
    | HttpError
  > {
    const otpExists = await prisma.otp.findUnique({
      where: {
        email,
      },
      select: {
        otp: true,
        expiresAt: true,
        email: true,
      },
    });
    if (!otpExists) return createHttpError(400, "OTP expired");
    if (otpExists.expiresAt < new Date()) {
      return createHttpError(400, "OTP expired");
    }

    if (otpExists.otp !== otp) return createHttpError(400, "Incorrect OTP");
    await prisma.otp.delete({
      where: {
        email,
      },
    });
    return {
      success: true,
      tempToken: await this.generateTempRegistrationToken(email),
    };
  }

  public async generateTempRegistrationToken(email: string) {
    const token = jwt.sign({ email }, _env.JWT_SECRET as string, {
      expiresIn: "10m", //10 minutes
    });
    return token;
  }

  public async registerTokenVerification(token: string): Promise<
    | {
        success: boolean;
        email: string;
      }
    | false
  > {
    try {
      const decoded = jwt.verify(token, _env.JWT_SECRET as string) as {
        email: string;
      };
      console.log(decoded);
      return {
        success: true,
        email: decoded.email,
      };
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async createTokens(
    userId: string,
    email: string
  ): Promise<
    | {
        accessToken: string;
        refreshToken: string;
      }
    | HttpError
    | false
  > {
    try {
      const accessToken = await this.generateAccessToken({ id: userId, email });
      const refreshToken = await this.generateRefreshToken({
        id: userId,
        email,
      });
      if (!refreshToken) return createHttpError(500, "Error creating token");
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async logout(userId: string) {
    try {
      const response = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: null,
        },
      });
      if (!response) return createHttpError(500, "Error logging out user");
    } catch (error) {
      console.error(error);
      return createHttpError(500, "Error logging out user");
    }
  }
  public async verifyAccessToken(accessToken: string) {
    try {
      const decoded = jwt.verify(accessToken, _env.JWT_SECRET as string) as {
        id: string;
        email: string;
      };
      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  public async verifyRefreshToken(
    oldRefreshtoken: string
  ): Promise<string | false> {
    try {
      const decoded = jwt.verify(
        oldRefreshtoken,
        _env.JWT_SECRET as string
      ) as {
        id: string;
        email: string;
      };
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          email: true,
          refreshToken: true,
        },
      });
      if (!user) return false;
      if (user.refreshToken !== oldRefreshtoken) return false;
      const token = (await this.generateAccessToken({
        id: user.id,
        email: user.email,
      })) as string;
      return token;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export default new AuthService();
