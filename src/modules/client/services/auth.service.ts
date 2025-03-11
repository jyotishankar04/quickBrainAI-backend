import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _env from "../../../config/envConfig";

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
  }) {
    return jwt.sign({ id, email }, _env.JWT_SECRET as string, {
      expiresIn: "30d",
    });
  }
}

export default new AuthService();
