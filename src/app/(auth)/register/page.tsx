import { redirect } from "next/navigation";
import { Register } from "@/app/(auth)/register/register";
import { validateRequest } from "@/server/auth/react";
import { isAdminCreated } from "@/app/(auth)/actions";

export const metadata = {
  title: "Register",
  description: "Register Page",
};

export default async function RegisterPage() {
  const { user } = await validateRequest();
  const adminCreated = await isAdminCreated();

  if (user) redirect("/");
  if (adminCreated) redirect("/login");

  return <Register />;
}
