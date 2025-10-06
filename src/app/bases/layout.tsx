import Link from "next/link";

export default async function BasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-neutral-100">
      <div className="min-h-14 w-full border-b-1 border-neutral-300 bg-white shadow-sm"></div>

      <div className="flex h-full items-start justify-items-start">
        <div className="min-h-full min-w-xs border-r-1 border-neutral-300 bg-white shadow-lg"></div>

        <div className="w-full px-12 py-8">
          <h1 className="mb-6 text-2xl font-semibold tracking-wide">Home</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
