import { Button } from "@/components/ui/button";

export default function PopoverListItem({
  text,
  icon: Icon,
  onClick,
}: {
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="flex w-full cursor-pointer items-center justify-start gap-2"
    >
      {Icon}
      <p className="text-sm">{text}</p>
    </Button>
  );
}
