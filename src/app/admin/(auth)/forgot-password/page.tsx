import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/pages/PasswordForms";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordForm />;
}
