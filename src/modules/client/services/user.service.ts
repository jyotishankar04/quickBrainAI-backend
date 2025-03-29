import createHttpError, { HttpError } from "http-errors";
import prisma from "../../../config/prisma.config";
import bcrypt from "bcrypt";
import { createServiceError } from "../../../utils/service.error";
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
  public async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
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
          isVerified: boolean;
          name: string;
          username: string;
          avatarUrl: string;
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
        name: true,
        username: true,
        avatarUrl: true,
        role: true,
      },
    });
    if (user)
      return {
        success: true,
        user: {
          ...user,
          avatarUrl: user.avatarUrl || "",
        },
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

  public async getUserById(id: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          username: true,
          bio: true,
          createdAt: true,
          isVerified: true,
          location: true,
        },
      });

      if (!user) return createServiceError("User not found", 404);
      return {
        success: true,
        user: user,
      };
    } catch (error) {
      console.error(error);
      return createServiceError("Error getting user");
    }
  }
}

export default new UserService();
