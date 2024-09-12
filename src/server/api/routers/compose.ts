import fs from "fs/promises";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parse } from "yaml";
import type { DockerCompose } from "@/lib/types";
import type { DockerComposeError } from "@/server/docker";
import { env } from "@/env";

export const composeRouter = createTRPCRouter({
  containersByName: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.dockerCompose.ps({
        cwd: `${env.STACKS_DIR}/${input.name}`,
        commandOptions: [["--format", "json"]],
      });

      if (result.err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to list containers",
        });
      }

      return result.data.services;
    }),

  subscribeLogs: publicProcedure
    .input(
      z.object({
        name: z.string(),
        services: z.array(z.string()),
      }),
    )
    .subscription(async function* ({ ctx, input }) {
      async function* maybeYield() {
        const logs = await ctx.dockerCompose.logs(input.services, {
          cwd: `${env.STACKS_DIR}/${input.name}`,
        });

        yield logs.out;
      }

      yield* maybeYield();
    }),

  listStacks: publicProcedure.query(async ({ ctx }) => {
    try {
      const entries = await fs.readdir(env.STACKS_DIR, {
        withFileTypes: true,
        encoding: "utf-8",
      });
      const newStacks = [];
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const result = await ctx.dockerCompose.ps({
            cwd: `${env.STACKS_DIR}/${entry.name}`,
            commandOptions: [["--format", "json"]],
          });
          const getStatus = () => {
            if (
              result.data.services.length &&
              result.data.services.every(
                (service) => service.state === "running",
              )
            ) {
              return "running";
            }

            if (
              result.data.services.length &&
              result.data.services.some((service) => service.state === "exited")
            ) {
              return "exited";
            }

            return "unknown";
          };
          const stack = {
            name: entry.name,
            status: getStatus(),
          };
          newStacks.push(stack);
        }
      }
      return newStacks;
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Failed to list stacks",
      });
    }
  }),

  createStackFile: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingStacks = await fs.readdir(env.STACKS_DIR, {
        withFileTypes: true,
        encoding: "utf-8",
      });
      const isNameUnique = existingStacks.every(
        (entry) => entry.name !== input.name,
      );
      if (!isNameUnique) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stack name must be unique",
        });
      }
      await fs.mkdir(`${env.STACKS_DIR}/${input.name}`);
      await fs.writeFile(
        `${env.STACKS_DIR}/${input.name}/${env.COMPOSE_FILE}`,
        `services:
  whoami:
    image: traefik/whoami`,
      );
    }),

  removeStackFile: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.dockerCompose.down({
          cwd: `${env.STACKS_DIR}/${input.name}`,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as DockerComposeError).err,
        });
      }

      try {
        await fs.rm(`${env.STACKS_DIR}/${input.name}`, { recursive: true });
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
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        return fs.readFile(
          `${env.STACKS_DIR}/${input.name}/${env.COMPOSE_FILE}`,
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
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const file = await fs.readFile(
          `${env.STACKS_DIR}/${input.name}/${env.COMPOSE_FILE}`,
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
        name: z.string(),
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
          `${env.STACKS_DIR}/${input.name}/${env.COMPOSE_FILE}`,
          input.stack,
        );
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
        });
      }
    }),

  up: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.dockerCompose.upAll({
          cwd: `${env.STACKS_DIR}/${input.name}`,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as DockerComposeError).err,
        });
      }
    }),

  down: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.dockerCompose.down({
          cwd: `${env.STACKS_DIR}/${input.name}`,
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as DockerComposeError).err,
        });
      }
    }),
});
