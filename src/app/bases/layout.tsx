import { auth } from "@/server/auth";
import MenuBar from "../_components/MenuBar";
import { redirect } from "next/navigation";

export default async function BasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <div className="min-h-14 w-full border-b-1 border-neutral-300 bg-white shadow-sm"></div>

      <div className="flex h-full items-start justify-items-start">
        <MenuBar />

        <div className="w-full px-12 py-8">
          <h1 className="mb-6 text-2xl font-semibold tracking-wide">Home</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
