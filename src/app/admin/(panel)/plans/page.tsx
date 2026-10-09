import type { Metadata } from "next";
import { Plans } from "@/components/admin/pages/Plans";

export const metadata: Metadata = { title: "Server plans" };

export default function Page() {
  return <Plans />;
}
