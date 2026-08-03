import { prisma } from "@/lib/prisma";

export async function getInstituteById(
  id: string
) {
  return prisma.institute.findUnique({
    where: {
      id,
    },

    include: {
      city: true,
      //teachers: true,
      managers: true,
      facilities:true,
      faqs:true,
      //batches:true,
      notablepersons:true,
      achievements:true,
      operatingHours: { orderBy: { dayOfWeek: "asc" } },

      categories: {
        include: {
          category: true,
        },
      },

      reviews: {
        where: {
            status: "APPROVED"
          },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          replies: {
            where: {
              status: "APPROVED"
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },

        

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}