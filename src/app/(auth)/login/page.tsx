import { redirect } from "next/navigation";
import { Login } from "./login";
import { validateRequest } from "@/server/auth/react";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <Login />;
}
