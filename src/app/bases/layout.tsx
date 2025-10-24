import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function BasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/");

  return <>{children}</>;
}
