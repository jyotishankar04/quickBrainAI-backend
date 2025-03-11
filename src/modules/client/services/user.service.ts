import createHttpError, { HttpError } from "http-errors";
import prisma from "../../../config/prisma.config";
import bcrypt from "bcrypt";
class UserService {
  private async getHashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  private async checkPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
  private async genereateUsername(email: string) {
    const username = email.split("@")[0];
    return username;
  }

  public async checkUserExists(
    email: string,
    select: {
      password?: boolean;
    } = { password: false }
  ): Promise<
    | {
        success: boolean;
        user: {
          id: string;
          email: string;
          password: string;
        };
      }
    | false
  > {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        isVerified: true,
        email: true,
        password: select.password,
        id: true,
      },
    });
    if (user)
      return {
        success: true,
        user,
      };
    return false;
  }

  public async createUser(user: {
    email: string;
    name: string;
    password: string;
  }): Promise<
    | {
        success: boolean;
        user: {
          id: string;
          email: string;
        };
      }
    | HttpError
  > {
    try {
      user.password = await this.getHashedPassword(user.password);
      const username = await this.genereateUsername(user.email);
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
          username,
        },
      });
      return {
        success: true,
        user: {
          email: createdUser.email,
          id: createdUser.id,
        },
      };
    } catch (error) {
      console.log(error);
      return createHttpError(500, "Error creating user");
    }
  }
}

export default new UserService();
