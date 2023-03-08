import type { MentoringMentee } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getMenteesMentoredByAsync(
  mentorId: MentoringMentee["userId"]
) {
  return await prisma.mentoringMentee.findMany({
    where: {
      userId: mentorId,
    },
    include: {
      Mentee: true,
    },
  });
}
