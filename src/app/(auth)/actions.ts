"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { lucia } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/server/auth/utils";
import { users } from "@/server/db/schema";
import { validateRequest } from "@/server/auth/react";

interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please provide your password").max(255),
});
type LoginInput = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Please provide your password").max(255),
    confirmPassword: z.string().min(1, "Please confirm your password").max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterInput = z.infer<typeof registerSchema>;

export async function login(
  _: unknown,
  formData: FormData,
): Promise<ActionResponse<LoginInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  if (!existingUser?.passwordHash) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const validPassword = await verifyPassword(
    existingUser.passwordHash,
    password,
  );
  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function register(
  _: unknown,
  formData: FormData,
): Promise<ActionResponse<RegisterInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = registerSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
        confirmPassword: err.fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    columns: { email: true },
  });

  if (existingUser) {
    return {
      formError: "Cannot create account with that email",
    };
  }

  const userId = nanoid();
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function isAdminCreated() {
  const users = await db.query.users.findMany();
  return !!users.length;
}
