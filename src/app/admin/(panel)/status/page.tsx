import type { Metadata } from "next";
import { StatusAdmin } from "@/components/admin/pages/StatusAdmin";

export const metadata: Metadata = { title: "Status page" };

export default function Page() {
  return <StatusAdmin />;
}
