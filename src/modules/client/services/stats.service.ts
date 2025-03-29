import prisma from "../../../config/prisma.config";
import { createServiceError } from "../../../utils/service.error";

class StatsService {
  public async getDashboardStats(userId: string): Promise<any> {
    try {
      const totalNotes = await prisma.notes.count({
        where: { userId },
      });
      const starredNotes = await prisma.notes.count({
        where: { userId, isStared: true },
      });
      const totalCategories = await prisma.category.count({
        where: { userId },
      });
      const notesWithFiles = await prisma.notes.count({
        where: {
          userId: userId,
          files: { isEmpty: false },
        },
      });
      const notesLastMonth = await prisma.notes.count({
        where: {
          userId: userId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      });
      //       const lastFiveActivities = await prisma.$queryRaw`
      //   (SELECT id, 'note_created' AS action, noteTitle AS title, createdAt FROM "notes" WHERE "userId" = ${userId})
      //   UNION ALL
      //   (SELECT id, 'note_updated' AS action, noteTitle AS title, updatedAt AS createdAt FROM "notes" WHERE "userId" = ${userId} AND createdAt != updatedAt)
      //   UNION ALL
      //   (SELECT id, 'category_created' AS action, name AS title, createdAt FROM "categories" WHERE "userId" = ${userId})
      //   ORDER BY createdAt DESC
      //   LIMIT 5;
      // `;

      const notesLastWeek = await prisma.notes.count({
        where: {
          userId: userId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
          },
        },
      });

      const publicNotes = await prisma.notes.count({
        where: { userId: userId, isPrivate: false },
      });
      const privateNotes = totalNotes - publicNotes;

      // last 5 activities
      const lastFiveActivities = await prisma.$queryRaw`
  (SELECT id, 'note_created' AS action, "noteTitle" AS title, "createdAt" 
   FROM "notes" WHERE "userId" = ${userId})

  UNION ALL

  (SELECT id, 'note_updated' AS action, "noteTitle" AS title, "updatedAt" AS "createdAt" 
   FROM "notes" WHERE "userId" = ${userId} AND "createdAt" != "updatedAt")

  UNION ALL

  (SELECT id, 
          CASE 
            WHEN "isStared" = TRUE THEN 'note_starred' 
            ELSE 'note_unstarred' 
          END AS action, 
          "noteTitle" AS title, 
          "updatedAt" AS "createdAt" 
   FROM "notes" 
   WHERE "userId" = ${userId} AND "createdAt" != "updatedAt")

  UNION ALL

  (SELECT id, 'category_created' AS action, "name" AS title, "createdAt" 
   FROM "categories" WHERE "userId" = ${userId})

  ORDER BY "createdAt" DESC
  LIMIT 5;
`;

      const lastThreeNotes = await prisma.notes.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          noteContent: false,
          extractedText: false,
          id: true,
          noteTitle: true,
          noteDescription: true,
          isStared: true,
          isPrivate: true,
          files: true,
          userId: true,
          categoryId: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          category: true,
        },
        take: 3,
      });

      return {
        success: true,
        message: "Stats retrieved successfully!",
        data: {
          totalNotes,
          starredNotes,
          totalCategories,
          notesWithFiles,
          notesLastMonth,
          notesLastWeek,
          publicNotes,
          lastThreeNotes,
          lastFiveActivities,
          privateNotes,
        },
      };
    } catch (error) {
      console.error(error);
      return createServiceError("Error getting stats");
    }
  }
}

export default new StatsService();
