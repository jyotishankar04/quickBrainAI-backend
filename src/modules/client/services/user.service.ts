import createHttpError, { HttpError } from "http-errors";
import prisma from "../../../config/prisma.config";
import bcrypt from "bcrypt";
import { createServiceError } from "../../../utils/service.error";
import getGravatarUrl from "../../../utils/emailImage";
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
  ): Promise<any | false> {
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
        avatarId: true,
      },
    });
    if (user)
      return {
        success: true,
        user: {
          ...user,
          avatarUrl: user.avatarUrl || "",
          avatarId: user.avatarId || "",
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
      const userImage = getGravatarUrl(user.email) || "";
      console.log(userImage);
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
          username,
          avatarUrl: userImage,
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
    console.log(id);
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
          _count: {
            select: {
              categories: true,
              Notes: true,
            },
          },
          role: true,
          updatedAt: true,
          customUrl: true,
          instagramUrl: true,
          twitterUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          gender: true,
          dob: true,
          subscriptionPlan: true,
          UserSkill: {
            select: {
              Skill: {
                select: {
                  name: true,
                },
              },
            },
          },
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
  public async updateUser(id: string, body: any): Promise<any> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      const user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          name: body.name || existingUser?.name,
          email: body.email || existingUser?.email,
          avatarUrl: body.image.url || existingUser?.avatarUrl,
          avatarId: body.image.publicId || existingUser?.avatarId,
          username: body.username || existingUser?.username,
          bio: body.bio || existingUser?.bio,
          location: body.location || existingUser?.location,
          customUrl: body.customUrl || existingUser?.customUrl,
          instagramUrl: body.instagramUrl || existingUser?.instagramUrl,
          twitterUrl: body.twitterUrl || existingUser?.twitterUrl,
          githubUrl: body.githubUrl || existingUser?.githubUrl,
          linkedinUrl: body.linkedinUrl || existingUser?.linkedinUrl,
          gender: body.gender || existingUser?.gender,
          dob: body.dob || existingUser?.dob,
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
          _count: {
            select: {
              categories: true,
              Notes: true,
            },
          },
          role: true,
          updatedAt: true,
          customUrl: true,
          instagramUrl: true,
          twitterUrl: true,
          githubUrl: true,
          linkedinUrl: true,
          gender: true,
          dob: true,
          subscriptionPlan: true,
          UserSkill: {
            select: {
              Skill: {
                select: {
                  name: true,
                },
              },
            },
          },
          avatarId: true,
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
  public async getSkills(): Promise<any> {
    try {
      const skills = await prisma.skill.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      if (!skills) return createServiceError("User not found", 404);
      return {
        success: true,
        skills: skills,
      };
    } catch (error) {
      console.error(error);
      return createServiceError("Error getting user");
    }
  }
  public async updateUserSkills(
    skills: string[],
    userId: string
  ): Promise<any> {
    try {
      if (!userId) return createServiceError("User id is required");

      // Unlink all existing skills
      await prisma.userSkill.deleteMany({
        where: { userId },
      });

      // Link new skills
      if (skills.length > 0) {
        await prisma.userSkill.createMany({
          data: skills.map((skillId) => ({
            userId,
            skillId,
          })),
          skipDuplicates: true, // Avoid duplicate inserts
        });
      }

      return {
        success: true,
        message: "User skills updated successfully",
      };
    } catch (error) {
      console.error(error);
      return createServiceError("Error updating user skills");
    }
  }
}

export default new UserService();
