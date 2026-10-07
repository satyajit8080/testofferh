import type { Metadata } from "next";
import { SetupForm } from "@/components/admin/pages/PasswordForms";

export const metadata: Metadata = { title: "First-time setup" };

export default function Page() {
  return <SetupForm />;
}
