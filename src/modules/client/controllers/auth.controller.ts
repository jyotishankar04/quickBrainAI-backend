import { Request, Response, NextFunction } from "express";
import MailService from "../services/mail.service";
import {
  getErrorMessage,
  loginValidator,
  registerCompletionValidator,
  registerSetp1Validator,
  registerVerificationValidator,
} from "../../../validator/validator";
import createHttpError from "http-errors";
import userService from "../services/user.service";
import AuthService from "../services/auth.service";

class AuthController {
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const body = req.body;
    const validator = registerSetp1Validator.safeParse(body);

    if (!validator.success) {
      return next(createHttpError(400, getErrorMessage(validator.error)));
    }

    const userExists = await userService.checkUserExists(body.email);
    if (userExists) {
      return next(createHttpError(400, "User already exists"));
    }
    const otp: number | false = await MailService.sendVerificationOtp(
      body.email
    );
    if (!otp) {
      return next(createHttpError(500, "Error sending email"));
    }

    res.cookie("email", body.email, {
      httpOnly: true,
    });

    return res.json({
      success: true,
      message: "Email sent successfully!",
    });
  }

  public async registerVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const body = req.body;
    const cookies = req.cookies;
    const { email } = cookies;
    const validator = registerVerificationValidator.safeParse({
      email,
      otp: body.otp,
    });

    if (!validator.success) {
      return next(createHttpError(400, getErrorMessage(validator.error)));
    }
    const response = await AuthService.validateOtp(body.email, body.otp);

    if (!response.success) {
      return next(createHttpError(400, "Error validating OTP"));
    }

    res.cookie("registrationToken", response.tempToken, {
      httpOnly: true,
    });

    return res.json({
      success: true,
      message: "User registered successfully!",
    });
  }

  public async registerCompletion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const body = req.body;
    const cookies = req.cookies;
    const { registrationToken } = cookies;
    const validator = registerCompletionValidator.safeParse({
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
      name: body.name,
    });

    if (!validator.success) {
      return next(createHttpError(400, getErrorMessage(validator.error)));
    }
    if (!registrationToken) {
      res.clearCookie("registrationToken");
      return next(createHttpError(400, "Please register again"));
    }
    const response = await AuthService.registerTokenVerification(
      registrationToken
    );
    if (!response) {
      res.clearCookie("registrationToken");
      return next(createHttpError(400, "Please register again"));
    }

    const userExists = await userService.checkUserExists(response.email);
    if (userExists) {
      return next(createHttpError(400, "User already exists"));
    }

    const user = await userService.createUser({
      email: response.email,
      password: body.password,
      name: body.name,
    });
    if (!user.success) {
      return next(createHttpError(500, "Error creating user"));
    }
    const token = await AuthService.createTokens(user.user.id, response.email);

    if (!token || !token.accessToken || !token.refreshToken) {
      return next(createHttpError(500, "Error creating token"));
    }

    await MailService.sendWelcomeEmail(user.user.email, body.name);

    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
    });
    res.clearCookie("registrationToken");
    return res.json({
      message: "User registration completed successfully!",
    });
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const body = req.body;
    const validator = loginValidator.safeParse({
      email: body.email,
      password: body.password,
    });
    if (!validator.success) {
      return next(createHttpError(400, getErrorMessage(validator.error)));
    }

    const isUserExists = await userService.checkUserExists(body.email, {
      password: true,
    });
    if (!isUserExists) {
      return next(createHttpError(400, "User does not exist"));
    }

    const isValidPassword = await userService.verifyPassword(
      body.password,
      isUserExists.user.password
    );
    if (!isValidPassword) {
      return next(createHttpError(400, "Invalid password"));
    }

    const token = await AuthService.createTokens(
      isUserExists.user.id,
      isUserExists.user.email
    );
    if (!token || !token.accessToken || !token.refreshToken) {
      return next(createHttpError(500, "Error creating token"));
    }

    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
    });

    return res.json({
      success: true,
      message: "User logged in successfully!",
    });
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User logged out successfully!",
    });
  }

  public async session(req: Request, res: Response, next: NextFunction) {
    res.json({
      message: "User session retrieved successfully!",
    });
  }
}

export default new AuthController();
