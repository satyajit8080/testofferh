import type { Metadata } from "next";
import { UsersAdmin } from "@/components/admin/pages/UsersAdmin";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <UsersAdmin />;
}
