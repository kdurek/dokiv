import fs from "fs/promises";

import { env } from "@/env";
import type { DockerCompose } from "@/lib/types";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { composeFileExists, getStack } from "@/server/api/utils";
import { COMPOSE_FILE_NAME, SORT_ORDER } from "@/server/consts";
import type { DockerComposeError } from "@/server/docker";
import { TRPCError } from "@trpc/server";
import { parse } from "yaml";
import { z } from "zod";

export const composeRouter = createTRPCRouter({
  getStackList: publicProcedure.query(async () => {
    try {
      const entries = (
        await fs.readdir(env.STACKS_DIR, {
          withFileTypes: true,
          encoding: "utf-8",
        })
      ).filter((entry) => entry.isDirectory());

      const stackList = await Promise.all(
        entries.map(async (entry) => {
          try {
            // Skip if the directory does not contain a compose file
            if (!(await composeFileExists(env.STACKS_DIR, entry.name))) {
              return;
            }
            return getStack(env.STACKS_DIR, entry.name);
          } catch (error) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: (error as Error).message,
            });
          }
        }),
      );

      return stackList
        .filter((stack) => stack !== undefined)
        .sort(
          (a, b) => SORT_ORDER.indexOf(a.status) - SORT_ORDER.indexOf(b.status),
        );
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: (error as Error).message,
      });
    }
  }),

  createStackFile: publicProcedure
    .input(
      z.object({
        composeName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingStacks = await fs.readdir(env.STACKS_DIR, {
        withFileTypes: true,
        encoding: "utf-8",
      });
      const isNameUnique = existingStacks.every(
        (entry) => entry.name !== input.composeName,
      );
      if (!isNameUnique) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stack name must be unique",
        });
      }
      await fs.mkdir(`${env.STACKS_DIR}/${input.composeName}`);
      await fs.writeFile(
        `${env.STACKS_DIR}/${input.composeName}/${COMPOSE_FILE_NAME}`,
        `services:
  whoami:
    image: traefik/whoami`,
      );
    }),

  removeStackFile: publicProcedure
    .input(
      z.object({
        composeName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.dockerCompose.down({
          cwd: `${env.STACKS_DIR}/${input.composeName}`,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as DockerComposeError).err,
        });
      }

      try {
        await fs.rm(`${env.STACKS_DIR}/${input.composeName}`, {
          recursive: true,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
        });
      }
    }),

  getStackFile: publicProcedure
    .input(
      z.object({
        composeName: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        return fs.readFile(
          `${env.STACKS_DIR}/${input.composeName}/${COMPOSE_FILE_NAME}`,
          "utf-8",
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
        });
      }
    }),

  getParsedStackFile: publicProcedure
    .input(
      z.object({
        composeName: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const file = await fs.readFile(
          `${env.STACKS_DIR}/${input.composeName}/${COMPOSE_FILE_NAME}`,
          "utf-8",
        );
        return parse(file) as DockerCompose;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
        });
      }
    }),

  saveStackFile: publicProcedure
    .input(
      z.object({
        composeName: z.string(),
        stack: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.dockerCompose.config({
          configAsString: input.stack,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as DockerComposeError).err,
        });
      }

      try {
        await fs.writeFile(
          `${env.STACKS_DIR}/${input.composeName}/${COMPOSE_FILE_NAME}`,
          input.stack,
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
        });
      }
    }),
});
