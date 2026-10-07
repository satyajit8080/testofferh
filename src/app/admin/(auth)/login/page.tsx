import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/pages/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <LoginForm />;
}
