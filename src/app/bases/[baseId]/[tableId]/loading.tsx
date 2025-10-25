import { Spinner } from "@/components/ui/spinner";

export default function LoadingTable() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
      <Spinner className="size-5" />
    </div>
  );
}
