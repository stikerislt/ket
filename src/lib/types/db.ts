import type { Prisma } from "@prisma/client";

export type QuestionWithDetails = Prisma.QuestionGetPayload<{
  include: {
    options: true;
    references: {
      include: {
        ruleClause: {
          include: {
            sourceDocument: true;
          };
        };
      };
    };
  };
}>;

export type AttemptWithRelations = Prisma.AttemptGetPayload<{
  include: {
    examProfile: true;
    answers: true;
  };
}>;
