import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), status: z.string(), feedback: z.string(), rating: z.number(), authorid: z.string() }))
    .mutation(async ({ ctx, input }) => {

      return ctx.db.interviewee.create({
        data: {
          name: input.name,
          status: input.status,
          feedback: input.feedback,
          rating: input.rating,
          authorId: input.authorid
        },
      });
    }),

  getInterviewee: publicProcedure
  .input(z.object({authorid: z.string()}))
  .query(({ ctx, input }) => {
    return ctx.db.interviewee.findMany({
      where: {
        authorId: input.authorid
      }
    });
  }),
});
