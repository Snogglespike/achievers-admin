import { prisma } from "~/db.server";

export async function getChaptersAsync() {
  return await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAvailabelMentorsAsync(
  chapterId: number,
  studentId: number | undefined,
) {
  const mentors = await prisma.user.findMany({
    where: {
      chapterId,
      mentorToStudentAssignement: {
        some: {
          studentId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return mentors.map(({ id, firstName, lastName }) => ({
    id,
    fullName: `${firstName} ${lastName}`,
  }));
}

export async function getAvailabelStudentsAsync(
  chapterId: number,
  mentorId: number | undefined,
) {
  const students = await prisma.student.findMany({
    where: {
      chapterId,
      mentorToStudentAssignement: {
        some: {
          userId: mentorId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return students.map(({ id, firstName, lastName }) => ({
    id,
    fullName: `${firstName} ${lastName}`,
  }));
}

export async function getCountAsync(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
) {
  return await prisma.mentorToStudentSession.count({
    where: whereClause(
      chapterId,
      mentorId,
      studentId,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
  });
}

export async function getSessionsAsync(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
  pageNumber: number,
  numberItems = 10,
) {
  return await prisma.mentorToStudentSession.findMany({
    where: whereClause(
      chapterId,
      mentorId,
      studentId,
      startDate,
      endDate,
      isCompleted,
      isSignedOff,
    ),
    select: {
      id: true,
      attendedOn: true,
      completedOn: true,
      signedOffOn: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      completedOn: "desc",
    },
    skip: numberItems * pageNumber,
    take: numberItems,
  });
}

function whereClause(
  chapterId: number,
  mentorId: number | undefined,
  studentId: number | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined,
  isCompleted: boolean | undefined,
  isSignedOff: boolean | undefined,
) {
  return {
    userId: mentorId,
    studentId,
    chapterId,
    completedOn: isCompleted
      ? {
          not: null,
        }
      : undefined,
    signedOffOn: isSignedOff
      ? {
          not: null,
        }
      : undefined,
    AND:
      startDate && endDate
        ? [
            {
              attendedOn: {
                lte: endDate,
              },
            },
            {
              attendedOn: {
                gte: startDate,
              },
            },
          ]
        : undefined,
  };
}
