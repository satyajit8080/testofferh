import type { Metadata } from "next";
import { Account } from "@/components/admin/pages/Account";

export const metadata: Metadata = { title: "My account" };

export default function Page() {
  return <Account />;
}
