import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/pages/PasswordForms";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return <ResetPasswordForm />;
}
