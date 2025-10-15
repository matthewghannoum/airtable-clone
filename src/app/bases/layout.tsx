import { auth } from "@/server/auth";
import MenuBar from "../_components/MenuBar";
import { redirect } from "next/navigation";
import Image from "next/image";
import UserAccount from "../_components/UserAccount";

export default async function BasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/");

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      <div className="flex min-h-14 w-full items-center justify-between border-b-1 border-neutral-300 bg-white px-4 py-2 shadow-sm">
        <Image src="/images/logo.svg" alt="Logo" width={100} height={20} />

        <UserAccount
          name={session.user.name ?? "User"}
          email={session.user.email ?? "No email"}
        />
      </div>

      <div className="flex h-full items-start justify-items-start">
        <MenuBar />

        {children}
      </div>
    </div>
  );
}
